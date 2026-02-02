import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "../redux/store";
import { useEffect } from "react";
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

  const publicPaths = ["/signin", "/signup"];

  useEffect(() => {
    const checkAuth = async () => {
      // Don't check auth if we are already on a public page and have no user
      // This prevents unnecessary API calls after logout
      try {
        const res = await api.get("/me", { withCredentials: true });
        const userData = res.data;

        localStorage.setItem("user", JSON.stringify(userData));
        dispatch(setUser(userData));

        // If user is authenticated but tries to go to Sign In/Up
        if (publicPaths.includes(location.pathname)) {
          navigate("/createAndJoin", { replace: true });
        }
      } catch (err) {
        // If API fails (401), clear everything
        dispatch(clearUser());
        localStorage.removeItem("user");

        // If they are on a protected page, force them to Sign In
        if (!publicPaths.includes(location.pathname)) {
          navigate("/signin", { replace: true });
        }
      }
    };

    checkAuth();
    // Optimized dependency array
  }, [location.pathname]); 

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
