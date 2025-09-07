'use client';
import type { Well } from '../types/well';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface VerticalLineChartProps {
  well?: Well | null;
  dataKey: string;        // e.g., "DT" or "GR"
  lineColor: string;      // e.g., "#fc99af" or "#82ca9d"
  title: string;          // Chart title
}

interface WellDataPoint {
  DEPTH: number;
  [key: string]: number | undefined; // other keys like DT, GR
}
export default function VerticalLineChart({ well, dataKey, lineColor, title }: VerticalLineChartProps) {
const data: WellDataPoint[] = well?.data || [];

  if (!well) {
    return <p className="text-gray-500">No well selected.</p>;
  }

  if (!data.length) {
    return <p className="text-gray-500">No data available for {well.name}.</p>;
  }

  if (!data.some(d => d[dataKey] !== undefined)) {
    return <p className="text-gray-500">No data for {dataKey} in {well.name}.</p>;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {/* Custom Legend */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-3" style={{ backgroundColor: lineColor }} />
        <span className="text-sm">{dataKey}</span>
      </div>

      <div className='h-[600px] mt-auto'>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            layout="vertical"
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
          >
            <CartesianGrid horizontal={false} vertical={true} stroke="#ccc" strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: dataKey, position: 'insideBottom', offset: -10 }} />
            <YAxis type="category" dataKey="DEPTH" reversed tick={false} axisLine={false} width={0} />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke={lineColor} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
