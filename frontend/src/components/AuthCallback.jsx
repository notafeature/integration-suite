import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setToken } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;
    if (!sessionId) { navigate("/", { replace: true }); return; }
    (async () => {
      try {
        const { data } = await api.post("/auth/session", { session_id: sessionId });
        setToken(data.session_token);
        setUser(data.user);
        window.history.replaceState(null, "", "/");
        navigate("/", { replace: true, state: { user: data.user } });
      } catch {
        setError(true);
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <p className="font-display text-xl text-ink-soft">
        {error ? "Something interrupted sign-in. Please try again." : "Orienting…"}
      </p>
    </div>
  );
}
