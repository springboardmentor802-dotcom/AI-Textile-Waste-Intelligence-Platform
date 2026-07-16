import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Building, Lock, Save, Loader2, KeyRound } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setError('Name field is required.');
      return;
    }
    if (password && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await updateProfile(name, organization, password || null);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-sans">My Profile</h2>
        <p className="text-xs text-slate-400 font-semibold mt-1">Update your account credentials and system identity</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-bold text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold text-center">
          Profile details updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        
        {/* Name and Organization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Organization Name
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Readonly specs */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="block text-slate-400 font-bold uppercase tracking-wider">Email Address</span>
            <span className="font-bold text-slate-700">{user?.email}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-bold uppercase tracking-wider">System Role</span>
            <span className="font-bold text-forest-700">{user?.role}</span>
          </div>
        </div>

        {/* Change password (optional) */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
            <KeyRound className="h-4.5 w-4.5 text-slate-400" />
            <span>Update Password (Optional)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-forest-600 hover:bg-forest-700 disabled:bg-slate-300 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Saving Details...</span>
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Profile;
