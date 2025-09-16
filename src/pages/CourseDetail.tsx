// src/pages/CourseDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  IndianRupee,
  Calendar,
  Award,
  PlayCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { Course } from '../types';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourse(id!);
      setCourse(response);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll in this course');
      navigate('/auth/login');
      return;
    }

    if (!id) {
      toast.error('Course ID not found');
      return;
    }

    try {
      setEnrolling(true);
      await apiClient.enrollInCourse(id);
      toast.success('Successfully enrolled in the course!');
      // Optionally redirect to student dashboard or course page
      navigate('/student/courses');
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      toast.error(error.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'video', label: 'Course Video' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'reviews', label: 'Reviews' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/courses"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:flex lg:items-start lg:space-x-8">
            {/* Course Image */}
            <div className="flex-shrink-0 lg:w-80">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl overflow-hidden">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-24 h-24 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="mt-6 lg:mt-0 lg:flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.name}</h1>
              <p className="text-lg text-gray-600 mb-6">{course.description}</p>

              {/* Course Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center">
                  <IndianRupee className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-lg font-semibold">₹{course.fees?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-purple-600 mr-2" />
                  <span>{course.enrollmentCount} students</span>
                </div>
                {course.rating > 0 && (
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2 fill-current" />
                    <span>{course.rating.toFixed(1)} ({course.reviews?.length || 0} reviews)</span>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="flex-1 sm:flex-none"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  <Award className="w-5 h-5 mr-2" />
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </Button>
                <Button variant="outline" size="lg">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Preview Course
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {selectedTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h2>
                  <div className="prose prose-lg text-gray-600">
                    <p>{course.description}</p>
                    
                    {course.structure && course.structure.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                        <ul className="space-y-3">
                          {course.structure.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTab === 'curriculum' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
                  {course.subjects && course.subjects.length > 0 ? (
                    <div className="space-y-4">
                      {course.subjects.map((subject, index) => (
                        <Card key={index} className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{typeof subject === 'string' ? subject : subject.name}</h3>
                              <p className="text-gray-600">Subject {index + 1}</p>
                              {typeof subject === 'object' && subject.description && (
                                <p className="text-sm text-gray-500 mt-1">{subject.description}</p>
                              )}
                            </div>
                            <PlayCircle className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          {/* Instructor Assignment Section */}
                          {typeof subject === 'object' && subject.instructor ? (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {subject.instructor.user ? 
                                      `${subject.instructor.user.firstName} ${subject.instructor.user.lastName}` : 
                                      'Instructor Name'
                                    }
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {subject.instructor.designation || 'Subject Instructor'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                Assigned
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">No instructor assigned</p>
                                  <p className="text-xs text-gray-400">Instructor will be assigned soon</p>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                Pending
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Detailed curriculum will be available soon.</p>
                  )}
                </div>
              )}

              {selectedTab === 'video' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Video</h2>
                  {course.videoUrl ? (
                    <Card className="p-6">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        {course.videoUrl.includes('youtube.com') || course.videoUrl.includes('youtu.be') ? (
                          <iframe
                            src={course.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            title={`${course.name} - Course Video`}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={course.videoUrl}
                            controls
                            className="w-full h-full"
                            poster={course.imageUrl}
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Introduction</h3>
                        <p className="text-gray-600">
                          Watch this video to get an overview of what you'll learn in this course and how it will benefit your career.
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-6">
                      <div className="text-center py-12">
                        <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Video Available</h3>
                        <p className="text-gray-600">Course video will be available soon.</p>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {selectedTab === 'instructor' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Meet Your Instructor</h2>
                  <Card className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Expert Instructor</h3>
                        <p className="text-blue-600 mb-2">Industry Professional</p>
                        <p className="text-gray-600">
                          Learn from experienced professionals who bring real-world expertise to the classroom.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {selectedTab === 'reviews' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Reviews</h2>
                  {course.reviews && course.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {course.reviews.map((review, index) => (
                        <Card key={index} className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm text-gray-600">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="mt-12 lg:mt-0">
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-green-600">₹{course.fees?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium">{course.enrollmentCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Certificate</span>
                  <span className="font-medium text-green-600">Yes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Access</span>
                  <span className="font-medium">Lifetime</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  <Award className="w-5 h-5 mr-2" />
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  30-day money-back guarantee
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;