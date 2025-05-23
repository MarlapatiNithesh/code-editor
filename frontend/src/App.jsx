import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import NoPage from "./pages/NoPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import useUserData from "./CustomHooks/getUserData";
import { useSelector } from "react-redux";
import EditorPage from "./pages/Editor";


function App() {
  return (
    <BrowserRouter>
      <RouteHandler />
    </BrowserRouter>
  );
}

const RouteHandler = () => {
  
  useUserData();

  const { userData, loading } = useSelector((state) => state.user);

  

  if (loading) return <div className="text-white p-10 text-center"></div>;

  return (
    <Routes>
      <Route path="/" element={userData ? <Home /> : <Navigate to="/login" />} />
      <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" />} />
      <Route path="/login" element={!userData ? <Login /> : <Navigate to="/" />} />
      <Route path="/editor/:id/:version" element={userData ? <EditorPage/> : <Navigate to="/login" />} />
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
};

export default App;
