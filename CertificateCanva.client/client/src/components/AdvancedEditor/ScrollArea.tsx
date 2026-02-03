import React from "react";

export const ScrollArea = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={`overflow-y-auto flex-1 ${className || ""}`}>
            {children}
        </div>
    );
};
