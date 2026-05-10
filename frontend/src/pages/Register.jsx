import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiLockClosed, HiChip } from 'react-icons/hi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', full_name: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      showSuccess('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      showError(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiChip className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-dark-400">Start your AI-powered learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" icon={HiUser} type="text" name="full_name" placeholder="John Doe"
            value={formData.full_name} onChange={handleChange} />
          <Input label="Username" icon={HiUser} type="text" name="username" placeholder="johndoe"
            value={formData.username} onChange={handleChange} required />
          <Input label="Email" icon={HiMail} type="email" name="email" placeholder="john@example.com"
            value={formData.email} onChange={handleChange} required />
          <Input label="Password" icon={HiLockClosed} type="password" name="password" placeholder="At least 8 characters"
            value={formData.password} onChange={handleChange} required minLength={8} />
          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center mt-6 text-dark-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
