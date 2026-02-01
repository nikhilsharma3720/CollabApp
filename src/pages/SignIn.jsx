import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/Slices/userSlice";
import toast from "react-hot-toast";
import "./Auth.css";

export default function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");

    setLoading(true);
    try {
      const res = await api.post("/signin", { email, password });

      dispatch(setUser(res.data.user));
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success(`Welcome back, ${res.data.user.name || "User"}!`);
      navigate("/createAndJoin");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-circle">C</div>
          <h2>Welcome Back</h2>
          <p>Sign in to continue to your workspace</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label>Password</label>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <span className="loader-dots">Logging in...</span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="form-footer">
          New to CollabApp?{" "}
          <Link to="/signup" className="signup-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
