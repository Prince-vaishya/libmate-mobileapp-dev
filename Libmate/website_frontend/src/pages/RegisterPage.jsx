// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash, FaQuoteLeft } from 'react-icons/fa';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',  // Changed from fullName to full_name
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!formData.full_name.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    setLoading(true);
    
    // Prepare data for API - match backend expectations
    const registerData = {
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || ''
    };
    
    const result = await register(registerData);
    
    if (result.success) {
      // After successful registration, user is automatically logged in
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#2C1F14] to-[#4A3728] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C4895A]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C4895A]/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#C4895A] rounded-xl flex items-center justify-center">
              <span className="text-white font-serif font-bold text-xl">L</span>
            </div>
            <span className="font-serif text-xl font-bold text-white">LibMate</span>
          </div>
          <div className="space-y-6">
            <FaQuoteLeft className="text-[#C4895A] text-3xl opacity-60" />
            <blockquote className="text-white text-2xl md:text-3xl font-serif leading-relaxed">
              "The more that you read, the more things you will know. The more that you learn, the more places you'll go."
            </blockquote>
            <cite className="text-[#C4895A] text-sm not-italic block">— Dr. Seuss</cite>
          </div>
          <div className="flex gap-2 justify-start">
            {['#8B6F5E', '#4A7C59', '#5E6B8B', '#8B5E6B', '#7A6B4A', '#4A6B7C'].map((color, i) => (
              <div
                key={i}
                className="w-8 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
                style={{ backgroundColor: color, height: `${60 + i * 10}px` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#FAF7F2] to-[#F3EDE3] p-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#2C1F14] to-[#4A3728] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-serif text-2xl font-bold">L</span>
              </div>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#2C1F14]">Join LibMate</h2>
            <p className="mt-2 text-sm text-[#9A8478]">Create your free account and start exploring</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-[#4A3728] mb-1">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-[#9A8478]" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#EAE0D0] rounded-xl bg-white placeholder-[#9A8478] text-[#2C1F14] focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent transition-all"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#4A3728] mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-[#9A8478]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#EAE0D0] rounded-xl bg-white placeholder-[#9A8478] text-[#2C1F14] focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#4A3728] mb-1">
                Phone number <span className="text-[#9A8478] text-xs">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-[#9A8478]" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#EAE0D0] rounded-xl bg-white placeholder-[#9A8478] text-[#2C1F14] focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent transition-all"
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#4A3728] mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-[#9A8478]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-[#EAE0D0] rounded-xl bg-white placeholder-[#9A8478] text-[#2C1F14] focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent transition-all"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#4A3728] mb-1">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-[#9A8478]" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-[#EAE0D0] rounded-xl bg-white placeholder-[#9A8478] text-[#2C1F14] focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent transition-all"
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9A8478] hover:text-[#C4895A] transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <div className="bg-[#C4895A]/10 border border-[#C4895A]/20 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 text-[#C4895A] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-[#C4895A]">
                  By registering, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#2C1F14] hover:bg-[#4A3728] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C4895A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EAE0D0]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-[#9A8478]">or</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-[#9A8478]">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#C4895A] hover:text-[#D4A574] transition-colors">
                Log in
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-3 bg-[#EAE0D0]/30 rounded-lg border border-[#EAE0D0]">
            <p className="text-xs text-center text-[#9A8478]">
              <span className="font-semibold text-[#C4895A]">Demo Credentials:</span><br />
              Email: emma.watson@email.com<br />
              Password: password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;