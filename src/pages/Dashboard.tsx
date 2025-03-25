
import { useState } from "react";
import { Music, Mic, Sliders, Download, Play, FileAudio, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import AudioVisualizer from "../components/AudioVisualizer";

interface Project {
  id: string;
  title: string;
  date: string;
  duration: string;
  thumbnail?: string;
}

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "Summer Vibes",
      date: "Jun 15, 2023",
      duration: "3:24",
    },
    {
      id: "2",
      title: "Acoustic Session",
      date: "May 28, 2023",
      duration: "4:15",
    },
    {
      id: "3",
      title: "Demo Track",
      date: "Apr 12, 2023",
      duration: "2:58",
    }
  ]);

  const [recentActivity] = useState([
    {
      id: "1",
      action: "Created new project",
      project: "Summer Vibes",
      date: "2 hours ago"
    },
    {
      id: "2",
      action: "Added vocals to",
      project: "Acoustic Session",
      date: "Yesterday"
    },
    {
      id: "3",
      action: "Exported",
      project: "Demo Track",
      date: "3 days ago"
    }
  ]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          <Link to="/studio">
            <Button variant="gradient" className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              New Project
            </Button>
          </Link>
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
                    <span className="text-light-100/60 text-sm">{selectedProject.duration}</span>
                  </div>
                  
                  <div className="h-40 bg-dark-300 rounded-lg overflow-hidden mb-4">
                    <AudioVisualizer isPlaying={isPlaying} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-light-100/60">
                      Last edited on {selectedProject.date}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={togglePlayback}
                      >
                        <Play className="h-4 w-4" />
                        {isPlaying ? "Pause" : "Play"}
                      </Button>
                      
                      <Link to={`/studio?project=${selectedProject.id}`}>
                        <Button 
                          variant="gradient" 
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Sliders className="h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-60 flex flex-col items-center justify-center text-light-100/40">
                  <Music className="h-16 w-16 mb-4" />
                  <p>Select a project to preview</p>
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
                          {project.date} • {project.duration}
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Activity Feed */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div 
                    key={activity.id}
                    className="pb-4 border-b border-white/5 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Music className="h-4 w-4" />
                      </div>
                      
                      <div>
                        <p className="text-sm">
                          <span>{activity.action} </span>
                          <span className="font-medium">{activity.project}</span>
                        </p>
                        <p className="text-xs text-light-100/60 mt-1">{activity.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
