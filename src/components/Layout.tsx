
import { ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-dark-100 text-light-100 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {children}
      </main>
      <footer className="bg-dark-200 border-t border-white/5 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gradient text-xl font-bold">MelodyAligner</span>
              <span className="text-light-100/60 text-sm">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex gap-6 text-light-100/60">
              <a href="#" className="hover:text-light-100 transition-colors">Terms</a>
              <a href="#" className="hover:text-light-100 transition-colors">Privacy</a>
              <a href="#" className="hover:text-light-100 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
