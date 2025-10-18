import { TrendingUp, Flame, Zap, Activity } from 'lucide-react';
import { Badge } from './ui/badge';

interface PriorityIndicatorProps {
  priority: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityIndicator({ priority, showLabel = false, size = 'md' }: PriorityIndicatorProps) {
  const getPriorityLevel = () => {
    if (priority >= 80) return 'critical';
    if (priority >= 60) return 'high';
    if (priority >= 40) return 'medium';
    return 'low';
  };

  const getConfig = () => {
    const level = getPriorityLevel();
    
    const configs = {
      critical: {
        icon: Flame,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        label: 'Критический',
        description: 'Максимальное влияние на проток',
      },
      high: {
        icon: Zap,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300',
        label: 'Высокий',
        description: 'Значительное влияние на проток',
      },
      medium: {
        icon: TrendingUp,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        label: 'Средний',
        description: 'Умеренное влияние на проток',
      },
      low: {
        icon: Activity,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        label: 'Низкий',
        description: 'Минимальное влияние на проток',
      },
    };
    
    return configs[level];
  };

  const config = getConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const content = (
    <div className="flex items-center gap-2">
      <div className={`p-1 rounded ${config.bgColor}`}>
        <Icon className={`${sizeClasses[size]} ${config.color}`} />
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{config.label}</span>
          <span className="text-xs text-gray-500">{priority}/100</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative group">
      {content}
      {!showLabel && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
            <p className="font-medium">{config.label} приоритет</p>
            <p className="text-gray-300">{config.description}</p>
            <p>Оценка: {priority}/100</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Компактный индикатор для списков
 */
export function PriorityBadge({ priority }: { priority: number }) {
  const getPriorityLevel = () => {
    if (priority >= 80) return { label: 'Критический', color: 'bg-red-100 text-red-800 border-red-200' };
    if (priority >= 60) return { label: 'Высокий', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (priority >= 40) return { label: 'Средний', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { label: 'Низкий', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  const config = getPriorityLevel();

  return (
    <Badge variant="outline" className={`${config.color} text-xs`}>
      {config.label} ({priority})
    </Badge>
  );
}
