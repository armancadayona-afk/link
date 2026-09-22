import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface DeviceSimulatorProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  children,
  headerAction,
}) => {
  return (
    <div className="flex flex-col items-center w-full max-w-[430px] mx-auto">
      {/* Device Header label outside frame */}
      <div className="w-full flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-200">{title}</span>
          {badge && (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>

      {/* Android Device Outer Bezel */}
      <div className="w-full relative rounded-[42px] p-3 bg-slate-900 border-[3px] border-slate-700/80 shadow-2xl shadow-black/80 ring-1 ring-white/10">
        {/* Antenna / Mic band */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-slate-800 rounded-b-md" />

        {/* Device Inner Screen */}
        <div className="relative w-full h-[730px] rounded-[34px] overflow-hidden bg-slate-950 flex flex-col select-none text-slate-100 border border-slate-800">
          {/* Android Status Bar */}
          <div className="h-9 px-6 pt-1.5 flex items-center justify-between text-xs text-slate-300 font-medium z-30 bg-slate-950/70 backdrop-blur-md">
            <span className="tracking-tight text-slate-200 font-semibold">9:41</span>
            
            {/* Front Camera Punch-hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-black ring-2 ring-slate-800/80 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950/60" />
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1">
                <span className="text-[10px]">94%</span>
                <BatteryMedium className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
            {children}
          </div>

          {/* Android Bottom Navigation Pill */}
          <div className="h-6 flex items-center justify-center bg-slate-950/90 z-20">
            <div className="w-32 h-1 bg-slate-600/60 rounded-full hover:bg-slate-400 transition-colors" />
          </div>
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 mt-2 text-center max-w-xs">{subtitle}</p>
      )}
    </div>
  );
};
