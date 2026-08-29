import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomDropdown({
  options = [], // [{ label: "Label", value: "val", icon: ReactNode, dot: "bg-blue-600" }] or ["string"]
  value,
  onChange,
  placeholder = "Select Option",
  icon: Icon,
  error = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format options if array of strings is passed
  const formattedOptions = options.map((opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { label: String(opt), value: opt };
    }
    return opt;
  });

  const selectedOption = formattedOptions.find((opt) => opt.value === value);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm rounded-lg border bg-surface transition cursor-pointer text-left ${
          error
            ? "border-red-500 text-red-600"
            : isOpen
            ? "border-primary ring-2 ring-primary/10"
            : "border-border hover:border-primary/50 text-ink"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {Icon && <Icon size={15} className="text-ink-muted shrink-0" />}
          {selectedOption?.dot && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dot}`} />
          )}
          <span className={selectedOption ? "text-ink font-medium" : "text-ink-muted"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-ink-muted shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-xl z-30 py-1.5 max-h-60 overflow-y-auto animate-fadeIn">
          {formattedOptions.length === 0 ? (
            <div className="px-3.5 py-2 text-xs text-ink-muted">No options available</div>
          ) : (
            formattedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-left transition cursor-pointer hover:bg-canvas ${
                    isSelected ? "text-primary bg-primary-soft/50 font-semibold" : "text-ink"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {opt.dot && <span className={`w-2 h-2 rounded-full ${opt.dot}`} />}
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-primary" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
