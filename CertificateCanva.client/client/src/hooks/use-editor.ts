import * as fabric from "fabric";
import { useCallback, useState, useMemo, useRef } from "react";

import type {
    Editor,
    BuildEditorProps,
    EditorHookProps,
} from "../components/AdvancedEditor/types";
import {
    FILL_COLOR,
    STROKE_WIDTH,
    STROKE_COLOR,
    CIRCLE_OPTIONS,
    DIAMOND_OPTIONS,
    TRIANGLE_OPTIONS,
    RECTANGLE_OPTIONS,
    STROKE_DASH_ARRAY,
    TEXT_OPTIONS,
    FONT_FAMILY,
    FONT_WEIGHT,
    FONT_SIZE,
    JSON_KEYS,
} from "../components/AdvancedEditor/types";
import { useHistory } from "./use-history";
import {
    createFilter,
    downloadFile,
    isTextType,
    transformText
} from "../components/AdvancedEditor/utils";
import { useHotkeys } from "./use-hotkeys";
import { useClipboard } from "./use-clipboard";
import { useAutoResize } from "./use-auto-resize";
import { useCanvasEvents } from "./use-canvas-events";
import { useWindowEvents } from "./use-window-events";
import { useLoadState } from "./use-load-state";

const buildEditor = ({
    save,
    undo,
    redo,
    canRedo,
    canUndo,
    autoZoom,
    copy,
    paste,
    canvas,
    fillColor,
    fontFamily,
    setFontFamily,
    setFillColor,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    selectedObjects,
    strokeDashArray,
    setStrokeDashArray,
}: BuildEditorProps): Editor => {
    const generateSaveOptions = () => {
        const workspace = getWorkspace() as fabric.Rect;
        if (!workspace) return {};

        const { width, height, left, top } = workspace;

        return {
            name: "Image",
            format: "png",
            quality: 1,
            width,
            height,
            left,
            top,
        };
    };

    const savePng = () => {
        const options = generateSaveOptions();

        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        const dataUrl = canvas.toDataURL(options as any);

        downloadFile(dataUrl, "png");
        autoZoom();
    };

    const saveSvg = () => {
        const options = generateSaveOptions();

        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        const dataUrl = canvas.toDataURL(options as any);

        downloadFile(dataUrl, "svg");
        autoZoom();
    };

    const saveJpg = () => {
        const options = generateSaveOptions();

        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        const dataUrl = canvas.toDataURL(options as any);

        downloadFile(dataUrl, "jpg");
        autoZoom();
    };

    const saveJson = async () => {
        const dataUrl = (canvas as any).toJSON(JSON_KEYS);

        await transformText(dataUrl.objects);
        const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(dataUrl, null, "\t"),
        )}`;
        downloadFile(fileString, "json");
    };

    const loadJson = (json: string) => {
        const data = JSON.parse(json);

        canvas.loadFromJSON(data).then(() => {
            autoZoom();
        });
    };

    const getWorkspace = () => {
        return canvas
            .getObjects()
            .find((object) => (object as any).name === "clip");
    };

    const center = (object: fabric.FabricObject) => {
        const workspace = getWorkspace();
        const center = workspace?.getCenterPoint();

        if (!center) return;

        canvas.viewportCenterObject(object);
        // Manual adjustment if workspace is not at canvas center
        // For now simple center is fine as workspace is centered in init
    };

    const addToCanvas = (object: fabric.FabricObject) => {
        center(object);
        canvas.add(object);
        canvas.setActiveObject(object);
    };

    return {
        savePng,
        saveJpg,
        saveSvg,
        saveJson,
        loadJson,
        canUndo,
        canRedo,
        autoZoom,
        getWorkspace,
        zoomIn: () => {
            let zoomRatio = canvas.getZoom();
            zoomRatio += 0.05;
            const center = canvas.getCenterPoint();
            canvas.zoomToPoint(
                new fabric.Point(center.x, center.y),
                zoomRatio > 1 ? 1 : zoomRatio
            );
        },
        zoomOut: () => {
            let zoomRatio = canvas.getZoom();
            zoomRatio -= 0.05;
            const center = canvas.getCenterPoint();
            canvas.zoomToPoint(
                new fabric.Point(center.x, center.y),
                zoomRatio < 0.2 ? 0.2 : zoomRatio,
            );
        },
        changeSize: (value: { width: number; height: number }) => {
            const workspace = getWorkspace();

            workspace?.set(value);
            autoZoom();
            save();
        },
        changeBackground: (value: string) => {
            const workspace = getWorkspace();
            workspace?.set({ fill: value });
            canvas.renderAll();
            save();
        },
        enableDrawingMode: () => {
            canvas.discardActiveObject();
            canvas.renderAll();
            canvas.isDrawingMode = true;
            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.width = strokeWidth;
                canvas.freeDrawingBrush.color = strokeColor;
            }
        },
        disableDrawingMode: () => {
            canvas.isDrawingMode = false;
        },
        onUndo: () => undo(),
        onRedo: () => redo(),
        onCopy: () => copy(),
        onPaste: () => paste(),
        changeImageFilter: (value: string) => {
            const objects = canvas.getActiveObjects();
            objects.forEach((object) => {
                if (object.type === "image") {
                    const imageObject = object as fabric.FabricImage;

                    const effect = createFilter(value);

                    imageObject.filters = effect ? [effect] : [];
                    imageObject.applyFilters();
                    canvas.renderAll();
                }
            });
        },
        addImage: (value: string) => {
            fabric.FabricImage.fromURL(
                value,
                {
                    crossOrigin: "anonymous",
                },
            ).then((image) => {
                const workspace = getWorkspace();

                image.scaleToWidth(workspace?.width || 0);
                image.scaleToHeight(workspace?.height || 0);

                addToCanvas(image);
            });
        },
        delete: () => {
            canvas.getActiveObjects().forEach((object) => canvas.remove(object));
            canvas.discardActiveObject();
            canvas.renderAll();
        },
        addText: (value, options) => {
            const object = new fabric.Textbox(value, {
                ...TEXT_OPTIONS,
                fill: fillColor,
                ...options,
            });

            addToCanvas(object);
        },
        getActiveOpacity: () => {
            const selectedObject = selectedObjects[0];

            if (!selectedObject) {
                return 1;
            }

            const value = selectedObject.get("opacity") || 1;

            return value;
        },
        changeFontSize: (value: number) => {
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    object.set({ fontSize: value } as any);
                }
            });
            canvas.renderAll();
        },
        getActiveFontSize: () => {
            const selectedObject = selectedObjects[0];

            if (!selectedObject) {
                return FONT_SIZE;
            }

            const value = (selectedObject as any).get("fontSize") || FONT_SIZE;

            return value;
        },
        changeTextAlign: (value: string) => {
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    object.set({ textAlign: value } as any);
                }
            });
            canvas.renderAll();
        },
        getActiveTextAlign: () => {
            const selectedObject = selectedObjects[0];

            if (!selectedObject) {
                return "left";
            }

            const value = (selectedObject as any).get("textAlign") || "left";

            return value;
        },
        changeFontUnderline: (value: boolean) => {
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    object.set({ underline: value } as any);
                }
            });
            canvas.renderAll();
        },
        getActiveFontUnderline: () => {
            const selectedObject = selectedObjects[0];

            if (!selectedObject) {
                return false;
            }

            const value = (selectedObject as any).get("underline") || false;

            return value;
        },
        changeFontLinethrough: (value: boolean) => {
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    object.set({ linethrough: value } as any);
                }
            });
            canvas.renderAll();
        },
        getActiveFontLinethrough: () => {
            const selectedObject = selectedObjects[0];

            if (!selectedObject) {
                return false;
            }

            const value = (selectedObject as any).get("linethrough") || false;

            return value;
        },
        changeFontStyle: (value: string) => {
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    object.set({ fontStyle: value } as any);
                }
            });
            canvas.renderAll();
        },
        getActiveFontStyle: () => {
            const selectedObject = selectedObjects[0];

            if (!selectedObject) {
                return "normal";
            }

            const value = (selectedObject as any).get("fontStyle") || "normal";

            return value;
        },
        changeFontWeight: (value: number) => {
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    object.set({ fontWeight: value } as any);
                }
            });
            canvas.renderAll();
        },
        changeOpacity: (value: number) => {
            canvas.getActiveObjects().forEach((object) => {
                object.set({ opacity: value });
            });
            canvas.renderAll();
        },
        bringForward: () => {
            canvas.getActiveObjects().forEach((object) => {
                canvas.bringObjectForward(object);
            });

            canvas.renderAll();

            const workspace = getWorkspace();
            if (workspace) {
                canvas.sendObjectToBack(workspace);
            }
        },
        sendBackwards: () => {
            canvas.getActiveObjects().forEach((object) => {
                canvas.sendObjectBackwards(object);
            });

            canvas.renderAll();
            const workspace = getWorkspace();
            if (workspace) {
                canvas.sendObjectToBack(workspace);
            }
        },
        changeFontFamily: (value: string) => {
            setFontFamily(value);
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    object.set({ fontFamily: value } as any);
                }
            });
            canvas.renderAll();
        },
        changeFillColor: (value: string) => {
            setFillColor(value);
            canvas.getActiveObjects().forEach((object) => {
                object.set({ fill: value });
            });
            canvas.renderAll();
        },
        changeStrokeColor: (value: string) => {
            setStrokeColor(value);
            canvas.getActiveObjects().forEach((object) => {
                // Text types don't have stroke usually but we can set fill
                if (isTextType(object.type)) {
                    object.set({ fill: value });
                    return;
                }

                object.set({ stroke: value });
            });
            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.color = value;
            }
            canvas.renderAll();
        },
        changeStrokeWidth: (value: number) => {
            setStrokeWidth(value);
            canvas.getActiveObjects().forEach((object) => {
                object.set({ strokeWidth: value });
            });
            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.width = value;
            }
            canvas.renderAll();
        },
        changeStrokeDashArray: (value: number[]) => {
            setStrokeDashArray(value);
            canvas.getActiveObjects().forEach((object) => {
                object.set({ strokeDashArray: value });
            });
            canvas.renderAll();
        },
        addCircle: () => {
            const object = new fabric.Circle({
                ...CIRCLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                strokeDashArray: strokeDashArray,
            });

            addToCanvas(object);
        },
        addSoftRectangle: () => {
            const object = new fabric.Rect({
                ...RECTANGLE_OPTIONS,
                rx: 50,
                ry: 50,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                strokeDashArray: strokeDashArray,
            });

            addToCanvas(object);
        },
        addRectangle: () => {
            const object = new fabric.Rect({
                ...RECTANGLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                strokeDashArray: strokeDashArray,
            });

            addToCanvas(object);
        },
        addTriangle: () => {
            const object = new fabric.Triangle({
                ...TRIANGLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                strokeDashArray: strokeDashArray,
            });

            addToCanvas(object);
        },
        addInverseTriangle: () => {
            const HEIGHT = TRIANGLE_OPTIONS.height;
            const WIDTH = TRIANGLE_OPTIONS.width;

            const object = new fabric.Polygon(
                [
                    { x: 0, y: 0 },
                    { x: WIDTH, y: 0 },
                    { x: WIDTH / 2, y: HEIGHT },
                ],
                {
                    ...TRIANGLE_OPTIONS,
                    fill: fillColor,
                    stroke: strokeColor,
                    strokeWidth: strokeWidth,
                    strokeDashArray: strokeDashArray,
                }
            );

            addToCanvas(object);
        },
        addDiamond: () => {
            const HEIGHT = DIAMOND_OPTIONS.height;
            const WIDTH = DIAMOND_OPTIONS.width;

            const object = new fabric.Polygon(
                [
                    { x: WIDTH / 2, y: 0 },
                    { x: WIDTH, y: HEIGHT / 2 },
                    { x: WIDTH / 2, y: HEIGHT },
                    { x: 0, y: HEIGHT / 2 },
                ],
                {
                    ...DIAMOND_OPTIONS,
                    fill: fillColor,
                    stroke: strokeColor,
                    strokeWidth: strokeWidth,
                    strokeDashArray: strokeDashArray,
                }
            );
            addToCanvas(object);
        },
        canvas,
        getActiveFontWeight: () => {
            const selectedObject = selectedObjects[0];

            if (!selectedObject) {
                return FONT_WEIGHT;
            }

            const value = (selectedObject as any).get("fontWeight") || FONT_WEIGHT;

            return value;
        },
        getActiveFontFamily: () => {
            const selectedObject = selectedObjects[0];

            if (!selectedObject) {
                return fontFamily;
            }

            const value = (selectedObject as any).get("fontFamily") || fontFamily;

            return value;
        },
        getActiveFillColor: () => {
            const selectedObject = selectedObjects[0];

            if (!selectedObject) {
                return fillColor;
            }

            const value = selectedObject.get("fill") || fillColor;

            return value as string;
        },
        getActiveStrokeColor: () => {
            const selectedObject = selectedObjects[0];

            if (!selectedObject) {
                return strokeColor;
            }

            const value = selectedObject.get("stroke") || strokeColor;

            return value as string;
        },
        getActiveStrokeWidth: () => {
            const selectedObject = selectedObjects[0];

            if (!selectedObject) {
                return strokeWidth;
            }

            const value = selectedObject.get("strokeWidth") || strokeWidth;

            return value;
        },
        getActiveStrokeDashArray: () => {
            const selectedObject = selectedObjects[0];

            if (!selectedObject) {
                return strokeDashArray;
            }

            const value = selectedObject.get("strokeDashArray") || strokeDashArray;

            return value;
        },
        selectedObjects,
    };
};

export const useEditor = ({
    defaultState,
    defaultHeight,
    defaultWidth,
    clearSelectionCallback,
    saveCallback,
}: EditorHookProps) => {
    const initialState = useRef(defaultState);
    const initialWidth = useRef(defaultWidth);
    const initialHeight = useRef(defaultHeight);

    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const [selectedObjects, setSelectedObjects] = useState<fabric.FabricObject[]>([]);

    const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
    const [fillColor, setFillColor] = useState(FILL_COLOR);
    const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
    const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
    const [strokeDashArray, setStrokeDashArray] = useState<number[]>(STROKE_DASH_ARRAY);

    useWindowEvents();

    const {
        save,
        canRedo,
        canUndo,
        undo,
        redo,
        canvasHistory,
        setHistoryIndex,
    } = useHistory({
        canvas,
        saveCallback
    });

    const { copy, paste } = useClipboard({ canvas });

    const { autoZoom } = useAutoResize({
        canvas,
        container,
    });

    useCanvasEvents({
        save,
        canvas,
        setSelectedObjects,
        clearSelectionCallback,
    });

    useHotkeys({
        undo,
        redo,
        copy,
        paste,
        save,
        canvas,
    });

    useLoadState({
        canvas,
        autoZoom,
        initialState,
        canvasHistory,
        setHistoryIndex,
    });

    const editor = useMemo(() => {
        if (canvas) {
            return buildEditor({
                save,
                undo,
                redo,
                canUndo,
                canRedo,
                autoZoom,
                copy,
                paste,
                canvas,
                fillColor,
                strokeWidth,
                strokeColor,
                setFillColor,
                setStrokeColor,
                setStrokeWidth,
                strokeDashArray,
                selectedObjects,
                setStrokeDashArray,
                fontFamily,
                setFontFamily,
            });
        }

        return undefined;
    },
        [
            canRedo,
            canUndo,
            undo,
            redo,
            save,
            autoZoom,
            copy,
            paste,
            canvas,
            fillColor,
            strokeWidth,
            strokeColor,
            selectedObjects,
            strokeDashArray,
            fontFamily,
        ]);

    const init = useCallback(
        ({
            initialCanvas,
            initialContainer,
        }: {
            initialCanvas: fabric.Canvas;
            initialContainer: HTMLDivElement;
        }) => {
            fabric.FabricObject.ownDefaults = {
                ...fabric.FabricObject.ownDefaults,
                cornerColor: "#FFF",
                cornerStyle: "circle",
                borderColor: "#3b82f6",
                borderScaleFactor: 1.5,
                transparentCorners: false,
                borderOpacityWhenMoving: 1,
                cornerStrokeColor: "#3b82f6",
            };

            const initialWorkspace = new fabric.Rect({
                width: initialWidth.current,
                height: initialHeight.current,
                name: "clip",
                fill: "white",
                selectable: false,
                hasControls: false,
                shadow: new fabric.Shadow({
                    color: "rgba(0,0,0,0.8)",
                    blur: 5,
                }),
            });

            initialCanvas.setDimensions({
                width: initialContainer.offsetWidth,
                height: initialContainer.offsetHeight
            });

            initialCanvas.add(initialWorkspace);
            initialCanvas.centerObject(initialWorkspace);
            initialCanvas.clipPath = initialWorkspace;

            setCanvas(initialCanvas);
            setContainer(initialContainer);

            const currentState = JSON.stringify(
                (initialCanvas as any).toJSON(JSON_KEYS)
            );
            canvasHistory.current = [currentState];
            setHistoryIndex(0);
        },
        [
            canvasHistory,
            setHistoryIndex,
        ]
    );

    return { init, editor };
};
