import React, { useState } from 'react'
import logo from "../images/logo.png";
import { Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError(""); // Clear backend error on submit

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/login`,
        {
          email: email,
          password: password,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Assuming 200 means success
        console.log("Login successful");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
        setEmail("");
        setPassword("");
        setErrors({});
        setBackendError("");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.msg
      ) {
        setBackendError(error.response.data.msg);
      } else {
        setBackendError("An unexpected error occurred. Please try again.");
      }
      console.error("Error during login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="w-full max-w-md bg-[#0f0e0e] p-6 rounded-lg shadow-xl shadow-black/50 flex flex-col"
      >
        <img
          src={logo}
          alt="Logo"
          className="w-48 mx-auto bg-transparent mb-6 object-contain"
        />

        <div className="flex items-center bg-black rounded-full mt-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            autoComplete="new-email"
            type="email"
            placeholder="Email"
            required
            className="flex-1 px-4 py-3 bg-transparent text-white border-none outline-none rounded-full"
          />
        </div>
        {errors.email && (
          <span className="text-red-500 bg-transparent self-start pl-[20px] text-sm mt-1 block">{errors.email}</span>
        )}

        <div className="flex items-center bg-black rounded-full mt-4">
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            autoComplete="new-password"
            type="password"
            placeholder="Password"
            required
            className="flex-1 px-4 py-3 bg-transparent text-white border-none outline-none rounded-full"
          />
        </div>
        {errors.password && (
          <span className="text-red-500 bg-transparent self-start pl-[20px] text-sm mt-1 block">{errors.password}</span>
        )}

        {/* Backend error message */}
        {backendError && (
          <span className="text-red-500 bg-transparent self-start pl-[20px] text-sm mt-3 block">
            {backendError}
          </span>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 mt-4"
        >
          {isLoading ? "Loading..." : "Login"}
        </button>

        <p className="text-gray-400 text-center text-sm mt-4 bg-transparent">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 bg-transparent hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
