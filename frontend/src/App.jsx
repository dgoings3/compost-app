import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import LogForm from "./LogForm";
import LogsPage from "./LogsPage";
import AnalyticsPage from "./AnalyticsPage";
import "./App.css";
import logo from "./assets/temp.png";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://compost-app.onrender.com";

function normalizeAuth(authValue) {
  if (!authValue) return "";
  return authValue.startsWith("Basic ") ? authValue : `Basic ${authValue}`;
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    const encodedAuth = btoa(`${username}:${password}`);
    const fullAuth = `Basic ${encodedAuth}`;

    try {
      const response = await fetch(`${API_BASE}/api/logs`, {
        headers: {
          Authorization: fullAuth
        }
      });

      if (!response.ok) {
        alert("Invalid username or password");
        return;
      }

      sessionStorage.setItem("auth", fullAuth);
      onLogin(fullAuth);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed");
    }
  }

  return (
    <div className="page-container">
      <div className="form-card">

        <div className="logo-container">
            <img src={logo} alt="WindrowPro Logo" className="logo"/>
        </div>

        <h1 className="page-title">Login</h1>

        <form onSubmit={handleSubmit} className="log-form">
          <div className="form-group">
            <label>Username</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
            />
          </div>

          <button type="submit" className="primary-button">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

function ProtectedRoute({ auth, children }) {
  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const [auth, setAuth] = useState(normalizeAuth(sessionStorage.getItem("auth") || ""));

  function handleLogin(newAuth) {
    const normalized = normalizeAuth(newAuth);
    sessionStorage.setItem("auth", normalized);
    setAuth(normalized);
  }

  function handleLogout() {
    sessionStorage.removeItem("auth");
    setAuth("");
  }

  return (
    <div className="page-container">
      {auth && (
        <nav
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap"
          }}
        >
          <Link to="/">Log Entry</Link>
          <Link to="/logs">Saved Logs</Link>
          <Link to="/analytics">Analytics</Link>
          <button type="button" className="secondary-button" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      )}

      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        <Route
          path="/"
          element={
            <ProtectedRoute auth={auth}>
              <LogForm auth={auth} apiBase={API_BASE} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logs"
          element={
            <ProtectedRoute auth={auth}>
              <LogsPage auth={auth} apiBase={API_BASE} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute auth={auth}>
              <AnalyticsPage auth={auth} apiBase={API_BASE} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;