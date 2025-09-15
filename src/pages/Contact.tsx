// src/pages/Contact.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Shield,
  AlertTriangle
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import ReCaptcha, { ReCaptchaRef } from '../components/UI/ReCaptcha';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  agreeToTerms: boolean;
}

const Contact: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [formStartTime] = useState(Date.now());
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const recaptchaRef = React.useRef<ReCaptchaRef>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
      recaptchaRef.current?.reset();
    if (!captchaToken) {
      toast.error('Please complete the CAPTCHA verification');
      return;
    }

    setLoading(true);
    try {
      const messageData = {
        ...data,
        captchaToken,
        formStartTime: formStartTime.toString(),
        // Honeypot fields (empty for legitimate users)
        website: '',
        url: '',
        link: ''
      };
      
      await apiClient.createContactMessage(messageData);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
    toast.error('CAPTCHA expired. Please verify again.');
  };

  const handleCaptchaError = () => {
    setCaptchaToken(null);
    toast.error('CAPTCHA error. Please try again.');
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Visit Us',
      details: [
        'SSM Technologies Coaching Institute',
        '123 Education Street, Knowledge City',
        'Chennai, Tamil Nadu 600001',
        'India'
      ]
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Call Us',
      details: [
        '+91 98765 43210',
        '+91 98765 43211',
        'Mon-Sat: 9:00 AM - 8:00 PM',
        'Sunday: 10:00 AM - 6:00 PM'
      ]
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Us',
      details: [
        'info@ssmtechnologies.co.in',
        'admissions@ssmtechnologies.co.in',
        'support@ssmtechnologies.co.in',
        'careers@ssmtechnologies.co.in'
      ]
    }
  ];

  const departments = [
    {
      name: 'Admissions',
      email: 'admissions@ssmtechnologies.co.in',
      phone: '+91 98765 43210',
      description: 'Course inquiries, enrollment, and admission process'
    },
    {
      name: 'Technical Support',
      email: 'support@ssmtechnologies.co.in',
      phone: '+91 98765 43211',
      description: 'Technical issues, portal access, and course materials'
    },
    {
      name: 'Placements',
      email: 'placements@ssmtechnologies.co.in',
      phone: '+91 98765 43212',
      description: 'Career guidance, placement assistance, and job opportunities'
    },
    {
      name: 'Corporate Training',
      email: 'corporate@ssmtechnologies.co.in',
      phone: '+91 98765 43213',
      description: 'Corporate training programs and bulk enrollments'
    }
  ];

  const faqs = [
    {
      question: 'What are your course timings?',
      answer: 'We offer flexible batch timings including morning (9 AM - 12 PM), afternoon (2 PM - 5 PM), evening (6 PM - 9 PM), and weekend batches.'
    },
    {
      question: 'Do you provide placement assistance?',
      answer: 'Yes, we provide 100% placement assistance with dedicated career counseling, interview preparation, and connections with 200+ hiring partners.'
    },
    {
      question: 'Can I pay the course fee in installments?',
      answer: 'Yes, we offer flexible payment options including installments and EMI facilities to make education affordable.'
    },
    {
      question: 'Do you offer online classes?',
      answer: 'Yes, we offer both online and offline classes. Our online classes are live and interactive with recorded sessions for revision.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get In Touch
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              {/* Security Notice */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Secure Contact Form</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      This form is protected by advanced security measures including CAPTCHA verification and rate limiting.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                    >
                      {showSecurityInfo ? 'Hide' : 'Show'} security details
                    </button>
                    {showSecurityInfo && (
                      <div className="mt-3 text-xs text-blue-600 space-y-1">
                        <p>• Maximum 3 messages per hour from same IP</p>
                        <p>• Maximum 2 messages per email/phone per hour</p>
                        <p>• CAPTCHA verification required</p>
                        <p>• Automated spam detection</p>
                        <p>• Content validation and filtering</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[+]?[\d\s-()]+$/,
                          message: 'Invalid phone number',
                        },
                      })}
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <select
                      {...register('subject', { required: 'Subject is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="course-inquiry">Course Inquiry</option>
                      <option value="admission">Admission Process</option>
                      <option value="placement">Placement Assistance</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="corporate-training">Corporate Training</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  {/* Honeypot fields - hidden from users but visible to bots */}
                  <div style={{ display: 'none' }}>
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                    <input type="text" name="url" tabIndex={-1} autoComplete="off" />
                    <input type="text" name="link" tabIndex={-1} autoComplete="off" />
                  </div>

                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    {...register('message', {
                      required: 'Message is required',
                      minLength: {
                        value: 10,
                        message: 'Message must be at least 10 characters long',
                      },
                    })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Tell us how we can help you..."
                    maxLength={2000}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Minimum 10 characters required</span>
                    <span>{watch('message')?.length || 0}/2000</span>
                  </div>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                {/* Terms Agreement */}
                <div>
                  <div className="flex items-start">
                    <input
                      {...register('agreeToTerms', {
                        required: 'You must agree to the terms and conditions',
                      })}
                      id="agree-terms"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="agree-terms" className="ml-3 block text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-500">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-500">
                        Privacy Policy
                      </a>
                      . I understand that my information will be used to respond to my inquiry.
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
                  )}
                </div>

                {/* reCAPTCHA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Security Verification *
                  </label>
                  <ReCaptcha
                    ref={recaptchaRef}
                    onVerify={handleCaptchaChange}
                    onExpire={handleCaptchaExpire}
                    onError={handleCaptchaError}
                  />
                  {!captchaToken && (
                    <p className="mt-2 text-sm text-gray-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
                      Please complete the CAPTCHA verification above
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  disabled={!captchaToken}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 flex items-start">
                    <Shield className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    Your message is protected by multiple security layers including CAPTCHA verification, 
                    rate limiting, and spam detection. We typically respond within 24 hours during business days.
                  </p>
                </div>
              </form>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{info.title}</h4>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-sm text-gray-600">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Business Hours */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Business Hours
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium">10:00 AM - 6:00 PM</span>
                </div>
              </div>
            </Card>

            {/* Social Media */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </Card>
          </div>
        </div>

        {/* Departments */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact by Department</h2>
            <p className="text-xl text-gray-600">Get in touch with the right team for faster assistance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{dept.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{dept.description}</p>
                <div className="space-y-2">
                  <a
                    href={`mailto:${dept.email}`}
                    className="block text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {dept.email}
                  </a>
                  <a
                    href={`tel:${dept.phone}`}
                    className="block text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {dept.phone}
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Map Section (Placeholder) */}
        <div className="mt-16">
          <Card className="overflow-hidden">
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive Map Coming Soon</p>
                <p className="text-sm text-gray-500">123 Education Street, Knowledge City, Chennai</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;