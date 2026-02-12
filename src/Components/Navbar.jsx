import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../redux/Slices/userSlice";
import api from "../api/axios";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const getDisplayName = () => {
    if (!user?.email) return "User";
    const namePart = user.email.split("@")[0];
    return namePart
      .split(/[._]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      dispatch(clearUser());
      localStorage.clear();
      navigate("/signin", { replace: true });
      window.location.reload();
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* REBRANDED LOGO SECTION */}
        <div className="logo-section" onClick={() => navigate("/")}>
  <div className="sync-icon-container">
    {/* This is the loader animation inside the Navbar */}
    <div className="sync-orbit">
      <div className="sync-particle p1"></div>
      <div className="sync-particle p2"></div>
    </div>
  </div>
  <span className="logo-brand">SYNC</span>
</div>
        <div className="nav-actions">
          {user?.isLoggedIn ? (
            <div className="nav-user-area">
              <div className="user-profile-pill">
                <div className="nav-avatar-circle">
                  {getDisplayName().charAt(0)}
                </div>
                <span className="nav-display-name">{getDisplayName()}</span>
              </div>
              <button className="nav-logout-minimal" onClick={handleLogout}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 01-2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-auth-links">
              <Link to="/signin" className="nav-link-subtle">
                Sign In
              </Link>
              <Link to="/signup" className="nav-link-cta">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
