import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import LogForm from "./LogForm";
import LogsPage from "./LogsPage";
import { useState } from "react";

const API_BASE = "https://compost-app.onrender.com";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = btoa(`${username}:${password}`);

    try {
      const res = await fetch(`${API_BASE}/api/logs`, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });

      if (!res.ok) {
        alert("Invalid username or password");
        return;
      }

      sessionStorage.setItem("auth", auth);
      onLogin(auth);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed");
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h1 className="page-title">Login</h1>

        <form onSubmit={handleSubmit} className="log-form">
          <div className="form-group">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
  const [auth, setAuth] = useState(sessionStorage.getItem("auth") || "");

  const handleLogout = () => {
    sessionStorage.removeItem("auth");
    setAuth("");
  };

  return (
    <div className="page-container">
      {auth && (
        <nav style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/">Log Entry</Link>
          <Link to="/logs">Saved Logs</Link>
          <button type="button" className="secondary-button" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      )}

      <Routes>
        <Route path="/login" element={<LoginPage onLogin={setAuth} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute auth={auth}>
              <LogForm auth={auth} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute auth={auth}>
              <LogsPage auth={auth} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;