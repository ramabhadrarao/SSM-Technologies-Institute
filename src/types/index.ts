export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student' | 'instructor';
  first_name?: string;
  last_name?: string;
  phone?: string;
  whatsapp?: string;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  video_url?: string;
  fees: number;
  duration: string;
  structure: string[];
  subjects: string[];
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  course_id?: string;
  created_at: string;
}

export interface Instructor {
  id: string;
  user_id: string;
  bio: string;
  designation: string;
  image_url?: string;
  resume_url?: string;
  certificates: string[];
  skills: string[];
  experience: number;
  created_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  enrolled_courses: string[];
  created_at: string;
}

export interface Batch {
  id: string;
  name: string;
  course_id: string;
  instructor_id: string;
  schedule: {
    date: string;
    time: string;
    meeting_link?: string;
  }[];
  max_students: number;
  enrolled_students: string[];
  created_at: string;
}

export interface Slider {
  id: string;
  title: string;
  description: string;
  image_url: string;
  order: number;
  active: boolean;
  created_at: string;
}

export interface AboutMember {
  id: string;
  name: string;
  designation: string;
  bio: string;
  image_url?: string;
  order: number;
  created_at: string;
}