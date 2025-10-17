import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanColumn } from './components/KanbanColumn';
import { AddTaskDialog } from './components/AddTaskDialog';
import { MetricsGrid } from './components/MetricsGrid';
import { PriorityDistribution } from './components/PriorityDistribution';
import { WIPLimitSettings } from './components/WIPLimitSettings';
import { TaskDetailDialog } from './components/TaskDetailDialog';
import { BufferReportDialog } from './components/BufferReportDialog';
import { FullKitTemplatesDialog } from './components/FullKitTemplatesDialog';
import { RopeControl } from './components/RopeControl';
import { TOCDashboard } from './components/TOCDashboard';
import { LayoutGrid, Settings, BarChart3, ClipboardList, Anchor, AlertTriangle } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Task } from './types/task';
import { ToastContainer } from './components/ui/toast-container';
import { 
  identifyConstraint, 
  canStartNewTask, 
  validateFullKit,
  sortTasksByPriority,
  calculateFlowBuffer,
} from './utils/toc-calculations';
import { toast } from './utils/toast';

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
  const [ropeControlOpen, setRopeControlOpen] = useState(false);
  const [wipLimits, setWipLimits] = useState({
    todo: 10,
    inProgress: 3,
    done: 20,
  });

  // Автоматическое определение ограничения
  const [detectedConstraint, setDetectedConstraint] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/tasks')
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  useEffect(() => {
    const tasksByStatus = {
      todo: tasks.filter(t => t.status === 'todo'),
      inProgress: tasks.filter(t => t.status === 'inProgress'),
      done: tasks.filter(t => t.status === 'done'),
    };
    
    const constraint = identifyConstraint(tasksByStatus, wipLimits);
    if (constraint !== detectedConstraint) {
      setDetectedConstraint(constraint);
      if (constraint) {
        toast.warning(`Обнаружено ограничение в колонке: ${
          constraint === 'todo' ? 'К выполнению' : 
          constraint === 'inProgress' ? 'В работе' : 
          'Выполнено'
        }`);
      }
    }
  }, [tasks, wipLimits]);

  const handleDrop = (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Проверка Full-kit при переходе в "В работе"
    if (newStatus === 'inProgress' && task.status === 'todo') {
      const validation = validateFullKit(task);
      if (!validation.valid) {
        toast.error('Ворота Full-kit закрыты', {
          description: 'Завершите подготовку полного комплекта перед началом работы',
        });
        return;
      }
    }

    // Проверка WIP-лимита
    const targetTasks = tasks.filter(t => t.status === newStatus);
    const limit = wipLimits[newStatus as keyof typeof wipLimits];
    
    if (targetTasks.length >= limit) {
      toast.error('WIP-лимит превышен', {
        description: `В колонке "${
          newStatus === 'todo' ? 'К выполнению' : 
          newStatus === 'inProgress' ? 'В работе' : 
          'Выполнено'
        }" достигнут лимит (${limit} задач)`,
      });
      return;
    }

    // Обновляем задачу
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          const activityEntry = {
            id: Date.now().toString(),
            user: 'Текущий пользователь',
            action: `переместил задачу в "${
              newStatus === 'todo' ? 'Очередь' : 
              newStatus === 'inProgress' ? 'В работе' : 
              'На проверке'
            }"`,
            timestamp: new Date().toISOString(),
          };
          
          return {
            ...t,
            status: newStatus,
            activityLog: [...t.activityLog, activityEntry],
          };
        }
        return t;
      })
    );

    toast.success('Задача перемещена');
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
    toast.success('WIP-лимиты обновлены');
  };

  // Сортировка задач по автоматическому приоритету
  const getSortedTasks = (status: string) => {
    const statusTasks = tasks.filter(t => t.status === status);
    return sortTasksByPriority(statusTasks);
  };

  // Расчет загрузки ограничения
  const getConstraintLoad = () => {
    if (!detectedConstraint) return 0;
    const constraintTasks = tasks.filter(t => t.status === detectedConstraint);
    const limit = wipLimits[detectedConstraint as keyof typeof wipLimits];
    return (constraintTasks.length / limit) * 100;
  };

  // Проверка возможности запуска новой задачи
  const checkCanStartNew = (status: string) => {
    const currentTasks = tasks.filter(t => t.status === status);
    const limit = wipLimits[status as keyof typeof wipLimits];
    const constraintTasks = detectedConstraint ? tasks.filter(t => t.status === detectedConstraint) : [];
    
    return canStartNewTask(
      currentTasks.length,
      limit,
      detectedConstraint || '',
      status,
      constraintTasks
    );
  };

  const columns = [
    { title: 'Очередь', status: 'todo' },
    { title: 'В работе', status: 'inProgress' },
    { title: 'На проверке', status: 'done' },
    { title: 'Архив', status: 'archive' },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <LayoutGrid className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-slate-800">Канбан доска ТОС</h1>
                  {detectedConstraint && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ Обнаружено ограничение: {
                        detectedConstraint === 'todo' ? 'К выполнению' : 
                        detectedConstraint === 'inProgress' ? 'В работе' : 
                        'Выполнено'
                      }
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setRopeControlOpen(!ropeControlOpen)}>
                  <Anchor className="h-4 w-4 mr-2" />
                  Канат
                </Button>
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

          <div className="flex flex-col mb-2">
            <MetricsGrid tasks={tasks} />
            {/* Дашборд ТОС */}
            <TOCDashboard tasks={tasks} detectedConstraint={detectedConstraint} />
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4">
            {columns.map((column) => {
              const isConstraint = column.status === detectedConstraint;
              return (
                <div key={column.status} className="relative">
                  {isConstraint && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Ограничение (Барабан)
                      </div>
                    </div>
                  )}
                  <KanbanColumn
                    title={column.title}
                    status={column.status}
                    tasks={getSortedTasks(column.status)}
                    wipLimit={wipLimits[column.status as keyof typeof wipLimits]}
                    onDrop={handleDrop}
                    onAddTask={handleAddTask}
                    onDeleteTask={handleDeleteTask}
                    onTaskClick={handleTaskClick}
                  />
                </div>
              );
            })}
          </div>

          <PriorityDistribution tasks={tasks} />
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

        <ToastContainer />
      </div>
    </DndProvider>
  );
}