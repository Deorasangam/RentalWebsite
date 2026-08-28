import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Building2, BedSingle, Building, Users } from "lucide-react";

const navItems = [
  { type: "Home", label: "All", icon: Home, color: "from-violet-500 to-purple-600" },
  { type: "hostel", label: "Hostel", icon: Building2, color: "from-blue-500 to-cyan-600" },
  { type: "pg", label: "PG", icon: Users, color: "from-emerald-500 to-teal-600" },
  { type: "room", label: "Room", icon: BedSingle, color: "from-orange-500 to-amber-600" },
  { type: "apartment", label: "Apartment", icon: Building, color: "from-pink-500 to-rose-600" },
];

const Navpage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentType = new URLSearchParams(location.search).get("type");

  const handleTypeClick = (type) => {
    if (type === "Home") {
      navigate("/");
    } else {
      navigate(`/?type=${type}`);
    }
  };

  const isActive = (type) => {
    if (type === "Home") return !currentType;
    return currentType === type;
  };

  return (
    <div className="border-b border-white/5 bg-[#080613]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-none">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item.type);
            return (
              <motion.button
                key={item.type}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleTypeClick(item.type)}
                className={`relative flex flex-col items-center gap-1.5 px-5 py-2.5 rounded-xl transition-all duration-200 flex-shrink-0 group ${
                  active
                    ? "bg-white/10 border border-white/15"
                    : "hover:bg-white/5 border border-transparent"
                }`}
                id={`nav-${item.type}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    active
                      ? `bg-gradient-to-br ${item.color} shadow-glow-sm`
                      : "bg-white/5 group-hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`} />
                </div>
                <span
                  className={`text-xs font-semibold transition-colors ${
                    active ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r ${item.color}`}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navpage;
