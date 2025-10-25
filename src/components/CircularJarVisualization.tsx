interface CircularJarVisualizationProps {
  progress: number;
  jarId: number;
  isLarge?: boolean;
  imageUrl?: string;
}

const CircularJarVisualization = ({ 
  progress, 
  jarId, 
  isLarge = false,
  imageUrl 
}: CircularJarVisualizationProps) => {
  const size = isLarge ? 400 : 280;
  const strokeWidth = isLarge ? 20 : 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate progress for each segment (0-25%, 25-50%, 50-75%, 75-100%)
  const redProgress = Math.min(progress, 25);
  const orangeProgress = Math.min(Math.max(progress - 25, 0), 25);
  const blueProgress = Math.min(Math.max(progress - 50, 0), 25);
  const greenProgress = Math.min(Math.max(progress - 75, 0), 25);
  
  // Convert to stroke dash values
  const getStrokeDash = (segmentProgress: number) => {
    const segmentLength = (circumference / 4);
    const filledLength = (segmentProgress / 25) * segmentLength;
    return `${filledLength} ${circumference - filledLength}`;
  };
  
  const getStrokeOffset = (startPercent: number) => {
    return circumference - (circumference * startPercent / 100);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="w-full h-full drop-shadow-2xl transform -rotate-90"
        style={{ maxWidth: size, maxHeight: size }}
      >
        <defs>
          <clipPath id={`clip-circle-${jarId}`}>
            <circle cx={size / 2} cy={size / 2} r={radius - strokeWidth / 2 - 8} />
          </clipPath>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(200, 200, 200, 0.2)"
          strokeWidth={strokeWidth}
        />
        
        {/* Image or placeholder inside */}
        {imageUrl ? (
          <g transform={`rotate(90 ${size / 2} ${size / 2})`}>
            <image
              href={imageUrl}
              x={strokeWidth + 8}
              y={strokeWidth + 8}
              width={size - (strokeWidth + 8) * 2}
              height={size - (strokeWidth + 8) * 2}
              clipPath={`url(#clip-circle-${jarId})`}
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        ) : (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2 - 8}
            fill="rgba(255, 255, 255, 0.4)"
          />
        )}
        
        {/* Red segment (0-25%) */}
        {redProgress > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#red-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={getStrokeDash(redProgress)}
            strokeDashoffset={getStrokeOffset(0)}
            strokeLinecap="round"
          />
        )}
        
        {/* Orange segment (25-50%) */}
        {orangeProgress > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#orange-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={getStrokeDash(orangeProgress)}
            strokeDashoffset={getStrokeOffset(25)}
            strokeLinecap="round"
          />
        )}
        
        {/* Blue segment (50-75%) */}
        {blueProgress > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#blue-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={getStrokeDash(blueProgress)}
            strokeDashoffset={getStrokeOffset(50)}
            strokeLinecap="round"
          />
        )}
        
        {/* Green segment (75-100%) */}
        {greenProgress > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#green-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={getStrokeDash(greenProgress)}
            strokeDashoffset={getStrokeOffset(75)}
            strokeLinecap="round"
          />
        )}
        
        {/* Gradients */}
        <defs>
          <linearGradient id="red-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="green-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default CircularJarVisualization;
