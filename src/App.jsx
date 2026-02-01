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
import Navbar from "./components/Navbar";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Board from "./pages/Board";
import CreateJoinTeam from "./Components/Teams/createJoinTeam";
import api from "./api/axios";
import { setUser, clearUser } from "../redux/Slices/userSlice";

// ✅ Handles Global Auth Logic
function AuthLoader({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Define paths that don't require a logged-in user
  const publicPaths = ["/signin", "/signup"];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/me", { withCredentials: true });
        const userData = res.data;

        // 1. Sync state and storage
        localStorage.setItem("user", JSON.stringify(userData));
        dispatch(setUser(userData));

        // 2. 🛡️ PREVENT GOING BACK TO SIGNIN/SIGNUP
        // If user is logged in and tries to go to /signin or /signup, send them home
        if (publicPaths.includes(location.pathname)) {
          navigate("/createAndJoin", { replace: true });
        }
      } catch (err) {
        // 3. Handle Session Failure
        dispatch(clearUser());
        localStorage.removeItem("user");

        // Only redirect to signin if they are trying to access protected content
        if (!publicPaths.includes(location.pathname)) {
          navigate("/signin", { replace: true });
        }
      }
    };

    checkAuth();
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
            {/* Default fallback: redirect to signin */}
            <Route path="*" element={<SignIn />} />
          </Routes>
        </AuthLoader>
      </Router>
    </Provider>
  );
}

export default App;
