import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Plus, Trash2, Save, Copy } from 'lucide-react';
import { ChecklistItem } from '../types/task';

interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  items: Omit<ChecklistItem, 'completed'>[];
}

interface FullKitTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate?: (template: ChecklistTemplate) => void;
}

export function FullKitTemplatesDialog({
  open,
  onOpenChange,
  onSelectTemplate,
}: FullKitTemplatesDialogProps) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([
    {
      id: '1',
      name: 'Разработка функционала',
      description: 'Стандартный чек-лист для разработки нового функционала',
      items: [
        { id: '1-1', title: 'Утверждены требования' },
        { id: '1-2', title: 'Создан дизайн макет' },
        { id: '1-3', title: 'Готова техническая спецификация' },
        { id: '1-4', title: 'Доступна тестовая среда' },
        { id: '1-5', title: 'Готовы тестовые данные' },
      ],
    },
    {
      id: '2',
      name: 'Тестирование',
      description: 'Чек-лист для полного тестирования',
      items: [
        { id: '2-1', title: 'Готов код для тестирования' },
        { id: '2-2', title: 'Написаны тест-кейсы' },
        { id: '2-3', title: 'Доступна тестовая среда' },
        { id: '2-4', title: 'Подготовлены тестовые данные' },
      ],
    },
    {
      id: '3',
      name: 'Релиз',
      description: 'Подготовка к релизу в production',
      items: [
        { id: '3-1', title: 'Все тесты пройдены' },
        { id: '3-2', title: 'Обновлена документация' },
        { id: '3-3', title: 'Создан релизный changelog' },
        { id: '3-4', title: 'Настроен мониторинг' },
        { id: '3-5', title: 'План отката готов' },
      ],
    },
  ]);

  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');

  const startNewTemplate = () => {
    const newTemplate: ChecklistTemplate = {
      id: Date.now().toString(),
      name: 'Новый шаблон',
      description: '',
      items: [],
    };
    setEditingTemplate(newTemplate);
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;

    const exists = templates.find(t => t.id === editingTemplate.id);
    if (exists) {
      setTemplates(templates.map(t => (t.id === editingTemplate.id ? editingTemplate : t)));
    } else {
      setTemplates([...templates, editingTemplate]);
    }
    setEditingTemplate(null);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const duplicateTemplate = (template: ChecklistTemplate) => {
    const newTemplate: ChecklistTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (копия)`,
      items: template.items.map(item => ({
        ...item,
        id: `${Date.now()}-${item.id}`,
      })),
    };
    setTemplates([...templates, newTemplate]);
  };

  const addItemToEditingTemplate = () => {
    if (!editingTemplate || !newItemTitle.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      title: newItemTitle,
    };

    setEditingTemplate({
      ...editingTemplate,
      items: [...editingTemplate.items, newItem],
    });
    setNewItemTitle('');
  };

  const removeItemFromEditingTemplate = (itemId: string) => {
    if (!editingTemplate) return;

    setEditingTemplate({
      ...editingTemplate,
      items: editingTemplate.items.filter(item => item.id !== itemId),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Шаблоны "Полного комплекта"</DialogTitle>
          <DialogDescription>
            Создавайте и управляйте шаблонами чек-листов для быстрого применения к задачам
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 h-[70vh]">
          {/* Список шаблонов */}
          <div className="w-1/3 border-r pr-4">
            <div className="mb-4">
              <Button onClick={startNewTemplate} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Создать шаблон
              </Button>
            </div>

            <ScrollArea className="h-[calc(100%-60px)]">
              <div className="space-y-2">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      editingTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setEditingTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm">{template.name}</h4>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTemplate(template);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                    <div className="text-xs text-gray-500">{template.items.length} пунктов</div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Редактирование шаблона */}
          <div className="flex-1">
            {editingTemplate ? (
              <div className="h-full flex flex-col">
                <div className="space-y-4 mb-4">
                  <div>
                    <Label>Название шаблона</Label>
                    <Input
                      value={editingTemplate.name}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, name: e.target.value })
                      }
                      placeholder="Введите название"
                    />
                  </div>
                  <div>
                    <Label>Описание</Label>
                    <Input
                      value={editingTemplate.description}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, description: e.target.value })
                      }
                      placeholder="Введите описание"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <Label className="mb-2 block">Пункты чек-листа</Label>
                  <ScrollArea className="h-[calc(100%-100px)] mb-4">
                    <div className="space-y-2 pr-4">
                      {editingTemplate.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                        >
                          <Checkbox disabled />
                          <span className="flex-1 text-sm">{item.title}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItemFromEditingTemplate(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2">
                    <Input
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      placeholder="Добавить пункт..."
                      onKeyPress={(e) => e.key === 'Enter' && addItemToEditingTemplate()}
                    />
                    <Button onClick={addItemToEditingTemplate}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button onClick={saveTemplate} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить шаблон
                  </Button>
                  {onSelectTemplate && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onSelectTemplate(editingTemplate);
                        onOpenChange(false);
                      }}
                    >
                      Применить к задаче
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="mb-2">Выберите шаблон для редактирования</p>
                  <p className="text-sm">или создайте новый</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
