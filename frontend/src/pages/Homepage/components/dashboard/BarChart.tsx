import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DocumentTypeCounts } from '../../../../types';

interface DocumentBarChartProps {
  data: DocumentTypeCounts | null;
}

const DocumentBarChart: React.FC<DocumentBarChartProps> = ({ data }) => {
  if (!data) return null;

  const colorMap: Record<string, string> = {
    'Legal': '#4c7aff',
    'IP': '#ff7a4c',
    'Executive': '#7aff4c',
  };

  const defaultColor = '#4c4cc8';

  const chartData = Object.entries(data).map(([name, count]) => {
    let displayName = name;
    if (name.toLowerCase().includes('legal')) displayName = 'Legal';
    if (name.toLowerCase().includes('i.p') || name.toLowerCase().includes('ip agreement')) displayName = 'IP';
    if (name.toLowerCase().includes('executive')) displayName = 'Executive';
    
    return {
      originalName: name,
      name: displayName,
      count: count as number,
      color: colorMap[displayName] || defaultColor,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 20,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.3} />
        <XAxis
          dataKey="name"
          tick={{ fill: 'white' }}
          axisLine={{ stroke: 'white', strokeOpacity: 0.5 }}
          height={50}
          tickMargin={8}
          interval={0}
          textAnchor="middle"
        />
        <YAxis
          tick={{ fill: 'white' }}
          axisLine={{ stroke: 'white', strokeOpacity: 0.5 }}
        />
        <Tooltip
          cursor={false}
          contentStyle={{
            backgroundColor: 'rgba(30, 30, 60, 0.8)',
            border: '1px solid #4c4cc8',
            color: 'white',
            borderRadius: '4px',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
          }}
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              return payload[0].payload.originalName;
            }
            return label;
          }}
          labelStyle={{ fontWeight: 'bold', color: 'white' }}
          itemStyle={{ color: 'white' }}
          formatter={(value, name) => [value, name]}
          wrapperStyle={{ outline: 'none' }}
          isAnimationActive={false}
        />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
          name="Document Count"
          animationDuration={1200}
          animationEasing="ease-in-out"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DocumentBarChart;
