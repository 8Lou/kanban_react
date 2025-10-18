import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Shield, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { Task } from '../types/task';
import { validateFullKit } from '../utils/toc-calculations';

interface FullKitGateProps {
  task: Task;
  onApprove?: () => void;
  onReject?: () => void;
  compact?: boolean;
}

export function FullKitGate({ task, onApprove, onReject, compact = false }: FullKitGateProps) {
  const validation = validateFullKit(task);
  const completedItems = task.fullKitStatus.checklist.filter(i => i.completed).length;
  const totalItems = task.fullKitStatus.checklist.length;
  const completionPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border">
        {validation.valid ? (
          <>
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span className="text-green-700">Комплект готов</span>
          </>
        ) : (
          <>
            <Lock className="h-3 w-3 text-orange-600" />
            <span className="text-orange-700">Ворота закрыты</span>
          </>
        )}
      </div>
    );
  }

  return (
    <Card className={`p-4 ${validation.valid ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${validation.valid ? 'bg-green-100' : 'bg-orange-100'}`}>
          {validation.valid ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Shield className="h-5 w-5 text-orange-600" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={validation.valid ? 'text-green-900' : 'text-orange-900'}>
              Ворота "Полного комплекта"
            </h4>
            {task.gatekeeper && (
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {task.gatekeeper}
              </div>
            )}
          </div>

          {validation.valid ? (
            <Alert className="bg-white border-green-200 mb-3">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Все готово к работе!</AlertTitle>
              <AlertDescription className="text-green-700">
                Полный комплект собран. Задача может быть запущена в работу.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-white border-orange-200 mb-3">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Ворота закрыты</AlertTitle>
              <AlertDescription className="text-orange-700">
                Не все элементы полного комплекта готовы. Завершите подготовку перед запуском.
              </AlertDescription>
            </Alert>
          )}

          {/* Прогресс чек-листа */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Чек-лист полного комплекта</span>
              <span className="font-medium">
                {completedItems} / {totalItems}
              </span>
            </div>
            <Progress 
              value={completionPercent} 
              className={`h-2 ${validation.valid ? 'bg-green-100 [&>div]:bg-green-500' : 'bg-orange-100 [&>div]:bg-orange-500'}`}
            />
          </div>

          {/* Недостающие элементы */}
          {!validation.valid && validation.missingItems.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-orange-800 mb-2">Необходимо подготовить:</p>
              <ul className="space-y-1">
                {validation.missingItems.map((item, index) => (
                  <li key={index} className="text-xs text-orange-700 flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Кнопки действий для стража ворот */}
          {(onApprove || onReject) && (
            <div className="flex gap-2 mt-3">
              {onApprove && validation.valid && (
                <Button 
                  size="sm" 
                  onClick={onApprove}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-3 w-3 mr-2" />
                  Открыть ворота
                </Button>
              )}
              {onReject && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onReject}
                >
                  Вернуть на доработку
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
