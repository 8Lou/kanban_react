import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanColumn } from './components/KanbanColumn';
import { AddTaskDialog } from './components/AddTaskDialog';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { WIPLimitSettings } from './components/WIPLimitSettings';
import { TaskDetailDialog } from './components/TaskDetailDialog';
import { BufferReportDialog } from './components/BufferReportDialog';
import { FullKitTemplatesDialog } from './components/FullKitTemplatesDialog';
import { LayoutGrid, Settings, BarChart3, ClipboardList } from 'lucide-react';
import { Button } from './components/ui/button';
import { Task } from './types/task';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Разработать дизайн главной страницы',
      description: 'Создать макет в Figma с учетом брендбука компании',
      status: 'todo',
      priority: 'high',
      assignees: ['Анна Иванова'],
      creator: 'Иван Менеджер',
      createdAt: '2025-10-10T10:00:00',
      dueDate: '2025-10-20',
      fullKitStatus: {
        isComplete: false,
        checklist: [
          { id: '1-1', title: 'Собрать референсы', completed: true },
          { id: '1-2', title: 'Создать цветовую палитру', completed: false },
          { id: '1-3', title: 'Утвердить типографику', completed: false },
        ],
      },
      durationEstimate50: 16,
      bufferConsumption: 25,
      constraintType: 'drum',
      constraintResource: 'Дизайнер',
      gatekeeper: 'Петр Сидоров',
      attachments: [],
      comments: [],
      activityLog: [
        {
          id: 'log-1',
          user: 'Иван Менеджер',
          action: 'создал задачу',
          timestamp: '2025-10-10T10:00:00',
        },
      ],
    },
    {
      id: '2',
      title: 'Настроить CI/CD pipeline',
      description: 'Автоматизировать процесс деплоя на production',
      status: 'todo',
      priority: 'medium',
      assignees: ['Петр Сидоров'],
      creator: 'Иван Менеджер',
      createdAt: '2025-10-11T09:00:00',
      dueDate: '2025-10-22',
      fullKitStatus: {
        isComplete: true,
        checklist: [
          { id: '2-1', title: 'Настроить GitHub Actions', completed: true },
          { id: '2-2', title: 'Подключить тестовый сервер', completed: true },
        ],
      },
      durationEstimate50: 8,
      bufferConsumption: 15,
      constraintType: 'none',
      attachments: [],
      comments: [],
      activityLog: [
        {
          id: 'log-2',
          user: 'Иван Менеджер',
          action: 'создал задачу',
          timestamp: '2025-10-11T09:00:00',
        },
      ],
    },
    {
      id: '3',
      title: 'Провести код-ревью',
      description: 'Проверить pull request от команды backend',
      status: 'inProgress',
      priority: 'high',
      assignees: ['Мария Петрова', 'Иван Смирнов'],
      creator: 'Иван Менеджер',
      createdAt: '2025-10-12T11:00:00',
      dueDate: '2025-10-16',
      fullKitStatus: {
        isComplete: false,
        checklist: [
          { id: '3-1', title: 'Проверить код', completed: true },
          { id: '3-2', title: 'Запустить тесты', completed: false },
          { id: '3-3', title: 'Оставить комментарии', completed: false },
        ],
      },
      durationEstimate50: 4,
      bufferConsumption: 70,
      constraintType: 'constraint',
      constraintResource: 'Код-ревьюер',
      gatekeeper: 'Мария Петрова',
      attachments: [],
      comments: [
        {
          id: 'c1',
          author: 'Мария Петрова',
          text: 'Начала проверку, нашла несколько моментов',
          timestamp: '2025-10-13T14:30:00',
        },
      ],
      activityLog: [
        {
          id: 'log-3',
          user: 'Иван Менеджер',
          action: 'создал задачу',
          timestamp: '2025-10-12T11:00:00',
        },
        {
          id: 'log-3-1',
          user: 'Мария Петрова',
          action: 'взяла в работу',
          timestamp: '2025-10-13T10:00:00',
        },
      ],
    },
    {
      id: '4',
      title: 'Написать юнит-тесты',
      description: 'Покрыть тестами новый функционал модуля аутентификации',
      status: 'inProgress',
      priority: 'medium',
      assignees: ['Иван Смирнов'],
      creator: 'Иван Менеджер',
      createdAt: '2025-10-13T08:00:00',
      dueDate: '2025-10-18',
      fullKitStatus: {
        isComplete: false,
        checklist: [
          { id: '4-1', title: 'Написать тесты для login', completed: true },
          { id: '4-2', title: 'Написать тесты для logout', completed: false },
        ],
      },
      durationEstimate50: 6,
      bufferConsumption: 45,
      constraintType: 'none',
      attachments: [],
      comments: [],
      activityLog: [
        {
          id: 'log-4',
          user: 'Иван Менеджер',
          action: 'создал задачу',
          timestamp: '2025-10-13T08:00:00',
        },
      ],
    },
    {
      id: '5',
      title: 'Обновить документацию API',
      description: 'Добавить описание новых endpoint\'ов в Swagger',
      status: 'done',
      priority: 'low',
      assignees: ['Ольга Козлова'],
      creator: 'Иван Менеджер',
      createdAt: '2025-10-08T10:00:00',
      dueDate: '2025-10-14',
      fullKitStatus: {
        isComplete: true,
        checklist: [
          { id: '5-1', title: 'Описать новые endpoints', completed: true },
          { id: '5-2', title: 'Добавить примеры запросов', completed: true },
        ],
      },
      durationEstimate50: 3,
      bufferConsumption: 100,
      constraintType: 'none',
      attachments: [
        {
          id: 'f1',
          name: 'API_documentation.pdf',
          size: '2.4 MB',
          uploadedBy: 'Ольга Козлова',
          uploadedAt: '2025-10-14T16:00:00',
        },
      ],
      comments: [],
      activityLog: [
        {
          id: 'log-5',
          user: 'Иван Менеджер',
          action: 'создал задачу',
          timestamp: '2025-10-08T10:00:00',
        },
        {
          id: 'log-5-1',
          user: 'Ольга Козлова',
          action: 'завершила задачу',
          timestamp: '2025-10-14T16:00:00',
        },
      ],
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('todo');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [bufferReportOpen, setBufferReportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [wipLimits, setWipLimits] = useState({
    todo: 10,
    inProgress: 3,
    done: 20,
    archive: 100,
  });

  const handleDrop = (taskId: string, newStatus: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleSaveLimits = (newLimits) => {
    setWipLimits(newLimits);
  };

  const handleAddTask = (status: string) => {
    setCurrentStatus(status);
    setDialogOpen(true);
  };

  const handleCreateTask = (taskData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    assignee: string;
    dueDate: string;
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      assignees: taskData.assignee ? [taskData.assignee] : [],
      creator: 'Текущий пользователь',
      createdAt: new Date().toISOString(),
      dueDate: taskData.dueDate,
      status: currentStatus,
      fullKitStatus: {
        isComplete: false,
        checklist: [],
      },
      bufferConsumption: 0,
      constraintType: 'none',
      attachments: [],
      comments: [],
      activityLog: [
        {
          id: Date.now().toString(),
          user: 'Текущий пользователь',
          action: 'создал задачу',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setTaskDetailOpen(true);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const handleSaveWIPLimits = (limits: typeof wipLimits) => {
    setWipLimits(limits);
  };

  const columns = [
    { title: 'Очередь', status: 'todo' },
    { title: 'В работе', status: 'inProgress' },
    { title: 'На проверке', status: 'done' },
    { title: 'Архив', status: 'done' },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <LayoutGrid className="h-8 w-8 text-blue-600" />
                <h1 className="text-slate-800">Канбан доска ТОС</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTemplatesOpen(true)}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Шаблоны
                </Button>
                <Button variant="outline" onClick={() => setBufferReportOpen(true)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Отчеты
                </Button>
                <Button variant="outline" onClick={() => setSettingsOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  WIP-лимиты
                </Button>
              </div>
            </div>
            <p className="text-slate-600">
              Управляйте задачами проекта по методологии Теории ограничений систем (ТОС)
            </p>
          </div>

          <PerformanceMetrics tasks={tasks} />

          <div className="flex gap-6 overflow-x-auto pb-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.status}
                title={column.title}
                status={column.status}
                tasks={tasks.filter((task) => task.status === column.status)}
                wipLimit={wipLimits[column.status as keyof typeof wipLimits]}
                onDrop={handleDrop}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>
        </div>

        <AddTaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onAdd={handleCreateTask}
        />

        <WIPLimitSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          currentLimits={wipLimits}
          onSave={handleSaveWIPLimits}
        />

        <TaskDetailDialog
          task={selectedTask}
          open={taskDetailOpen}
          onOpenChange={setTaskDetailOpen}
          onUpdate={handleTaskUpdate}
        />

        <BufferReportDialog
          tasks={tasks}
          open={bufferReportOpen}
          onOpenChange={setBufferReportOpen}
        />

        <FullKitTemplatesDialog
          open={templatesOpen}
          onOpenChange={setTemplatesOpen}
        />
      </div>
    </DndProvider>
  );
}