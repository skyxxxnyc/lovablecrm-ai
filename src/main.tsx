import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <SubscriptionProvider>
      <App />
    </SubscriptionProvider>
  </ThemeProvider>
);
