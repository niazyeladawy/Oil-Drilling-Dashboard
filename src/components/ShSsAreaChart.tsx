'use client';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { Well, WellDataRow } from '../types/well';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

interface ShSsAreaChartProps {
  well?: Well | null;
}

export default function ShSsAreaChart({ well }: ShSsAreaChartProps) {
  const data = well?.data || [];

  if (!well) {
    return <p className="text-gray-500">No well selected.</p>;
  }

  if (!data.length) {
    return <p className="text-gray-500">No data available for {well.name}.</p>;
  }

  const chartKeys = ['%SH', '%SS']; // Only plot these in the chart
  const keyColors: Record<string, string> = {
    '%SH': '#fc99af',
    '%SS': '#7bc5f4',
    '%LS': '#fcd566',
    '%DOL': '#56c7c8',
    '%ANH': '#a274f6',
    '%Coal': '#fda94f',
    '%Salt': '#cfd2d4',
  };

  // Exclude DEPTH, DT, and GR from legend
  const legendKeys = Array.from(
    new Set(
      data.flatMap((d) =>
        Object.keys(d).filter((k) => !['DEPTH', 'DT', 'GR'].includes(k))
      )
    )
  );

  interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  payload?: {
    payload: WellDataRow;
  }[];
}

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null;
    const dataPoint = payload[0].payload;

    return (
      <div className="bg-white p-2 border rounded shadow-md text-sm">
        <div><strong>DEPTH:</strong> {dataPoint.DEPTH}</div>
        {Object.entries(dataPoint).map(([key, value]) => {
          if (key === 'DEPTH') return null;
          return (
            <div key={key}>
              <strong>{key.replace('%', '')}:</strong> {value}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-2">Rock Compansation</h2>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-2">
        {legendKeys.map((key) => (
          <div key={key} className="flex items-center gap-1">
            <div
              className="w-9 h-3"
              style={{ backgroundColor: keyColors[key] || '#888' }}
            />
            <span className="text-sm">{key.replace('%', '')}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            layout="vertical"
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
          >
            <XAxis
              type="number"
              label={{ value: '%', position: 'insideBottom', offset: -10 }}
            />
            <YAxis type="category" dataKey="DEPTH" reversed />
            <Tooltip content={<CustomTooltip />} />
            {chartKeys.map((key) =>
              data.some((d) => d[key] !== undefined) ? (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={keyColors[key]}
                  fill={keyColors[key]}
                />
              ) : null
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
