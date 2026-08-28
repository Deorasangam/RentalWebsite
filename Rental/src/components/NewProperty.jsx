import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, X, Check, Building, MapPin, DollarSign, Tag, FileText, Mail,
  Wifi, Tv, Wind, UtensilsCrossed, WashingMachine, Car, Layers, ArrowUpFromLine,
  Dumbbell, Shield, Flower2, Sofa, Flame
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const amenityConfig = [
  { name: "WiFi", icon: Wifi },
  { name: "TV", icon: Tv },
  { name: "Air Conditioning", icon: Wind },
  { name: "Heating", icon: Flame },
  { name: "Kitchen", icon: UtensilsCrossed },
  { name: "Washing Machine", icon: WashingMachine },
  { name: "Parking", icon: Car },
  { name: "Elevator", icon: ArrowUpFromLine },
  { name: "Swimming Pool", icon: Layers },
  { name: "Gym", icon: Dumbbell },
  { name: "Security", icon: Shield },
  { name: "Balcony", icon: Flower2 },
  { name: "Garden", icon: Flower2 },
  { name: "Furniture", icon: Sofa },
];

function NewProperty() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [discount, setDiscount] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setImages(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("price", price);
    formData.append("location", location);
    formData.append("discount", discount);
    formData.append("description", description);
    formData.append("email", email);
    formData.append("amenities", JSON.stringify(amenities));
    images.forEach((img) => formData.append("images", img));
    try {
      await axios.post("https://rentalwebsite.onrender.com/NewProperty", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Property listed successfully! 🏠");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const propertyTypes = ["House", "Apartment", "Room", "PG", "Hostel"];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold gradient-text mb-2">List Your Property</h1>
          <p className="text-slate-400">Fill in the details below to get your property in front of thousands of renters.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 space-y-5"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-violet-400" />
              Basic Information
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Property Name *</label>
              <Input
                type="text"
                placeholder="e.g. Cozy Studio Apartment in Koramangala"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="my-0"
                id="prop-name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Property Type *</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {propertyTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 px-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      type === t
                        ? "bg-violet-600/30 border-violet-500/60 text-violet-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <DollarSign className="inline w-3 h-3 mr-1" />Price / Month *
                </label>
                <Input type="number" placeholder="e.g. 8000" value={price} onChange={(e) => setPrice(e.target.value)} required className="my-0" id="prop-price" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Tag className="inline w-3 h-3 mr-1" />Discount (%)
                </label>
                <Input type="number" placeholder="e.g. 10" value={discount} onChange={(e) => setDiscount(e.target.value)} className="my-0" id="prop-discount" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <MapPin className="inline w-3 h-3 mr-1" />Location *
              </label>
              <Input type="text" placeholder="e.g. Koramangala, Bangalore" value={location} onChange={(e) => setLocation(e.target.value)} required className="my-0" id="prop-location" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Mail className="inline w-3 h-3 mr-1" />Contact Email *
              </label>
              <Input type="email" placeholder="contact@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="my-0" id="prop-email" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <FileText className="inline w-3 h-3 mr-1" />Description *
              </label>
              <Textarea
                placeholder="Describe your property — layout, nearby facilities, transport, rules..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                id="prop-description"
              />
            </div>
          </motion.div>

          {/* Amenities */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-violet-400" />
              Amenities
              <span className="text-xs font-normal text-slate-500 ml-1">({amenities.length} selected)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {amenityConfig.map(({ name: a, icon: Icon }) => {
                const selected = amenities.includes(a);
                return (
                  <motion.button
                    key={a}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleAmenity(a)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      selected
                        ? "bg-violet-600/25 border-violet-500/50 text-violet-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/8 hover:text-white"
                    }`}
                    id={`amenity-${a.replace(/\s+/g, "-")}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${selected ? "text-violet-400" : "text-slate-500"}`} />
                    <span className="truncate">{a}</span>
                    {selected && <Check className="w-3 h-3 ml-auto flex-shrink-0 text-violet-400" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-violet-400" />
              Property Images
              <span className="text-xs font-normal text-slate-500 ml-1">({images.length}/5)</span>
            </h2>

            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/15 hover:border-violet-500/50 bg-white/[0.02] hover:bg-violet-500/5 cursor-pointer transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center group-hover:bg-violet-500/25 transition-colors">
                <Upload className="w-6 h-6 text-violet-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Click to upload images</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB · Max 5 images</p>
              </div>
              <input
                id="image-upload"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                multiple
                required
                className="hidden"
              />
            </label>

            <AnimatePresence>
              {imagePreviews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-5 gap-3 mt-4"
                >
                  {imagePreviews.map((src, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-white/10"
                    >
                      <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-gradient h-12 text-base font-bold"
              id="submit-property"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Publish Property
                </span>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

export default NewProperty;
