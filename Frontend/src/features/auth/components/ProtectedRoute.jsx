import { useNavigate } from "react-router";
import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) return <p>Loading...</p>;

  return user ? children : null;
};

export default ProtectedRoute;
