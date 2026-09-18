import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ConfigProvider } from "./context/ConfigContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ConfirmProvider>
          <ConfigProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ConfigProvider>
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
