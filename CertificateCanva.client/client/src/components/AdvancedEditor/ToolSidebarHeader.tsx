interface ToolSidebarHeaderProps {
    title: string;
    description?: string;
};

export const ToolSidebarHeader = ({
    title,
    description
}: ToolSidebarHeaderProps) => {
    return (
        <div className="p-4 border-b border-gray-200 space-y-1">
            <h3 className="text-sm font-semibold text-gray-800">
                {title}
            </h3>
            {description && (
                <p className="text-xs text-gray-500">
                    {description}
                </p>
            )}
        </div>
    );
};
