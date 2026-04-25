import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`
        relative flex h-9 w-16 items-center rounded-full border transition-all duration-300
        ${isDark
          ? "border-gray-700 bg-gray-800 hover:border-gray-600"
          : "border-gray-200 bg-gray-100 hover:border-gray-300"
        }
      `}
    >
      {/* Sliding indicator */}
      <span
        className={`
          absolute flex h-7 w-7 items-center justify-center rounded-full shadow-sm
          transition-all duration-300 ease-in-out
          ${isDark
            ? "translate-x-8 bg-brand-500 text-white"
            : "translate-x-0.5 bg-white text-amber-500 shadow-gray-200"
          }
        `}
      >
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </span>
      {/* Background icons */}
      <Sun
        size={12}
        className={`absolute left-2 transition-opacity duration-200 ${isDark ? "opacity-30 text-gray-500" : "opacity-0"}`}
      />
      <Moon
        size={12}
        className={`absolute right-2 transition-opacity duration-200 ${isDark ? "opacity-0" : "opacity-30 text-gray-400"}`}
      />
    </button>
  );
};
