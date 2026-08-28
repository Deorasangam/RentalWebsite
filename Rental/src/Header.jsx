import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, Plus, User, LogOut, LayoutDashboard, Home, MapPin, Building2, Building } from "lucide-react";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import axios from "axios";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 1) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axios.get(`/suggestions?q=${encodeURIComponent(searchQuery.trim())}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?location=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === "property_type") {
      navigate(`/search?type=${encodeURIComponent(suggestion.value)}`);
    } else if (suggestion.type === "location") {
      navigate(`/search?location=${encodeURIComponent(suggestion.value)}`);
    } else if (suggestion.type === "property") {
      navigate(`/property/${suggestion.value}`);
    }
    setSearchQuery("");
    setIsSearchOpen(false);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-[#080613]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 group">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-glow-sm">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xl gradient-text tracking-tight">
              RentEase
            </span>
          </motion.div>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md relative" ref={searchRef}>
          <motion.div
            className="flex items-center w-full h-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 gap-2 focus-within:border-violet-500/60 focus-within:bg-white/8 focus-within:shadow-glow-sm transition-all duration-200"
            whileFocusWithin={{ scale: 1.01 }}
          >
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by location, name or type..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 my-0 py-0 px-0 rounded-none"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setSuggestions([]); }} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <Button
              size="sm"
              onClick={handleSearch}
              className="h-7 px-3 text-xs btn-gradient rounded-lg"
            >
              Search
            </Button>
          </motion.div>

          {/* Desktop Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#0c0920]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 py-2"
              >
                {suggestions.map((item, idx) => (
                  <div
                    key={`${item.type}-${idx}`}
                    onClick={() => handleSuggestionClick(item)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      {item.type === "location" && <MapPin className="w-4 h-4 text-violet-400" />}
                      {item.type === "property_type" && <Building2 className="w-4 h-4 text-indigo-400" />}
                      {item.type === "property" && <Building className="w-4 h-4 text-pink-400" />}
                    </div>
                    <div>
                      <div className="text-sm text-white font-medium">{item.label}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {item.type.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-xl border border-white/10"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Add Property */}
          {user && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                className="hidden md:flex btn-gradient h-9 px-4 text-sm"
              >
                <Link to="/newproperty">
                  <Plus className="w-4 h-4" />
                  Add Property
                </Link>
              </Button>
            </motion.div>
          )}

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl w-10 h-10 relative"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              id="user-menu-trigger"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : user ? (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              ) : (
                <User className="w-4 h-4" />
              )}
            </Button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-56 glass-card p-1.5 z-50"
                  id="user-menu-dropdown"
                >
                  {user ? (
                    <>
                      <div className="px-3 py-2 mb-1">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      </div>
                      <div className="h-px bg-white/10 my-1" />
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to="/newproperty"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-all md:hidden"
                      >
                        <Plus className="w-4 h-4" />
                        Add Property
                      </Link>
                      <div className="h-px bg-white/10 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-all"
                      >
                        <User className="w-4 h-4" />
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white bg-violet-600/30 hover:bg-violet-600/50 transition-all mt-1"
                      >
                        <Plus className="w-4 h-4" />
                        Register
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-white/10 relative"
            ref={mobileSearchRef}
          >
            <div className="px-4 py-3 flex items-center gap-2 bg-[#080613]/90 backdrop-blur-xl">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by location, name or type..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 my-0 py-0 px-0 rounded-none"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSuggestions([]); }} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <Button size="sm" onClick={handleSearch} className="btn-gradient h-8 px-3 text-xs rounded-lg">
                Go
              </Button>
            </div>
            
            {/* Mobile Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 bg-[#0c0920] border-b border-white/10 z-50 py-2 max-h-64 overflow-y-auto"
                >
                  {suggestions.map((item, idx) => (
                    <div
                      key={`mob-${item.type}-${idx}`}
                      onClick={() => handleSuggestionClick(item)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        {item.type === "location" && <MapPin className="w-4 h-4 text-violet-400" />}
                        {item.type === "property_type" && <Building2 className="w-4 h-4 text-indigo-400" />}
                        {item.type === "property" && <Building className="w-4 h-4 text-pink-400" />}
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">{item.label}</div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {item.type.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
