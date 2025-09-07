// /components/WellDetails.tsx
'use client';
import type { Well } from '../types/well';
import ShSsAreaChart from './ShSsAreaChart';
import VerticalLineChart from './VerticalLineChart';

interface WellDetailsProps {
  well: Well | null;
}
export default function WellDetails({ well }: WellDetailsProps) {
  
  return (
    <div className="flex flex-1 gap-4  ">
      {/* Charts */}
<div className="flex-1 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded items-end">
        <ShSsAreaChart well={well} />
        <VerticalLineChart well={well} dataKey="DT" lineColor="#fc99af" title="DT" />
        <VerticalLineChart well={well} dataKey="GR" lineColor="#3aadf2" title="GR" />
        {/* Optional extra charts */}
        {/* <WellLineCharts well={well} /> */}
      </div>

      {/* Chatbot */}
      {/* <div className="w-80 bg-gray-50 p-4 rounded shadow flex flex-col h-[200px] sticky top-0">
        <h3 className="text-lg font-semibold mb-2">Well Chatbot</h3>
        <Chatbot wellData={well?.data} />
      </div> */}
    </div>
  );
}
