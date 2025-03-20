import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import useForm from '../hooks/useForm';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = (values: { email: string; password: string }) => {
    const errors: Partial<{ email: string; password: string }> = {};
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    }
    
    return errors;
  };

  const { values, errors, touched, handleChange, handleSubmit } = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: validateForm,
    onSubmit: async (values) => {
      setFormError(null);
      try {
        console.log('Login data being sent:', values);
        const loggedInUser = await login(values.email, values.password);
        // Navigate based on the user role from the login response
        if (loggedInUser && loggedInUser.role) {
          console.log('Navigating to:', `/${loggedInUser.role}`);
          navigate(`/${loggedInUser.role}`);
        } else {
          navigate('/');
        }
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
      
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-radial from-primary-200 to-transparent rounded-full"></div>
                <Activity className="h-16 w-16 text-primary-600 relative z-10" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-base text-gray-600">
              Sign in to your CuraBot account
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
              <form className="space-y-6" onSubmit={handleSubmit}>
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
                />
                
                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  autoComplete="current-password"
                  required
                  value={values.password}
                  onChange={handleChange}
                  error={touched.password ? errors.password : undefined}
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-md hover:shadow-lg transition-all py-3"
                >
                  Sign in
                </Button>
                
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                      Create one now
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