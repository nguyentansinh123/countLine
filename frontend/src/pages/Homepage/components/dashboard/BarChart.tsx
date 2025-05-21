// src/components/DocumentBarChart.tsx
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
} from 'recharts';

type Props = {
  data: { [key: string]: any }[]; // each item must include a `name` field and numeric values
};

const colors = ['#01B4D2', '#52C41A', '#FD0000', '#FAAD14', '#722ED1', '#1890FF'];

const DocumentBarChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const keys = Object.keys(data[0]).filter((key) => key !== 'name');

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip contentStyle={{ background: '#222', border: 'none' }} />
          <Legend />
          {keys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              barSize={10}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DocumentBarChart;
