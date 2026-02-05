import React from 'react';
import { Sun, Cloud, CloudLightning, Thermometer } from 'lucide-react';

interface StatusWeatherProps {
  status: 'SUNNY' | 'CLOUDY' | 'STORMY';
  efficiency: number;
}

const StatusWeather: React.FC<StatusWeatherProps> = ({ status, efficiency }) => {
  const config = {
    SUNNY: {
      icon: Sun,
      color: 'text-emerald-400',
      label: 'NORMAL',
      sub: 'All systems operating normally'
    },
    CLOUDY: {
      icon: Cloud,
      color: 'text-amber-400',
      label: 'ATTENTION REQUIRED',
      sub: 'Efficiency or wellbeing deviation detected'
    },
    STORMY: {
      icon: CloudLightning,
      color: 'text-red-500',
      label: 'CRITICAL',
      sub: 'Immediate safety review required'
    }
  };
  const { icon: Icon, color, label, sub } = config[status];


  return (
    <div className={`${color} p-2 rounded-lg breathe`}
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)'
      }}>
      <div className={`${color} p-2 bg-slate-900/50 rounded-lg animate-pulse`}>
        <Icon size={32} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
          System Status
        </p>

        <h2 className={`text-lg font-black uppercase ${color}`}>
          {label}
        </h2>

        <p className="text-[10px] text-slate-400 leading-tight">
          {sub}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 transition-all" style={{ width: `${efficiency}%` }} />
          </div>
          <span className="text-[10px] mono text-slate-400">{efficiency}% Perf.</span>
        </div>
      </div>
    </div>
  );
};

export default StatusWeather;
