// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaQuoteLeft } from 'react-icons/fa';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on role
      if (user?.role === 'admin' || user?.email?.includes('libmate.edu')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // In LoginPage.jsx, update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Success - redirect handled by useEffect
        console.log('Login successful');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
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
              "A reader lives a thousand lives before he dies. The man who never reads lives only one."
            </blockquote>
            <cite className="text-[#C4895A] text-sm not-italic block">— George R.R. Martin</cite>
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
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#FAF7F2] to-[#F3EDE3] p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#2C1F14] to-[#4A3728] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-serif text-2xl font-bold">L</span>
              </div>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#2C1F14]">Welcome back</h2>
            <p className="mt-2 text-sm text-[#9A8478]">Log in to access your library account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#4A3728] mb-2">
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
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#EAE0D0] rounded-xl bg-white placeholder-[#9A8478] text-[#2C1F14] focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#4A3728] mb-2">
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-[#EAE0D0] rounded-xl bg-white placeholder-[#9A8478] text-[#2C1F14] focus:outline-none focus:ring-2 focus:ring-[#C4895A] focus:border-transparent transition-all"
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#C4895A] focus:ring-[#C4895A] border-[#EAE0D0] rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#9A8478]">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-[#C4895A] hover:text-[#D4A574] transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#2C1F14] hover:bg-[#4A3728] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C4895A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EAE0D0]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-[#9A8478]">or</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-[#9A8478]">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-[#C4895A] hover:text-[#D4A574] transition-colors">
                Register here
              </Link>
            </p>
          </div>

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

export default LoginPage;