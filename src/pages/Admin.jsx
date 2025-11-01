import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { Trash2, Loader2 } from "lucide-react";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user } = useAuth();
  const [absensi, setAbsensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [tanggal, setTanggal] = useState("");
  const [waktu, setWaktu] = useState("");

  useEffect(() => {
    fetchAbsensi();
  }, []);

  // ⏰ Update tanggal & waktu real-time
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
    const { data, error } = await supabase
      .from("absensi")
      .select("*")
      .order("id", { ascending: false });
    if (error) console.error(error);
    else setAbsensi(data || []);
    setLoading(false);
  };

  const handleDelete = async (id, fotoUrl) => {
    try {
      // Hapus foto dari bucket storage
      if (fotoUrl) {
        const path = fotoUrl.split("/").pop();
        await supabase.storage.from("absensi-foto").remove([path]);
      }

      // Hapus row dari tabel
      const { error } = await supabase.from("absensi").delete().eq("id", id);
      if (error) throw error;

      // Update state agar tabel langsung refresh
      setAbsensi(absensi.filter((item) => item.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Gagal menghapus:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col p-6">
      {/* Header */}
      <header className="w-full bg-blue-700 text-white py-4 px-6 rounded-2xl shadow-lg flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo-golkar.png"
            alt="Logo DPR RI"
            className="w-12 h-12 rounded-full bg-white p-1 shadow-md"
          />
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-blue-100">Data Absensi Magang DPR RI</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <p className="text-sm">{tanggal}</p>
          <p className="font-semibold text-lg">{waktu}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-100">
              {user?.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border border-blue-200">
            <table className="w-full border-collapse">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">No</th>
                  <th className="py-3 px-4 text-left">Nama</th>
                  <th className="py-3 px-4 text-left">Tanggal</th>
                  <th className="py-3 px-4 text-left">Waktu</th>
                  <th className="py-3 px-4 text-left">Foto</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {absensi.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">
                      Tidak ada data absensi.
                    </td>
                  </tr>
                ) : (
                  absensi.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-blue-100 hover:bg-blue-50 transition-all"
                    >
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4 font-semibold">{item.nama}</td>
                      <td className="py-3 px-4">{item.tanggal}</td>
                      <td className="py-3 px-4">{item.waktu}</td>
                      <td className="py-3 px-4">
                        {item.foto_url ? (
                          <img
                            src={item.foto_url}
                            alt={item.nama}
                            className="w-20 h-20 object-cover rounded-xl border border-blue-400 shadow-sm"
                          />
                        ) : (
                          <span className="text-gray-400 italic">
                            Tidak ada foto
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setConfirmDelete(item)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 mx-auto transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
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
        <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Hapus Data?
            </h2>
            <p className="text-gray-600 mb-6">
              Yakin ingin menghapus data{" "}
              <span className="font-semibold text-blue-600">
                {confirmDelete.nama}
              </span>
              ?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() =>
                  handleDelete(confirmDelete.id, confirmDelete.foto_url)
                }
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}