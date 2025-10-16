import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Task } from '../types/task';

interface PriorityDistributionProps {
  tasks: Task[];
}

export function PriorityDistribution({ tasks }: PriorityDistributionProps) {
  const totalTasks = tasks.length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;

  const priorityDistribution = {
    high: totalTasks > 0 ? Math.round((highPriorityTasks / totalTasks) * 100) : 0,
    medium: totalTasks > 0 ? Math.round((mediumPriorityTasks / totalTasks) * 100) : 0,
    low: totalTasks > 0 ? Math.round((lowPriorityTasks / totalTasks) * 100) : 0,
  };

  return (
    <Card className="p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4">Распределение по приоритетам</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-red-600">Высокий</span>
            <span className="text-sm font-medium text-red-600">{priorityDistribution.high}%</span>
          </div>
          <Progress value={priorityDistribution.high} className="h-2 [&>div]:bg-red-500" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-yellow-600">Средний</span>
            <span className="text-sm font-medium text-yellow-600">{priorityDistribution.medium}%</span>
          </div>
          <Progress value={priorityDistribution.medium} className="h-2 [&>div]:bg-yellow-500" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-green-600">Низкий</span>
            <span className="text-sm font-medium text-green-600">{priorityDistribution.low}%</span>
          </div>
          <Progress value={priorityDistribution.low} className="h-2 [&>div]:bg-green-500" />
        </div>
      </div>
    </Card>
  );
}