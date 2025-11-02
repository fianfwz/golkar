import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Absensi from "./pages/Absensi";
import History from "./pages/History";
import Admin from "./pages/Admin";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <Routes>
            {/* 🟢 Public Routes (hanya untuk yang belum login) */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* 🔒 Protected Routes (hanya untuk yang sudah login) */}
            <Route
              path="/absensi"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <Absensi />
                </ProtectedRoute>
              }
            />
            <Route
              path="/riwayat"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* 🧭 Redirect semua yang tidak dikenal */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
