import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { ChartType } from '@/types/data-grid';
import { BarChart as BarIcon, LineChart as LineIcon, Activity, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisualizerModalProps {
  data: any[];
}

// Custom Tooltip Component for better UX
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-100 shadow-xl rounded-lg text-xs">
        <p className="font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }} 
              />
              <span className="text-slate-500 font-medium">{entry.name}:</span>
              <span className="font-mono font-bold text-slate-700">
                {typeof entry.value === 'number' 
                  ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const VisualizerModal: React.FC<VisualizerModalProps> = ({ data }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');

  // --- 1. Intelligent Parsing Logic ---
  const { dataKeys, labelKey, summaryStats } = useMemo(() => {
    if (data.length === 0) return { dataKeys: [], labelKey: '', summaryStats: [] };
    
    // Get all keys except our internal index
    const firstRow = data[0];
    const keys = Object.keys(firstRow).filter(k => k !== '_index');

    // 1a. Detect Label (X-Axis)
    // Priority: Keys containing 'date', 'time', 'name', 'region' -> First String -> Index
    let bestLabelKey = '_index';
    let maxScore = -1;

    keys.forEach(key => {
        const val = firstRow[key];
        if (typeof val === 'string') {
            let score = 1;
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('date') || lowerKey.includes('year') || lowerKey.includes('month')) score += 5;
            if (lowerKey.includes('name') || lowerKey.includes('region') || lowerKey.includes('status')) score += 3;
            
            if (score > maxScore) {
                maxScore = score;
                bestLabelKey = key;
            }
        }
    });

    // 1b. Detect Metrics (Series)
    // Filter keys that are definitely numbers
    const numerics = keys.filter(k => {
        const val = firstRow[k];
        return typeof val === 'number';
    });

    // 1c. Calculate Summary Stats (Total, Avg)
    const stats = numerics.map(key => {
        const sum = data.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
        const avg = sum / data.length;
        return {
            key,
            sum,
            avg
        };
    });

    return {
        labelKey: bestLabelKey,
        dataKeys: numerics,
        summaryStats: stats
    };
  }, [data]);

  // --- 2. Chart Rendering ---
  const renderChart = () => {
    const CommonProps = {
      data: data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    // Modern professional palette
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...CommonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey={labelKey} 
                stroke="#94a3b8" 
                tick={{fontSize: 11, fill: '#64748b'}} 
                tickLine={false}
                axisLine={false}
                dy={10}
            />
            <YAxis 
                stroke="#94a3b8" 
                tick={{fontSize: 11, fill: '#64748b'}} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
            {dataKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[index % colors.length]} 
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...CommonProps}>
            <defs>
                {dataKeys.map((key, index) => (
                    <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0}/>
                    </linearGradient>
                ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey={labelKey} 
                stroke="#94a3b8" 
                tick={{fontSize: 11, fill: '#64748b'}} 
                tickLine={false}
                axisLine={false}
                dy={10}
            />
            <YAxis 
                stroke="#94a3b8" 
                tick={{fontSize: 11, fill: '#64748b'}} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
            {dataKeys.map((key, index) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[index % colors.length]} 
                fillOpacity={1} 
                fill={`url(#color${key})`} 
              />
            ))}
          </AreaChart>
        );
      case 'bar':
      default:
        return (
          <BarChart {...CommonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey={labelKey} 
                stroke="#94a3b8" 
                tick={{fontSize: 11, fill: '#64748b'}} 
                tickLine={false}
                axisLine={false}
                dy={10}
            />
            <YAxis 
                stroke="#94a3b8" 
                tick={{fontSize: 11, fill: '#64748b'}} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            />
            <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
            {dataKeys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={colors[index % colors.length]} 
                radius={[6, 6, 0, 0]} 
                maxBarSize={60}
              />
            ))}
          </BarChart>
        );
    }
  };

  // --- 3. Empty State ---
  if (data.length === 0 || dataKeys.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
                <BarIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No numeric data found</h3>
            <p className="text-sm max-w-xs text-center mt-2">
                Please ensure your selection includes at least one column with numeric values (e.g., Revenue, Users).
            </p>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Data Source</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{data.length}</span>
                <span className="text-sm text-slate-500">rows selected</span>
            </div>
        </div>

        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg self-start">
          {[
            { id: 'bar', icon: BarIcon, label: 'Bar' },
            { id: 'area', icon: Activity, label: 'Area' },
            { id: 'line', icon: LineIcon, label: 'Line' }
          ].map((type) => (
            <button
                key={type.id}
                onClick={() => setChartType(type.id as ChartType)}
                className={cn(
                "px-3 py-1.5 rounded-md transition-all text-sm font-medium flex items-center gap-2",
                chartType === type.id 
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
            >
                <type.icon className="w-4 h-4" /> {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryStats.slice(0, 4).map((stat) => (
              <div key={stat.key} className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold uppercase tracking-wide truncate max-w-[100px]">{stat.key}</span>
                  </div>
                  <div className="text-lg font-mono font-semibold text-slate-800">
                    {stat.sum > 10000 
                        ? (stat.sum / 1000).toFixed(1) + 'k' 
                        : stat.sum.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Avg: {stat.avg.toFixed(0)}
                  </div>
              </div>
          ))}
      </div>

      {/* Main Chart Area */}
      <div className="h-[400px] w-full border border-slate-100 rounded-xl p-4 bg-white shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
