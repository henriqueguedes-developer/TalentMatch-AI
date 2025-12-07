import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface MatchGaugeProps {
  score: number;
  label?: string;
  size?: number;
}

const MatchGauge: React.FC<MatchGaugeProps> = ({ score, label = "Match", size = 200 }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const getColor = (val: number) => {
    if (val >= 80) return '#10b981'; // Green-500
    if (val >= 60) return '#f59e0b'; // Amber-500
    return '#ef4444'; // Red-500
  };

  const activeColor = getColor(score);
  const remainingColor = '#E5E7EB'; // Geek Gray Border

  // Geometry calculations
  const radius = size / 2;
  const strokeWidth = 15;
  // Chart center Y position (leaving space for top stroke)
  const cy = radius + 10; 
  // Total container height: Radius + Top Padding + Bottom Space for Text
  const containerHeight = radius + 60; 

  return (
    <div className="flex flex-col items-center justify-center">
      <div style={{ width: size, height: containerHeight }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy={cy}
              startAngle={180}
              endAngle={0}
              innerRadius={radius - strokeWidth}
              outerRadius={radius}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              cornerRadius={5}
            >
              <Cell key="score" fill={activeColor} />
              <Cell key="bg" fill={remainingColor} />
            </Pie>
            <text
              x="50%"
              y={cy - 15} // Positioned inside the arc
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-bold fill-[#1D3557]"
              style={{ fontSize: size / 3.5 }}
            >
              {score}%
            </text>
            <text
              x="50%"
              y={cy + 30} // Positioned safely below the arc
              textAnchor="middle"
              className="text-xs font-semibold uppercase tracking-wider fill-gray-400"
            >
              {label}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MatchGauge;