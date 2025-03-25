
import { useState } from "react";
import { User, Music, Mail, Calendar, LogOut, Edit } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";

interface UserProfile {
  name: string;
  email: string;
  joinDate: string;
  projectsCount: number;
  bio: string;
  avatar?: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "Alex Johnson",
    email: "alex@example.com",
    joinDate: "June 12, 2023",
    projectsCount: 12,
    bio: "Music producer and vocalist with a passion for creating unique sounds.",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setProfile(editedProfile);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [projectStatistics] = useState([
    { label: "Total Projects", value: 12 },
    { label: "Exported Tracks", value: 8 },
    { label: "Total Studio Time", value: "14h 32m" },
    { label: "Collaborations", value: 3 },
  ]);

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
                >
                  {isEditing ? (
                    <>
                      Save
                    </>
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
                    name="name"
                    value={editedProfile.name}
                    onChange={handleChange}
                    className="text-xl font-bold text-center bg-dark-300 border border-white/10 rounded px-2 py-1 mb-1 w-full"
                  />
                ) : (
                  <h3 className="text-xl font-bold mb-1">{profile.name}</h3>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-light-100/60" />
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedProfile.email}
                      onChange={handleChange}
                      className="flex-1 bg-dark-300 border border-white/10 rounded px-2 py-1"
                    />
                  ) : (
                    <span>{profile.email}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-light-100/60" />
                  <span>Joined {profile.joinDate}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-light-100/60" />
                  <span>{profile.projectsCount} Projects</span>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium mb-2">Bio</h4>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={editedProfile.bio}
                      onChange={handleChange}
                      className="w-full bg-dark-300 border border-white/10 rounded px-3 py-2 min-h-[100px]"
                    />
                  ) : (
                    <p className="text-light-100/70 text-sm">{profile.bio}</p>
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
                >
                  Subscription Settings
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-light-100/70 hover:text-light-100"
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
                {projectStatistics.map((stat, index) => (
                  <div key={index} className="bg-dark-300 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-light-100/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recently Worked On */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Recently Worked On</h2>
              
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div 
                    key={item} 
                    className="flex items-center justify-between p-4 border border-white/5 rounded-lg hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-dark-400 rounded flex items-center justify-center">
                        <Music className="h-6 w-6 text-light-100/40" />
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Project Title {item}</h3>
                        <div className="text-sm text-light-100/60">
                          Last edited 2 days ago
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Open
                    </Button>
                  </div>
                ))}
              </div>
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="border border-white/10 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Free</h3>
                    <ul className="text-sm text-light-100/70 space-y-2 mb-4">
                      <li>• 3 projects</li>
                      <li>• Basic AI alignment</li>
                      <li>• 5 exports per month</li>
                    </ul>
                    <div className="text-xl font-bold mb-4">$0</div>
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  </div>
                  
                  <div className="border border-primary/30 bg-primary/5 rounded-lg p-4 relative">
                    <div className="absolute -top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      POPULAR
                    </div>
                    <h3 className="font-medium mb-2">Pro</h3>
                    <ul className="text-sm text-light-100/70 space-y-2 mb-4">
                      <li>• Unlimited projects</li>
                      <li>• Advanced AI processing</li>
                      <li>• 50 exports per month</li>
                      <li>• Priority support</li>
                    </ul>
                    <div className="text-xl font-bold mb-4">$9.99<span className="text-sm font-normal">/month</span></div>
                    <Button variant="gradient" className="w-full">
                      Upgrade
                    </Button>
                  </div>
                  
                  <div className="border border-white/10 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Premium</h3>
                    <ul className="text-sm text-light-100/70 space-y-2 mb-4">
                      <li>• Everything in Pro</li>
                      <li>• Unlimited exports</li>
                      <li>• Commercial use license</li>
                      <li>• Advanced customization</li>
                    </ul>
                    <div className="text-xl font-bold mb-4">$19.99<span className="text-sm font-normal">/month</span></div>
                    <Button variant="outline" className="w-full">
                      Upgrade
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
