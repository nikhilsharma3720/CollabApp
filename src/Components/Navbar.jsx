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

      dispatch(clearUser());

      localStorage.removeItem("teamId");
      localStorage.removeItem("user");

      localStorage.removeItem("teamName");
      localStorage.removeItem("teamJoinCode");

      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  return (
    <nav className="navbar">
      <div
        className="logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        CollabApp
      </div>

      <div className="nav-links">
        {user?.isLoggedIn ? (
          <>
            <div className="user-profile">
              <div className="avatar">{getDisplayName().charAt(0)}</div>
              <span className="user-greeting">
                Hi, <strong>{getDisplayName()}</strong>
              </span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signin" className="nav-link">
              Sign In
            </Link>
            <Link to="/signup" className="nav-link">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
