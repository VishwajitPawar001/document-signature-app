import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import DocumentDetail from "./pages/DocumentDetails";
import SignDocument from "./pages/SignDocument";

import ProtectedRoute from "./components/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>

      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* IMPORTANT: ONLY ONE SIGN ROUTE */}
      <Route path="/sign/:token" element={<SignDocument />} />

      {/* ===== PROTECTED ROUTES ===== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents/:id"
        element={
          <ProtectedRoute>
            <DocumentDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

    </Routes>
  </BrowserRouter>
);