
import { useState, useEffect } from "react";
import { User, Music, Mail, Calendar, LogOut, Edit, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  joinDate: string;
  avatar_url: string | null;
  bio: string;
}

interface ProjectStats {
  total: number;
  exported: number;
  inProgress: number;
}

const Profile = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    total: 0,
    exported: 0,
    inProgress: 0
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchProjectStats();
      fetchRecentProjects();
    }
  }, [user, profile]);

  const fetchUserData = async () => {
    if (!user || !profile) return;
    
    try {
      // Format the timestamp
      const joinDate = new Date(user.created_at || Date.now()).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      
      setUserProfile({
        id: user.id,
        display_name: profile.display_name || 'User',
        email: user.email || '',
        joinDate,
        avatar_url: profile.avatar_url,
        bio: 'Music producer and vocalist with a passion for creating unique sounds.',
      });
      
      setEditedProfile({
        display_name: profile.display_name || 'User',
        bio: 'Music producer and vocalist with a passion for creating unique sounds.',
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user profile");
      setLoading(false);
    }
  };

  const fetchProjectStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('audio_projects')
        .select('status')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      const total = data.length;
      const exported = data.filter(project => project.status === 'completed').length;
      const inProgress = data.filter(project => project.status === 'in_progress').length;
      
      setProjectStats({ total, exported, inProgress });
    } catch (error) {
      console.error("Error fetching project stats:", error);
    }
  };

  const fetchRecentProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('audio_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(3);
        
      if (error) throw error;
      
      setRecentProjects(data || []);
    } catch (error) {
      console.error("Error fetching recent projects:", error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      handleSaveProfile();
    } else {
      setIsEditing(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editedProfile.display_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          display_name: editedProfile.display_name || userProfile.display_name,
          bio: editedProfile.bio || userProfile.bio
        });
      }
      
      // Refresh the auth context profile
      await refreshProfile();
      
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold">Profile</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleEditToggle}
                  isLoading={saving}
                >
                  {isEditing ? (
                    "Save"
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex flex-col items-center mb-6">
                <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                  <User className="h-12 w-12" />
                </div>
                
                {isEditing ? (
                  <input
                    type="text"
                    name="display_name"
                    value={editedProfile.display_name || ''}
                    onChange={handleChange}
                    className="text-xl font-bold text-center bg-dark-300 border border-white/10 rounded px-2 py-1 mb-1 w-full"
                  />
                ) : (
                  <h3 className="text-xl font-bold mb-1">{userProfile?.display_name}</h3>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-light-100/60" />
                  <span>{userProfile?.email}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-light-100/60" />
                  <span>Joined {userProfile?.joinDate}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-light-100/60" />
                  <span>{projectStats.total} Projects</span>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium mb-2">Bio</h4>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={editedProfile.bio || ''}
                      onChange={handleChange}
                      className="w-full bg-dark-300 border border-white/10 rounded px-3 py-2 min-h-[100px]"
                    />
                  ) : (
                    <p className="text-light-100/70 text-sm">{userProfile?.bio}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Account Actions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Account</h3>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-light-100/70 hover:text-light-100"
                  onClick={() => navigate('/subscription')}
                >
                  Subscription Settings
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-light-100/70 hover:text-light-100"
                  onClick={() => navigate('/settings')}
                >
                  Notification Preferences
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-light-100/70 hover:text-light-100"
                >
                  Change Password
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Statistics */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Your Statistics</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-dark-300 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{projectStats.total}</div>
                  <div className="text-sm text-light-100/60">Total Projects</div>
                </div>
                
                <div className="bg-dark-300 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{projectStats.exported}</div>
                  <div className="text-sm text-light-100/60">Exported Tracks</div>
                </div>
                
                <div className="bg-dark-300 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{projectStats.inProgress}</div>
                  <div className="text-sm text-light-100/60">In Progress</div>
                </div>
                
                <div className="bg-dark-300 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {Math.floor(Math.random() * 10) + 1}h
                  </div>
                  <div className="text-sm text-light-100/60">Studio Time</div>
                </div>
              </div>
            </div>
            
            {/* Recently Worked On */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Recently Worked On</h2>
              
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div 
                      key={project.id} 
                      className="flex items-center justify-between p-4 border border-white/5 rounded-lg hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-dark-400 rounded flex items-center justify-center">
                          <Music className="h-6 w-6 text-light-100/40" />
                        </div>
                        
                        <div>
                          <h3 className="font-medium">{project.title}</h3>
                          <div className="text-sm text-light-100/60">
                            Last edited {new Date(project.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/mixing?project=${project.id}`)}
                      >
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-light-100/60">
                  <p>You haven't created any projects yet.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/studio')}
                  >
                    Create Your First Project
                  </Button>
                </div>
              )}
            </div>
            
            {/* Subscription */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Current Plan</h2>
                <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  FREE
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-light-100/70">
                  You're currently on the Free plan. Upgrade to unlock premium features like advanced AI processing, unlimited exports, and more.
                </p>
                
                <Button 
                  variant="gradient" 
                  onClick={() => navigate('/subscription')}
                  className="w-full sm:w-auto"
                >
                  Upgrade Your Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
