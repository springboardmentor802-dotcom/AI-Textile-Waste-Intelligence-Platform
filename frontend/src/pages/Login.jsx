import React, { useState } from 'react';
import API from '../services/api';

function Login({ onSwitchToRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      // Backend /auth/login endpoint par call
      const response = await API.post('/auth/login', formData);
      console.log("Full Backend Response:", response.data); 

      const { access_token, role } = response.data;
      localStorage.setItem('token', access_token);

      // Backend se jo role aa raha hai wahi set hoga
      localStorage.setItem('role', role);

      setMessage({ type: 'success', text: `Login Successful! Token Generated.` });
      
      // 1 second baad dashboard switch hoga
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);

    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Invalid email or password.';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Welcome Back</h2>
        <p className="text-gray-500 text-center mb-6 text-sm">Sign in to manage your textile intelligence workflows</p>
        
        {message.text && (
          <div className={`p-3 rounded-xl text-sm mb-4 text-center font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
              placeholder="operator2@test.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-100 transition duration-200 text-sm mt-2">
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="text-emerald-600 font-semibold hover:underline">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;