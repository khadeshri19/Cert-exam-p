import type { LucideIcon } from "lucide-react";

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
            className={`tool-button ${isActive ? 'active' : ''}`}
            style={{
                width: '100%',
                height: 'auto',
                padding: '12px 0',
                flexDirection: 'column',
                gap: '6px',
                borderRadius: 0
            }}
        >
            <Icon className="tool-icon" />
            <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 500 }}>
                {label}
            </span>
        </button>
    );
};
