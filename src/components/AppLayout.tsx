import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        onContactSelect={() => {}}
        onDealSelect={() => {}}
        onCompanySelect={() => {}}
        onViewChange={() => {}}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
