import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Task } from '../types/task';
import { ScrollArea } from './ui/scroll-area';
import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface BufferReportDialogProps {
  tasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BufferReportDialog({ tasks, open, onOpenChange }: BufferReportDialogProps) {
  // Группировка задач по статусу буфера
  const greenZoneTasks = tasks.filter(t => t.bufferConsumption <= 33);
  const yellowZoneTasks = tasks.filter(t => t.bufferConsumption > 33 && t.bufferConsumption <= 66);
  const redZoneTasks = tasks.filter(t => t.bufferConsumption > 66);

  // Средний уровень потребления буфера
  const avgBufferConsumption = tasks.length > 0
    ? Math.round(tasks.reduce((sum, task) => sum + task.bufferConsumption, 0) / tasks.length)
    : 0;

  // Задачи с ограничениями
  const constraintTasks = tasks.filter(t => t.constraintType === 'constraint' || t.constraintType === 'drum');

  // История потребления (мок данные)
  const bufferHistory = [
    { week: 'Неделя 1', green: 65, yellow: 25, red: 10 },
    { week: 'Неделя 2', green: 55, yellow: 30, red: 15 },
    { week: 'Неделя 3', green: 60, yellow: 20, red: 20 },
    { week: 'Неделя 4', green: 50, yellow: 35, red: 15 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Отчетность по буферу потока</DialogTitle>
          <DialogDescription>
            Анализ состояния буферов и истории потребления для управления потоком задач
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="temperature">Температура буферов</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Сводка */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-gray-600 mb-1">Всего задач</div>
                  <div className="text-3xl">{tasks.length}</div>
                </Card>
                <Card className="p-4 bg-green-50">
                  <div className="text-sm text-green-700 mb-1">Зеленая зона</div>
                  <div className="text-3xl text-green-600">{greenZoneTasks.length}</div>
                  <div className="text-xs text-green-600 mt-1">
                    {tasks.length > 0 ? Math.round((greenZoneTasks.length / tasks.length) * 100) : 0}%
                  </div>
                </Card>
                <Card className="p-4 bg-yellow-50">
                  <div className="text-sm text-yellow-700 mb-1">Желтая зона</div>
                  <div className="text-3xl text-yellow-600">{yellowZoneTasks.length}</div>
                  <div className="text-xs text-yellow-600 mt-1">
                    {tasks.length > 0 ? Math.round((yellowZoneTasks.length / tasks.length) * 100) : 0}%
                  </div>
                </Card>
                <Card className="p-4 bg-red-50">
                  <div className="text-sm text-red-700 mb-1">Красная зона</div>
                  <div className="text-3xl text-red-600">{redZoneTasks.length}</div>
                  <div className="text-xs text-red-600 mt-1">
                    {tasks.length > 0 ? Math.round((redZoneTasks.length / tasks.length) * 100) : 0}%
                  </div>
                </Card>
              </div>

              {/* Средний уровень буфера */}
              <Card className="p-6">
                <h3 className="mb-4">Средний уровень потребления буфера</h3>
                <div className="relative w-full h-12 bg-gray-200 rounded-full overflow-hidden">
                  <div className="absolute inset-0 flex">
                    <div className="w-1/3 bg-green-100"></div>
                    <div className="w-1/3 bg-yellow-100"></div>
                    <div className="w-1/3 bg-red-100"></div>
                  </div>
                  <div
                    className={`absolute left-0 top-0 h-full transition-all ${
                      avgBufferConsumption <= 33
                        ? 'bg-green-500'
                        : avgBufferConsumption <= 66
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${avgBufferConsumption}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm mix-blend-difference">{avgBufferConsumption}%</span>
                  </div>
                </div>
              </Card>

              {/* Критические задачи */}
              {redZoneTasks.length > 0 && (
                <Card className="p-6 border-red-200 bg-red-50">
                  <h3 className="mb-4 flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    Критические задачи (красная зона)
                  </h3>
                  <div className="space-y-3">
                    {redZoneTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{task.title}</p>
                            {task.constraintType !== 'none' && (
                              <Badge variant="outline" className="text-xs">
                                {task.constraintType === 'drum' ? '🥁 Барабан' : '⚠️ Ограничение'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Исполнители: {task.assignees.join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl text-red-600">{task.bufferConsumption}%</div>
                          <div className="text-xs text-gray-600">потребление</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Задачи-ограничения */}
              {constraintTasks.length > 0 && (
                <Card className="p-6 border-purple-200 bg-purple-50">
                  <h3 className="mb-4 text-purple-800">Задачи с ограничениями</h3>
                  <div className="space-y-3">
                    {constraintTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{task.title}</p>
                            <Badge variant="outline">
                              {task.constraintType === 'drum' ? '🥁 Барабан' : '⚠️ Ограничение'}
                            </Badge>
                          </div>
                          {task.constraintResource && (
                            <p className="text-sm text-gray-600">
                              Ресурс: {task.constraintResource}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl ${
                              task.bufferConsumption <= 33
                                ? 'text-green-600'
                                : task.bufferConsumption <= 66
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {task.bufferConsumption}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="temperature" className="space-y-4 mt-0">
              <Card className="p-6">
                <h3 className="mb-4">График "температуры" буферов</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Распределение задач по зонам буфера показывает общее состояние системы
                </p>

                {/* Визуальное представление температуры */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Зеленая зона (0-33%)</span>
                      </div>
                      <span className="text-sm">{greenZoneTasks.length} задач</span>
                    </div>
                    <div className="w-full h-8 bg-green-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-green-500 flex items-center justify-center text-white text-sm"
                        style={{
                          width: `${
                            tasks.length > 0 ? (greenZoneTasks.length / tasks.length) * 100 : 0
                          }%`,
                        }}
                      >
                        {tasks.length > 0
                          ? `${Math.round((greenZoneTasks.length / tasks.length) * 100)}%`
                          : ''}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-yellow-600" />
                        <span>Желтая зона (34-66%)</span>
                      </div>
                      <span className="text-sm">{yellowZoneTasks.length} задач</span>
                    </div>
                    <div className="w-full h-8 bg-yellow-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 flex items-center justify-center text-white text-sm"
                        style={{
                          width: `${
                            tasks.length > 0 ? (yellowZoneTasks.length / tasks.length) * 100 : 0
                          }%`,
                        }}
                      >
                        {tasks.length > 0
                          ? `${Math.round((yellowZoneTasks.length / tasks.length) * 100)}%`
                          : ''}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span>Красная зона (67-100%)</span>
                      </div>
                      <span className="text-sm">{redZoneTasks.length} задач</span>
                    </div>
                    <div className="w-full h-8 bg-red-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-red-500 flex items-center justify-center text-white text-sm"
                        style={{
                          width: `${
                            tasks.length > 0 ? (redZoneTasks.length / tasks.length) * 100 : 0
                          }%`,
                        }}
                      >
                        {tasks.length > 0
                          ? `${Math.round((redZoneTasks.length / tasks.length) * 100)}%`
                          : ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Рекомендации */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="mb-2 text-blue-900">Рекомендации</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {redZoneTasks.length > 3 && (
                      <li>• Слишком много задач в красной зоне - требуется срочное вмешательство</li>
                    )}
                    {yellowZoneTasks.length > tasks.length / 2 && (
                      <li>• Большая часть задач в желтой зоне - необходимо усилить контроль</li>
                    )}
                    {greenZoneTasks.length > tasks.length * 0.7 && (
                      <li>• Отличная работа! Большинство задач в зеленой зоне</li>
                    )}
                  </ul>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-0">
              <Card className="p-6">
                <h3 className="mb-4">История потребления буфера</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Динамика распределения задач по зонам за последние недели
                </p>

                <div className="space-y-6">
                  {bufferHistory.map((week) => (
                    <div key={week.week}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{week.week}</span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600">🟢 {week.green}%</span>
                          <span className="text-yellow-600">🟡 {week.yellow}%</span>
                          <span className="text-red-600">🔴 {week.red}%</span>
                        </div>
                      </div>
                      <div className="w-full h-6 bg-gray-200 rounded-lg overflow-hidden flex">
                        <div
                          className="bg-green-500"
                          style={{ width: `${week.green}%` }}
                        ></div>
                        <div
                          className="bg-yellow-500"
                          style={{ width: `${week.yellow}%` }}
                        ></div>
                        <div className="bg-red-500" style={{ width: `${week.red}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="mb-2">Тренды</h4>
                  <div className="text-sm space-y-1">
                    <p>• Количество задач в красной зоне увеличилось на 5% за последнюю неделю</p>
                    <p>• Средний уровень буфера: {avgBufferConsumption}%</p>
                    <p>
                      • Рекомендация: Сфокусироваться на задачах с ограничениями для улучшения потока
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
