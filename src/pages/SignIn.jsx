import { useState, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    <div className="auth-screen">
      {/* LEFT SIDE: Brand Visual */}
      <div className="auth-visual-side">
        <div className="gradient-sphere"></div>
        <div className={`visual-content-wrapper ${isVisible ? "slide-in" : ""}`}>
          <div className="brand-badge">Welcome Back</div>
          <h1>Focus on <br /><span>what matters.</span></h1>
          <p>Log in to access your projects and continue where you left off with your team.</p>
        </div>
        <div className="glass-shape s1"></div>
        <div className="glass-shape s2"></div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="auth-form-side">
        <div className={`form-container ${isVisible ? "fade-in" : ""}`}>
          <div className="form-header">
            <h2>Sign In</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="input-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-field">
              <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Password</label>
               </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p className="switch-auth">
            New to CollabApp? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}