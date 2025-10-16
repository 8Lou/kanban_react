import { CheckCircle2, Clock, AlertCircle, BarChart3, Zap, Timer, AlertTriangle } from 'lucide-react';
import { Task } from '../types/task';
import { MetricCard } from './MetricCard';

interface MetricsGridProps {
  tasks: Task[];
}

export function MetricsGrid({ tasks }: MetricsGridProps) {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'inProgress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;

  const donePercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const throughput = doneTasks;

  const metrics = [
    {
      icon: BarChart3,
      label: 'Всего задач',
      value: totalTasks,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: CheckCircle2,
      label: 'На проверке',
      value: doneTasks,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subValue: `${donePercentage}%`
    },
    {
      icon: Clock,
      label: 'В работе',
      value: inProgressTasks,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Zap,
      label: 'Пропускная способность',
      value: throughput,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subValue: 'задач/неделя'
    },
    {
      icon: Timer,
      label: 'Средний цикл',
      value: '2.5 дня',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: AlertTriangle,
      label: 'Высокий приоритет',
      value: highPriorityTasks,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>
    </div>
  );
}