import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Login from "@/pages/Login";
import Schedule from "@/pages/Schedule";
import { Toaster } from "sonner";

const Gate = () => {
  const { userName } = useAuth();
  return userName ? <Schedule /> : <Login />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Gate />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              unstyled: false,
              className:
                "!rounded-none !border-2 !border-foreground !bg-background !text-foreground !font-mono",
            }}
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
