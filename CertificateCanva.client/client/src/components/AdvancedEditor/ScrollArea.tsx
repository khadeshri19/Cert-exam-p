import React from "react";

export const ScrollArea = ({ children }: { children: React.ReactNode }) => {
    return (
        <div style={{ overflowY: 'auto', flex: 1 }}>
            {children}
        </div>
    );
};
