import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, useSession, useClerk } from "@clerk/react";
import { useEffect } from "react";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { session } = useSession();
  const { signOut } = useClerk();

  useEffect(() => {
    if (isLoaded && isSignedIn && session) {
      // Check if session is older than 24 hours (24 * 60 * 60 * 1000 ms)
      const sessionAgeMs = Date.now() - session.createdAt.getTime();
      if (sessionAgeMs > 86400000) {
        signOut();
      }
    }
  }, [isLoaded, isSignedIn, session, signOut]);

  // Inactivity Tracker
  useEffect(() => {
    if (!isSignedIn) return;

    // Initialize or get last activity
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) {
      localStorage.setItem('lastActivity', Date.now().toString());
    }

    const resetActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    // Events to track
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetActivity));

    // Check inactivity every minute
    const interval = setInterval(() => {
      const last = parseInt(localStorage.getItem('lastActivity') || Date.now().toString());
      const twelveHours = 12 * 60 * 60 * 1000;
      
      if (Date.now() - last > twelveHours) {
        signOut();
        localStorage.removeItem('lastActivity');
      }
    }, 60000);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetActivity));
      clearInterval(interval);
    };
  }, [isSignedIn, signOut]);

  if (!isLoaded) {
    return (
      <div className="auth-viewport">
        <div className="auth-card" style={{ textAlign: "center", padding: "3rem" }}>
          <div className="loading-spinner" />
          <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // Prevent rendering if session is expired, wait for signOut
  if (session && (Date.now() - session.createdAt.getTime() > 86400000)) {
    return null;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (isSignedIn) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sign-in" element={
        <AuthRoute><SignInPage /></AuthRoute>
      } />
      <Route path="/sign-up" element={
        <AuthRoute><SignUpPage /></AuthRoute>
      } />
      {/* Keep old routes as redirects for backward compat */}
      <Route path="/login" element={<Navigate to="/sign-in" replace />} />
      <Route path="/signup" element={<Navigate to="/sign-up" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
