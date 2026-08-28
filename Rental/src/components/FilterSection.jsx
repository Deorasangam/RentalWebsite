// src/components/FilterSection.jsx
import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal, Star } from "lucide-react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

const Section = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="border-b border-white/8 last:border-0 pb-4 last:pb-0">
    <button
      className="flex items-center justify-between w-full py-3 text-sm font-semibold text-white hover:text-violet-300 transition-colors group"
      onClick={onToggle}
    >
      <span className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-violet-400" />
        {title}
      </span>
      {isOpen
        ? <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
        : <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
      }
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="pb-2">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const amenitiesList = [
  "WiFi", "TV", "Air Conditioning", "Kitchen", "Parking",
  "Gym", "Security", "Garden", "Furniture", "Washing Machine", "Balcony", "Heating",
];

const FilterSection = ({ onFilterChange }) => {
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedPriceButton, setSelectedPriceButton] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sections, setSections] = useState({ price: true, rating: true, amenities: true });

  const toggle = (key) => setSections((s) => ({ ...s, [key]: !s[key] }));

  const handlePriceRange = (e, i) => {
    const newRange = [...priceRange];
    newRange[i] = parseInt(e.target.value);
    setPriceRange(newRange);
    setSelectedPriceButton(null);
    onFilterChange({ type: "price", value: newRange });
  };

  const priceButtons = [
    { label: "Budget", min: 0, max: 2000 },
    { label: "Mid", min: 2001, max: 5000 },
    { label: "Premium", min: 5001, max: 10000 },
  ];

  const toggleAmenity = (amenity) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(updated);
    onFilterChange({ type: "amenities", value: updated });
  };

  return (
    <div className="glass-card p-5 space-y-1">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/8">
        <SlidersHorizontal className="w-4 h-4 text-violet-400" />
        <h2 className="text-sm font-bold text-white">Filters</h2>
        {(selectedAmenities.length > 0 || minRating > 0) && (
          <button
            onClick={() => {
              setSelectedAmenities([]);
              setMinRating(0);
              setSelectedPriceButton(null);
              setPriceRange([0, 10000]);
              onFilterChange({ type: "amenities", value: [] });
              onFilterChange({ type: "rating", value: 0 });
              onFilterChange({ type: "price", value: [0, 10000] });
            }}
            className="ml-auto text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Price */}
      <Section title="Price Range" icon={SlidersHorizontal} isOpen={sections.price} onToggle={() => toggle("price")}>
        <div className="space-y-4 pt-1">
          <div className="flex gap-1.5">
            {priceButtons.map((b) => (
              <button
                key={b.label}
                onClick={() => {
                  setSelectedPriceButton(b.label);
                  setPriceRange([b.min, b.max]);
                  onFilterChange({ type: "price", value: [b.min, b.max] });
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedPriceButton === b.label
                    ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/8"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>₹{priceRange[0].toLocaleString()}</span>
              <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
            <input
              type="range" min="0" max="10000"
              value={priceRange[0]}
              onChange={(e) => handlePriceRange(e, 0)}
              className="w-full"
            />
            <input
              type="range" min="0" max="50000"
              value={priceRange[1]}
              onChange={(e) => handlePriceRange(e, 1)}
              className="w-full"
            />
          </div>
        </div>
      </Section>

      {/* Rating */}
      <Section title="Min Rating" icon={Star} isOpen={sections.rating} onToggle={() => toggle("rating")}>
        <div className="space-y-1 pt-1">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => {
                const next = minRating === rating ? 0 : rating;
                setMinRating(next);
                onFilterChange({ type: "rating", value: next });
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all ${
                minRating === rating
                  ? "bg-violet-600/20 border border-violet-500/30 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                ))}
                {[...Array(5 - rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-white/10" />
                ))}
              </div>
              <span className="text-xs">& above</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Amenities */}
      <Section title="Amenities" icon={SlidersHorizontal} isOpen={sections.amenities} onToggle={() => toggle("amenities")}>
        <div className="grid grid-cols-1 gap-1.5 pt-1">
          {amenitiesList.map((amenity) => {
            const checked = selectedAmenities.includes(amenity);
            return (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  checked
                    ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                    : "bg-white/[0.03] border-white/8 text-slate-400 hover:bg-white/6 hover:text-white"
                }`}
                id={`filter-amenity-${amenity.replace(/\s+/g, "-")}`}
              >
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                  checked ? "bg-violet-600 border-violet-600" : "border-white/20"
                }`}>
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                {amenity}
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
};

FilterSection.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
};

export default FilterSection;
