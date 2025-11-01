import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabaseClient';
import { AlertCircle, User, Lock, Mail, Eye, EyeOff, UserPlus } from 'lucide-react';
import bcrypt from 'bcryptjs';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    // Validasi input
    if (!formData.nama || !formData.email || !formData.password) {
      setError('Semua field harus diisi!');
      setLoading(false);
      return;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format email tidak valid!');
      setLoading(false);
      return;
    }

    // Validasi password minimal 6 karakter
    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter!');
      setLoading(false);
      return;
    }

    try {
      // Cek apakah email sudah terdaftar
      const { data: existingUser } = await supabase
        .from('user')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        setError('Email sudah terdaftar!');
        setLoading(false);
        return;
      }

      console.log('🔐 Starting password hashing...');
      console.log('Original password:', formData.password);
      
      // 🔒 CRITICAL: Hash password dengan bcrypt
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      
      console.log('✅ Password hashed successfully!');
      console.log('Hash (first 30 chars):', hashedPassword.substring(0, 30));
      console.log('Hash length:', hashedPassword.length);

      // Pastikan hash valid (harus dimulai dengan $2a$ atau $2b$)
      if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
        throw new Error('Password hashing failed - invalid hash format');
      }

      // Insert user baru dengan password yang sudah di-hash
      const { data, error } = await supabase
        .from('user')
        .insert([
          {
            nama: formData.nama,
            email: formData.email,
            password: hashedPassword // ✅ HARUS hash, BUKAN plain text!
          }
        ])
        .select();

      if (error) {
        console.error('Database error:', error);
        setError('Gagal registrasi: ' + error.message);
      } else {
        console.log('✅ User registered successfully with hashed password');
        setSuccess('Registrasi berhasil! Password Anda telah dienkripsi dengan aman. Mengalihkan ke halaman login...');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Terjadi kesalahan saat registrasi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleRegister();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-4 rounded-3xl shadow-2xl mb-4">
            <img
              src="/images/logo-golkar.png"
              alt="Logo Golkar"
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Absensi Magang DPR RI
          </h1>
          <p className="text-gray-600">Partai Golkar</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 p-6 text-white text-center">
            <div className="bg-white/20 backdrop-blur-sm inline-block p-3 rounded-2xl mb-3">
              <UserPlus size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">Daftar Akun</h2>
            <p className="text-green-100 text-sm mt-1">
              Buat akun baru untuk absensi
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl flex items-start gap-3 shadow-md">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 text-sm font-semibold">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl flex items-start gap-3 shadow-md">
                <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-green-700 text-sm font-semibold">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Nama Lengkap */}
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-yellow-400 to-yellow-500 p-2 rounded-lg">
                    <User className="text-white" size={18} />
                  </div>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400 outline-none transition-all"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                    <Mail className="text-white" size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400 outline-none transition-all"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-yellow-400 to-yellow-500 p-2 rounded-lg">
                    <Lock className="text-white" size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-14 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400 outline-none transition-all"
                    placeholder="Minimal 6 karakter"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-2xl shadow-md">
                <p className="text-xs text-gray-700 text-center font-medium">
                  <strong className="text-green-700">🔒 Keamanan:</strong> Password Anda akan dienkripsi dengan bcrypt (tidak dapat di-reverse)
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </form>

            {/* Link ke Login */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Sudah punya akun?{' '}
                <a href="/login" className="text-green-600 hover:text-green-700 font-bold transition-colors">
                  Login di sini
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-green-500 text-white font-bold py-2 px-6 rounded-full shadow-lg inline-block text-sm">
            🟡 Partai Golkar 🟢
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;