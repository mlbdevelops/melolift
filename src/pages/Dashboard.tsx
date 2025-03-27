import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Download, Upload, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useAuth } from "../contexts/AuthContext";

interface Project {
  id: string;
  title: string;
  description?: string;
  [key: string]: any;
}

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("audio_projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [user]);
  
  const handleCreateNew = () => {
    navigate("/studio");
  };
  
  const handleEditProject = (projectId: string) => {
    navigate(`/studio?project=${projectId}`);
  };
  
  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("audio_projects")
        .delete()
        .eq("id", projectId);
        
      if (error) throw error;
      
      // Update projects list
      setProjects(projects.filter(project => project.id !== projectId));
      
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project"); // Changed from "destructive" to "error"
    }
  };
  
  const handleMixProject = (projectId: string) => {
    navigate(`/mixing?project=${projectId}`);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin h-12 w-12 border-t-2 border-primary rounded-full"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Projects</h1>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>
        
        {projects.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-light-100/60">No projects yet. Start creating your first masterpiece!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
                <p className="text-light-100/60 mb-4">{project.description || "No description"}</p>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMixProject(project.id)}
                  >
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Mix
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditProject(project.id)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
