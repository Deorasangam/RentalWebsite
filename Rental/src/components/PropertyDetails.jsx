import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, BedDouble, Bath, Home, Star, Calendar, Heart, Share2,
  ChevronLeft, ChevronRight, Wifi, Tv, Wind, Coffee, Car, Dumbbell,
  Shield, Trees, User, Mail, Phone, X, Check, ArrowLeft, Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { cn } from "../lib/utils";

// ─── Image Gallery ─────────────────────────────────────────────────────────────
const ImageGallery = ({ propertyId, images = [], onShowFullGallery }) => {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const d = touchStart - touchEnd;
    if (d > 50 && current < images.length - 1) setCurrent((p) => p + 1);
    if (d < -50 && current > 0) setCurrent((p) => p - 1);
    setTouchStart(null); setTouchEnd(null);
  };

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-2xl overflow-hidden">
        <div
          className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden"
          onClick={() => onShowFullGallery(0)}
        >
          <img
            src={`https://rentalwebsite.onrender.com/images/${propertyId}/0`}
            alt="Main"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => onShowFullGallery(i)}
          >
            <img
              src={`https://rentalwebsite.onrender.com/images/${propertyId}/${i}`}
              alt={`View ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {i === 4 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{images.length - 5}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Slider */}
      <div
        className="md:hidden relative h-72 rounded-2xl overflow-hidden"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchMove={(e) => setTouchEnd(e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="absolute inset-0 flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {Array.from({ length: Math.min(images.length, 5) }).map((_, i) => (
            <div key={i} className="w-full h-full flex-shrink-0">
              <img
                src={`https://rentalwebsite.onrender.com/images/${propertyId}/${i}`}
                alt={`View ${i + 1}`}
                className="w-full h-full object-cover"
                onClick={() => onShowFullGallery(i)}
              />
            </div>
          ))}
        </div>
        {current > 0 && (
          <button onClick={() => setCurrent((p) => p - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
        )}
        {current < Math.min(images.length, 5) - 1 && (
          <button onClick={() => setCurrent((p) => p + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        )}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {Array.from({ length: Math.min(images.length, 5) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn("h-1.5 rounded-full transition-all", current === i ? "w-5 bg-white" : "w-1.5 bg-white/40")}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

ImageGallery.propTypes = {
  propertyId: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string),
  onShowFullGallery: PropTypes.func.isRequired,
};
ImageGallery.defaultProps = { images: [] };

// ─── Amenity Icon Map ─────────────────────────────────────────────────────────
const amenityIcons = {
  WiFi: <Wifi className="w-4 h-4" />,
  TV: <Tv className="w-4 h-4" />,
  "Air Conditioning": <Wind className="w-4 h-4" />,
  Parking: <Car className="w-4 h-4" />,
  Garden: <Trees className="w-4 h-4" />,
  Security: <Shield className="w-4 h-4" />,
  Gym: <Dumbbell className="w-4 h-4" />,
  Kitchen: <Coffee className="w-4 h-4" />,
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [bookingData, setBookingData] = useState({ checkIn: "", checkOut: "", message: "" });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`https://rentalwebsite.onrender.com/property/${id}`);
        setProperty(res.data.property);
        if (user) {
          try {
            const token = localStorage.getItem("token");
            const fav = await axios.get(`https://rentalwebsite.onrender.com/property/${id}/favorite`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setIsFavorited(fav.data.isFavorited);
          } catch {}
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load property");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user, navigate]);

  const handleFavorite = async () => {
    if (!user) { toast.warning("Please login to save favorites"); navigate("/login"); return; }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`https://rentalwebsite.onrender.com/property/${id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFavorited(res.data.isFavorited);
      toast.success(res.data.isFavorited ? "Added to favorites ❤️" : "Removed from favorites");
    } catch {
      toast.error("Failed to update favorites");
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) { toast.warning("Please login to book"); navigate("/login"); return; }
    try {
      const token = localStorage.getItem("token");
      await axios.post(`https://rentalwebsite.onrender.com/property/${id}/book`, bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Booking request sent! 🎉");
      setBookingData({ checkIn: "", checkOut: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-8 h-8 text-violet-400" />
          </div>
          <p className="text-slate-400 text-sm">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const avgRating = property.reviews?.length
    ? (property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to listings
      </motion.button>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start gap-4 mb-5"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="default">{property.type}</Badge>
            {property.discount > 0 && <Badge variant="destructive">{property.discount}% OFF</Badge>}
            {avgRating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-white">{avgRating}</span>
                <span className="text-slate-400">({property.reviews.length} reviews)</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">
            {property.name}
          </h1>
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <MapPin className="w-4 h-4 text-violet-400" />
            {property.location}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFavorite}
            className={cn("gap-2", isFavorited && "border-red-500/40 text-red-400 bg-red-500/10")}
            id="favorite-btn"
          >
            <Heart className={cn("w-4 h-4", isFavorited && "fill-red-500 text-red-500")} />
            {isFavorited ? "Saved" : "Save"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied! 📋");
            }}
            id="share-btn"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </motion.div>

      {/* Gallery */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <ImageGallery
          propertyId={property._id}
          images={property.images || []}
          onShowFullGallery={(i) => { setSelectedImage(i); setShowFullGallery(true); }}
        />
      </motion.div>

      {/* Full Gallery Modal */}
      <AnimatePresence>
        {showFullGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setShowFullGallery(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full max-w-4xl">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={`https://rentalwebsite.onrender.com/images/${property._id}/${selectedImage}`}
                alt={`View ${selectedImage + 1}`}
                className="w-full h-auto rounded-2xl max-h-[70vh] object-contain"
              />
              <div className="flex justify-center mt-4 gap-2">
                {Array.from({ length: Math.min(property.images?.length || 1, 5) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn("w-16 h-12 rounded-xl overflow-hidden border-2 transition-all", selectedImage === i ? "border-violet-500" : "border-transparent opacity-60 hover:opacity-100")}
                  >
                    <img src={`https://rentalwebsite.onrender.com/images/${property._id}/${i}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-4">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8">
                <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Home className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Type</p>
                  <p className="text-sm font-semibold text-white">{property.type}</p>
                </div>
              </div>
              {property.bedrooms && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <BedDouble className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Bedrooms</p>
                    <p className="text-sm font-semibold text-white">{property.bedrooms}</p>
                  </div>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Bath className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Bathrooms</p>
                    <p className="text-sm font-semibold text-white">{property.bathrooms}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-3">About this property</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
          </motion.div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm text-violet-300">
                    {amenityIcons[amenity] || <Check className="w-4 h-4" />}
                    {amenity}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Map */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden">
            <div className="p-6 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-violet-400" />
                Location
              </h2>
            </div>
            <div className="h-64 mx-6 mb-6 rounded-xl overflow-hidden">
              <iframe
                title="Property Location"
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
                allowFullScreen
                className="grayscale"
              />
            </div>
          </motion.div>

          {/* Reviews */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              Reviews ({property.reviews?.length || 0})
            </h2>
            {property.reviews?.length > 0 ? (
              <div className="space-y-4">
                {property.reviews.map((review, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="pb-4 border-b border-white/8 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/40 to-indigo-500/40 flex items-center justify-center text-xs font-bold text-violet-300">
                        {review.userName?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{review.userName || "Anonymous"}</p>
                        <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {[...Array(5)].map((_, si) => (
                          <Star key={si} className={`w-3.5 h-3.5 ${si < review.rating ? "text-yellow-400 fill-yellow-400" : "text-white/10"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Star className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No reviews yet. Be the first!</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right — Booking */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            {/* Price Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold text-white">₹{property.price?.toLocaleString()}</span>
                <span className="text-slate-400 text-sm">/month</span>
                {property.discount > 0 && (
                  <Badge variant="destructive" className="ml-auto">{property.discount}% OFF</Badge>
                )}
              </div>
              {avgRating && (
                <div className="flex items-center gap-1.5 mb-5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold text-white">{avgRating}</span>
                  <span className="text-slate-400 text-xs">({property.reviews?.length} reviews)</span>
                </div>
              )}

              <div className="h-px bg-white/8 mb-5" />

              <form onSubmit={handleBooking} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                    <Calendar className="w-3 h-3" /> Check-in
                  </label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full"
                    required
                    id="checkin-date"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                    <Calendar className="w-3 h-3" /> Check-out
                  </label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    min={bookingData.checkIn || new Date().toISOString().split("T")[0]}
                    className="w-full"
                    required
                    id="checkout-date"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                    Message to host
                  </label>
                  <Textarea
                    placeholder="Tell the host about your stay..."
                    value={bookingData.message}
                    onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!user}
                  className="w-full btn-gradient h-11 font-bold text-base"
                  id="book-now-btn"
                >
                  {user ? "Book Now" : "Login to Book"}
                </Button>
                {!user && (
                  <p className="text-center text-xs text-slate-500">
                    <span className="text-violet-400 cursor-pointer hover:underline" onClick={() => navigate("/login")}>Sign in</span> to book this property
                  </p>
                )}
              </form>
            </motion.div>

            {/* Contact */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-4">Contact Host</h3>
              <div className="space-y-3">
                {property.email && (
                  <a href={`mailto:${property.email}`} className="flex items-center gap-3 text-slate-300 hover:text-violet-300 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center group-hover:bg-violet-500/25 transition-colors">
                      <Mail className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <span className="text-sm truncate">{property.email}</span>
                  </a>
                )}
                {property.phone && (
                  <a href={`tel:${property.phone}`} className="flex items-center gap-3 text-slate-300 hover:text-violet-300 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center group-hover:bg-emerald-500/25 transition-colors">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-sm">{property.phone}</span>
                  </a>
                )}
              </div>
            </motion.div>

            {/* House Rules */}
            {property.rules && Object.keys(property.rules).length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
                <h3 className="text-sm font-bold text-white mb-4">House Rules</h3>
                <div className="space-y-2">
                  {Object.entries(property.rules).map(([rule, allowed]) => (
                    <div key={rule} className="flex items-center gap-2.5 text-sm">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", allowed ? "bg-emerald-500/20" : "bg-red-500/20")}>
                        {allowed
                          ? <Check className="w-3 h-3 text-emerald-400" />
                          : <X className="w-3 h-3 text-red-400" />
                        }
                      </div>
                      <span className="text-slate-300 capitalize">{rule.replace(/([A-Z])/g, " $1").trim()} {allowed ? "allowed" : "not allowed"}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
