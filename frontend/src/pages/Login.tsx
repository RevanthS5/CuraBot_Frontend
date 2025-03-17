import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Activity className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to CuraBot
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        
        {formError && (
          <Alert 
            status="error" 
            description={formError}
            onClose={() => setFormError(null)}
          />
        )}
        {authError && (
          <Alert 
            status="error" 
            description={authError}
          />
        )}
        
        <Card>
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
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}