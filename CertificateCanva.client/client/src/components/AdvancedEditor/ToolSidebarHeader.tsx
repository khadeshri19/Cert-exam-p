interface ToolSidebarHeaderProps {
    title: string;
    description?: string;
};

export const ToolSidebarHeader = ({
    title,
    description
}: ToolSidebarHeaderProps) => {
    return (
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: '0 0 4px 0' }}>
                {title}
            </h3>
            {description && (
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {description}
                </p>
            )}
        </div>
    );
};
