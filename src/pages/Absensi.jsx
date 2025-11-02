import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import supabase from "../lib/supabaseClient";
import {
  Camera,
  Save,
  RotateCcw,
  Loader2,
  History,
  AlertCircle,
  User,
  Clock,
  Calendar,
} from "lucide-react";
import LogoutButton from "../components/LogoutButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Absensi() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [tanggal, setTanggal] = useState("");
  const [waktu, setWaktu] = useState("");
  const [status, setStatus] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [isHadirToday, setIsHadirToday] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const savedUser = user || JSON.parse(sessionStorage.getItem("currentUser") || "{}");
  const userName = savedUser?.nama || savedUser?.name || savedUser?.email?.split('@')[0] || "User";
  const userId = savedUser?.id || savedUser?.user_id || null;

  const handleDevices = useCallback(
    (mediaDevices) => {
      const videoDevices = mediaDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    },
    [selectedDeviceId]
  );

  useEffect(() => {
    if (
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.enumerateDevices === "function"
    ) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(handleDevices)
        .catch(() =>
          setWebcamError("Tidak dapat mengakses daftar kamera. Periksa izin kamera.")
        );
    } else {
      setWebcamError(
        "Browser Anda tidak mendukung akses kamera. Gunakan Chrome atau buka lewat HTTPS."
      );
    }
  }, [handleDevices]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTanggal(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
      setWaktu(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if user has already done attendance today
  useEffect(() => {
    const checkTodayAttendance = async () => {
      if (!userId) {
        setLoadingStatus(false);
        return;
      }

      try {
        const today = new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const { data, error } = await supabase
          .from("absensi")
          .select("id")
          .eq("user_id", userId)
          .eq("tanggal", today)
          .limit(1);

        if (error) throw error;

        setIsHadirToday(data && data.length > 0);
      } catch (err) {
        // Error checking attendance
      } finally {
        setLoadingStatus(false);
      }
    };

    checkTodayAttendance();
  }, [userId]);

  const capture = useCallback(() => {
    if (!webcamRef.current) {
      setStatus("❌ Kamera belum siap, tunggu sebentar...");
      return;
    }
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) setImage(imageSrc);
      else setStatus("❌ Gagal mengambil foto, coba lagi");
    } catch (err) {
      setStatus("❌ Error saat mengambil foto");
    }
  }, []);

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async () => {
    if (!image) {
      setStatus("⚠️ Silakan ambil foto terlebih dahulu!");
      return;
    }

    if (!userId) {
      setStatus("❌ Gagal menyimpan: User belum login!");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const fileName = `${userName}-${Date.now()}.jpg`;
      const file = dataURLtoFile(image, fileName);

      const { error: uploadError } = await supabase.storage
        .from("absensi-foto")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: publicData, error: urlError } = supabase.storage
        .from("absensi-foto")
        .getPublicUrl(fileName);
      if (urlError) throw urlError;

      const fotoUrl = publicData.publicUrl;

      const { error: dbError } = await supabase.from("absensi").insert([
        {
          user_id: userId,
          nama: userName,
          tanggal,
          waktu,
          foto_url: fotoUrl,
        },
      ]);
      if (dbError) throw dbError;

      setStatus("✅ Absen berhasil disimpan");
      setImage(null);
      // Update status hadir setelah berhasil absen
      setIsHadirToday(true);
    } catch (err) {
      setStatus("❌ Terjadi kesalahan saat menyimpan absen.");
    } finally {
      setLoading(false);
    }
  };

  const goToHistory = () => navigate("/riwayat");

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center p-3 sm:p-4 md:p-6">
      {/* Header */}
      <header className="w-full max-w-4xl bg-gradient-to-r from-amber-400 to-amber-500 text-white py-3 px-4 sm:py-4 sm:px-6 rounded-2xl shadow-lg mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <img
                src="/images/logo-golkar.png"
                alt="Logo Golkar"
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
            </div>
            <div className="text-left sm:text-left">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Absensi Peserta GIS Program</h1>
              <p className="text-xs sm:text-sm text-amber-100">DPR RI - Partai Golkar</p>
            </div>
          </div>

          {/* Date, Time & Actions */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <Calendar size={14} className="text-amber-100" />
              <p className="text-xs font-medium">{tanggal}</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <Clock size={14} className="text-amber-100" />
              <p className="font-bold text-base sm:text-lg">{waktu}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={goToHistory}
                className="flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs px-3 py-1.5 rounded-lg shadow-md transition-all"
              >
                <History size={14} /> History
              </button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-4xl grid md:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Left Sidebar - User Info */}
        <div className="md:col-span-1 space-y-3 sm:space-y-4">
          {/* User Card */}
          <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-4 shadow-lg text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/30 backdrop-blur-sm p-2.5 rounded-xl">
                <User size={24} className="text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide opacity-90">Peserta</p>
                <h3 className="text-lg sm:text-xl font-bold">{userName}</h3>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <p className="text-xs opacity-90">Status Hari Ini</p>
              {loadingStatus ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  <p className="text-sm font-semibold">Memuat...</p>
                </div>
              ) : (
                <p className={`text-base font-bold ${isHadirToday ? 'text-white' : 'text-amber-100'}`}>
                  {isHadirToday ? '✅ Hadir' : '⏳ Belum Absen'}
                </p>
              )}
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h3 className="text-base font-bold text-gray-800 mb-3">📋 Panduan Absensi</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="bg-amber-400 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                <span>Pilih kamera yang akan digunakan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-amber-400 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                <span>Pastikan wajah terlihat jelas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-amber-400 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                <span>Ambil foto dengan menekan tombol</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                <span>Simpan absensi Anda</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Main Form */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-4 sm:p-5">
          <div className="text-center mb-4">
            <div className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-white py-2 px-6 rounded-xl shadow-md">
              <h2 className="text-base sm:text-lg font-bold">Formulir Absensi</h2>
            </div>
          </div>

          {/* Camera Selection */}
          {devices.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Pilih Kamera
              </label>
              <select
                value={selectedDeviceId || ""}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full bg-gradient-to-r from-amber-50 to-emerald-50 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium text-gray-700 shadow-sm"
              >
                {devices.map((device, i) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    📷 {device.label || `Kamera ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Camera Preview */}
          <div className="relative mb-4 rounded-2xl overflow-hidden shadow-md bg-gray-100">
            {!image ? (
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    deviceId: selectedDeviceId
                      ? { exact: selectedDeviceId }
                      : undefined,
                  }}
                  onUserMedia={() => setWebcamReady(true)}
                  onUserMediaError={() =>
                    setWebcamError("Tidak dapat mengakses kamera.")
                  }
                  className="w-full h-48 sm:h-64 md:h-72 object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                  {webcamReady ? "🟢 Kamera Aktif" : "🔴 Memuat..."}
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={image}
                  alt="Hasil Absen"
                  className="w-full h-48 sm:h-64 md:h-72 object-cover"
                />
                <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md">
                  ✅ Foto Berhasil Diambil
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {webcamError && (
            <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-xl flex items-start gap-2 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 text-xs sm:text-sm font-medium">{webcamError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {!image ? (
              <button
                onClick={capture}
                disabled={!webcamReady}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all shadow-md font-semibold text-sm w-full sm:w-auto ${
                  webcamReady
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Camera size={18} />
                {webcamReady ? "Ambil Foto" : "Tunggu..."}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setImage(null)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-md text-sm w-full sm:w-auto"
                >
                  <RotateCcw size={18} /> Ulangi
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all shadow-md font-semibold text-sm w-full sm:w-auto ${
                    loading
                      ? "bg-emerald-400 cursor-not-allowed text-white"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Simpan
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Status Message */}
          {status && (
            <div
              className={`mt-4 p-3 rounded-xl text-center font-semibold text-sm shadow-sm ${
                status.includes("✅")
                  ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800"
                  : status.includes("❌")
                  ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                  : "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800"
              }`}
            >
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6">
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 text-white font-semibold py-2 px-6 rounded-full shadow-md">
          <p className="text-xs sm:text-sm">🟡 Partai Golkar - Melayani dengan Hati 🟢</p>
        </div>
      </div>
    </div>
  );
}