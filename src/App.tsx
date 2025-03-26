
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioProvider } from "./contexts/AudioContext";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./components/LandingPage";
import Dashboard from "./pages/Dashboard";
import Studio from "./pages/Studio";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Mixing from "./pages/Mixing";
import GroovePad from "./pages/GroovePad";
import Subscription from "./pages/Subscription";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AudioProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/index" element={<Index />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/studio" 
                element={
                  <ProtectedRoute>
                    <Studio />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mixing" 
                element={
                  <ProtectedRoute>
                    <Mixing />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/groovepad" 
                element={
                  <ProtectedRoute>
                    <GroovePad />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/subscription" 
                element={
                  <ProtectedRoute>
                    <Subscription />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AudioProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
