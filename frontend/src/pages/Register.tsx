import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Activity className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
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
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={values.role}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              leftIcon={<UserPlus className="h-5 w-5" />}
            >
              Create Account
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}