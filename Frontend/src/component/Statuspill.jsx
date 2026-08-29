import { STATUS_META } from "../lib/Utils";
import { ChevronDown } from "lucide-react";

export default function StatusPill({ status, showChevron = false }) {
  const meta = STATUS_META[status] || STATUS_META.new;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors ${meta.bg} ${meta.text} border border-transparent hover:border-black/10`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      <span>{meta.label}</span>
      {showChevron && <ChevronDown size={12} className="opacity-70 ml-0.5" />}
    </span>
  );
}