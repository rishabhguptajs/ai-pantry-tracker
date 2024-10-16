import React from 'react';

interface RibbonProps {
  color: string;
  content: {
    text: string;
    position: 'left' | 'right';
  };
}

const Ribbon: React.FC<RibbonProps> = ({ color, content }) => {
  const positionClasses = content.position === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative overflow-hidden w-64 h-24">
      <div
        className={`absolute ${positionClasses} top-4 -my-2 py-1 px-4 transform ${
          content.position === 'left' ? '-rotate-45 -translate-x-6' : 'rotate-45 translate-x-6'
        }`}
      >
        <div
          className={`bg-${color}-500 text-white text-sm font-semibold tracking-wider uppercase py-1 px-6 shadow-lg`}
          style={{
            borderRadius: '6px',
            border: '2px dotted white',
            boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1), inset 0 0 0 2px ${color}`,
          }}
        >
          {content.text}
        </div>
      </div>
    </div>
  );
};

export default Ribbon;