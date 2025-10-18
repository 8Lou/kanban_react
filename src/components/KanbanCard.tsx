import { useDrag } from 'react-dnd';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

import { Trash2, Calendar, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import { FullKitGate } from './FullKitGate';
import { calculateTaskPriority } from '../utils/toc-calculations';

import { Task } from '../types/task';

interface KanbanCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onClick?: (id: string) => void;
  showFullKitGate?: boolean;
}

export function KanbanCard({
  task,
  onDelete,
  onClick,
  showFullKitGate = false,
}: KanbanCardProps) {
  const { id, title, description, priority, assignees, dueDate, bufferConsumption, fullKitStatus, constraintType } = task;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200',
  };

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
  };

  const getBufferColor = () => {
    if (bufferConsumption <= 33) return 'bg-green-500';
    if (bufferConsumption <= 66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Автоматический расчет приоритета по ТОС
  const autoPriority = calculateTaskPriority(task);
  const getPriorityColor = () => {
    if (autoPriority >= 80) return 'bg-red-100 border-red-300 text-red-800';
    if (autoPriority >= 60) return 'bg-orange-100 border-orange-300 text-orange-800';
    if (autoPriority >= 40) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-gray-100 border-gray-300 text-gray-600';
  };

  const getPriorityLabel = () => {
    if (autoPriority >= 80) return 'КРИТИЧЕСКИЙ';
    if (autoPriority >= 60) return 'ВЫСОКИЙ';
    if (autoPriority >= 40) return 'СРЕДНИЙ';
    return 'НИЗКИЙ';
  };

  return (
    <div
      ref={drag}
      className={`transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <Card
        className="p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow bg-white overflow-visible"
        onClick={(e) => {
          if (onClick && !(e.target as HTMLElement).closest('button')) {
            onClick(id);
          }
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <h3>{title}</h3>
              {constraintType === 'drum' && <span className="text-lg">🥁</span>}
              {constraintType === 'constraint' && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            title="Удалить (временная функция)"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-gray-600 mb-3 text-sm line-clamp-2">{description}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={priorityColors[priority]}>
            {priorityLabels[priority]}
          </Badge>
          <Badge className={`text-xs font-bold ${getPriorityColor()}`}>
            ТОС: {getPriorityLabel()} ({autoPriority})
          </Badge>
          {fullKitStatus.isComplete && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Комплект
            </Badge>
          )}
        </div>

        {/* Full-kit gate для задач в очереди */}
        {showFullKitGate && (
          <div className="mb-3">
            <FullKitGate task={task} compact />
          </div>
        )}

        {/* Индикатор буфера */}
        {bufferConsumption > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Буфер</span>
              <span className="text-gray-600">{bufferConsumption}%</span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="w-1/3 bg-green-100"></div>
                <div className="w-1/3 bg-yellow-100"></div>
                <div className="w-1/3 bg-red-100"></div>
              </div>
              <div
                className={`absolute left-0 top-0 h-full ${getBufferColor()} transition-all`}
                style={{ width: `${bufferConsumption}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          {assignees.length > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-3 w-3" />
              <span className="text-xs">{assignees.join(', ')}</span>
            </div>
          )}
          {dueDate && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">{dueDate}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}