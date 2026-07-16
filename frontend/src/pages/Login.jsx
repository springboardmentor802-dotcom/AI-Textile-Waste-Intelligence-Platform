import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { label: 'Manufacturer', email: 'manufacturer@textile.com', desc: 'Apex Textiles Inc' },
    { label: 'Operator', email: 'operator@textile.com', desc: 'Green Cycle Facility' },
    { label: 'Manager', email: 'manager@textile.com', desc: 'EcoFashion Alliance' },
    { label: 'Admin', email: 'admin@textile.com', desc: 'Full System Control' }
  ];

  const handleQuickFill = (acc) => {
    setEmail(acc.email);
    setPassword('Password123!');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        
        {/* Core Auth Panel */}
        <div className="w-full max-w-md space-y-8 bg-white p-8 lg:p-10 rounded-3xl border border-slate-200 shadow-xl">
          
          {/* Branding Banner */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center space-x-2 text-forest-700 hover:opacity-90 transition-opacity">
              <Recycle className="h-8 w-8 text-forest-600 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="font-extrabold text-2xl tracking-tight text-forest-950">TexWaste</span>
            </Link>
            <h2 className="text-xl font-bold text-slate-800">Sign in to your account</h2>
            <p className="text-xs text-slate-400 font-medium">Textile Waste Intelligence Portal</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-sm font-semibold text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs font-semibold text-forest-600 hover:underline cursor-not-allowed">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-600 hover:bg-forest-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-forest-600/10 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-6 text-center text-xs">
            <span className="text-slate-400 font-semibold">New to TexWaste? </span>
            <Link to="/register" className="text-forest-600 hover:underline font-bold">
              Create an account
            </Link>
          </div>

          {/* Quick Fill section */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <span className="block text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick-Fill Demo Credentials (Password123!)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className="p-2.5 bg-slate-50 border border-slate-200 hover:border-forest-400 hover:bg-forest-50/20 text-left rounded-xl transition-all-300 group focus:outline-none"
                >
                  <span className="block text-xs font-bold text-slate-700 group-hover:text-forest-800">
                    {acc.label}
                  </span>
                  <span className="block text-[9px] text-slate-400 leading-tight truncate">
                    {acc.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
