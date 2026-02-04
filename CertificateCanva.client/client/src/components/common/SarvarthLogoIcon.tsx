import React from 'react';

interface SarvarthLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const SarvarthLogo: React.FC<SarvarthLogoProps> = ({ size = 'md' }) => {
    const heights = { sm: '24px', md: '32px', lg: '40px' };

    return (
        <img
            src="/Sarvarth-Logo.jpg"
            alt="Sarvarth"
            style={{ height: heights[size] }}
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';

                // Fallback if image fails to load
                const span = document.createElement('span');
                span.style.fontSize = size === 'lg' ? '24px' : '18px';
                span.style.fontWeight = '700';
                span.style.color = '#3d5a5a';
                span.innerHTML = 'sarvarth<span style="color: #ee7158;">⬚</span>';
                target.parentElement?.appendChild(span);
            }}
        />
    );
};

export default SarvarthLogo;
