import { computeEfficiency } from './rules/efficiency.ts';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    ShieldCheck, AlertTriangle, Navigation, User as UserIcon,
    Cpu, Clock, TrendingUp, Map as MapIcon, ChevronRight,
    Zap, Coffee, Timer, BrainCircuit, Heart, Users, Minimize2
} from 'lucide-react';
import type { Person, Zone, Bottleneck, WellbeingStats, Asset } from './types.ts';
import { ZoneType } from './types.ts';
import { ACCESS_POINTS, ZONES, WAREHOUSE_WIDTH, WAREHOUSE_HEIGHT } from '../../constants.ts';
import { WarehouseMap } from './components/WarehouseMap.tsx';
import StatusWeather from './components/StatusWeather.tsx';
import { isPointInZone, calculateDistance, formatTime } from './utils.ts';

const INITIAL_ASSETS: Asset[] = [
    {
        id: 'a1',
        type: 'FORKLIFT',
        position: { x: 350, y: 280 },
        velocity: { vx: 1.2, vy: 0.8 },
        warningRadius: 120,
        dangerRadius: 60,
    }
];


const INITIAL_PEOPLE: Person[] = [
    {
        id: 'p1', name: 'Tech_John', position: { x: 200, y: 200 }, zoneId: 'zone-a',
        lastSeen: Date.now(), dwellTime: 0, totalWorkTime: 4000, totalRestTime: 300,
        safetyStatus: 'SAFE', safetyViolation: false, isAuthenticated: true, role: 'Worker',
        wellbeing: { aloneTime: 0, edgeZonePercentage: 15, isolationAlert: false, stabilityScore: 92 }
    },
    {
        id: 'p2', name: 'Visitor_04', position: { x: 600, y: 150 }, zoneId: 'zone-b',
        lastSeen: Date.now(), dwellTime: 0, totalWorkTime: 0, totalRestTime: 120,
        safetyStatus: 'SAFE', safetyViolation: false, isAuthenticated: false, role: 'Visitor',
        wellbeing: { aloneTime: 4500, edgeZonePercentage: 80, isolationAlert: false, stabilityScore: 45 }
    },
    {
        id: 'p3', name: 'Sup_Sarah', position: { x: 500, y: 450 }, zoneId: 'zone-c',
        lastSeen: Date.now(), dwellTime: 0, totalWorkTime: 8000, totalRestTime: 500,
        safetyStatus: 'SAFE', safetyViolation: false, isAuthenticated: true, role: 'Supervisor',
        wellbeing: { aloneTime: 0, edgeZonePercentage: 10, isolationAlert: false, stabilityScore: 80 }
    },
    {
        id: 'p4', name: 'Worker_02', position: { x: 880, y: 520 },
        zoneId: 'zone-c',
        lastSeen: Date.now(),
        dwellTime: 0,
        totalWorkTime: 6000,
        totalRestTime: 200,
        safetyStatus: 'SAFE',
        safetyViolation: false,
        isAuthenticated: true,
        role: 'Worker',
        wellbeing: {
            aloneTime: 420,
            edgeZonePercentage: 85,
            isolationAlert: true,    // triggered
            stabilityScore: 55
        },
    }, {
        id: 'p5', name: 'Worker_02', position: { x: 400, y: 450 }, zoneId: 'zone-c',
        lastSeen: Date.now(), dwellTime: 0, totalWorkTime: 8000, totalRestTime: 500,
        safetyStatus: 'SAFE', safetyViolation: false, isAuthenticated: true, role: 'Worker',
        wellbeing: { aloneTime: 0, edgeZonePercentage: 10, isolationAlert: false, stabilityScore: 88 }
    },
];


const App: React.FC = () => {
    const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
    const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
    const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const assetsRef = useRef<Asset[]>(assets);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            setAssets(prev =>
                prev.map(a =>
                    a.id !== 'a1'
                        ? a
                        : {
                            ...a,
                            position: {
                                x: a.position.x + (e.key === 'ArrowRight' ? 10 : e.key === 'ArrowLeft' ? -10 : 0),
                                y: a.position.y + (e.key === 'ArrowDown' ? 10 : e.key === 'ArrowUp' ? -10 : 0),
                            }
                        }
                )
            );
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    useEffect(() => {
        assetsRef.current = assets;
        const interval = setInterval(() => {
            setAssets(prev =>
                prev.map(a => {
                    let nx = a.position.x + a.velocity.vx;
                    let ny = a.position.y + a.velocity.vy;
                    let vx = a.velocity.vx;
                    let vy = a.velocity.vy;

                    if (nx < 20 || nx > WAREHOUSE_WIDTH - 20) vx *= -1;
                    if (ny < 20 || ny > WAREHOUSE_HEIGHT - 20) vy *= -1;

                    return {
                        ...a,
                        position: { x: nx, y: ny },
                        velocity: { vx, vy },
                    };
                })
            );
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setPeople(prevPeople =>
                prevPeople.map(p => {
                    const nextX = Math.max(
                        20,
                        Math.min(WAREHOUSE_WIDTH - 20, p.position.x + (Math.random() - 0.5) * 20)
                    );
                    const nextY = Math.max(
                        20,
                        Math.min(WAREHOUSE_HEIGHT - 20, p.position.y + (Math.random() - 0.5) * 20)
                    );

                    const nextPos = { x: nextX, y: nextY };
                    const currentZone = ZONES.find(z => isPointInZone(nextPos, z));

                    // hazard
                    let safetyStatus: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';

                    for (const a of assetsRef.current) {
                        const d = calculateDistance(nextPos, a.position);

                        if (d <= a.dangerRadius) {
                            safetyStatus = 'DANGER';
                            break; // 最高优先级
                        } else if (d <= a.warningRadius) {
                            safetyStatus = 'WARNING';
                        }
                    }
                    //WORK zone
                    const accessWarning =
                        currentZone?.type === ZoneType.WORK && !p.isAuthenticated
                    const safetyViolation =
                        safetyStatus !== 'SAFE' || accessWarning;
                    // wellbeing
                    const nearbyCount = prevPeople.filter(
                        o => o.id !== p.id && calculateDistance(nextPos, o.position) < 100
                    ).length;

                    const isAlone = nearbyCount === 0;
                    const newAloneTime = p.wellbeing.aloneTime + (isAlone ? 1 : 0);
                    const isolationAlert = newAloneTime > 300;

                    const isWork = currentZone?.type === ZoneType.WORK;
                    const isRest = currentZone?.type === ZoneType.REST;

                    return {
                        ...p,
                        position: nextPos,
                        zoneId: currentZone?.id ?? p.zoneId,
                        safetyStatus,
                        safetyViolation,
                        lastSeen: Date.now(),
                        dwellTime: currentZone?.id !== p.zoneId ? 0 : p.dwellTime + 1,
                        totalWorkTime: p.totalWorkTime + (isWork ? 1 : 0),
                        totalRestTime: p.totalRestTime + (isRest ? 1 : 0),
                        wellbeing: {
                            ...p.wellbeing,
                            aloneTime: newAloneTime,
                            isolationAlert,
                            stabilityScore: Math.max(
                                30,
                                p.wellbeing.stabilityScore + (Math.random() - 0.5) * 2
                            ),
                        },
                    };
                })
            );
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const enrichedPeople = useMemo(() => {
        return people.map(p => ({
            ...p,
            efficiency: computeEfficiency(p),
        }));
    }, [people]);
    // --- Efficiency Logic (Priority 2) ---
    const bottlenecks: Bottleneck[] = useMemo(() => {
        return ZONES.map(z => {
            const occupants = people.filter(p => p.zoneId === z.id);
            // Overload logic: more than 3 people in close proximity (< 100px)
            let isOverloaded = false;
            if (occupants.length > 3) {
                for (let i = 0; i < occupants.length; i++) {
                    let closeNeighbors = 0;
                    for (let j = 0; j < occupants.length; j++) {
                        if (i !== j && calculateDistance(occupants[i].position, occupants[j].position) < 100) {
                            closeNeighbors++;
                        }
                    }
                    if (closeNeighbors >= 3) { isOverloaded = true; break; }
                }
            }


            // Calculate average dwell time in minutes for the zone
            const avgDwellSeconds = occupants.length > 0
                ? occupants.reduce((sum, p) => sum + p.dwellTime, 0) / occupants.length
                : 0;
            const avgDwellTime = avgDwellSeconds / 60;


            return {
                zoneName: z.name,
                density: occupants.length / 5,
                isOverloaded,
                occupantCount: occupants.length,
                avgDwellTime
            };
        });
    }, [people]);


    const systemStatus = useMemo(() => {
       if (people.some(p => p.safetyStatus === 'DANGER' || (p.isAuthenticated === false && p.zoneId === 'zone-b'))) {
        return 'STORMY'; 
    }
        if (people.some(p => p.safetyStatus === 'WARNING' || p.wellbeing.isolationAlert)) {
        return 'CLOUDY'; 
    }
        return 'SUNNY'; // Nominal
    }, [people, bottlenecks]);


    const selectedPerson = people.find(p => p.id === selectedPersonId);
    const hasDanger = people.some(p => p.safetyStatus === 'DANGER');
    const hasWarning = people.some(p => p.safetyStatus === 'WARNING');
    const hasUnauthorizedVisitor = people.some(
        p => p.safetyViolation && !p.isAuthenticated
    );
    const globalEfficiency = useMemo(() => {
        if (people.length === 0) return 0;
        const sum = people.reduce((acc, p) => acc + p.wellbeing.stabilityScore, 0);
        return Math.round(sum / people.length);
    }, [people]);
    return (
        <div className=" relative min-h-screen w-full
  bg-gradient-to-br
  from-[#fffaf5]
  via-[#f7f3ef]
  to-[#f1ede8]">
            <div className="
  absolute inset-0
  bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_0)]
  [background-size:24px_24px]
  pointer-events-none" />
            <div className="min-h-screen max-w-7xl mx-auto p-6 flex flex-col gap-8">
                <header className="
  flex flex-col md:flex-row items-start md:items-center justify-between gap-6
  bg-white/40 backdrop-blur-2xl
  border border-white/40
  rounded-[2.5rem]
  px-10 py-7
  shadow-[0_15px_50px_rgba(0,0,0,0.05)]
">
                    {/* Brand + Mission */}
                    <div className="flex items-center gap-5">
                        <div
                            className={`p-4 rounded-2xl transition-all shadow-xl ${systemStatus === 'SUNNY'
                                ? 'bg-sky-500/90 shadow-sky-500/30'
                                : systemStatus === 'CLOUDY'
                                    ? 'bg-amber-500/90 shadow-amber-500/30'
                                    : 'bg-red-600 animate-pulse shadow-red-600/40'
                                }`}
                        >
                            <ShieldCheck size={30} className="text-white" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-semibold text-slate-800 leading-tight">
                                Happiness <span className="text-pink-500">Warehouse</span>
                            </h1>

                            <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
                                We actively care about your <span className="text-sky-400 font-semibold">safety</span>,
                                <span className="text-amber-400 font-semibold"> operational efficiency</span>,
                                and <span className="text-pink-400 font-semibold">overall wellbeing</span>.
                            </p>
                        </div>
                    </div>

                    {/* System Climate */}
                    <StatusWeather status={systemStatus} efficiency={globalEfficiency} />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
                    {/* Priority 1 & 2: Safety & Efficiency */}
                    <aside className="lg:col-span-3 space-y-6">
                        <section className="
 bg-slate-900/40 backdrop-blur-xl p-7 rounded-[2.2rem]
  border border-white/5 shadow-2xl
  transition-all duration-500 hover:border-sky-500/30
">
                            <h3 className="text-xs font-black text-red-400 uppercase mb-4 flex items-center gap-2 tracking-widest">
                                <ShieldCheck size={14} /> Safety Integrity
                            </h3>

                            <div className="space-y-4">
                                {hasDanger ? (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                                        <p className="text-xs font-bold text-red-300 uppercase">CRITICAL ALERT</p>
                                        <p className="text-[11px] text-red-400 mt-1 leading-snug">
                                            Collision risk detected: personnel within forklift danger zone.
                                        </p>
                                    </div>
                                ) : hasWarning ? (
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                                        <p className="text-xs font-bold text-amber-300 uppercase">PROXIMITY WARNING</p>
                                        <p className="text-[11px] text-amber-400 mt-1 leading-snug">
                                            Forklift operating near personnel. Maintain safe distance.
                                        </p>
                                    </div>
                                ) : hasUnauthorizedVisitor ? (
                                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl">
                                        <p className="text-xs font-bold text-orange-300 uppercase">ACCESS WARNING</p>
                                        <p className="text-[11px] text-orange-400 mt-1 leading-snug">
                                            Unauthorized visitor detected in restricted work zone.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                        <ShieldCheck size={18} className="text-emerald-400" />
                                        <span className="text-xs font-semibold text-emerald-300">
                                            All monitored areas are operating safely.
                                        </span>
                                    </div>
                                )}
                            </div>

                        </section>
                        <section className="
  bg-slate-900/70 p-6 rounded-3xl
  border border-slate-800
  shadow-xl
">
                            <h3 className="text-xs font-black text-sky-400 uppercase mb-4 flex items-center gap-2 tracking-widest">
                                <Users size={14} /> Operational Load
                            </h3>

                            <div className="space-y-4">
                                {bottlenecks.map(b => (
                                    <div key={b.zoneName} className="space-y-1">
                                        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
                                            <span>{b.zoneName}</span>
                                            <span className={b.isOverloaded ? 'text-amber-400' : 'text-sky-400'}>
                                                {b.isOverloaded ? 'High Load' : 'Normal'}
                                            </span>
                                        </div>

                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-700 ${b.isOverloaded ? 'bg-amber-500' : 'bg-sky-500'
                                                    }`}
                                                style={{ width: `${Math.min(100, (b.occupantCount / 5) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>


                    {/* Center: Live Map */}
                    <main className="lg:col-span-6 space-y-6">
                        <WarehouseMap
                            zones={ZONES}
                            aps={ACCESS_POINTS}
                            people={people}
                            assets={assets}
                            selectedPersonId={selectedPersonId}
                            onSelectPerson={setSelectedPersonId}
                        />
                        <aside className="lg:col-span-3 space-y-6 max-h-[680px] overflow-hidden opacity-90">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
                                    <span className="text-[10px] text-slate-500 font-black uppercase">Active Personnel</span>
                                    <p className="text-2xl font-black text-white">{people.length}</p>
                                </div>
                                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
                                    <span className="text-[10px] text-slate-500 font-black uppercase">Isolated Workers</span>
                                    <p className="text-2xl font-black text-amber-500">{people.filter(p => p.wellbeing.isolationAlert).length}</p>
                                </div>
                                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
                                    <span className="text-[10px] text-slate-500 font-black uppercase">Density Status</span>
                                    <p className="text-2xl font-black text-sky-400">{systemStatus === 'SUNNY' ? 'IDEAL' : 'VARIES'}</p>
                                </div>
                            </div>
                        </aside>
                    </main>


                    {/* Priority 3: Wellbeing Dashboard */}
                    <aside className="lg:col-span-3 space-y-6">
                        <section className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                            <h3 className="text-xs font-black text-pink-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
                                <Heart size={14} /> Wellbeing Vitals
                            </h3>


                            {selectedPerson ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center">
                                        <div className="relative w-24 h-24 mb-4">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                                                <circle cx="48" cy="48" r="40" stroke="#ec4899" strokeWidth="8" fill="transparent"
                                                    strokeDasharray={251} strokeDashoffset={251 - (selectedPerson.wellbeing.stabilityScore / 100) * 251}
                                                    strokeLinecap="round" className="transition-all duration-1000" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-xl font-black text-white">{Math.round(selectedPerson.wellbeing.stabilityScore)}%</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-slate-500">Baseline Stability</span>
                                    </div>


                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/30">
                                            <p className="text-[8px] font-black text-slate-500 uppercase">Alone Time</p>
                                            <p className="text-sm font-black text-white">{formatTime(selectedPerson.wellbeing.aloneTime)}</p>
                                        </div>
                                        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/30">
                                            <p className="text-[8px] font-black text-slate-500 uppercase">Edge Zone</p>
                                            <p className="text-sm font-black text-white">{Math.round(selectedPerson.wellbeing.edgeZonePercentage)}%</p>
                                        </div>
                                    </div>


                                    {selectedPerson.wellbeing.isolationAlert && (
                                        <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-xl flex items-center gap-2">
                                            <Minimize2 size={16} className="text-pink-500" />
                                            <span className="text-[10px] font-black text-pink-200 uppercase tracking-tighter">Isolation Risk Detected</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-slate-600 text-xs italic text-center">
                                    Select personnel to view<br />wellbeing trajectory
                                </div>
                            )}
                        </section>


                        <section className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl flex-grow overflow-hidden">
                            <h3 className="text-xs font-black text-slate-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                                <BrainCircuit size={14} /> Personnel Sync
                            </h3>
                            <div className="space-y-2 overflow-y-auto max-h-[250px] custom-scrollbar">
                                {people.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPersonId(p.id)}
                                        className={`w-full p-4 rounded-2xl border transition-all text-left ${selectedPersonId === p.id ? 'bg-sky-600 border-sky-400' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-black text-white">{p.name}</span>
                                            <div className={`w-2 h-2 rounded-full ${p.wellbeing.isolationAlert ? 'bg-pink-500 animate-ping' : 'bg-emerald-500'}`} />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">{p.role}</span>
                                            <span className="text-[10px] font-black mono text-sky-400">{formatTime(p.dwellTime)}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>


                <footer className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center text-[8px] font-black text-slate-600 uppercase tracking-widest">
                    <div className="flex gap-6">
                        <span>Sync: 1s</span>
                        <span>Isolation Buffer: 2h</span>
                        <span>Overload Threshold: {'>'}3p/5m</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-sky-500"></div> </div>
                        <div className="bg-slate-800 px-3 py-1 rounded-full">Build Stable</div>
                    </div>
                </footer>
            </div>
        </div>
    );
};


export default App;
