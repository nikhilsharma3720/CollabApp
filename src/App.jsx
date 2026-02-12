import { useState, useEffect } from "react"; // Added useState
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "../redux/store";
import { Toaster } from "react-hot-toast";

import Navbar from "./Components/Navbar";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Board from "./pages/Board";
import CreateJoinTeam from "./Components/CreateJoinTeam";
import api from "./api/axios";
import { setUser, clearUser } from "../redux/Slices/userSlice";

function AuthLoader({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true); // New Guard State

  const publicPaths = ["/signin", "/signup"];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/me", { withCredentials: true });
        const userData = res.data;

        localStorage.setItem("user", JSON.stringify(userData));
        dispatch(setUser(userData));

        if (publicPaths.includes(location.pathname)) {
          navigate("/createAndJoin", { replace: true });
        }
      } catch (err) {
        dispatch(clearUser());
        localStorage.removeItem("user");

        if (!publicPaths.includes(location.pathname)) {
          navigate("/signin", { replace: true });
        }
      } finally {
        setLoading(false); // Stop loading ONLY after check is done
      }
    };

    checkAuth();
  }, [dispatch, navigate]); // Removed location.pathname to prevent infinite loops

  if (loading) {
    return (
      <div className="sync-splash-screen">
        <div className="sync-loader-orbit">
          <div className="sync-dot-p1"></div>
          <div className="sync-dot-p2"></div>
        </div>
        <h1 className="sync-loader-text">SYNC</h1>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthLoader>
          <Navbar />
          <Toaster position="top-right" reverseOrder={false} />
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/boards" element={<Board />} />
            <Route path="/createAndJoin" element={<CreateJoinTeam />} />
            <Route path="*" element={<SignIn />} />
          </Routes>
        </AuthLoader>
      </Router>
    </Provider>
  );
}

export default App;