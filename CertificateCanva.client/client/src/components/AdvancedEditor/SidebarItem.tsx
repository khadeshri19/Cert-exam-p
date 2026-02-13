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
            style={{
                width: '100%',
                height: 'auto',
                padding: '12px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: 'none',
                backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                color: isActive ? '#2563eb' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.color = '#374151';
                }
            }}
            onMouseOut={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                }
            }}
        >
            <Icon style={{ width: '20px', height: '20px' }} />
            <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
                {label}
            </span>
        </button>
    );
};
