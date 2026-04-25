import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { TenantProvider } from "./context/TenantContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <HelmetProvider>
        <TenantProvider>
          <App />
        </TenantProvider>
      </HelmetProvider>
    </ThemeProvider>
  </StrictMode>
);
