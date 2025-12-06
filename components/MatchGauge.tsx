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

  return (
    <div className="flex flex-col items-center justify-center">
      <div style={{ width: size, height: size / 2 + 20 }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={size / 2 - 15}
              outerRadius={size / 2}
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
              y="90%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-bold fill-[#1D3557]"
              style={{ fontSize: size / 4 }}
            >
              {score}%
            </text>
            <text
              x="50%"
              y="100%"
              dy={5}
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