import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Indexpage from "./components/Indexpage.jsx";
import NewProperty from "./components/NewProperty";
import Login from "./components/Login";
import Layout from "./Layout";
import Register from "./components/Register";
import Navpage from "./components/Navpage";
import Main01 from "./components/Main01";
import Footer from "./components/Footer";
import Profile from "./components/Profile";
import PropertyDetails from "./components/PropertyDetails";
// import FilterSection from "./components/FilterSection";
import { useState, createContext, useContext } from "react";
import PropTypes from "prop-types";
import axios from "axios";

// Set default base URL for axios
axios.defaults.baseURL = "https://rentalwebsite.onrender.com";

// Create Filter Context
export const FilterContext = createContext(null);

// Create Filter Provider Component
export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    price: [0, 5000],
    rating: 0,
    amenities: [],
  });

  const updateFilters = (filterUpdate) => {
    setFilters((prev) => ({
      ...prev,
      ...filterUpdate,
    }));
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

FilterProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook for using filters
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Main Search Page Component
const SearchPage = () => {
  return (
    <div className="flex">
      {/* <aside className="w-64 p-4">
        <FilterSection />
      </aside> */}
      <main className="flex-1">
        <Main01 />
      </main>
    </div>
  );
};

// App Component
function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Indexpage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/main01" element={<SearchPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="/property/:id" element={<PropertyDetails />} />

          {/* Protected Routes */}
          <Route
            path="/newproperty"
            element={
              <ProtectedRoute>
                <NewProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Additional Routes */}
          <Route path="/navpage" element={<Navpage />} />
          <Route path="/footer" element={<Footer />} />

          {/* Catch-all route for 404 */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
                <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
                <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-gradient px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2">
                  Go Home
                </a>
              </div>
            }
          />
        </Route>
      </Routes>
    </div>
  );
}

// Root App Component with Providers
function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <AppContent />
      </FilterProvider>
    </AuthProvider>
  );
}

export default App;
