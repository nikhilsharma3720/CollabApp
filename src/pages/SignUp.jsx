import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./Auth.css";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/signup", { name, email, password });
      toast.success("Connection Established!"); // Rebranded toast
      navigate("/signin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      {/* LEFT: Rebranded with 'Sync' content but same classes */}
      <div className="auth-visual-side">
        <div className="gradient-sphere"></div>
        <div className={`visual-content-wrapper ${isVisible ? "slide-in" : ""}`}>
          <div className="brand-badge">Build v1.0 • Dev Edition</div>
          <h1>Engineered for <br /><span>Real-time.</span></h1>
          <p>A personal exploration of WebSocket architecture and modern state management. Sync your thoughts.</p>
        </div>
        <div className="glass-shape s1"></div>
        <div className="glass-shape s2"></div>
      </div>

      {/* RIGHT: Same classes, updated labels and text */}
      <div className="auth-form-side">
        <div className={`form-container ${isVisible ? "fade-in" : ""}`}>
          <div className="form-header">
            {/* Added a simple SYNC text logo here inside your existing header */}
            <div style={{fontWeight: '900', letterSpacing: '0.4em', color: '#7c3aed', marginBottom: '10px'}}>SYNC</div>
            <h2>Initialize Account</h2>
            <p>Step into your live workspace.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="input-field">
              <label>Identity</label>
              <input 
                type="text" 
                placeholder="Your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="input-field">
              <label>System Email</label>
              <input 
                type="email" 
                placeholder="name@provider.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-field">
              <label>Access Key</label>
              <input 
                type="password" 
                placeholder="Secure password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Establishing Link..." : "Join Workspace"}
            </button>
          </form>

          <p className="switch-auth">
            Already Synced? <Link to="/signin">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}