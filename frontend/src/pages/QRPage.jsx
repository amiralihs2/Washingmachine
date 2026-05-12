import React from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Printer, WashingMachine } from "lucide-react";

export default function QRPage() {
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="qr-page">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b-2 border-foreground print:hidden">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <Link
            to="/"
            data-testid="qr-back-link"
            className="border-2 border-foreground p-2 hover:-translate-y-0.5 transition-transform inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span className="font-mono text-xs uppercase tracking-[0.2em]">Back</span>
          </Link>
          <button
            onClick={() => window.print()}
            data-testid="qr-print-button"
            className="border-2 border-foreground p-2 hover:-translate-y-0.5 transition-transform inline-flex items-center gap-2"
          >
            <Printer size={16} />
            <span className="font-mono text-xs uppercase tracking-[0.2em]">Print</span>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 print:py-12">
        <div className="border-2 border-foreground p-6 bg-card text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(16,185,129,0.4)] print:shadow-none">
          <div className="inline-flex items-center gap-2 border-2 border-foreground px-3 py-1 mb-5 font-mono text-[10px] tracking-[0.2em]">
            <WashingMachine size={12} /> SCAN TO BOOK
          </div>

          <h1 className="font-display text-4xl leading-none mb-2" data-testid="qr-title">
            WASH<span className="bg-foreground text-background px-1.5">SLOT</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em] mb-6">
            // dorm laundry · book your slot
          </p>

          <div className="bg-white p-4 border-2 border-foreground inline-block" data-testid="qr-image">
            <QRCodeSVG value={appUrl} size={220} level="M" includeMargin={false} />
          </div>

          <p className="font-mono text-[10px] mt-5 break-all opacity-70" data-testid="qr-url">
            {appUrl}
          </p>

          <ol className="text-left font-mono text-xs space-y-2 mt-6 list-decimal list-inside">
            <li>Open phone camera</li>
            <li>Point at the QR code</li>
            <li>Tap the link · enter your name · book a slot</li>
          </ol>
        </div>

        <p className="text-center font-mono text-[10px] text-muted-foreground mt-6 uppercase tracking-[0.3em] print:mt-10">
          ★ Stick this on the washing machine ★
        </p>
      </main>
    </div>
  );
}
