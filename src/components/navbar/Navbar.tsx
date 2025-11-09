import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";

const GAME_SERVICE_URL =
  (import.meta as any).env.VITE_GAME_SERVICE_URL || "http://localhost:8001";

export default function Navbar() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  const handleOpenAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setError("");
    setFormData({ name: "", password: "" });
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
    setError("");
    setFormData({ name: "", password: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (authMode === "login") {
        const response = await fetch(`${GAME_SERVICE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Include cookies
          body: JSON.stringify({
            username: formData.name,
            password: formData.password,
          }),
        });

        if (response.ok) {
          handleCloseAuth();
          // Refresh auth status and reload
          window.location.reload();
        } else {
          const data = await response.json();
          setError(data.message || "Login failed");
        }
      } else {
        const response = await fetch(`${GAME_SERVICE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Include cookies
          body: JSON.stringify({
            username: formData.name,
            password: formData.password,
          }),
        });

        if (response.ok) {
          handleCloseAuth();
          // Refresh auth status and reload
          window.location.reload();
        } else {
          const data = await response.json();
          setError(data.message || "Registration failed");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <div>
            <Link to="/" className="navbar-title-link">
              <h1>Memoriq</h1>
            </Link>
          </div>
          <div className="navbar-button-container">
            <span>Loading...</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div>
            <Link to="/" className="navbar-title-link">
              <h1>Memoriq</h1>
            </Link>
          </div>
          <div className="navbar-button-container">
            {!isAuthenticated ? (
              <div className="auth-buttons">
                <button
                  className="navbar-button btn-login"
                  onClick={() => handleOpenAuth("login")}
                >
                  Sign In
                </button>
                <button
                  className="navbar-button btn-register"
                  onClick={() => handleOpenAuth("register")}
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="user-info-container">
                <span className="user-name">{user?.username}</span>
                <button className="navbar-button btn-logout" onClick={logout}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={handleCloseAuth}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseAuth}>
              ✕
            </button>
            <h2>{authMode === "login" ? "Sign In" : "Create Account"}</h2>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">Username</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Choose a username"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              {authMode === "register" && (
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {authMode === "login" && (
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {error && <div className="auth-error">{error}</div>}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : authMode === "login"
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </form>

            <div className="auth-toggle">
              {authMode === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className="toggle-link"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="toggle-link"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
