import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor for token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    return () => {
      delete axios.defaults.headers.common["Authorization"];
    };
  }, []);

  // Verify token and get user data on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("https://rentalwebsite.onrender.com/profile");
        setUser(response.data.user);
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (token, userData) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
