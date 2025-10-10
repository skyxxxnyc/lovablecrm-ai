import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { SkipLinks } from "./components/accessibility/SkipLink";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <SkipLinks />
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SubscriptionProvider>
        <App />
      </SubscriptionProvider>
    </ThemeProvider>
  </>
);
