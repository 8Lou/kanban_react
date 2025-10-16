import { Card } from './ui/card';
import { TrendingUp, CheckCircle2, Clock, AlertCircle, BarChart3 } from 'lucide-react';
import { Progress } from './ui/progress';
import { Task } from '../types/task';

interface PerformanceMetricsProps {
  tasks: Task[];
}

export function PerformanceMetrics({ tasks }: PerformanceMetricsProps) {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'inProgress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;

  const throughput = doneTasks; // За текущий период
  const avgCycleTime = '2.5 дня'; // Мок данные

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
      subValue: `${completionRate}%`,
    },
    {
      icon: Clock,
      label: 'В работе',
      value: inProgressTasks,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      label: 'Пропускная способность',
      value: throughput,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subValue: 'задач/неделя',
    },
    {
      icon: Clock,
      label: 'Средний цикл',
      value: avgCycleTime,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: AlertCircle,
      label: 'Высокий приоритет',
      value: highPriorityTasks,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-4">
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
        ))}
      </div>

      <Card className="p-6">
        <h3 className="mb-4">Распределение по приоритетам</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Высокий приоритет</span>
              <span className="text-sm">{highPriorityTasks} задач</span>
            </div>
            <Progress value={(highPriorityTasks / totalTasks) * 100} className="h-2 bg-red-100 [&>div]:bg-red-500" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Средний приоритет</span>
              <span className="text-sm">{mediumPriorityTasks} задач</span>
            </div>
            <Progress value={(mediumPriorityTasks / totalTasks) * 100} className="h-2 bg-yellow-100 [&>div]:bg-yellow-500" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Низкий приоритет</span>
              <span className="text-sm">{lowPriorityTasks} задач</span>
            </div>
            <Progress value={(lowPriorityTasks / totalTasks) * 100} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
          </div>
        </div>
      </Card>
    </div>
  );
}
