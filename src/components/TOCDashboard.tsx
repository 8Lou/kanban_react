import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Task } from '../types/task';
import { 
  performTriage, 
  calculateFlowBuffer, 
  calculateFlowMetrics 
} from '../utils/toc-calculations';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Clock,
  Zap
} from 'lucide-react';

interface TOCDashboardProps {
  tasks: Task[];
  detectedConstraint: string | null;
}

export function TOCDashboard({ tasks, detectedConstraint }: TOCDashboardProps) {
  const triage = performTriage(tasks);
  const flowBuffer = calculateFlowBuffer(tasks.filter(t => t.status !== 'done'));
  const metrics = calculateFlowMetrics(tasks);

  return (
    <div className="flex md:flex-row gap-4 mb-6">
      {/* Метрики потока */}
      <Card className="p-4 w-full md:w-1/2">
        <h3 className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600" />
          Метрики потока
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-600 mb-1">Проток (Throughput)</div>
            <div className="text-2xl flex items-center gap-2">
              {metrics.throughput}
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-xs text-gray-500">задач завершено</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">WIP</div>
            <div className="text-2xl flex items-center gap-2">
              {metrics.wip}
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-xs text-gray-500">задач в работе</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Средний цикл</div>
            <div className="text-2xl flex items-center gap-2">
              {metrics.avgCycleTime}
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-xs text-gray-500">часов</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Буфер потока</div>
            <div className="text-2xl flex items-center gap-2">
              {flowBuffer.toFixed(1)}
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-xs text-gray-500">часов (50%)</div>
          </div>
        </div>
      </Card>

      {/* Триаж задач */}
      <Card className="p-4 w-full md:w-1/2">
        <h3 className="mb-4">Авто-Триаж задач</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Высокая ценность</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {triage.highValue.length}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">Низкая ценность</span>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800">
              {triage.lowValue.length}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-red-50 rounded">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm">Рекомендованы к отмене</span>
            </div>
            <Badge className="bg-red-100 text-red-800">
              {triage.shouldCancel.length}
            </Badge>
          </div>
        </div>

        {triage.shouldCancel.length > 0 && (
          <Alert className="mt-3 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Рекомендация</AlertTitle>
            <AlertDescription className="text-red-700 text-xs">
              {triage.shouldCancel.length} задач с низкой ценностью и высокими усилиями. 
              Рекомендуется отменить для фокуса на приоритетах.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Статус ограничения */}
      {detectedConstraint && (
        <Card className="p-4 border-red-200 bg-red-50 md:col-span-2">
          <Alert className="bg-white border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Обнаружено ограничение системы</AlertTitle>
            <AlertDescription className="text-red-700">
              Колонка "{
                detectedConstraint === 'todo' ? 'К выполнению' : 
                detectedConstraint === 'inProgress' ? 'В работе' : 
                'Выполнено'
              }" является узким местом потока. Все усилия должны быть направлены на разгрузку этого этапа.
            </AlertDescription>
          </Alert>
          <div className="mt-3 p-3 bg-white rounded-lg">
            <p className="text-xs font-medium text-red-800 mb-2">Действия по 5 шагам фокусировки ТОС:</p>
            <ol className="text-xs text-red-700 space-y-1 list-decimal list-inside">
              <li>✓ Ограничение идентифицировано</li>
              <li>Максимизировать использование ограничения (убрать простои)</li>
              <li>Подчинить все остальные ресурсы ограничению</li>
              <li>Расширить ограничение (добавить ресурсы)</li>
              <li>Вернуться к шагу 1 после устранения текущего ограничения</li>
            </ol>
          </div>
        </Card>
      )}
    </div>
  );
}