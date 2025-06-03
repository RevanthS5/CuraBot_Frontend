/* eslint-disable */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, User, Phone, UserPlus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import useForm from '../hooks/useForm';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

interface RegisterFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'patient' | 'doctor' | 'admin';
}

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error: authError } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = (values: RegisterFormValues) => {
    const errors: Partial<RegisterFormValues> = {};
    
    if (!values.name) {
      errors.name = 'Name is required';
    }
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!values.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(values.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone number must be 10 digits';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const { values, errors, touched, handleChange, handleSubmit } = useForm<RegisterFormValues>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
    },
    validate: validateForm,
    onSubmit: async (values) => {
      setFormError(null);
      try {
        const { confirmPassword, ...userData } = values;
        console.log('Register data being sent:', userData);
        await register(userData);
        navigate('/');
      } catch (err: any) {
        setFormError(err.message);
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-white">
      <div className="container-custom py-6">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-radial from-primary-200 to-transparent rounded-full"></div>
                <Activity className="h-16 w-16 text-primary-600 relative z-10" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Join CuraBot
            </h2>
            <p className="mt-2 text-center text-base text-gray-600">
              Create your account to get started
            </p>
          </motion.div>
          
          {(formError || authError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Alert 
                status="error" 
                description={formError || authError}
                onClose={() => setFormError(null)}
              />
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-card border-0">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  label="Full name"
                  autoComplete="name"
                  required
                  value={values.name}
                  onChange={handleChange}
                  error={touched.name ? errors.name : undefined}
                  leftIcon={<User className="h-5 w-5 text-gray-400" />}
                  placeholder="John Doe"
                />
                
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email address"
                  autoComplete="email"
                  required
                  value={values.email}
                  onChange={handleChange}
                  error={touched.email ? errors.email : undefined}
                  leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                  placeholder="you@example.com"
                />
                
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  label="Phone number"
                  autoComplete="tel"
                  required
                  value={values.phone}
                  onChange={handleChange}
                  error={touched.phone ? errors.phone : undefined}
                  leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
                  placeholder="1234567890"
                />
                
                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  autoComplete="new-password"
                  required
                  value={values.password}
                  onChange={handleChange}
                  error={touched.password ? errors.password : undefined}
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                  placeholder="••••••••"
                />
                
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Confirm password"
                  autoComplete="new-password"
                  required
                  value={values.confirmPassword}
                  onChange={handleChange}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                  placeholder="••••••••"
                />

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    I am a
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white shadow-sm"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  leftIcon={<UserPlus className="h-5 w-5" />}
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-md hover:shadow-lg transition-all py-3 mt-6"
                >
                  Create Account
                </Button>
                
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                      Sign in instead
                    </Link>
                  </p>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}