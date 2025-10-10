import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <main className="container mx-auto px-4 py-6" id="main-content" role="main">
        {children}
      </main>
    </div>
  );
};
