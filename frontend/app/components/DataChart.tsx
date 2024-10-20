'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataChartProps {
  data: any[];
  xKey: string;
  bars: { dataKey: string; fill: string }[];
  title: string;
}

const DataChart: React.FC<DataChartProps> = ({ data, xKey, bars, title }) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {bars.map((bar, index) => (
            <Bar key={index} dataKey={bar.dataKey} fill={bar.fill} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataChart;