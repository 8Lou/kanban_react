import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Anchor, AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';

interface RopeControlProps {
  currentWIP: number;
  wipLimit: number;
  constraintStatus: string | null;
  constraintLoad: number; // 0-100%
  canStartNew: boolean;
  reason?: string;
}

export function RopeControl({
  currentWIP,
  wipLimit,
  constraintStatus,
  constraintLoad,
  canStartNew,
  reason,
}: RopeControlProps) {
  const utilizationPercent = (currentWIP / wipLimit) * 100;
  const isNearLimit = utilizationPercent >= 80;
  const isAtLimit = utilizationPercent >= 100;

  return (
    <Card className="p-4 border-purple-200 bg-purple-50">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-purple-100">
          <Anchor className="h-5 w-5 text-purple-600" />
        </div>

        <div className="flex-1">
          <h4 className="text-purple-900 mb-3">Контроль "Каната" (Rope)</h4>

          {/* Статус системы */}
          {canStartNew ? (
            <Alert className="bg-white border-green-200 mb-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Система готова</AlertTitle>
              <AlertDescription className="text-green-700">
                Можно запускать новые задачи в работу
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-white border-orange-200 mb-3">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Система перегружена</AlertTitle>
              <AlertDescription className="text-orange-700">
                {reason || 'Дождитесь завершения текущих задач'}
              </AlertDescription>
            </Alert>
          )}

          {/* WIP загрузка */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-600">Загрузка системы (WIP)</span>
              <span className={`font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-green-600'}`}>
                {currentWIP} / {wipLimit} ({Math.round(utilizationPercent)}%)
              </span>
            </div>
            <Progress
              value={utilizationPercent}
              className={`h-3 ${
                isAtLimit
                  ? 'bg-red-100 [&>div]:bg-red-500'
                  : isNearLimit
                  ? 'bg-orange-100 [&>div]:bg-orange-500'
                  : 'bg-green-100 [&>div]:bg-green-500'
              }`}
            />
          </div>

          {/* Загрузка ограничения */}
          {constraintStatus && (
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  Загрузка ограничения ({constraintStatus})
                </span>
                <span className={`font-medium ${constraintLoad > 80 ? 'text-red-600' : constraintLoad > 60 ? 'text-orange-600' : 'text-green-600'}`}>
                  {Math.round(constraintLoad)}%
                </span>
              </div>
              <Progress
                value={constraintLoad}
                className={`h-3 ${
                  constraintLoad > 80
                    ? 'bg-red-100 [&>div]:bg-red-500'
                    : constraintLoad > 60
                    ? 'bg-orange-100 [&>div]:bg-orange-500'
                    : 'bg-green-100 [&>div]:bg-green-500'
                }`}
              />
            </div>
          )}

          {/* Правила Каната */}
          <div className="mt-4 p-3 bg-white rounded-lg">
            <p className="text-xs font-medium text-purple-800 mb-2">Принципы "Каната":</p>
            <ul className="text-xs text-purple-700 space-y-1">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Новая задача запускается только после завершения текущей</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Темп работы синхронизирован с ритмом ограничения (Барабана)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Однозадачность &gt; многозадачность</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
