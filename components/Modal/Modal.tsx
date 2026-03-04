import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
    >
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-black transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  </div>
);

export default Modal;
