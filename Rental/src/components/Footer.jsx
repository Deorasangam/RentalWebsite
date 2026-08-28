import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, Twitter, Instagram, Facebook, Linkedin, ArrowUpRight } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Browse Listings", href: "/" },
    { label: "Add Property", href: "/newproperty" },
    { label: "How It Works", href: "#" },
    { label: "Pricing", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Safety Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Community", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Licenses", href: "#" },
  ],
};

const socials = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-white/8 bg-[#050410]/60 backdrop-blur-sm">
      {/* Top gradient line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-xl gradient-text">RentEase</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Discover and book premium hostels, PGs, rooms and apartments near you. Modern rental made effortless.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links], i) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-bold text-white mb-4">{section}</h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-slate-400 hover:text-violet-300 transition-colors flex items-center gap-1 group"
                    >
                      {label}
                      {href !== "#" && (
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-y-0.5 group-hover:translate-y-0 transition-all" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2025 RentEase. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Made with</span>
            <span className="text-red-400">❤</span>
            <span>for renters everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
