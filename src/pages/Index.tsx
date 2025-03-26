
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// This page serves as a redirection component
const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      // If the user is logged in, redirect to dashboard
      // If not, redirect to the landing page
      if (user) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [navigate, user, loading]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-200">
      <div className="text-center">
        <Loader className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Redirecting...</h1>
        <p className="text-light-100/70">Please wait while we direct you to the right page</p>
      </div>
    </div>
  );
};

export default Index;
