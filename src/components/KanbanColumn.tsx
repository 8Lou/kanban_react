import { useDrop } from 'react-dnd';
import { KanbanCard } from './KanbanCard';
import { Button } from './ui/button';
import { Plus, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Task } from '../types/task';

interface KanbanColumnProps {
  title: string;
  status: string;
  tasks: Task[];
  wipLimit?: number;
  isConstraint?: boolean;
  onDrop: (taskId: string, newStatus: string) => void;
  onAddTask: (status: string) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskClick?: (taskId: string) => void;
}

export function KanbanColumn({ title, status, tasks, wipLimit, isConstraint, onDrop, onAddTask, onDeleteTask, onTaskClick }: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: { id: string }) => onDrop(item.id, status),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [onDrop, status]);

  const isOverLimit = wipLimit ? tasks.length > wipLimit : false;
  const isNearLimit = wipLimit ? tasks.length === wipLimit : false;

  const headerColors: Record<string, string> = {
    todo: 'bg-gray-100 border-gray-300',
    inProgress: 'bg-green-100 border-green-300',
    done: 'bg-blue-100 border-blue-300',
    archive: 'bg-purple-100 border-purple-300',
  };

  return (
    <div className={`flex flex-col h-full min-w-[320px] ${isConstraint ? 'border-red-500 border-4' : ''}`}>
      <div className={`p-4 rounded-t-lg border-b-2 ${
        isOverLimit 
          ? 'bg-red-100 border-red-400' 
          : isNearLimit 
          ? 'bg-yellow-100 border-yellow-400' 
          : headerColors[status] || 'bg-gray-100 border-gray-300'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2>{title}</h2>
            <span className={`px-2 py-1 rounded-full text-sm ${
              isOverLimit 
                ? 'bg-red-200 text-red-800' 
                : isNearLimit 
                ? 'bg-yellow-200 text-yellow-800' 
                : 'bg-white'
            }`}>
              {tasks.length}{wipLimit ? ` / ${wipLimit}` : ''}
            </span>
            {isOverLimit && <AlertTriangle className="h-4 w-4 text-red-600" />}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAddTask(status)}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {wipLimit && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">WIP-лимит</span>
              <span className={isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'}>
                {Math.round((tasks.length / wipLimit) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  isOverLimit 
                    ? 'bg-red-600' 
                    : isNearLimit 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((tasks.length / wipLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <div
        ref={drop}
        className={`flex-1 p-4 bg-gray-50 rounded-b-lg transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : 'border border-gray-200'
        } overflow-y-auto`}
      >
        {isOverLimit && (
          <Alert className="mb-3 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Превышен WIP-лимит! Рекомендуется завершить текущие задачи перед добавлением новых.
            </AlertDescription>
          </Alert>
        )}
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            id={task.id}
            title={task.title}
            description={task.description}
            priority={task.priority}
            assignees={task.assignees}
            dueDate={task.dueDate}
            bufferConsumption={task.bufferConsumption}
            fullKitComplete={task.fullKitStatus.isComplete}
            constraintType={task.constraintType}
            onDelete={onDeleteTask}
            onClick={onTaskClick}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            Перетащите карточку сюда
          </div>
        )}
      </div>
    </div>
  );
}