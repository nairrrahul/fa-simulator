import { JSX } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarItem {
  label: string;
  icon: JSX.Element;
  path?: string;
}

interface SidebarSectionProps {
  items: SidebarItem[];
}

export default function SidebarSection({ items }: SidebarSectionProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };
  
  return (
    <div className="border-b border-gray-700 py-4 px-4">
      {items.map((item, idx) => {
        const isActive = item.path === location.pathname;
        
        return (
          <div
            key={idx}
            onClick={() => handleClick(item.path)}
            className={`flex items-center gap-3 px-2 py-2 text-sm font-medium cursor-pointer rounded ${
              isActive 
                ? 'bg-[#1E1E25] text-blue-400' 
                : 'text-gray-200 hover:bg-[#1E1E25]'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
