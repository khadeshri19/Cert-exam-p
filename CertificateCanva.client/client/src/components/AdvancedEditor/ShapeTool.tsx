import { cn } from "../../lib/utils";

interface ShapeToolProps {
    onClick: () => void;
    icon: any;
    iconClassName?: string;
};

export const ShapeTool = ({
    onClick,
    icon: Icon,
    iconClassName
}: ShapeToolProps) => {
    return (
        <button
            onClick={onClick}
            className="aspect-square border rounded-md p-5 hover:bg-slate-50 transition"
        >
            <Icon className={cn("h-full w-full", iconClassName)} />
        </button>
    );
};
