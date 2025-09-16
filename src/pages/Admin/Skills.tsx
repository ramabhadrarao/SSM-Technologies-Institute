// src/pages/Admin/Skills.tsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Wrench,
  Tag,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface Skill {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SkillFormData {
  name: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
}

const Skills: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<SkillFormData>({
    name: '',
    description: '',
    category: 'programming',
    level: 'beginner',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'programming', label: 'Programming' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'business', label: 'Business' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'other', label: 'Other' }
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request('/admin/skills');
      console.log('Skills API response:', response); // Debug log
      
      // The API returns { success: true, data: [...], pagination: {...} }
      // The apiClient.request method returns data.data or data
      // Since the API response structure is { success: true, data: [...] }
      // We need to access the data property specifically
      if (response && Array.isArray(response)) {
        setSkills(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setSkills(response.data);
      } else {
        console.warn('Unexpected API response structure:', response);
        setSkills([]);
      }
    } catch (error: any) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to load skills');
      setSkills([]); // Ensure skills is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Skill name is required');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingSkill) {
        await apiClient.request(`/admin/skills/${editingSkill._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        toast.success('Skill updated successfully');
      } else {
        await apiClient.request('/admin/skills', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        toast.success('Skill created successfully');
      }

      await fetchSkills();
      resetForm();
    } catch (error: any) {
      console.error('Error saving skill:', error);
      toast.error(error.response?.data?.message || 'Failed to save skill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description,
      category: skill.category,
      level: skill.level,
      isActive: skill.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (skillId: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    try {
      await apiClient.request(`/admin/skills/${skillId}`, {
        method: 'DELETE'
      });
      toast.success('Skill deleted successfully');
      await fetchSkills();
    } catch (error: any) {
      console.error('Error deleting skill:', error);
      toast.error('Failed to delete skill');
    }
  };

  const toggleSkillStatus = async (skill: Skill) => {
    try {
      await apiClient.request(`/admin/skills/${skill._id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...skill, isActive: !skill.isActive })
      });
      toast.success(`Skill ${!skill.isActive ? 'activated' : 'deactivated'} successfully`);
      await fetchSkills();
    } catch (error: any) {
      console.error('Error updating skill status:', error);
      toast.error('Failed to update skill status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'programming',
      level: 'beginner',
      isActive: true
    });
    setEditingSkill(null);
    setShowForm(false);
  };

  const filteredSkills = (skills || []).filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || skill.level === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      programming: 'bg-blue-100 text-blue-800',
      design: 'bg-purple-100 text-purple-800',
      marketing: 'bg-orange-100 text-orange-800',
      business: 'bg-green-100 text-green-800',
      'data-science': 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getLevelColor = (level: string) => {
    const levelObj = levels.find(l => l.value === level);
    return levelObj?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wrench className="w-8 h-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Skills Management</h1>
                <p className="text-gray-600">Manage skills for instructor selection and course requirements</p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              {levels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <Card key={skill._id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {skill.isActive ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{skill.description}</p>

              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(skill.category)}`}>
                  {categories.find(c => c.value === skill.category)?.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                  {levels.find(l => l.value === skill.level)?.label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(skill)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSkillStatus(skill)}
                    className={skill.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {skill.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(skill._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(skill.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <Card className="p-12 text-center">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter !== 'all' || levelFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first skill.'}
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </Card>
        )}
      </div>

      {/* Skill Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., JavaScript, React, Python"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Brief description of the skill..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  >
                    {levels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active (available for selection)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={submitting}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {editingSkill ? 'Update Skill' : 'Create Skill'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;