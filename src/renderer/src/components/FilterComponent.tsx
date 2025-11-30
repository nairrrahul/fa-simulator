import { JSX, useState, useRef, useEffect } from "react";

export interface FilterOption {
  id: string | number;
  label: string;
}

interface FilterComponentProps {
  title: string;
  options: FilterOption[];
  selectedIds: Set<string | number>;
  onToggle: (id: string | number) => void;
  onToggleAll: () => void;
}

export default function FilterComponent({
  title,
  options,
  selectedIds,
  onToggle,
  onToggleAll,
}: FilterComponentProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const allSelected = selectedIds.size === options.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-[#13131A] border border-gray-700 rounded text-gray-200 hover:bg-[#1A1A22] transition-colors text-sm font-medium"
      >
        Filter
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#13131A] border border-gray-700 rounded-lg shadow-xl z-50">
          {/* Header - Toggle All */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <span className="text-sm font-semibold text-gray-300">{title}</span>
            <button
              onClick={onToggleAll}
              className="p-1 hover:bg-[#1A1A22] rounded transition-colors"
              title={allSelected ? "Deselect All" : "Select All"}
            >
              {allSelected ? (
                <div className="w-4 h-4 bg-blue-500 border border-blue-500 rounded" />
              ) : (
                <div className="w-4 h-4 border border-gray-500 rounded" />
              )}
            </button>
          </div>

          {/* Options List */}
          <div className="py-2 max-h-80 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selectedIds.has(option.id);
              
              return (
                <button
                  key={option.id}
                  onClick={() => onToggle(option.id)}
                  className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#1A1A22] transition-colors text-left"
                >
                  <span className="text-sm text-gray-300 pl-4">{option.label}</span>
                  <div className="p-1">
                    {isSelected ? (
                      <div className="w-4 h-4 bg-blue-500 border border-blue-500 rounded" />
                    ) : (
                      <div className="w-4 h-4 border border-gray-500 rounded" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}