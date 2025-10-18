import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (task: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    assignee: string;
    dueDate: string;
    durationEstimate50: number;
  }) => void;
}

export function AddTaskDialog({ open, onOpenChange, onAdd }: AddTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [durationEstimate50, setDurationEstimate50] = useState<number>(0);
  const [estimateError, setEstimateError] = useState('');

  const handleSubmit = () => {
    // Валидация 50%-ной оценки
    if (!durationEstimate50 || durationEstimate50 <= 0) {
      setEstimateError('Обязательно укажите сокращенную оценку времени (50% от обычной)');
      return;
    }
    
    if (title.trim()) {
      onAdd({
        title,
        description,
        priority,
        assignee,
        dueDate,
        durationEstimate50,
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignee('');
      setDueDate('');
      setDurationEstimate50(0);
      setEstimateError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Добавить новую задачу</DialogTitle>
          <DialogDescription>
            Заполните информацию о задаче. Нажмите "Сохранить" когда закончите.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Название задачи</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название задачи"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание задачи"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority">Приоритет</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Выберите приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="assignee">Исполнитель</Label>
            <Input
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Введите имя исполнителя"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Срок выполнения</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              50%-ная оценка времени (часы) *
              <span className="text-xs text-orange-600 font-normal">
                ⚠️ Принцип ТОС
              </span>
            </Label>
            <Input
              id="duration"
              type="number"
              min="0.5"
              step="0.5"
              value={durationEstimate50 || ''}
              onChange={(e) => {
                setDurationEstimate50(Number(e.target.value));
                setEstimateError('');
              }}
              placeholder="Например: обычно 8 часов → укажите 4"
              className={estimateError ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-600">
              💡 Укажите <strong>сокращенную оценку без запасов времени</strong>. 
              Остальные 50% автоматически добавятся в буфер потока.
            </p>
            {estimateError && (
              <p className="text-xs text-red-600">{estimateError}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
