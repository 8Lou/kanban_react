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
import { useState, useEffect } from 'react';

interface WIPLimits {
  todo: number;
  inProgress: number;
  done: number;
  archive: number;
}

interface WIPLimitSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLimits: WIPLimits;
  onSave: (limits: WIPLimits) => void;
}

export function WIPLimitSettings({ open, onOpenChange, currentLimits, onSave }: WIPLimitSettingsProps) {
  const [limits, setLimits] = useState<WIPLimits>(currentLimits);

  useEffect(() => {
    setLimits(currentLimits);
  }, [currentLimits]);

  const handleSubmit = () => {
    onSave(limits);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Настройка WIP-лимитов</DialogTitle>
          <DialogDescription>
            Установите максимальное количество задач для каждой колонки. Превышение лимита будет подсвечено.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="todo-limit">Очередь задач (Backlog)</Label>
            <Input
              id="todo-limit"
              type="number"
              min="0"
              value={limits.todo}
              onChange={(e) => setLimits({ ...limits, todo: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="inProgress-limit">В работе</Label>
            <Input
              id="inProgress-limit"
              type="number"
              min="0"
              value={limits.inProgress}
              onChange={(e) => setLimits({ ...limits, inProgress: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="done-limit">На проверке</Label>
            <Input
              id="done-limit"
              type="number"
              min="0"
              value={limits.done}
              onChange={(e) => setLimits({ ...limits, done: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="archive-limit">Архив</Label>
            <Input
              id="archive-limit"
              type="number"
              min="0"
              value={limits.archive}
              onChange={(e) => setLimits({ ...limits, archive: parseInt(e.target.value) || 0 })}
            />
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