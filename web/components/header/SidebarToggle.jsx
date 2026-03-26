import { Menu } from "lucide-react";

export default function SidebarToggle({ onToggle }) {
  return (
    <button type="button" onClick={onToggle} className="text-gray-400 hover:text-white transition-colors">
      <Menu size={20} />
    </button>
  );
}

