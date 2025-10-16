import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

interface BufferIndicatorProps {
  consumption: number; // 0-100
  className?: string;
}

export function BufferIndicator({ consumption, className = '' }: BufferIndicatorProps) {
  const getBufferColor = () => {
    if (consumption <= 33) return 'bg-green-500';
    if (consumption <= 66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBufferStatus = () => {
    if (consumption <= 33) return { text: 'Норма', icon: CheckCircle, color: 'text-green-600' };
    if (consumption <= 66) return { text: 'Внимание', icon: TrendingUp, color: 'text-yellow-600' };
    return { text: 'Критично', icon: AlertTriangle, color: 'text-red-600' };
  };

  const status = getBufferStatus();
  const StatusIcon = status.icon;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm">Индикатор буфера</span>
        <div className={`flex items-center gap-1 ${status.color}`}>
          <StatusIcon className="h-4 w-4" />
          <span className="text-sm">{status.text}</span>
        </div>
      </div>
      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        {/* Зоны буфера */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 bg-green-100"></div>
          <div className="w-1/3 bg-yellow-100"></div>
          <div className="w-1/3 bg-red-100"></div>
        </div>
        {/* Прогресс потребления */}
        <div
          className={`absolute left-0 top-0 h-full ${getBufferColor()} transition-all duration-300`}
          style={{ width: `${consumption}%` }}
        ></div>
        {/* Текст */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-gray-700 mix-blend-difference">{consumption}%</span>
        </div>
      </div>
    </div>
  );
}
