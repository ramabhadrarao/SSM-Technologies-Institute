import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Camera, 
  Save, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit2, 
  Trash2,
  Upload,
  Award,
  Briefcase,
  Calendar,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface InstructorProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  bio?: string;
  designation?: string;
  imageUrl?: string;
  skills: string[];
  certificates: Certificate[];
  workExperience: WorkExperience[];
}

interface Certificate {
  _id?: string;
  title: string;
  institution: string;
  year: number;
  description?: string;
  fileUrl?: string;
}

interface WorkExperience {
  _id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrent: boolean;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const InstructorProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<InstructorProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    bio: '',
    designation: '',
    imageUrl: '',
    skills: [],
    certificates: [],
    workExperience: []
  });
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'experience' | 'certificates' | 'password'>('profile');
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchAvailableSkills();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/instructor/profile');
      setProfile(response.data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await apiClient.get('/instructor/skills');
      setAvailableSkills(response.data);
    } catch (error: any) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const response = await apiClient.put('/instructor/profile', profile);
      setProfile(response.data);
      updateUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setChangingPassword(true);
      await apiClient.put('/instructor/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password changed successfully');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('photo', file);

      const response = await apiClient.post('/instructor/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfile(prev => ({ ...prev, imageUrl: response.data.imageUrl }));
      updateUser({ ...user, imageUrl: response.data.imageUrl });
      toast.success('Photo updated successfully');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSkillToggle = (skillId: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId]
    }));
  };

  const handleExperienceSubmit = async (experience: WorkExperience) => {
    try {
      if (editingExperience) {
        const response = await apiClient.put(`/instructor/experience/${editingExperience._id}`, experience);
        setProfile(prev => ({
          ...prev,
          workExperience: prev.workExperience.map(exp => 
            exp._id === editingExperience._id ? response.data : exp
          )
        }));
        toast.success('Experience updated successfully');
      } else {
        const response = await apiClient.post('/instructor/experience', experience);
        setProfile(prev => ({
          ...prev,
          workExperience: [...prev.workExperience, response.data]
        }));
        toast.success('Experience added successfully');
      }
      setShowExperienceModal(false);
      setEditingExperience(null);
    } catch (error: any) {
      console.error('Error saving experience:', error);
      toast.error(error.response?.data?.message || 'Failed to save experience');
    }
  };

  const handleExperienceDelete = async (experienceId: string) => {
    try {
      await apiClient.delete(`/instructor/experience/${experienceId}`);
      setProfile(prev => ({
        ...prev,
        workExperience: prev.workExperience.filter(exp => exp._id !== experienceId)
      }));
      toast.success('Experience deleted successfully');
    } catch (error: any) {
      console.error('Error deleting experience:', error);
      toast.error(error.response?.data?.message || 'Failed to delete experience');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Instructor Profile</h1>
          <p className="text-gray-600">Manage your professional information and credentials</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'profile', label: 'Profile Information', icon: User },
              { key: 'experience', label: 'Work Experience', icon: Briefcase },
              { key: 'certificates', label: 'Certificates', icon: Award },
              { key: 'password', label: 'Change Password', icon: Lock }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Photo Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto mb-4">
                  {profile.imageUrl ? (
                    <img
                      src={profile.imageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-gray-600">{profile.designation || 'Instructor'}</p>
              {uploadingPhoto && (
                <div className="mt-2">
                  <LoadingSpinner size="sm" />
                  <p className="text-sm text-gray-600 mt-1">Uploading...</p>
                </div>
              )}
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={profile.whatsapp || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, whatsapp: e.target.value }))}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={profile.designation || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, designation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Senior Software Engineer, Data Scientist"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={profile.bio || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about your background and expertise..."
                    />
                  </div>

                  {/* Skills Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Skills & Expertise
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableSkills.map((skill) => (
                        <label key={skill._id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.skills.includes(skill._id)}
                            onChange={() => handleSkillToggle(skill._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{skill.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={updating}
                      className="flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Work Experience Tab */}
            {activeTab === 'experience' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
                  <Button
                    onClick={() => {
                      setEditingExperience(null);
                      setShowExperienceModal(true);
                    }}
                    className="flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </div>

                <div className="space-y-4">
                  {profile.workExperience.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No work experience added yet.</p>
                  ) : (
                    profile.workExperience.map((experience) => (
                      <div key={experience._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{experience.position}</h3>
                            <p className="text-blue-600">{experience.company}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(experience.startDate).toLocaleDateString()} - {
                                experience.isCurrent ? 'Present' : 
                                experience.endDate ? new Date(experience.endDate).toLocaleDateString() : 'Present'
                              }
                            </p>
                            <p className="text-gray-700 mt-2">{experience.description}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingExperience(experience);
                                setShowExperienceModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExperienceDelete(experience._id!)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Certificates & Qualifications</h2>
                  <Button
                    onClick={() => {
                      setEditingCertificate(null);
                      setShowCertificateModal(true);
                    }}
                    className="flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certificate
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.certificates.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No certificates added yet.</p>
                    </div>
                  ) : (
                    profile.certificates.map((certificate) => (
                      <div key={certificate._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Award className="w-5 h-5 text-yellow-500 mt-1" />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingCertificate(certificate);
                                setShowCertificateModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900">{certificate.title}</h3>
                        <p className="text-blue-600">{certificate.institution}</p>
                        <p className="text-sm text-gray-600">{certificate.year}</p>
                        {certificate.description && (
                          <p className="text-gray-700 text-sm mt-2">{certificate.description}</p>
                        )}
                        {certificate.fileUrl && (
                          <a
                            href={certificate.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mt-2"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View Certificate
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {/* Password Change Tab */}
            {activeTab === 'password' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      loading={changingPassword}
                      className="flex items-center"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile;