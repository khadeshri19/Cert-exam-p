import type { LucideIcon } from "lucide-react";

import { cn } from "../../lib/utils";

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    isActive?: boolean;
    onClick: () => void;
};

export const SidebarItem = ({
    icon: Icon,
    label,
    isActive,
    onClick,
}: SidebarItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full py-4 flex flex-col items-center justify-center gap-y-1.5 transition-all relative",
                isActive
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
            style={isActive ? { backgroundColor: '#ee7158' } : {}}
        >
            {isActive && (
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                    style={{ backgroundColor: '#3d5a5a' }}
                />
            )}
            <Icon className="size-5 stroke-[1.5]" />
            <span className="text-[10px] font-medium uppercase tracking-wide">
                {label}
            </span>
        </button>
    );
};
