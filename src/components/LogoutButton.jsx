import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-3 py-1 rounded-lg shadow-sm transition-all"
    >
      <LogOut size={16} /> Logout
    </button>
  );
}

export default LogoutButton;