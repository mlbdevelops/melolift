
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

// This page serves as a redirection component
const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the landing page
    navigate('/', { replace: true });
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-200">
      <div className="text-center">
        <Loader className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Redirecting...</h1>
        <p className="text-light-100/70">Please wait while we direct you to the main page</p>
      </div>
    </div>
  );
};

export default Index;
