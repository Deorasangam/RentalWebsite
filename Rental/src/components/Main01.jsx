// src/components/Main01.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { StarIcon, MapPin, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FilterSection from "./FilterSection";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

// Skeleton card component
const SkeletonCard = () => (
  <div className="glass-card overflow-hidden">
    <div className="skeleton h-48 rounded-t-2xl rounded-b-none" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-4 w-3/4 rounded-lg" />
      <div className="skeleton h-3 w-1/2 rounded-lg" />
      <div className="skeleton h-3 w-1/3 rounded-lg" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="skeleton h-9 w-full rounded-xl mt-2" />
    </div>
  </div>
);

const PropertyCard = ({ property, index }) => {
  const [ratings, setRatings] = useState({});
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarClick = async (star) => {
    try {
      const response = await axios.post(
        `https://rentalwebsite.onrender.com/property/${property._id}/rate`,
        { rating: star, comment: "User rating" }
      );
      if (response.data.success) {
        setRatings((prev) => ({ ...prev, [property._id]: star }));
      }
    } catch (e) {
      console.error("Rating error:", e);
    }
  };

  const avgRating = property.reviews?.length
    ? (property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length).toFixed(1)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="property-card group"
    >
      <Link to={`/property/${property._id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden h-52">
          <img
            src={`https://rentalwebsite.onrender.com/images/${property._id}/0`}
            alt={property.name || "Property"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="default" className="text-[10px] font-semibold backdrop-blur-sm">
              {property.type}
            </Badge>
            {property.discount > 0 && (
              <Badge variant="destructive" className="text-[10px] font-semibold backdrop-blur-sm">
                {property.discount}% OFF
              </Badge>
            )}
          </div>

          {/* Rating badge */}
          {avgRating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
              <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-[11px] font-bold text-white">{avgRating}</span>
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-3 left-3">
            <span className="text-white font-bold text-lg">
              ₹{property.price?.toLocaleString()}
              <span className="text-xs font-normal text-white/70">/mo</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h2 className="font-bold text-white text-base leading-tight truncate mb-1.5 group-hover:text-violet-300 transition-colors">
            {property.name}
          </h2>

          <div className="flex items-center gap-1.5 text-slate-400 mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />
            <span className="text-xs truncate">{property.location}</span>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {property.amenities.slice(0, 3).map((a) => (
                <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge variant="outline" className="text-[10px]">+{property.amenities.length - 3}</Badge>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Stars + CTA */}
      <div className="px-5 pb-5 space-y-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <StarIcon
                className={`w-4 h-4 transition-colors ${
                  star <= (hoveredRating || ratings[property._id] || property.averageRating || 0)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-white/20"
                }`}
              />
            </button>
          ))}
          <span className="ml-1.5 text-xs text-slate-500">
            ({property.reviews?.length || 0})
          </span>
        </div>

        <Link to={`/property/${property._id}`} className="block">
          <Button className="w-full btn-gradient h-9 text-sm" id={`view-${property._id}`}>
            View Details
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

const Main01 = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const location = useLocation();
  const [filters, setFilters] = useState({ price: [0, 50000], rating: 0, amenities: [] });

  const handleFilterChange = ({ type, value }) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  useEffect(() => {
    if (properties.length) {
      const filtered = properties.filter((p) => {
        if (p.price < filters.price[0] || p.price > filters.price[1]) return false;
        const avg = p.reviews?.length
          ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
          : 0;
        if (filters.rating > 0 && avg < filters.rating) return false;
        if (filters.amenities.length > 0) {
          const pa = p.amenities || [];
          if (!filters.amenities.every((a) => pa.includes(a))) return false;
        }
        return true;
      });
      setFilteredProperties(filtered);
    }
  }, [filters, properties]);

  useEffect(() => {
    const fetchProperties = async () => {
      const params = new URLSearchParams(location.search);
      const locationQuery = params.get("location");
      const typeQuery = params.get("type");
      try {
        setLoading(true);
        const response = await axios.get("https://rentalwebsite.onrender.com/property", {
          params: { location: locationQuery, type: typeQuery },
        });
        const data = typeQuery
          ? response.data.filter((p) => p.type?.toLowerCase() === typeQuery.toLowerCase())
          : response.data;
        setProperties(data);
        setFilteredProperties(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [location.search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {loading ? "Loading..." : `${filteredProperties.length} Properties`}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Find your perfect rental</p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 md:hidden"
          onClick={() => setShowFilter(true)}
          id="filter-toggle-mobile"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <FilterSection onFilterChange={handleFilterChange} />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showFilter && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setShowFilter(false)}
              />
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 w-72 z-50 overflow-y-auto bg-[#0c0920] border-r border-white/10 p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Filters</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilter(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <FilterSection onFilterChange={handleFilterChange} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Property Grid */}
        <div className="flex-1">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProperties.map((property, i) => (
                <PropertyCard key={property._id} property={property} index={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <SlidersHorizontal className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No properties found</h3>
              <p className="text-slate-400 text-sm max-w-sm">
                Try adjusting your filters or search in a different location.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Main01;
