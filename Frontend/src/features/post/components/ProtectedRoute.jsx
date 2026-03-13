import { useNavigate } from "react-router";
import { useContext } from "react";
import { AuthContext } from "../../auth/auth.context";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  const navigate = useNavigate();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
