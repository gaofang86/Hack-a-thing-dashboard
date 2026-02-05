import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Bottleneck } from '../types';

interface EfficiencyChartsProps {
  bottlenecks: Bottleneck[];
}

export const EfficiencyCharts: React.FC<EfficiencyChartsProps> = ({ bottlenecks }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <h3 className="text-sm font-semibold mb-4 text-slate-300 flex items-center">
          <span className="w-2 h-2 bg-sky-500 rounded-full mr-2"></span>
          Bottleneck Intensity by Zone
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bottlenecks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="zoneName" 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: '12px' }}
                cursor={{ fill: '#334155' }}
              />
              <Bar dataKey="density" radius={[4, 4, 0, 0]}>
                {bottlenecks.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.density > 0.7 ? '#ef4444' : '#38bdf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <h3 className="text-sm font-semibold mb-4 text-slate-300 flex items-center">
          <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
          Average Dwell Time (Mins)
        </h3>
        <div className="space-y-3">
          {bottlenecks.map(b => (
            <div key={b.zoneName} className="flex flex-col">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-medium uppercase">
                <span>{b.zoneName}</span>
                <span>{b.avgDwellTime.toFixed(1)}m</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-400 transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (b.avgDwellTime / 15) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
