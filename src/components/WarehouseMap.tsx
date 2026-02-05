import React from 'react';
import type { Person, AP, Zone, Asset } from '../types';
import { ZoneType } from '../types';
import { WAREHOUSE_WIDTH, WAREHOUSE_HEIGHT } from '../../../constants';

interface WarehouseMapProps {
  zones: Zone[];
  aps: AP[];
  people: Person[];
  assets: Asset[];
  selectedPersonId: string | null;
  onSelectPerson: (id: string | null) => void;
}

export const WarehouseMap: React.FC<WarehouseMapProps> = ({
  zones,
  aps,
  people,
  assets,
  selectedPersonId,
  onSelectPerson
}) => {
  return (
    <div
      className="relative w-full rounded-[2.5rem] overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #020617 0%, #020617 60%, #020617)',
        boxShadow: '0 40px 120px rgba(0,0,0,0.55)',
        border: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      {/* HEADER */}
      <div className="absolute top-6 left-8 z-20 pointer-events-none">
        <div className="
    flex items-center gap-4 
    bg-slate-900/50 backdrop-blur-md 
    px-5 py-2.5 rounded-2xl 
    border border-white/10 
    shadow-[0_8px_32px_rgba(0,0,0,0.3)]
  ">
          <div className="flex flex-col gap-1">
            <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse shadow-[0_0_8px_#38bdf8]" />
            <div className="w-1.5 h-1.5 bg-sky-400/30 rounded-full" />
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WAREHOUSE_WIDTH} ${WAREHOUSE_HEIGHT}`}
        className="w-full h-auto"
        onClick={() => onSelectPerson(null)}
      >
        {/* Render Zones */}
        {zones.map(zone => (
          <g key={zone.id}>
            <polygon
              points={zone.points.map(p => `${p.x},${p.y}`).join(' ')}
              fill={zone.color}
              stroke={zone.type === ZoneType.WORK ? '#f97316' : '#22c55e'}
              strokeWidth="1"
              opacity="0.6"
            />
            <text
              x={zone.points[0].x + 15}
              y={zone.points[0].y + 25}
              className="text-[12px] fill-slate-500 font-black uppercase tracking-widest italic select-none"
            >
              {zone.name}
            </text>
          </g>
        ))}

        {/* Render People */}
        {people.map(person => {
          const isSelected = selectedPersonId === person.id;
          return (
            <g
              key={person.id}
              className="cursor-pointer transition-all duration-500"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPerson(person.id);
              }}
            >
              {/* Density Indicator Glow */}
              <circle
                cx={person.position.x}
                cy={person.position.y}
                r="60"
                fill={person.safetyViolation ? "rgba(239, 68, 68, 0.1)" : "rgba(56, 189, 248, 0.05)"}
              />

              {/* Person Marker */}
              <circle
                cx={person.position.x}
                cy={person.position.y}
                r={isSelected ? "12" : "8"}
                fill={isSelected ? '#38bdf8' : (person.wellbeing.isolationAlert ? '#ec4899' : '#fff')}
                stroke={person.safetyViolation ? '#ef4444' : '#1e293b'}
                strokeWidth="2"
                className="transition-all"
              />

              {isSelected && (
                <circle
                  cx={person.position.x}
                  cy={person.position.y}
                  r="18"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  className="animate-pulse"
                />
              )}

              <text
                x={person.position.x}
                y={person.position.y - 18}
                textAnchor="middle"
                className={`text-[10px] font-black uppercase pointer-events-none ${isSelected ? 'fill-white' : 'fill-slate-400'}`}
              >
                {person.name}
              </text>
            </g>
          );
        })}
        {/* Render Assets */}
        {assets.map(asset => (
          <g key={asset.id}>
            {/* Warning Zone（外圈） */}
            <circle
              cx={asset.position.x}
              cy={asset.position.y}
              r={asset.warningRadius}
              fill="rgba(234,179,8,0.12)"
              stroke="rgba(234,179,8,0.4)"
              strokeDasharray="4 4"
            />

            {/* Danger Zone（内圈） */}
            <circle
              cx={asset.position.x}
              cy={asset.position.y}
              r={asset.dangerRadius}
              fill="rgba(239,68,68,0.18)"
              stroke="rgba(239,68,68,0.6)"
            />

            {/* asset body */}
            <circle
              cx={asset.position.x}
              cy={asset.position.y}
              r={8}
              fill="#f97316"
              stroke="white"
              strokeWidth={2}
            />

            <text
              x={asset.position.x}
              y={asset.position.y - 14}
              textAnchor="middle"
              className="text-[9px] fill-orange-400 font-black"
            >
              {asset.type}
            </text>
          </g>
        ))}

        {/* Access Points */}
        {aps.map(ap => (
          <g key={ap.id}>
            <circle
              cx={ap.position.x}
              cy={ap.position.y}
              r="4"
              fill="#475569"
            />
            <circle
              cx={ap.position.x}
              cy={ap.position.y}
              r="12"
              fill="none"
              stroke="#475569"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
