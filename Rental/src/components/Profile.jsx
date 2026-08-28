import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, MapPin, Plus, Building, LogOut, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const SkeletonProfile = () => (
  <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <div className="glass-card p-8 flex items-center gap-6">
      <div className="skeleton w-24 h-24 rounded-2xl" />
      <div className="space-y-3 flex-1">
        <div className="skeleton h-6 w-48 rounded-lg" />
        <div className="skeleton h-4 w-64 rounded-lg" />
      </div>
    </div>
    <div className="glass-card p-6">
      <div className="skeleton h-5 w-32 rounded-lg mb-4" />
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
    </div>
  </div>
);

const Profile = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const fetchProfile = async () => {
      try {
        const response = await axios.get("https://rentalwebsite.onrender.com/profile");
        setProperties(response.data.properties || []);
      } catch (error) {
        if (error.response?.status === 401) { logout(); navigate("/login"); }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, navigate, logout]);

  if (!user) return null;
  if (loading) return <SkeletonProfile />;

  const initial = user.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Profile Card */}
        <div className="glass-card p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-glow text-4xl font-extrabold text-white">
                {initial}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#080613] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </motion.div>

            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-white mb-1">{user.name}</h1>
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                <Mail className="w-4 h-4 text-violet-400" />
                {user.email}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">{properties.length} Properties Listed</Badge>
                <Badge variant="secondary">Verified Member</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild className="btn-gradient h-9 px-4 text-sm" id="add-property-btn">
                <Link to="/newproperty">
                  <Plus className="w-4 h-4" />
                  Add Property
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl text-red-400 border-red-500/20 hover:bg-red-500/10"
                onClick={() => { logout(); navigate("/login"); }}
                id="logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-violet-400" />
              My Listings
            </h2>
            <span className="text-sm text-slate-400">{properties.length} total</span>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((property, i) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.35 }}
                  whileHover={{ y: -2 }}
                  className="group flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/8 hover:border-violet-500/30 transition-all"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 flex-shrink-0 overflow-hidden">
                    <img
                      src={`https://rentalwebsite.onrender.com/images/${property._id}/0`}
                      alt={property.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                      <MapPin className="w-3 h-3 text-violet-400" />
                      <span className="truncate">{property.location}</span>
                    </div>
                    <p className="text-sm font-bold text-violet-400 mt-1">
                      ₹{property.price?.toLocaleString()}<span className="text-xs font-normal text-slate-500">/mo</span>
                    </p>
                  </div>
                  <Link to={`/property/${property._id}`} className="self-center">
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No listings yet</h3>
              <p className="text-slate-400 text-sm mb-6">Add your first property and start earning.</p>
              <Button asChild className="btn-gradient" id="empty-add-property">
                <Link to="/newproperty">
                  <Plus className="w-4 h-4" />
                  Add Your First Property
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
