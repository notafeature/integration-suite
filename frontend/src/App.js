import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ConfigProvider } from "./context/ConfigContext";
import { Layout } from "./components/Layout";
import AuthCallback from "./components/AuthCallback";
import Home from "./pages/Home";
import Directory from "./pages/Directory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Organize from "./pages/Organize";
import StartCircle from "./pages/StartCircle";
import Connections from "./pages/Connections";
import Notifications from "./pages/Notifications";
import Legal from "./pages/Legal";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center font-display text-ink-soft">…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <Routes>
      <Route path="/" element={<Layout full><Home /></Layout>} />
      <Route path="/place/:label" element={<Layout full><Home /></Layout>} />
      <Route path="/circle/:slug" element={<Layout full><Home /></Layout>} />
      <Route path="/directory" element={<Layout><Directory /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      <Route path="/legal" element={<Layout><Legal /></Layout>} />
      <Route path="/start" element={<Protected><Layout><StartCircle /></Layout></Protected>} />
      <Route path="/organize" element={<Protected><Layout><Organize /></Layout></Protected>} />
      <Route path="/connections" element={<Protected><Layout><Connections /></Layout></Protected>} />
      <Route path="/notifications" element={<Protected><Layout><Notifications /></Layout></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
