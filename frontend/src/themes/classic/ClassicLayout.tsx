import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ClassicNavbar from "./components/ClassicNavbar";
import ClassicFooter from "./components/ClassicFooter";
import PopupNotice from "./components/PopupNotice";
import ScrollToTop from "./components/ScrollToTop";
import FontInjector from "../FontInjector";
import { classicFonts } from "../fontConfig";

export default function ClassicLayout() {
  const location = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col bg-white"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <FontInjector fonts={classicFonts} />
      <ClassicNavbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <ClassicFooter />
      <PopupNotice />
      <ScrollToTop />
    </div>
  );
}
