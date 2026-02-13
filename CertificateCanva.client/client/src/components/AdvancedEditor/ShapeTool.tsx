interface ShapeToolProps {
    onClick: () => void;
    icon: any;
};

export const ShapeTool = ({
    onClick,
    icon: Icon,
}: ShapeToolProps) => {
    return (
        <button
            onClick={onClick}
            style={{
                aspectRatio: '1/1',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '20px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
            <Icon style={{ width: '100%', height: '100%', color: '#4b5563' }} />
        </button>
    );
};
