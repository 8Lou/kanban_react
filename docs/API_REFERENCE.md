# API Reference - Kanban Board ТОС

Документация по API и внутренним функциям приложения.

## 📡 REST API (JSON Server)

### Base URL
```
http://localhost:3001
```

### Endpoints

#### Tasks

##### GET /tasks
Получить все задачи

**Response:**
```json
{
  "tasks": [
    {
      "id": "1",
      "title": "Разработать API",
      "description": "Создать REST API для управления задачами",
      "status": "todo",
      "priority": "high",
      "assignees": ["Иван Иванов"],
      "creator": "Менеджер проекта",
      "createdAt": "2024-01-15T10:00:00Z",
      "dueDate": "2024-01-20",
      "durationEstimate50": 4,
      "bufferConsumption": 25,
      "constraintType": "none",
      "constraintResource": null,
      "gatekeeper": "Тимлид",
      "fullKitStatus": {
        "isComplete": true,
        "checklist": [
          {
            "id": "1",
            "title": "Утверждены требования",
            "completed": true
          }
        ]
      },
      "attachments": [],
      "comments": [],
      "activityLog": []
    }
  ]
}
```

##### POST /tasks
Создать новую задачу

**Request Body:**
```json
{
  "title": "Новая задача",
  "description": "Описание задачи",
  "priority": "medium",
  "assignees": ["Исполнитель"],
  "dueDate": "2024-01-25",
  "durationEstimate50": 2,
  "status": "todo"
}
```

##### PUT /tasks/:id
Обновить задачу

**Request Body:** Полный объект задачи

##### DELETE /tasks/:id
Удалить задачу

## 🧮 ТОС Calculations API

### Core Functions

#### identifyConstraint()
Автоматическое определение ограничения системы

```typescript
function identifyConstraint(
  tasksByStatus: Record<string, Task[]>,
  wipLimits: Record<string, number>
): string | null

// Пример использования
const tasksByStatus = {
  todo: tasks.filter(t => t.status === 'todo'),
  inProgress: tasks.filter(t => t.status === 'inProgress'),
  done: tasks.filter(t => t.status === 'done')
};

const wipLimits = { todo: 10, inProgress: 3, done: 20 };
const constraint = identifyConstraint(tasksByStatus, wipLimits);
// Возвращает: "inProgress" | null
```

**Алгоритм:**
1. Для каждой колонки рассчитывает превышение лимита
2. Находит колонку с максимальным превышением > 20%
3. Возвращает статус колонки-ограничения или null

#### canStartNewTask()
Проверка возможности запуска новой задачи (логика "Каната")

```typescript
function canStartNewTask(
  currentWIP: number,
  wipLimit: number,
  constraintStatus: string,
  targetStatus: string,
  constraintTasks: Task[]
): { allowed: boolean; reason?: string }

// Пример использования
const result = canStartNewTask(
  3,              // текущий WIP
  3,              // лимит WIP
  "inProgress",   // статус ограничения
  "inProgress",   // целевой статус
  constraintTasks // задачи в ограничении
);
// Возвращает: { allowed: false, reason: "WIP-лимит достигнут" }
```

**Проверки:**
1. WIP-лимит не превышен
2. Ограничение не перегружено
3. Возвращает разрешение и причину блокировки

#### validateFullKit()
Валидация полного комплекта перед началом работы

```typescript
function validateFullKit(task: Task): { 
  valid: boolean; 
  missingItems: string[] 
}

// Пример использования
const validation = validateFullKit(task);
// Возвращает: { 
//   valid: false, 
//   missingItems: ["Не указана 50%-ная оценка", "Не назначены ответственные"] 
// }
```

**Проверяет:**
- Завершенность чек-листа
- Наличие 50%-ной оценки
- Назначенных ответственных
- Другие обязательные поля

#### calculateTaskPriority()
Автоматический расчет приоритета задачи по ТОС

```typescript
function calculateTaskPriority(task: Task): number

// Пример использования
const priority = calculateTaskPriority(task);
// Возвращает: 85 (0-100 баллов)
```

**Факторы приоритета:**
- Ручной приоритет (10 баллов)
- Критичность буфера (30 баллов)
- Тип ограничения (20 баллов)
- Full-kit готовность (15 баллов)
- Срочность дедлайна (25 баллов)

#### calculateFlowBuffer()
Расчет размера буфера потока

```typescript
function calculateFlowBuffer(tasks: Task[]): number

// Пример использования
const buffer = calculateFlowBuffer(tasks);
// Возвращает: 12 (часов - 50% от общей длительности)
```

#### calculateBufferConsumption()
Расчет процента потребления буфера для задачи

```typescript
function calculateBufferConsumption(
  task: Task,
  flowBuffer: number,
  actualTimeSpent: number
): number

// Пример использования
const consumption = calculateBufferConsumption(task, 10, 8);
// Возвращает: 60 (процент потребления буфера)
```

#### sortTasksByPriority()
Сортировка задач по автоматическому приоритету

```typescript
function sortTasksByPriority(tasks: Task[]): Task[]

// Пример использования
const sortedTasks = sortTasksByPriority(tasks);
// Возвращает: массив задач, отсортированный по убыванию приоритета
```

#### performTriage()
Триаж задач для определения кандидатов на отмену

```typescript
function performTriage(tasks: Task[]): {
  highValue: Task[];
  lowValue: Task[];
  shouldCancel: Task[];
}

// Пример использования
const triage = performTriage(tasks);
// Возвращает: {
//   highValue: [...],     // Высокоценные задачи
//   lowValue: [...],      // Низкоценные задачи  
//   shouldCancel: [...]   // Кандидаты на отмену
// }
```

#### calculateFlowMetrics()
Расчет метрик потока

```typescript
function calculateFlowMetrics(tasks: Task[]): {
  throughput: number;
  avgCycleTime: number;
  avgLeadTime: number;
  wip: number;
}

// Пример использования
const metrics = calculateFlowMetrics(tasks);
// Возвращает: {
//   throughput: 15,      // Количество завершенных задач
//   avgCycleTime: 3.2,   // Средний цикл (часы)
//   avgLeadTime: 4.8,    // Средний lead time (часы)
//   wip: 8               // Текущий WIP
// }
```

## 🎨 Component API

### KanbanCard

```typescript
interface KanbanCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onClick?: (id: string) => void;
  showFullKitGate?: boolean;
}

// Использование
<KanbanCard
  task={task}
  onDelete={handleDelete}
  onClick={handleClick}
  showFullKitGate={true}
/>
```

### FullKitGate

```typescript
interface FullKitGateProps {
  task: Task;
  onApprove?: () => void;
  onReject?: () => void;
  compact?: boolean;
}

// Использование
<FullKitGate
  task={task}
  onApprove={handleApprove}
  onReject={handleReject}
  compact={false}
/>
```

### BufferStatusReport

```typescript
interface BufferStatusReportProps {
  tasks: Task[];
}

// Использование
<BufferStatusReport tasks={tasks} />
```

### Progress (с буферными зонами)

```typescript
interface ProgressProps {
  value: number;
  showBufferZones?: boolean;
  className?: string;
}

// Использование
<Progress 
  value={75} 
  showBufferZones={true}
  className="h-4"
/>
```

## 📊 Data Types

### Task Interface

```typescript
interface Task {
  // Базовые поля
  id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  assignees: string[];
  creator: string;
  createdAt: string;
  dueDate?: string;
  
  // ТОС-специфичные поля
  durationEstimate50?: number;    // 50%-ная оценка в часах
  bufferConsumption: number;      // Потребление буфера (0-100%)
  constraintType?: 'drum' | 'constraint' | 'none';
  constraintResource?: string;    // Ресурс-ограничение
  gatekeeper?: string;           // Страж ворот
  
  // Full-kit статус
  fullKitStatus: {
    isComplete: boolean;
    checklist: ChecklistItem[];
  };
  
  // Дополнительные данные
  attachments: FileAttachment[];
  comments: Comment[];
  activityLog: ActivityLogEntry[];
}
```

### ChecklistItem

```typescript
interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}
```

### WIP Limits

```typescript
interface WIPLimits {
  todo: number;
  inProgress: number;
  done: number;
  archive: number;
}
```

### Buffer Zones

```typescript
type BufferZone = 'green' | 'yellow' | 'red';

// Зоны буфера
const BUFFER_ZONES = {
  green: { min: 0, max: 33 },    // Норма
  yellow: { min: 34, max: 66 },  // Предупреждение
  red: { min: 67, max: 100 }     // Критическое состояние
};
```

## 🔧 Utility Functions

### Date Helpers

```typescript
// Расчет срочности по дедлайну
function calculateDeadlineUrgency(dueDate?: string): number

// Форматирование даты
function formatDate(date: string): string

// Проверка просроченности
function isOverdue(dueDate: string): boolean
```

### Color Helpers

```typescript
// Получение цвета буфера
function getBufferColor(consumption: number): string

// Получение цвета приоритета
function getPriorityColor(priority: number): string

// Получение цвета WIP-лимита
function getWIPLimitColor(current: number, limit: number): string
```

### Validation Helpers

```typescript
// Валидация задачи
function validateTask(task: Partial<Task>): string[]

// Валидация 50%-ной оценки
function validateDurationEstimate(estimate: number): boolean

// Валидация WIP-лимитов
function validateWIPLimits(limits: WIPLimits): boolean
```

## 🚀 Hooks

### useTaskManagement

```typescript
function useTaskManagement() {
  return {
    tasks: Task[];
    createTask: (taskData: Partial<Task>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    moveTask: (id: string, newStatus: string) => void;
  };
}
```

### useTOCCalculations

```typescript
function useTOCCalculations(tasks: Task[]) {
  return {
    constraint: string | null;
    flowMetrics: FlowMetrics;
    bufferStatus: BufferStatus;
    prioritizedTasks: Task[];
  };
}
```

### useWIPLimits

```typescript
function useWIPLimits() {
  return {
    limits: WIPLimits;
    setLimits: (limits: WIPLimits) => void;
    checkLimit: (status: string, count: number) => boolean;
    getLimitStatus: (status: string, count: number) => 'normal' | 'warning' | 'exceeded';
  };
}
```

## 🔍 Error Handling

### API Errors

```typescript
// Обработка ошибок API
try {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
} catch (error) {
  console.error('API Error:', error);
  // Fallback to local data
}
```

### Validation Errors

```typescript
// Обработка ошибок валидации
const validation = validateFullKit(task);
if (!validation.valid) {
  toast.error('Ворота Full-kit закрыты', {
    description: validation.missingItems.join(', ')
  });
  return;
}
```

### Constraint Violations

```typescript
// Обработка нарушений ограничений
const canStart = canStartNewTask(currentWIP, wipLimit, constraint, targetStatus, constraintTasks);
if (!canStart.allowed) {
  toast.warning('Нарушение принципов ТОС', {
    description: canStart.reason
  });
  return;
}
```

## 📝 Events

### Task Events

```typescript
// События задач
interface TaskEvents {
  'task:created': (task: Task) => void;
  'task:updated': (task: Task) => void;
  'task:deleted': (taskId: string) => void;
  'task:moved': (taskId: string, fromStatus: string, toStatus: string) => void;
  'task:priority-changed': (taskId: string, newPriority: number) => void;
}
```

### Constraint Events

```typescript
// События ограничений
interface ConstraintEvents {
  'constraint:detected': (status: string) => void;
  'constraint:resolved': (status: string) => void;
  'constraint:overloaded': (status: string, overload: number) => void;
}
```

### Buffer Events

```typescript
// События буферов
interface BufferEvents {
  'buffer:zone-changed': (taskId: string, zone: BufferZone) => void;
  'buffer:critical': (taskId: string, consumption: number) => void;
  'buffer:exhausted': (taskId: string) => void;
}
```

---

**Эта документация покрывает все API и внутренние функции системы для разработчиков и интеграторов.**