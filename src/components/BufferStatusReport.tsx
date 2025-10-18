import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { AlertTriangle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { Task } from '../types/task';

interface BufferStatusReportProps {
  tasks: Task[];
}

export function BufferStatusReport({ tasks }: BufferStatusReportProps) {
  // Анализ состояния буферов
  const redZoneTasks = tasks.filter(t => t.bufferConsumption > 70);
  const yellowZoneTasks = tasks.filter(t => t.bufferConsumption > 30 && t.bufferConsumption <= 70);
  const greenZoneTasks = tasks.filter(t => t.bufferConsumption <= 30);
  
  // Задачи в работе
  const inProgressTasks = tasks.filter(t => t.status === 'inProgress');
  const avgBufferConsumption = inProgressTasks.length > 0 
    ? inProgressTasks.reduce((sum, t) => sum + t.bufferConsumption, 0) / inProgressTasks.length 
    : 0;

  // Критические задачи (красная зона + высокий приоритет)
  const criticalTasks = tasks.filter(t => 
    t.bufferConsumption > 70 && 
    (t.priority === 'high' || t.constraintType === 'drum' || t.constraintType === 'constraint')
  );

  const getZoneColor = (zone: 'red' | 'yellow' | 'green') => {
    switch (zone) {
      case 'red': return 'bg-red-50 border-red-200';
      case 'yellow': return 'bg-yellow-50 border-yellow-200';
      case 'green': return 'bg-green-50 border-green-200';
    }
  };

  const getZoneIcon = (zone: 'red' | 'yellow' | 'green') => {
    switch (zone) {
      case 'red': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'yellow': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'green': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Общая статистика */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Общее состояние буферов</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{redZoneTasks.length}</div>
            <div className="text-xs text-gray-600">Красная зона</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{yellowZoneTasks.length}</div>
            <div className="text-xs text-gray-600">Желтая зона</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{greenZoneTasks.length}</div>
            <div className="text-xs text-gray-600">Зеленая зона</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(avgBufferConsumption)}%</div>
            <div className="text-xs text-gray-600">Средний расход</div>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Общее состояние буферов</span>
            <span>{Math.round(avgBufferConsumption)}%</span>
          </div>
          <Progress value={avgBufferConsumption} showBufferZones />
        </div>
      </Card>

      {/* Критические задачи */}
      {criticalTasks.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">
              Требуют немедленного вмешательства ({criticalTasks.length})
            </h3>
          </div>
          <div className="space-y-2">
            {criticalTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex-1">
                  <div className="font-medium text-sm">{task.title}</div>
                  <div className="text-xs text-gray-600">
                    {task.assignees.join(', ')} • {task.constraintType === 'drum' ? '🥁 Барабан' : ''}
                  </div>
                </div>
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  {task.bufferConsumption}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Задачи по зонам */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Красная зона */}
        <Card className={`p-4 ${getZoneColor('red')}`}>
          <div className="flex items-center gap-2 mb-3">
            {getZoneIcon('red')}
            <h4 className="font-medium text-red-800">Красная зона</h4>
            <Badge className="bg-red-200 text-red-800">{redZoneTasks.length}</Badge>
          </div>
          <p className="text-xs text-red-700 mb-3">
            Буфер критически мал. Требуется немедленное вмешательство.
          </p>
          <div className="space-y-2">
            {redZoneTasks.slice(0, 3).map(task => (
              <div key={task.id} className="text-xs">
                <div className="font-medium">{task.title}</div>
                <div className="text-red-600">{task.bufferConsumption}% буфера</div>
              </div>
            ))}
            {redZoneTasks.length > 3 && (
              <div className="text-xs text-red-600">
                +{redZoneTasks.length - 3} задач...
              </div>
            )}
          </div>
        </Card>

        {/* Желтая зона */}
        <Card className={`p-4 ${getZoneColor('yellow')}`}>
          <div className="flex items-center gap-2 mb-3">
            {getZoneIcon('yellow')}
            <h4 className="font-medium text-yellow-800">Желтая зона</h4>
            <Badge className="bg-yellow-200 text-yellow-800">{yellowZoneTasks.length}</Badge>
          </div>
          <p className="text-xs text-yellow-700 mb-3">
            Буфер начинает истощаться. Планируйте корректирующие действия.
          </p>
          <div className="space-y-2">
            {yellowZoneTasks.slice(0, 3).map(task => (
              <div key={task.id} className="text-xs">
                <div className="font-medium">{task.title}</div>
                <div className="text-yellow-600">{task.bufferConsumption}% буфера</div>
              </div>
            ))}
            {yellowZoneTasks.length > 3 && (
              <div className="text-xs text-yellow-600">
                +{yellowZoneTasks.length - 3} задач...
              </div>
            )}
          </div>
        </Card>

        {/* Зеленая зона */}
        <Card className={`p-4 ${getZoneColor('green')}`}>
          <div className="flex items-center gap-2 mb-3">
            {getZoneIcon('green')}
            <h4 className="font-medium text-green-800">Зеленая зона</h4>
            <Badge className="bg-green-200 text-green-800">{greenZoneTasks.length}</Badge>
          </div>
          <p className="text-xs text-green-700 mb-3">
            Буфер в норме. Действия не требуются.
          </p>
          <div className="text-sm text-green-600">
            ✅ {greenZoneTasks.length} задач выполняются в срок
          </div>
        </Card>
      </div>

      {/* Рекомендации */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">Рекомендации по управлению буферами</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          {redZoneTasks.length > 0 && (
            <li>• Немедленно перераспределите ресурсы на задачи в красной зоне</li>
          )}
          {yellowZoneTasks.length > 0 && (
            <li>• Подготовьте план корректирующих действий для желтой зоны</li>
          )}
          {avgBufferConsumption > 60 && (
            <li>• Рассмотрите увеличение буферов или пересмотр оценок</li>
          )}
          {criticalTasks.length > 0 && (
            <li>• Сосредоточьте внимание на ограничениях (барабан/constraint)</li>
          )}
          <li>• Проводите ежедневный мониторинг состояния буферов</li>
        </ul>
      </Card>
    </div>
  );
}