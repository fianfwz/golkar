import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { Trash2, Loader2, Users, Calendar, Clock, Download, Search, FileText } from "lucide-react";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user } = useAuth();
  const [absensi, setAbsensi] = useState([]);
  const [filteredAbsensi, setFilteredAbsensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [tanggal, setTanggal] = useState("");
  const [waktu, setWaktu] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchAbsensi();
  }, []);

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

  const fetchAbsensi = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("absensi")
      .select("*")
      .order("id", { ascending: false });
    setAbsensi(data || []);
    setFilteredAbsensi(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let filtered = absensi;

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter((item) =>
        item.tanggal.includes(selectedDate)
      );
    }

    setFilteredAbsensi(filtered);
  }, [searchTerm, selectedDate, absensi]);

  const handleDelete = async (id, fotoUrl) => {
    try {
      if (fotoUrl) {
        const path = fotoUrl.split("/").pop();
        await supabase.storage.from("absensi-foto").remove([path]);
      }

      await supabase.from("absensi").delete().eq("id", id);
      setAbsensi(absensi.filter((item) => item.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      alert("Gagal menghapus data. Silakan coba lagi.");
    }
  };

  const totalAbsensi = absensi.length;
  const uniqueUsers = [...new Set(absensi.map(item => item.nama))].length;
  const todayAbsensi = absensi.filter(item => item.tanggal === tanggal).length;

  const exportToCSV = () => {
    const headers = ["No", "Nama", "Tanggal", "Waktu", "Foto URL"];
    const rows = filteredAbsensi.map((item, index) => [
      index + 1,
      item.nama,
      item.tanggal,
      item.waktu,
      item.foto_url || "-"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `absensi_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 md:p-6">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white py-4 px-4 md:px-6 rounded-2xl shadow-lg mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <img
                src="/images/logo-golkar.png"
                alt="Logo Golkar"
                className="w-12 h-12"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-xs md:text-sm text-amber-100">Kelola Data Absensi GIS Program</p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <Calendar size={14} className="text-amber-100" />
              <p className="text-xs font-medium">{tanggal}</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <Clock size={14} className="text-amber-100" />
              <p className="font-bold text-base">{waktu}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-100">
                {user?.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-4 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90 uppercase tracking-wide">Total Absensi</p>
              <h3 className="text-3xl font-bold mt-1">{totalAbsensi}</h3>
            </div>
            <div className="bg-white/30 backdrop-blur-sm p-3 rounded-xl">
              <FileText size={28} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90 uppercase tracking-wide">Total Peserta</p>
              <h3 className="text-3xl font-bold mt-1">{uniqueUsers}</h3>
            </div>
            <div className="bg-white/30 backdrop-blur-sm p-3 rounded-xl">
              <Users size={28} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90 uppercase tracking-wide">Hadir Hari Ini</p>
              <h3 className="text-3xl font-bold mt-1">{todayAbsensi}</h3>
            </div>
            <div className="bg-white/30 backdrop-blur-sm p-3 rounded-xl">
              <Calendar size={28} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Section */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama peserta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gradient-to-r from-amber-50 to-emerald-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
            />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-50 to-emerald-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
          />
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-md text-sm font-semibold"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
        
        {(searchTerm || selectedDate) && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <span className="font-semibold">Menampilkan: {filteredAbsensi.length} data</span>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDate("");
              }}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-lg">
            <div className="text-center">
              <Loader2 className="animate-spin text-amber-500 w-10 h-10 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Memuat data...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border border-amber-200">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-amber-400 to-amber-500 text-white">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold">No</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Nama</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Tanggal</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Waktu</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Foto</th>
                  <th className="py-3 px-4 text-center text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAbsensi.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={40} className="text-gray-300" />
                        <p className="font-medium">Tidak ada data absensi.</p>
                        {(searchTerm || selectedDate) && (
                          <p className="text-sm">Coba ubah filter pencarian Anda.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAbsensi.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-amber-100 hover:bg-gradient-to-r hover:from-amber-50 hover:to-emerald-50 transition-all"
                    >
                      <td className="py-3 px-4 text-sm">{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-gray-800 text-sm">{item.nama}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.tanggal}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.waktu}</td>
                      <td className="py-3 px-4">
                        {item.foto_url ? (
                          <img
                            src={item.foto_url}
                            alt={item.nama}
                            className="w-16 h-16 object-cover rounded-xl border-2 border-amber-400 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                            onClick={() => window.open(item.foto_url, '_blank')}
                          />
                        ) : (
                          <span className="text-gray-400 italic text-sm">
                            Tidak ada foto
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setConfirmDelete(item)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 mx-auto transition-all shadow-md text-sm font-semibold"
                        >
                          <Trash2 size={16} />
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal konfirmasi hapus */}
      {confirmDelete && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Hapus Data Absensi?
              </h2>
              <p className="text-gray-600 text-sm">
                Anda yakin ingin menghapus data absensi dari{" "}
                <span className="font-semibold text-amber-600">
                  {confirmDelete.nama}
                </span>
                ?
              </p>
              <p className="text-xs text-red-600 mt-2">
                Tindakan ini tidak dapat dibatalkan!
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-700 font-semibold transition-all shadow-md text-sm"
              >
                Batal
              </button>
              <button
                onClick={() =>
                  handleDelete(confirmDelete.id, confirmDelete.foto_url)
                }
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition-all shadow-md text-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center">
        <div className="inline-block bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 text-white font-semibold py-2 px-6 rounded-full shadow-md">
          <p className="text-xs sm:text-sm">🟡 Partai Golkar - Melayani dengan Hati 🟢</p>
        </div>
      </div>
    </div>
  );
}