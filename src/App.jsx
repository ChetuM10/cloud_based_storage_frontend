import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SharedWithMe from "./pages/SharedWithMe";
import Starred from "./pages/Starred";
import Recent from "./pages/Recent";
import Trash from "./pages/Trash";
import PublicLink from "./pages/PublicLink";

// Components
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route wrapper (redirect to dashboard if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/drive" replace />;
  }

  return children;
}

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
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
      <Route path="/public/:token" element={<PublicLink />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/drive" replace />} />
        <Route path="drive" element={<Dashboard />} />
        <Route path="folder/:folderId" element={<Dashboard />} />
        <Route path="shared" element={<SharedWithMe />} />
        <Route path="starred" element={<Starred />} />
        <Route path="recent" element={<Recent />} />
        <Route path="trash" element={<Trash />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/drive" replace />} />
    </Routes>
  );
}

export default App;
