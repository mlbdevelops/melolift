
import { ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
  hideNavbar?: boolean;
}

const Layout = ({ children, hideNavbar = false }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-dark-200 text-light-100 flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1 relative pt-20">  {/* Added pt-20 (padding-top) to create space below navbar */}
        {/* Background gradient elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[15%] -left-[10%] w-[70%] h-[60%] rounded-full bg-primary/5 blur-[120px]"></div>
          <div className="absolute -bottom-[15%] -right-[10%] w-[70%] h-[60%] rounded-full bg-accent-purple/5 blur-[120px]"></div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>
      </main>
      
      <footer className="bg-dark-300 border-t border-white/5 py-4 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-light-100/50 text-sm">
          <div>
            <p>© {new Date().getFullYear()} MeloLift. All rights reserved.</p>
          </div>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
