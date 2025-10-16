import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { BufferIndicator } from './BufferIndicator';
import { Task, ChecklistItem, Comment, FileAttachment, ActivityLogEntry } from '../types/task';
import {
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Paperclip,
  Plus,
  Shield,
  Trash2,
  Upload,
  User,
  Users,
  Activity,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Card } from './ui/card';

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedTask: Task) => void;
  availableUsers?: string[];
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onUpdate,
  availableUsers = ['Анна Иванова', 'Петр Сидоров', 'Мария Петрова', 'Иван Смирнов', 'Ольга Козлова'],
}: TaskDetailDialogProps) {
  const [localTask, setLocalTask] = useState<Task | null>(task);
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  if (!task || !localTask) return null;

  const updateLocalTask = (updates: Partial<Task>) => {
    const updated = { ...localTask, ...updates };
    setLocalTask(updated);
    onUpdate(updated);
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Текущий пользователь',
      text: newComment,
      timestamp: new Date().toISOString(),
    };

    const logEntry: ActivityLogEntry = {
      id: Date.now().toString(),
      user: 'Текущий пользователь',
      action: 'Добавлен комментарий',
      timestamp: new Date().toISOString(),
    };

    updateLocalTask({
      comments: [...localTask.comments, comment],
      activityLog: [...localTask.activityLog, logEntry],
    });
    setNewComment('');
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    const item: ChecklistItem = {
      id: Date.now().toString(),
      title: newChecklistItem,
      completed: false,
    };

    updateLocalTask({
      fullKitStatus: {
        ...localTask.fullKitStatus,
        checklist: [...localTask.fullKitStatus.checklist, item],
      },
    });
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = localTask.fullKitStatus.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const allCompleted = updatedChecklist.every(item => item.completed);

    updateLocalTask({
      fullKitStatus: {
        checklist: updatedChecklist,
        isComplete: allCompleted,
      },
    });
  };

  const removeChecklistItem = (itemId: string) => {
    const updatedChecklist = localTask.fullKitStatus.checklist.filter(item => item.id !== itemId);
    const allCompleted = updatedChecklist.every(item => item.completed);

    updateLocalTask({
      fullKitStatus: {
        checklist: updatedChecklist,
        isComplete: allCompleted,
      },
    });
  };

  const toggleAssignee = (user: string) => {
    const isAssigned = localTask.assignees.includes(user);
    const updatedAssignees = isAssigned
      ? localTask.assignees.filter(u => u !== user)
      : [...localTask.assignees, user];

    updateLocalTask({ assignees: updatedAssignees });
  };

  const getConstraintBadgeColor = () => {
    switch (localTask.constraintType) {
      case 'drum':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'constraint':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completedItems = localTask.fullKitStatus.checklist.filter(i => i.completed).length;
  const totalItems = localTask.fullKitStatus.checklist.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Input
                value={localTask.title}
                onChange={(e) => updateLocalTask({ title: e.target.value })}
                className="mb-2 border-none p-0 text-2xl h-auto focus-visible:ring-0"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className={getConstraintBadgeColor()}>
                  {localTask.constraintType === 'drum' && '🥁 Барабан'}
                  {localTask.constraintType === 'constraint' && '⚠️ Ограничение'}
                  {localTask.constraintType === 'none' && 'Обычная задача'}
                </Badge>
                {localTask.fullKitStatus.isComplete && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Комплект
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Детали</TabsTrigger>
              <TabsTrigger value="checklist">Комплект</TabsTrigger>
              <TabsTrigger value="comments">
                Комментарии ({localTask.comments.length})
              </TabsTrigger>
              <TabsTrigger value="activity">История</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[60vh]">
            <div className="px-6 py-4">
              <TabsContent value="details" className="mt-0 space-y-6">
                {/* Основная информация */}
                <Card className="p-4">
                  <h3 className="mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Основная информация
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Описание</Label>
                      <Textarea
                        value={localTask.description}
                        onChange={(e) => updateLocalTask({ description: e.target.value })}
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Приоритет</Label>
                        <Select
                          value={localTask.priority}
                          onValueChange={(value: 'low' | 'medium' | 'high') =>
                            updateLocalTask({ priority: value })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Низкий</SelectItem>
                            <SelectItem value="medium">Средний</SelectItem>
                            <SelectItem value="high">Высокий</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Дедлайн</Label>
                        <Input
                          type="date"
                          value={localTask.dueDate}
                          onChange={(e) => updateLocalTask({ dueDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Команда */}
                <Card className="p-4">
                  <h3 className="mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Команда
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <User className="h-3 w-3" />
                        Постановщик
                      </Label>
                      <Input value={localTask.creator} disabled className="bg-gray-50" />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Users className="h-3 w-3" />
                        Ответственные
                      </Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {localTask.assignees.map((assignee) => (
                          <Badge key={assignee} variant="secondary" className="gap-1">
                            {assignee}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-red-600"
                              onClick={() => toggleAssignee(assignee)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={toggleAssignee}>
                        <SelectTrigger>
                          <SelectValue placeholder="Добавить ответственного" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers
                            .filter(u => !localTask.assignees.includes(u))
                            .map(user => (
                              <SelectItem key={user} value={user}>
                                {user}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Shield className="h-3 w-3" />
                        Страж ворот
                      </Label>
                      <Select
                        value={localTask.gatekeeper || ''}
                        onValueChange={(value) => updateLocalTask({ gatekeeper: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выбрать стража ворот" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map(user => (
                            <SelectItem key={user} value={user}>
                              {user}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* ТОС параметры */}
                <Card className="p-4">
                  <h3 className="mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Параметры ТОС
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Clock className="h-3 w-3" />
                        50%-ная оценка длительности (часы)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={localTask.durationEstimate50 || ''}
                        onChange={(e) =>
                          updateLocalTask({ durationEstimate50: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="Введите оценку в часах"
                      />
                    </div>

                    <div>
                      <BufferIndicator
                        consumption={localTask.bufferConsumption}
                        className="w-full"
                      />
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={localTask.bufferConsumption}
                        onChange={(e) =>
                          updateLocalTask({ bufferConsumption: parseInt(e.target.value) })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-3 w-3" />
                          Тип ограничения
                        </Label>
                        <Select
                          value={localTask.constraintType || 'none'}
                          onValueChange={(value: 'drum' | 'constraint' | 'none') =>
                            updateLocalTask({ constraintType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Нет</SelectItem>
                            <SelectItem value="drum">Барабан (Drum)</SelectItem>
                            <SelectItem value="constraint">Ограничение</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Ресурс-ограничение</Label>
                        <Input
                          value={localTask.constraintResource || ''}
                          onChange={(e) => updateLocalTask({ constraintResource: e.target.value })}
                          placeholder="Укажите ресурс"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Даты */}
                <Card className="p-4">
                  <h3 className="mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Временные метки
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-600">Дата создания</Label>
                      <p>{new Date(localTask.createdAt).toLocaleDateString('ru-RU')}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Дедлайн</Label>
                      <p>
                        {localTask.dueDate
                          ? new Date(localTask.dueDate).toLocaleDateString('ru-RU')
                          : 'Не указан'}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Вложения */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Прикрепленные файлы ({localTask.attachments.length})
                    </h3>
                    <Button size="sm" variant="outline">
                      <Upload className="h-3 w-3 mr-2" />
                      Загрузить
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {localTask.attachments.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Нет прикрепленных файлов
                      </p>
                    ) : (
                      localTask.attachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <div>
                              <p className="text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {file.size} • {file.uploadedBy} •{' '}
                                {new Date(file.uploadedAt).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="checklist" className="mt-0 space-y-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Чек-лист "Полного комплекта"
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {completedItems} из {totalItems} выполнено
                      </p>
                    </div>
                    {localTask.fullKitStatus.isComplete && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        ✓ Завершено
                      </Badge>
                    )}
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{
                        width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    {localTask.fullKitStatus.checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => toggleChecklistItem(item.id)}
                        />
                        <span
                          className={`flex-1 ${
                            item.completed ? 'line-through text-gray-500' : ''
                          }`}
                        >
                          {item.title}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeChecklistItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Добавить пункт..."
                      onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                    />
                    <Button onClick={addChecklistItem}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="mt-0 space-y-4">
                <Card className="p-4">
                  <h3 className="mb-4 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Комментарии
                  </h3>

                  <div className="space-y-4 mb-4">
                    {localTask.comments.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Комментариев пока нет
                      </p>
                    ) : (
                      localTask.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {comment.author
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{comment.author}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.timestamp).toLocaleString('ru-RU')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex gap-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Добавить комментарий..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={addComment} className="mt-2">
                    Отправить
                  </Button>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-0 space-y-4">
                <Card className="p-4">
                  <h3 className="mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Журнал активности
                  </h3>

                  <div className="space-y-3">
                    {localTask.activityLog.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        История пуста
                      </p>
                    ) : (
                      localTask.activityLog.map((entry) => (
                        <div key={entry.id} className="flex gap-3 pb-3 border-b last:border-0">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{entry.user}</span> {entry.action}
                            </p>
                            {entry.details && (
                              <p className="text-xs text-gray-600 mt-1">{entry.details}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(entry.timestamp).toLocaleString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}