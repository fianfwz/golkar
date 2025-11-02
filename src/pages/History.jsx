import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { Loader2, ArrowLeft, Calendar, Clock, User, FileImage } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function History() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        if (!user || !user.id) {
          setError("Anda belum login. Silakan login terlebih dahulu.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("absensi")
          .select("id, nama, tanggal, waktu, foto_url, user_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setRiwayat(data || []);
      } catch (err) {
        setError("Gagal memuat riwayat absensi. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayat();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <Loader2 className="w-16 h-16 animate-spin text-yellow-500 mb-4 mx-auto" />
          <p className="text-gray-700 font-semibold text-lg">Memuat riwayat absensi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-yellow-50 via-white to-green-50 p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-8 py-3 rounded-2xl transition-all font-bold shadow-lg transform hover:scale-105"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl shadow-2xl p-6 md:p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-3 mb-3 drop-shadow-lg">
                📋 Riwayat Absensi
              </h1>
              {user && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 inline-flex items-center gap-3">
                  <div className="bg-white/30 p-2 rounded-xl">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">{user.nama || user.email}</p>
                    <p className="text-xs text-yellow-100">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/absensi")}
              className="flex items-center gap-2 bg-white text-yellow-600 hover:bg-yellow-50 px-6 py-3 rounded-2xl transition-all font-bold shadow-lg transform hover:scale-105"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
          </div>
        </div>

        {/* Content */}
        {riwayat.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileImage size={48} className="text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Belum Ada Riwayat Absensi
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Anda belum melakukan absensi. Mulai absen sekarang untuk melihat riwayat.
            </p>
            <button
              onClick={() => navigate("/absensi")}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl transition-all font-bold shadow-xl transform hover:scale-105"
            >
              Mulai Absen Sekarang
            </button>
          </div>
        ) : (
          <div>
            {/* Stats Card */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl shadow-xl p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100 mb-1 uppercase tracking-wide">Total Kehadiran</p>
                  <p className="text-4xl font-bold">{riwayat.length}</p>
                  <p className="text-sm text-green-100 mt-1">kali hadir</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <Calendar size={40} className="text-white" />
                </div>
              </div>
            </div>

            {/* Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {riwayat.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  {/* Foto */}
                  <div className="relative">
                    <img
                      src={item.foto_url}
                      alt={`Absen ${item.nama}`}
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fef3c7' width='200' height='200'/%3E%3Ctext fill='%23eab308' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      #{index + 1}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white font-bold text-lg drop-shadow-lg">
                        {item.nama}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 bg-gradient-to-br from-yellow-50 to-green-50">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-md">
                        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-2 rounded-lg">
                          <Calendar size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Tanggal</p>
                          <p className="text-sm font-bold text-gray-800">{item.tanggal}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-md">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                          <Clock size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Waktu</p>
                          <p className="text-sm font-bold text-gray-800">{item.waktu}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-green-500 text-white font-bold py-3 px-10 rounded-full shadow-xl inline-block">
          <p className="text-sm">🟡 Partai Golkar - Melayani dengan Hati 🟢</p>
        </div>
      </div>
    </div>
  );
}