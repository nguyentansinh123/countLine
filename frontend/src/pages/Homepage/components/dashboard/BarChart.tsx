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
    Legal: '#4c7aff',
    IP: '#ff7a4c',
    Executive: '#7aff4c',
  };

  const defaultColor = '#4c4cc8';

  const chartData = Object.entries(data).map(([name, count]) => {
    let displayName = name;
    if (name.toLowerCase().includes('legal')) displayName = 'Legal';
    if (
      name.toLowerCase().includes('i.p') ||
      name.toLowerCase().includes('ip agreement')
    )
      displayName = 'IP';
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
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#444"
          strokeOpacity={0.3}
        />
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
            backgroundColor: 'rgba(5, 5, 40, 0.9)',
            border: '1px solid rgba(100, 100, 255, 0.3)',
            color: 'white', // This sets the default text color
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            padding: '10px 12px',
          }}
          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          formatter={(value) => [
            <span style={{ color: 'white', fontWeight: 'normal' }}>
              {value} documents
            </span>,
            '',
          ]}
          labelStyle={{
            color: 'white',
            borderRadius: '4px',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          }}
          itemStyle={{ color: 'white' }}
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
