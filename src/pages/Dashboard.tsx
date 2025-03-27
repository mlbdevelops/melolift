
import { useState, useEffect } from "react";
import { Music, Mic, Sliders, Download, Play, FileAudio, Share2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import AudioVisualizer from "../components/AudioVisualizer";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  duration?: string;
  // Additional fields may be present
}

interface Activity {
  id: string;
  action: string;
  project_title?: string;
  project_id?: string;
  timestamp: string;
  user_id: string;
}

const Dashboard = () => {
  const { user, isPremiumFeature } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchActivity();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('audio_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      // This would fetch from a real activity table in a complete implementation
      // For now, we'll generate activities based on projects
      const { data, error } = await supabase
        .from('audio_projects')
        .select('id, title, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      if (data) {
        const activities: Activity[] = data.map((project, index) => {
          // Create different activity types based on the project
          const activityTypes = [
            { action: "Created new project", timestamp: project.created_at },
            { action: "Updated project", timestamp: project.updated_at },
            { action: "Added vocals to", timestamp: project.updated_at }
          ];
          
          const activityType = activityTypes[index % activityTypes.length];
          
          return {
            id: `activity-${project.id}-${index}`,
            action: activityType.action,
            project_title: project.title,
            project_id: project.id,
            timestamp: activityType.timestamp,
            user_id: user.id
          };
        });
        
        setRecentActivity(activities);
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleDeleteProject = async (projectId: string) => {
    if (!projectId) return;
    
    setDeletingProject(projectId);
    
    try {
      const { error } = await supabase
        .from('audio_projects')
        .delete()
        .eq('id', projectId);
        
      if (error) throw error;
      
      // Update local state
      setProjects(projects.filter(p => p.id !== projectId));
      
      // If the deleted project was selected, select another one or set to null
      if (selectedProject?.id === projectId) {
        const remainingProjects = projects.filter(p => p.id !== projectId);
        setSelectedProject(remainingProjects.length > 0 ? remainingProjects[0] : null);
      }
      
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeletingProject(null);
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleCreateNewProject = async () => {
    // Check if user has reached their project limit
    const planLimits = {
      1: 5,  // Free plan: 5 projects
      2: 20, // Pro plan: 20 projects
      // Premium plan: unlimited
    };
    
    try {
      // Get user's subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('plan_id, status')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const planId = subscription?.status === 'active' ? subscription.plan_id : 1; // Default to free
      
      // If not premium plan and reached limit
      if (planId !== 3 && planLimits[planId] && projects.length >= planLimits[planId]) {
        toast.error(
          <div>
            <p className="font-bold mb-2">Project limit reached</p>
            <p>You've reached the maximum number of projects for your plan.</p>
            <Button 
              variant="gradient" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.href = '/subscription'}
            >
              Upgrade Now
            </Button>
          </div>
        );
        return;
      }
      
      // Redirect to studio to create new project
      window.location.href = '/studio';
    } catch (error) {
      console.error("Error checking project limits:", error);
      // If we can't verify, allow them to continue
      window.location.href = '/studio';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          <Button 
            variant="gradient" 
            className="flex items-center gap-2"
            onClick={handleCreateNewProject}
          >
            <Music className="h-5 w-5" />
            <span>New Project</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Preview */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Project Preview</h2>
              
              {selectedProject ? (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">{selectedProject.title}</h3>
                    <span className="text-light-100/60 text-sm">
                      {selectedProject.duration || "No duration data"}
                    </span>
                  </div>
                  
                  <div className="h-40 bg-dark-300 rounded-lg overflow-hidden mb-4">
                    <AudioVisualizer isPlaying={isPlaying} />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-sm text-light-100/60">
                      Last edited {formatTimestamp(selectedProject.updated_at)}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={togglePlayback}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        <span>{isPlaying ? "Pause" : "Play"}</span>
                      </Button>
                      
                      <Link to={`/studio?project=${selectedProject.id}`}>
                        <Button 
                          variant="gradient" 
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Sliders className="h-4 w-4 mr-1" />
                          <span>Edit</span>
                        </Button>
                      </Link>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleDeleteProject(selectedProject.id)}
                        isLoading={deletingProject === selectedProject.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-60 flex flex-col items-center justify-center text-light-100/40">
                  <Music className="h-16 w-16 mb-4" />
                  <p>{loading ? "Loading projects..." : "No projects to preview"}</p>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/studio" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <Mic className="h-6 w-6" />
                    <span>Record</span>
                  </Button>
                </Link>
                
                <Link to="/studio" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <FileAudio className="h-6 w-6" />
                    <span>Import</span>
                  </Button>
                </Link>
                
                <Link to="/studio" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <Sliders className="h-6 w-6" />
                    <span>Mix</span>
                  </Button>
                </Link>
                
                <Link to="/studio" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <Download className="h-6 w-6" />
                    <span>Export</span>
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Recent Projects */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Projects</h2>
                <Link to="/projects" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map(project => (
                    <div 
                      key={project.id}
                      className={`rounded-lg p-4 cursor-pointer transition-all flex items-center justify-between ${
                        selectedProject?.id === project.id 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-white/5 border border-white/5'
                      }`}
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded bg-dark-300 flex items-center justify-center text-light-100/40">
                          <Music className="h-6 w-6" />
                        </div>
                        
                        <div>
                          <h3 className="font-medium">{project.title}</h3>
                          <div className="text-sm text-light-100/60">
                            {new Date(project.created_at).toLocaleDateString()} • {project.duration || "N/A"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-light-100/60 hover:text-light-100"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        
                        <Link to={`/studio?project=${project.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-light-100/60 hover:text-light-100"
                          >
                            <Sliders className="h-4 w-4" />
                          </Button>
                        </Link>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-light-100/60 hover:text-light-100 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          isLoading={deletingProject === project.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-light-100/50 border border-dashed border-light-100/20 rounded-lg">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No projects yet</p>
                  <p className="mb-4">Create your first music project to get started</p>
                  <Button 
                    variant="gradient" 
                    onClick={handleCreateNewProject}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Music className="h-4 w-4" />
                    <span>Create a Project</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Activity Feed */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div 
                      key={activity.id}
                      className="pb-4 border-b border-white/5 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Music className="h-4 w-4" />
                        </div>
                        
                        <div>
                          <p className="text-sm">
                            <span>{activity.action} </span>
                            <Link to={`/studio?project=${activity.project_id}`} className="font-medium hover:text-primary">
                              {activity.project_title}
                            </Link>
                          </p>
                          <p className="text-xs text-light-100/60 mt-1">
                            {formatTimestamp(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-light-100/50 border border-dashed border-light-100/20 rounded-lg">
                  <p>No activity yet</p>
                  <p className="text-sm">Your recent actions will appear here</p>
                </div>
              )}
            </div>
            
            {/* Your Presets */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Your Presets</h2>
              
              {isPremiumFeature('custom-presets') ? (
                <div className="space-y-3">
                  {/* This would be populated with actual presets in a complete implementation */}
                  <div className="p-6 text-center text-light-100/50 border border-dashed border-light-100/20 rounded-lg">
                    <p>No presets saved yet</p>
                    <p className="text-sm">Save your favorite mix settings as presets</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="opacity-50 pointer-events-none p-6 text-center border border-dashed border-light-100/20 rounded-lg">
                    <p>Premium Feature</p>
                    <p className="text-sm">Save custom presets for quick mixing</p>
                  </div>
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-dark-300/80 cursor-pointer rounded-lg"
                    onClick={() => {
                      toast.info(
                        <div>
                          <p className="font-bold mb-2">Premium Feature</p>
                          <p>Upgrade to create and save custom presets.</p>
                          <Button 
                            variant="gradient" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => window.location.href = '/subscription'}
                          >
                            Upgrade Now
                          </Button>
                        </div>
                      );
                    }}
                  >
                    <div className="bg-accent-purple text-white text-xs px-2 py-1 rounded-full">
                      PREMIUM
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Recently Worked On */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Recently Worked On</h2>
              
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.slice(0, 3).map(project => (
                    <Link
                      key={project.id}
                      to={`/studio?project=${project.id}`}
                      className="block p-3 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-dark-300 flex items-center justify-center text-light-100/40">
                          <Music className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-medium truncate">{project.title}</h3>
                          <p className="text-xs text-light-100/60">
                            Edited {formatTimestamp(project.updated_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-light-100/50 border border-dashed border-light-100/20 rounded-lg">
                  <p>No recent projects</p>
                  <p className="text-sm">Your recently worked on projects will appear here</p>
                </div>
              )}
            </div>
            
            {/* Tips */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Pro Tips</h2>
              
              <div className="space-y-4">
                <div className="pb-3 border-b border-white/5">
                  <h3 className="text-sm font-medium mb-1">Perfect Vocal Recording</h3>
                  <p className="text-xs text-light-100/60">
                    Record in a quiet room with minimal echo for best results.
                  </p>
                </div>
                
                <div className="pb-3 border-b border-white/5">
                  <h3 className="text-sm font-medium mb-1">AI Adjustment Tricks</h3>
                  <p className="text-xs text-light-100/60">
                    Use the groove pad to fine-tune the energy and mood of your track.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Quick Exports</h3>
                  <p className="text-xs text-light-100/60">
                    Press Ctrl+E to quickly export your current project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
