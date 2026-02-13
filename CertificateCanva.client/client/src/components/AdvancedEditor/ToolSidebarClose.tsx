import { ChevronsLeft } from "lucide-react";

interface ToolSidebarCloseProps {
    onClick: () => void;
};

export const ToolSidebarClose = ({
    onClick,
}: ToolSidebarCloseProps) => {
    return (
        <button
            onClick={onClick}
            style={{
                position: 'absolute',
                right: '-28px',
                height: '64px',
                backgroundColor: 'white',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0 12px 12px 0',
                padding: '0 6px',
                border: '1px solid #e5e7eb',
                borderLeft: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                zIndex: 50,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
            <ChevronsLeft style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
        </button>
    );
};
