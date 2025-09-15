import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Public Pages
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Subjects from './pages/Subjects';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Dashboard Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsersManagement from './pages/Admin/UsersManagement';
import AdminCoursesManagement from './pages/Admin/CoursesManagement';
import AdminBatchesManagement from './pages/Admin/BatchesManagement';
import AdminMessagesManagement from './pages/Admin/MessagesManagement';
import AdminReportsAnalytics from './pages/Admin/ReportsAnalytics';
import AdminSystemSettings from './pages/Admin/SystemSettings';
import StudentDashboard from './pages/Student/Dashboard';
import InstructorDashboard from './pages/Instructor/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersManagement />} />
              <Route path="/admin/courses" element={<AdminCoursesManagement />} />
              <Route path="/admin/batches" element={<AdminBatchesManagement />} />
              <Route path="/admin/messages" element={<AdminMessagesManagement />} />
              <Route path="/admin/reports" element={<AdminReportsAnalytics />} />
              <Route path="/admin/settings" element={<AdminSystemSettings />} />
              
              {/* Student & Instructor Routes */}
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;