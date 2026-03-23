import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { SideNav } from "./SideNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      {/* Skip navigation link for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
      >
        Skip to content
      </a>

      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <SideNav />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen max-w-2xl mx-auto md:max-w-none md:mx-0 relative overflow-hidden">
        <Header />
        <main id="main-content" className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
        {/* Bottom nav - mobile only */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>

      <Toaster />
    </div>
  );
}
