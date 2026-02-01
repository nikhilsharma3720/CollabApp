import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./Auth.css";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    if (!name.trim()) {
      toast.error("Full Name is required");
      hasError = true;
    }

    if (!email.trim()) {
      toast.error("Email Address is required");
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email");
      hasError = true;
    }

    if (!password) {
      toast.error("Password is required");
      hasError = true;
    } else if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      await api.post("/signup", { name, email, password });
      toast.success("Account created successfully! Please sign in.");
      navigate("/signin");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Signup failed. Try a different email.";
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
          <h2>Create Account</h2>
          <p>Join CollabApp and start organizing today.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label>Full Name</label>
            <input
              className={`auth-input ${!name && "input-error"}`}
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              className={`auth-input ${!email && "input-error"}`}
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              className={`auth-input ${password.length < 8 && password.length > 0 && "input-error"}`}
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="form-footer">
          Already have an account?{" "}
          <Link to="/signin" className="signup-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
