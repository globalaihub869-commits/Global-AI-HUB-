import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      data-testid="btn-theme-toggle"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      whileTap={{ scale: 0.9 }}
      className={`
        relative inline-flex items-center justify-center w-9 h-9 rounded-full
        border transition-all duration-300 overflow-hidden
        ${isDark
          ? "border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.35)]"
          : "border-yellow-400/50 bg-yellow-400/10 hover:bg-yellow-400/20 hover:border-yellow-400/70 shadow-[0_0_12px_rgba(250,204,21,0.2)] hover:shadow-[0_0_20px_rgba(250,204,21,0.35)]"
        }
      `}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute"
          >
            <Moon className="w-4 h-4 text-cyan-300" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute"
          >
            <Sun className="w-4 h-4 text-yellow-400" />
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        className={`
          absolute inset-0 rounded-full pointer-events-none
          ${isDark ? "bg-cyan-400/5" : "bg-yellow-400/5"}
        `}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.button>
  );
}
