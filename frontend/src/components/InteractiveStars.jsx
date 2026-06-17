import React, { useState } from 'react';
import { Star } from 'lucide-react';

const InteractiveStars = ({ rating = 0, onChange = null, size = 20, readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    if (readonly) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const handleClick = (index) => {
    if (readonly || !onChange) return;
    onChange(index);
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = readonly
          ? index <= rating
          : (hoverRating > 0 ? index <= hoverRating : index <= rating);

        return (
          <span
            key={index}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            style={{
              cursor: readonly ? 'default' : 'pointer',
              display: 'inline-flex',
              transition: 'transform 0.15s ease-in-out',
              transform: !readonly && index === hoverRating ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <Star
              size={size}
              style={{
                fill: isFilled ? 'var(--warning)' : 'transparent',
                stroke: isFilled ? 'var(--warning)' : 'var(--text-muted)',
                transition: 'fill 0.2s, stroke 0.2s',
                filter: isFilled ? 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.45))' : 'none'
              }}
            />
          </span>
        );
      })}
    </div>
  );
};

export default InteractiveStars;
