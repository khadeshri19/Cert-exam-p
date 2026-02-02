import React, { useState } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Trash2, Plus } from 'lucide-react';

interface TextPanelProps {
    onAddText: (options: any) => void;
    selectedObject: any;
    onUpdateText: (property: string, value: any) => void;
    onDelete: () => void;
}

const FONT_FAMILIES = [
    'Inter',
    'Arial',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Trebuchet MS',
    'Impact',
    'Comic Sans MS',
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96];

const TextPanel: React.FC<TextPanelProps> = ({
    onAddText,
    selectedObject,
    onUpdateText,
    onDelete,
}) => {
    const [newText, setNewText] = useState('');
    const [fontFamily, setFontFamily] = useState('Inter');
    const [fontSize, setFontSize] = useState(24);
    const [fontColor, setFontColor] = useState('#000000');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [textAlign, setTextAlign] = useState('left');

    const isTextObject = selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text');

    const handleAddText = () => {
        onAddText({
            text: newText || 'New Text',
            fontFamily,
            fontSize,
            fill: fontColor,
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            underline: isUnderline,
            textAlign,
        });
        setNewText('');
    };

    const toggleBold = () => {
        setIsBold(!isBold);
        if (isTextObject) {
            onUpdateText('fontWeight', !isBold ? 'bold' : 'normal');
        }
    };

    const toggleItalic = () => {
        setIsItalic(!isItalic);
        if (isTextObject) {
            onUpdateText('fontStyle', !isItalic ? 'italic' : 'normal');
        }
    };

    const toggleUnderline = () => {
        setIsUnderline(!isUnderline);
        if (isTextObject) {
            onUpdateText('underline', !isUnderline);
        }
    };

    const handleAlignChange = (align: string) => {
        setTextAlign(align);
        if (isTextObject) {
            onUpdateText('textAlign', align);
        }
    };

    const handleFontFamilyChange = (family: string) => {
        setFontFamily(family);
        if (isTextObject) {
            onUpdateText('fontFamily', family);
        }
    };

    const handleFontSizeChange = (size: number) => {
        setFontSize(size);
        if (isTextObject) {
            onUpdateText('fontSize', size);
        }
    };

    const handleColorChange = (color: string) => {
        setFontColor(color);
        if (isTextObject) {
            onUpdateText('fill', color);
        }
    };

    return (
        <div className="text-panel">
            {/* Add New Text */}
            <div className="panel-section">
                <h4 className="panel-section-title">Add Text</h4>
                <div className="panel-row">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Enter text..."
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAddText}>
                    <Plus size={16} />
                    Add Text
                </button>
            </div>

            {/* Font Family */}
            <div className="panel-section">
                <h4 className="panel-section-title">Font Family</h4>
                <select
                    className="form-input form-select"
                    value={fontFamily}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                >
                    {FONT_FAMILIES.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                        </option>
                    ))}
                </select>
            </div>

            {/* Font Size */}
            <div className="panel-section">
                <h4 className="panel-section-title">Font Size</h4>
                <select
                    className="form-input form-select"
                    value={fontSize}
                    onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                >
                    {FONT_SIZES.map((size) => (
                        <option key={size} value={size}>
                            {size}px
                        </option>
                    ))}
                </select>
            </div>

            {/* Font Color */}
            <div className="panel-section">
                <h4 className="panel-section-title">Font Color</h4>
                <div className="color-input-wrapper">
                    <input
                        type="color"
                        className="color-input"
                        value={fontColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                    />
                    <span className="color-value">{fontColor}</span>
                </div>
            </div>

            {/* Font Style */}
            <div className="panel-section">
                <h4 className="panel-section-title">Style</h4>
                <div className="font-controls">
                    <button
                        className={`font-control-btn ${isBold ? 'active' : ''}`}
                        onClick={toggleBold}
                        title="Bold"
                    >
                        <Bold size={18} />
                    </button>
                    <button
                        className={`font-control-btn ${isItalic ? 'active' : ''}`}
                        onClick={toggleItalic}
                        title="Italic"
                    >
                        <Italic size={18} />
                    </button>
                    <button
                        className={`font-control-btn ${isUnderline ? 'active' : ''}`}
                        onClick={toggleUnderline}
                        title="Underline"
                    >
                        <Underline size={18} />
                    </button>
                </div>
            </div>

            {/* Text Alignment */}
            <div className="panel-section">
                <h4 className="panel-section-title">Alignment</h4>
                <div className="font-controls">
                    <button
                        className={`font-control-btn ${textAlign === 'left' ? 'active' : ''}`}
                        onClick={() => handleAlignChange('left')}
                        title="Align Left"
                    >
                        <AlignLeft size={18} />
                    </button>
                    <button
                        className={`font-control-btn ${textAlign === 'center' ? 'active' : ''}`}
                        onClick={() => handleAlignChange('center')}
                        title="Align Center"
                    >
                        <AlignCenter size={18} />
                    </button>
                    <button
                        className={`font-control-btn ${textAlign === 'right' ? 'active' : ''}`}
                        onClick={() => handleAlignChange('right')}
                        title="Align Right"
                    >
                        <AlignRight size={18} />
                    </button>
                </div>
            </div>

            {/* Delete Selected */}
            {selectedObject && (
                <div className="panel-section">
                    <button className="btn btn-danger" style={{ width: '100%' }} onClick={onDelete}>
                        <Trash2 size={16} />
                        Delete Selected
                    </button>
                </div>
            )}
        </div>
    );
};

export default TextPanel;
