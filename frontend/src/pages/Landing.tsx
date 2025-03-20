import { Link } from 'react-router-dom';
import { Activity, UserPlus, LogIn, Users, Calendar, MessageSquare, Shield, ChevronRight, Heart, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Landing() {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [testimonialsRef, testimonialsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
        <div className="container-custom">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">CuraBot</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-600 hover:text-primary-600 transition-colors">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 transition-all"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-br from-primary-50 to-white">
        <div className="container-custom">
          <motion.div 
            ref={heroRef}
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                <span className="flex h-2 w-2 rounded-full bg-primary-600 mr-2"></span>
                Next-Gen Healthcare Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Modern Healthcare <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">Powered by AI</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                CuraBot connects patients with doctors seamlessly, while providing powerful tools for healthcare providers and administrators.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="btn-primary inline-flex items-center justify-center text-center px-8 py-3 rounded-md text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-md hover:shadow-lg"
                >
                  Get started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="btn-outline inline-flex items-center justify-center text-center"
                >
                  Login to your account
                </Link>
              </div>
              <div className="flex items-center space-x-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-primary-${i*100}`}></div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">1000+</span> patients trust us
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-primary-200/50 to-transparent rounded-full blur-xl"></div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10"
              >
                <img
                  className="w-full h-auto rounded-2xl shadow-card"
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                  alt="Doctor using digital tablet"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-card">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full">
                      <Heart className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Health Monitoring</p>
                      <p className="text-xs text-gray-500">AI-powered insights</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-card">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-full">
                      <Clock className="h-6 w-6 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Quick Appointments</p>
                      <p className="text-xs text-gray-500">Book in seconds</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section bg-white" ref={featuresRef}>
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary-600 mr-2"></span>
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A better way to manage healthcare</h2>
            <p className="text-lg text-gray-600">
              CuraBot provides a comprehensive solution for patients, doctors, and administrators.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Calendar className="h-6 w-6" />,
                title: "Easy Appointment Booking",
                description: "Book appointments with your preferred doctors in just a few clicks, with real-time availability.",
                color: "primary"
              },
              {
                icon: <MessageSquare className="h-6 w-6" />,
                title: "AI-Powered Health Assistant",
                description: "Get preliminary health advice and symptom analysis from our advanced AI chatbot.",
                color: "secondary"
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Doctor Management",
                description: "Doctors can manage their schedules, view patient history, and track appointments efficiently.",
                color: "primary"
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Secure Medical Records",
                description: "Your medical information is stored securely and accessible only to authorized personnel.",
                color: "secondary"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="card hover:shadow-lg transition-all"
              >
                <div className={`flex items-center justify-center h-14 w-14 rounded-xl bg-${feature.color}-100 text-${feature.color}-600 mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section bg-gradient-to-br from-primary-50 to-white" ref={testimonialsRef}>
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary-600 mr-2"></span>
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What our users say</h2>
            <p className="text-lg text-gray-600">
              Discover how CuraBot is transforming healthcare experiences for patients and providers alike.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Patient",
                image: "https://randomuser.me/api/portraits/women/32.jpg",
                quote: "CuraBot has made managing my healthcare so much easier. I can book appointments and access my records anytime!"
              },
              {
                name: "Dr. Michael Chen",
                role: "Cardiologist",
                image: "https://randomuser.me/api/portraits/men/54.jpg",
                quote: "As a doctor, CuraBot helps me organize my schedule and provide better care to my patients with its comprehensive tools."
              },
              {
                name: "Emily Rodriguez",
                role: "Hospital Administrator",
                image: "https://randomuser.me/api/portraits/women/68.jpg",
                quote: "The administrative features have streamlined our operations and improved efficiency across our entire facility."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="card hover:shadow-lg transition-all"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="section bg-white">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your healthcare experience?</h2>
                <p className="text-primary-100 mb-6">Join thousands of patients and healthcare providers who trust CuraBot for their healthcare needs.</p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-white mr-2" />
                    <span className="text-white">Easy appointment booking</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-white mr-2" />
                    <span className="text-white">Secure medical records</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-white mr-2" />
                    <span className="text-white">AI-powered health assistance</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-4">Create your account</h3>
                <div className="space-y-4">
                  <Link
                    to="/register"
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-sm hover:shadow-md transition-all"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Register Now
                  </Link>
                  <Link
                    to="/login"
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Activity className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">CuraBot</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 mb-6 md:mb-0">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-600 hover:text-primary-600 transition-colors">Contact</a>
            </div>
            <div className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} CuraBot. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
