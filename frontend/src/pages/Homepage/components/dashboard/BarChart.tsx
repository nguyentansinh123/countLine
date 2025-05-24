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
import { Empty } from 'antd';

interface DocumentChartProps {
  data: DocumentTypeCounts | null;
}

const DocumentBarChart: React.FC<DocumentChartProps> = ({ data }) => {
  const transformedData = data
    ? [
        { name: 'NDA', count: data.NDA || 0, color: '#4CAF50' },
        { name: 'Legal', count: data['Legal Document'] || 0, color: '#F44336' },
        { name: 'IP', count: data['I.P Agreement'] || 0, color: '#2196F3' },
        { name: 'Executive', count: data['Executive Document'] || 0, color: '#FF9800' },
      ]
    : [];

  const filteredData = transformedData.filter(item => item.count > 0);
  
  const hasData = filteredData.length > 0;

  const displayData = filteredData;

  console.log("Original data from API:", data);
  console.log("Filtered data for chart:", filteredData);

  if (!hasData) {
    return (
      <div
        style={{
          height: 220,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
        }}
      >
        <Empty
          description={
            <span style={{ color: '#aaa' }}>No document data available</span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={displayData}
        margin={{
          top: 20,
          right: 30,
          left: 0,
          bottom: 5,
        }}
        barGap={3}
        barCategoryGap={20}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#444"
          vertical={false}
          opacity={0.3}
        />
        <XAxis
          dataKey="name"
          axisLine={{ stroke: '#666' }}
          tick={{ fill: '#ccc', fontSize: 12 }}
        />
        <YAxis
          axisLine={{ stroke: '#666' }}
          tick={{ fill: '#ccc', fontSize: 12 }}
          domain={[0, 'auto']}
        />
        <Tooltip
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
            <span style={{ color: 'white', fontWeight: 'normal' }}>{value} documents</span>,
            ''
          ]}
          labelStyle={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: '15px',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '5px',
            marginBottom: '5px',
          }}
          itemStyle={{ color: 'white' }} 
        />
        <Bar
          dataKey="count"
          name="" 
          radius={[4, 4, 0, 0]}
          animationDuration={1500}
          animationBegin={300}
          minPointSize={3}
        >
          {displayData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DocumentBarChart;
