import React, { useState } from 'react';
import { authService } from '../services/api';
import { Leaf, Lock, Mail, UserCheck, CheckCircle2 } from 'lucide-react';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'SUSTAINABILITY_MANAGER'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // Sending payload object directly
      await authService.register(formData);
      
      setSuccessMsg('Account registered successfully! Redirecting to login...');
      
      setTimeout(() => {
        if (onSwitchToLogin) {
          onSwitchToLogin();
        } else {
          window.location.href = '/login';
        }
      }, 1200);

    } catch (err) {
      console.error("Registration Error:", err);
      const detail = err.response?.data?.detail;
      setErrorMsg(
        typeof detail === 'string' 
          ? detail 
          : Array.isArray(detail) 
            ? detail[0]?.msg || 'Validation failed.' 
            : 'Registration failed. Check credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 space-y-6">
        
        {/* Header (Light Theme Matching Login.jsx) */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-emerald-50 rounded-2xl mb-2 text-emerald-600">
            <Leaf className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account 👋</h2>
          <p className="text-slate-500 text-sm">Join the AI Textile Waste Intelligence Platform</p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-medium text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl font-medium flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="operator@test.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Platform Role</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm text-slate-700 font-medium"
              >
                <option value="RECYCLING_OPERATOR">Recycling Facility Operator</option>
                <option value="SUSTAINABILITY_MANAGER">Sustainability Manager</option>
                <option value="MANUFACTURER">Textile Manufacturer</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-100 transition duration-200 text-sm mt-2 disabled:bg-emerald-400"
          >
            {loading ? 'Registering Account...' : 'Complete Registration'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => onSwitchToLogin ? onSwitchToLogin() : (window.location.href = '/login')} 
            className="text-emerald-600 font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>

      </div>
    </div>
  );
};

export default Register;