import {
    Minimize,
    ZoomIn,
    ZoomOut
} from "lucide-react";

import type { Editor } from "./types";

interface FooterProps {
    editor: Editor | undefined;
};

export const Footer = ({ editor }: FooterProps) => {
    return (
        <footer className="h-12 border-t border-gray-200 bg-white w-full flex items-center justify-between px-4">
            <div className="flex items-center gap-1">
                <button
                    onClick={() => editor?.zoomOut()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut className="size-4" />
                </button>
                <button
                    onClick={() => editor?.autoZoom()}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Reset Zoom"
                >
                    <Minimize className="size-4" />
                </button>
                <button
                    onClick={() => editor?.zoomIn()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn className="size-4" />
                </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>Powered by</span>
                <img
                    src="/sarvarth-logo.png"
                    alt="Sarvarth"
                    className="h-4 object-contain"
                />
            </div>
        </footer>
    );
};
