import React, { useState } from "react";
import logo from "../images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userStore";
import axios from "axios";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/logout`,
        {}, // No body
        { withCredentials: true } // Correct config
      );
      if (response.status === 200) {
        dispatch(setUserData(null));
        navigate("/login"); // Redirect to login
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <nav className="bg-[#0f0e0e] text-white fixed top-0 w-full z-50 shadow-md">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 py-4 flex justify-between items-center">
        <img src={logo} alt="Logo" className="w-[150px] object-cover" />

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-blue-500 transition-all">
            Home
          </Link>
          <Link to="/about" className="hover:text-blue-500 transition-all">
            About
          </Link>
          <Link to="/services" className="hover:text-blue-500 transition-all">
            Services
          </Link>
          <Link to="/contact" className="hover:text-blue-500 transition-all">
            Contact
          </Link>
          <button
            onClick={handleLogout}
            className="btnNormal bg-red-500 transition-all hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 space-y-3">
          <Link to="/" onClick={() => setIsOpen(false)} className="block hover:text-blue-500">
            Home
          </Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="block hover:text-blue-500">
            About
          </Link>
          <Link to="/services" onClick={() => setIsOpen(false)} className="block hover:text-blue-500">
            Services
          </Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block hover:text-blue-500">
            Contact
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="block hover:text-red-500"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
