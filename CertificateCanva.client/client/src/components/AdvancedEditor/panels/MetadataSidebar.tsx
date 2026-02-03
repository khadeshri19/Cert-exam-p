import { useState, useEffect } from "react";
import { User, FileText, Calendar, Building2 } from "lucide-react";

import type { ActiveTool, Editor } from "../types";
import { ToolSidebarClose } from "../ToolSidebarClose";
import { ToolSidebarHeader } from "../ToolSidebarHeader";
import { ScrollArea } from "../ScrollArea";

import { cn } from "../../../lib/utils";

interface MetadataSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    metadata: {
        holder_name: string;
        certificate_title: string;
        issue_date: string;
        organization_name: string;
    };
    onMetadataChange: (metadata: any) => void;
}

export const MetadataSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool,
    metadata,
    onMetadataChange
}: MetadataSidebarProps) => {
    const [localMetadata, setLocalMetadata] = useState(metadata);

    useEffect(() => {
        setLocalMetadata(metadata);
    }, [metadata]);

    const handleChange = (field: string, value: string) => {
        const updated = { ...localMetadata, [field]: value };
        setLocalMetadata(updated);
        onMetadataChange(updated);
    };

    const onClose = () => {
        onChangeActiveTool("select");
    };

    const addToCanvas = (type: 'holder' | 'title' | 'date' | 'org' | 'id') => {
        let text = "";

        switch (type) {
            case 'holder': text = localMetadata.holder_name || "Holder Name"; break;
            case 'title': text = localMetadata.certificate_title || "Certificate Title"; break;
            case 'date': text = localMetadata.issue_date || "Issue Date"; break;
            case 'org': text = localMetadata.organization_name || "Organization Name"; break;
            case 'id': text = "Certificate ID: sarv-xxxx-xxxx"; break;
        }

        editor?.addText(text, {
            fontSize: type === 'title' ? 48 : 24,
            fontWeight: type === 'title' ? 'bold' : 'normal',
            fill: '#3d5a5a'
        });
    };

    return (
        <aside
            className={cn(
                "bg-white relative border-r border-gray-200 z-[40] w-[300px] h-full flex flex-col",
                activeTool === "metadata" ? "visible" : "hidden"
            )}
        >
            <ToolSidebarHeader
                title="Certificate Info"
                description="Manage certificate details and metadata"
            />

            <ScrollArea>
                <div className="p-4 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User size={14} /> Holder Name
                            </label>
                            <input
                                value={localMetadata.holder_name}
                                onChange={(e) => handleChange('holder_name', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm"
                                placeholder="Recipient Full Name"
                            />
                            <button
                                onClick={() => addToCanvas('holder')}
                                className="text-[10px] text-[#ee7158] hover:underline"
                            >
                                + Add to Canvas
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <FileText size={14} /> Certificate Title
                            </label>
                            <input
                                value={localMetadata.certificate_title}
                                onChange={(e) => handleChange('certificate_title', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm"
                                placeholder="e.g. Certificate of Excellence"
                            />
                            <button
                                onClick={() => addToCanvas('title')}
                                className="text-[10px] text-[#ee7158] hover:underline"
                            >
                                + Add to Canvas
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Calendar size={14} /> Issue Date
                            </label>
                            <input
                                type="date"
                                value={localMetadata.issue_date}
                                onChange={(e) => handleChange('issue_date', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm"
                            />
                            <button
                                onClick={() => addToCanvas('date')}
                                className="text-[10px] text-[#ee7158] hover:underline"
                            >
                                + Add to Canvas
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Building2 size={14} /> Organization
                            </label>
                            <input
                                value={localMetadata.organization_name}
                                onChange={(e) => handleChange('organization_name', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm"
                                placeholder="e.g. Sarvarth Academy"
                            />
                            <button
                                onClick={() => addToCanvas('org')}
                                className="text-[10px] text-[#ee7158] hover:underline"
                            >
                                + Add to Canvas
                            </button>
                        </div>

                        <div className="pt-4 border-t">
                            <button
                                onClick={() => addToCanvas('id')}
                                className="w-full py-2 bg-gray-50 border border-dashed border-gray-300 rounded-md text-xs text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                + Add Certificate ID Placeholder
                            </button>
                            <p className="text-[10px] text-gray-400 mt-2 text-center">
                                * The actual ID will be generated upon saving.
                            </p>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};
