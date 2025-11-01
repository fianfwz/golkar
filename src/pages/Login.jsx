import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import bcrypt from 'bcryptjs';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 🔹 1. Cek admin
      const { data: adminData } = await supabase
        .from("admin")
        .select("*")
        .eq("email", formData.email)
        .maybeSingle();

      if (adminData) {
        if (adminData.password === formData.password) {
          setUser({ id: adminData.id, email: adminData.email, role: "admin" });
          setSuccess("Login berhasil sebagai Admin");
          setTimeout(() => navigate("/admin"), 600);
          return;
        } else {
          throw new Error("Password salah");
        }
      }

      // 🔹 2. Cek user biasa
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("*")
        .eq("email", formData.email)
        .maybeSingle();

      if (userError) {
        console.error("Database error:", userError);
        throw new Error("Terjadi kesalahan saat mengambil data user");
      }

      if (!userData) {
        throw new Error("Email tidak terdaftar");
      }

      console.log("User found:", userData.email);
      console.log("Password from DB (first 20 chars):", userData.password?.substring(0, 20));
      console.log("Password input:", formData.password);

      // 🔒 Cek apakah password di database adalah bcrypt hash
      const isBcryptHash = userData.password?.startsWith('$2a$') || 
                          userData.password?.startsWith('$2b$') || 
                          userData.password?.startsWith('$2y$');

      if (isBcryptHash) {
        // Password adalah bcrypt hash - gunakan bcrypt.compare
        console.log("Detected bcrypt hash, using bcrypt.compare");
        try {
          const isPasswordValid = await bcrypt.compare(
            formData.password,
            userData.password
          );

          console.log("Bcrypt compare result:", isPasswordValid);

          if (isPasswordValid) {
            setUser({
              id: userData.id,
              nama: userData.nama,
              email: userData.email,
              role: "user",
            });
            setSuccess("Login berhasil");
            setTimeout(() => navigate("/absensi"), 600);
            return;
          } else {
            throw new Error("Password salah");
          }
        } catch (bcryptError) {
          console.error("Bcrypt error:", bcryptError);
          throw new Error("Error saat memverifikasi password");
        }
      } else {
        // Password adalah plain text (user lama)
        console.log("Detected plain text password");
        if (userData.password === formData.password) {
          setUser({
            id: userData.id,
            nama: userData.nama,
            email: userData.email,
            role: "user",
          });
          setSuccess("Login berhasil");
          setTimeout(() => navigate("/absensi"), 600);
          return;
        } else {
          throw new Error("Password salah");
        }
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-green-50 p-4">
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
            Absensi peserta GIS Program
          </h1>
          <p className="text-gray-600">Partai Golkar</p>
        </div>

        {/* Login Card */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 p-6 text-white text-center">
            <div className="bg-white/20 backdrop-blur-sm inline-block p-3 rounded-2xl mb-3">
              <LogIn size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">Login</h2>
            <p className="text-yellow-100 text-sm mt-1">Masuk ke akun Anda</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="flex items-start gap-2 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-4 mb-4 shadow-md">
                <AlertCircle className="text-red-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-700 font-semibold">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 mb-4 shadow-md">
                <AlertCircle className="text-green-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-700 font-semibold">{success}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="mb-5">
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-yellow-400 to-yellow-500 p-2 rounded-lg">
                    <Mail className="text-white" size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    value={formData.email}
                    className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400 outline-none transition-all"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                    <Lock className="text-white" size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    onChange={handleChange}
                    value={formData.password}
                    className="w-full pl-14 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-50 shadow-xl transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Belum punya akun?{" "}
                <a href="/register" className="text-yellow-600 font-bold hover:text-yellow-700 transition-colors">
                  Daftar Sekarang
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

export default Login;