import { Card } from './ui/card';

interface Metric {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  subValue?: string;
}

interface MetricCardProps {
  metric: Metric;
}

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className={`inline-flex p-2 rounded-lg ${metric.bgColor} mb-3`}>
        <metric.icon className={`h-5 w-5 ${metric.color}`} />
      </div>
      <div className="space-y-1">
        <p className="text-gray-600 text-xs">{metric.label}</p>
        <p className="text-2xl">{metric.value}</p>
        {metric.subValue && (
          <p className="text-xs text-gray-500">{metric.subValue}</p>
        )}
      </div>
    </Card>
  );
}