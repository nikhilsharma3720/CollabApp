import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.user.user);

  if (!user || !user.id) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
