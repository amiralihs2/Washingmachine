from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ============ Models ============

class Reservation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_name: str
    date: str  # ISO date YYYY-MM-DD
    start_hour: int  # 0-23
    duration: int  # 1 or 2
    queue: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ReservationCreate(BaseModel):
    user_name: str
    date: str
    start_hour: int
    duration: int


class CancelRequest(BaseModel):
    user_name: str


class QueueRequest(BaseModel):
    user_name: str


# ============ Helpers ============

def reservation_slots(start_hour: int, duration: int) -> List[int]:
    return [(start_hour + i) % 24 for i in range(duration)]


# ============ Routes ============

@api_router.get("/")
async def root():
    return {"message": "WashSlot API"}


@api_router.get("/reservations", response_model=List[Reservation])
async def list_reservations(start_date: str, end_date: str):
    """Get all reservations between start_date and end_date (inclusive)."""
    cursor = db.reservations.find(
        {"date": {"$gte": start_date, "$lte": end_date}},
        {"_id": 0}
    )
    return await cursor.to_list(1000)


@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(payload: ReservationCreate):
    if payload.duration not in (1, 2):
        raise HTTPException(status_code=400, detail="Duration must be 1 or 2 hours")
    if not (0 <= payload.start_hour <= 23):
        raise HTTPException(status_code=400, detail="start_hour must be between 0 and 23")
    if payload.duration == 2 and payload.start_hour == 23:
        raise HTTPException(status_code=400, detail="A 2h slot cannot start at 23:00")
    if not payload.user_name.strip():
        raise HTTPException(status_code=400, detail="user_name is required")

    requested_hours = set(reservation_slots(payload.start_hour, payload.duration))

    # check overlap on same date
    existing = await db.reservations.find({"date": payload.date}, {"_id": 0}).to_list(1000)
    for r in existing:
        occupied = set(reservation_slots(r["start_hour"], r["duration"]))
        if requested_hours & occupied:
            raise HTTPException(status_code=409, detail="Slot already booked")

    res = Reservation(
        user_name=payload.user_name.strip(),
        date=payload.date,
        start_hour=payload.start_hour,
        duration=payload.duration,
    )
    await db.reservations.insert_one(res.model_dump())
    return res


@api_router.delete("/reservations/{reservation_id}")
async def cancel_reservation(reservation_id: str, payload: CancelRequest):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if res["user_name"].lower() != payload.user_name.strip().lower():
        raise HTTPException(status_code=403, detail="You can only cancel your own reservation")

    queue = res.get("queue", [])
    if queue:
        # Promote the next user in queue to be the new owner
        new_owner = queue[0]
        new_queue = queue[1:]
        await db.reservations.update_one(
            {"id": reservation_id},
            {"$set": {"user_name": new_owner, "queue": new_queue}},
        )
        return {"success": True, "promoted": True, "new_owner": new_owner}

    await db.reservations.delete_one({"id": reservation_id})
    return {"success": True, "promoted": False}


@api_router.post("/reservations/{reservation_id}/queue", response_model=Reservation)
async def join_queue(reservation_id: str, payload: QueueRequest):
    name = payload.user_name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="user_name is required")
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if res["user_name"].lower() == name.lower():
        raise HTTPException(status_code=400, detail="You already own this slot")
    queue = res.get("queue", [])
    if any(q.lower() == name.lower() for q in queue):
        raise HTTPException(status_code=409, detail="You are already in the queue")
    queue.append(name)
    await db.reservations.update_one({"id": reservation_id}, {"$set": {"queue": queue}})
    res["queue"] = queue
    return res


@api_router.delete("/reservations/{reservation_id}/queue", response_model=Reservation)
async def leave_queue(reservation_id: str, payload: QueueRequest):
    name = payload.user_name.strip()
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    queue = [q for q in res.get("queue", []) if q.lower() != name.lower()]
    await db.reservations.update_one({"id": reservation_id}, {"$set": {"queue": queue}})
    res["queue"] = queue
    return res


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
