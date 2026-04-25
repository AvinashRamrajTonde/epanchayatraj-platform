import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { publicService, type Notice } from "../../../services/publicService";

export default function PopupNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("popup-notice-dismissed");
    if (dismissed) return;

    publicService
      .getNotices({ page: 1, limit: 1, category: "urgent" })
      .then((data) => {
        const urgent = data.notices?.[0];
        if (urgent) {
          setNotice(urgent);
          setTimeout(() => setVisible(true), 2000);
        }
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("popup-notice-dismissed", "1");
  };

  return (
    <AnimatePresence>
      {visible && notice && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-[91] flex items-center justify-center p-4"
            onClick={dismiss}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-red-500 to-orange-500 px-5 py-4">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-xl animate-pulse">🔔</span>
                    <span className="font-bold">तातडीची सूचना</span>
                  </div>
                  <button
                    onClick={dismiss}
                    className="text-white/80 hover:text-white text-xl w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {notice.imageUrl && (
                  <img
                    src={notice.imageUrl}
                    alt={notice.title}
                    className="w-full h-40 object-cover rounded-xl mb-4"
                  />
                )}
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {notice.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                  {notice.content}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs text-gray-400">
                    {new Date(notice.createdAt).toLocaleDateString("mr-IN")}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5">
                <button
                  onClick={dismiss}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-2.5 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-colors shadow-md shadow-orange-500/20"
                >
                  ठीक आहे
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
