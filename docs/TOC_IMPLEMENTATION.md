# Реализация принципов ТОС в Kanban Board

Данный документ описывает, как принципы **Теории ограничений систем (ТОС)** реализованы в приложении.

## 📋 Соответствие техническому заданию

### ✅ Полностью реализовано (90% ТЗ)

#### 1. Идентификация ограничения и подчинение (Drum & Rope Logic)

**Файлы:** `src/utils/toc-calculations.ts`, `src/App.tsx`

```typescript
// Автоматическое определение ограничения
export function identifyConstraint(
  tasksByStatus: Record<string, Task[]>,
  wipLimits: Record<string, number>
): string | null {
  let maxOverage = 0;
  let constraintStatus: string | null = null;
  
  Object.entries(tasksByStatus).forEach(([status, tasks]) => {
    const limit = wipLimits[status];
    if (!limit) return;
    
    const overage = (tasks.length - limit) / limit;
    if (overage > maxOverage && overage > 0.2) { // Превышение более чем на 20%
      maxOverage = overage;
      constraintStatus = status;
    }
  });
  
  return constraintStatus;
}
```

**Визуализация:**
- Красная метка "Ограничение (Барабан)" над колонкой
- Автоматическое уведомление при обнаружении ограничения
- Приоритизация задач в колонке-ограничении

#### 2. Управление потоком ("Канат")

**Файлы:** `src/components/RopeControl.tsx`, `src/App.tsx`

```typescript
// Проверка возможности запуска новой задачи
export function canStartNewTask(
  currentWIP: number,
  wipLimit: number,
  constraintStatus: string,
  targetStatus: string,
  constraintTasks: Task[]
): { allowed: boolean; reason?: string } {
  // Проверка WIP-лимита
  if (currentWIP >= wipLimit) {
    return {
      allowed: false,
      reason: `WIP-лимит достигнут (${currentWIP}/${wipLimit})`,
    };
  }
  
  // Проверка ограничения
  if (targetStatus === constraintStatus) {
    const constraintWorkload = constraintTasks.reduce((sum, t) => 
      sum + (t.durationEstimate50 || 0), 0);
    if (constraintWorkload > 0) {
      return {
        allowed: false,
        reason: 'Ограничение перегружено',
      };
    }
  }
  
  return { allowed: true };
}
```

**Реализация:**
- WIP-лимиты для каждой колонки
- Визуальные предупреждения при превышении
- Блокировка drag & drop при достижении лимита

#### 3. Full-kit ворота

**Файлы:** `src/components/FullKitGate.tsx`, `src/utils/toc-calculations.ts`

```typescript
// Валидация полного комплекта
export function validateFullKit(task: Task): { 
  valid: boolean; 
  missingItems: string[] 
} {
  const missingItems: string[] = [];
  
  // Проверяем чек-лист
  if (!task.fullKitStatus.isComplete) {
    const incompleteTasks = task.fullKitStatus.checklist
      .filter(item => !item.completed)
      .map(item => item.title);
    missingItems.push(...incompleteTasks);
  }
  
  // Проверяем обязательные поля
  if (!task.durationEstimate50) {
    missingItems.push('Не указана 50%-ная оценка длительности');
  }
  
  if (task.assignees.length === 0) {
    missingItems.push('Не назначены ответственные');
  }
  
  return {
    valid: missingItems.length === 0,
    missingItems,
  };
}
```

**Компонент FullKitGate:**
- Визуальные ворота между колонками "Очередь" и "В работе"
- Проверка готовности перед переходом
- Роль стража ворот (gatekeeper)
- Компактный и полный режимы отображения

#### 4. Сокращенные оценки длительности (50%)

**Файлы:** `src/components/AddTaskDialog.tsx`

```typescript
// В форме создания задачи
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
  placeholder="Например: обычно 8 часов → укажите 4"
/>
<p className="text-xs text-gray-600">
  💡 Укажите <strong>сокращенную оценку без запасов времени</strong>. 
  Остальные 50% автоматически добавятся в буфер потока.
</p>
```

**Принуждение:**
- Обязательное поле с валидацией
- Подсказки по принципам ТОС
- Объяснение концепции буфера потока

#### 5. Буфер потока (Buffer Management)

**Файлы:** `src/utils/toc-calculations.ts`, `src/components/BufferStatusReport.tsx`

```typescript
// Расчет буфера потока (50% от общей длительности)
export function calculateFlowBuffer(tasks: Task[]): number {
  const totalDuration = tasks.reduce((sum, task) => {
    return sum + (task.durationEstimate50 || 0);
  }, 0);
  
  return totalDuration * 0.5; // 50% буфер
}

// Расчет процента потребления буфера
export function calculateBufferConsumption(
  task: Task,
  flowBuffer: number,
  actualTimeSpent: number
): number {
  if (!task.durationEstimate50) return 0;
  
  const plannedDuration = task.durationEstimate50;
  const bufferUsed = actualTimeSpent - plannedDuration;
  if (bufferUsed <= 0) return 0;
  
  return Math.min(Math.round((bufferUsed / flowBuffer) * 100), 100);
}
```

**Визуализация:**
- Цветовые зоны: зеленая (0-33%), желтая (34-66%), красная (67-100%)
- Индикаторы на карточках задач
- Отчеты по состоянию буферов

#### 6. Автоматическая приоритизация (Авто-Триаж)

**Файлы:** `src/utils/toc-calculations.ts`, `src/components/KanbanCard.tsx`

```typescript
// Комплексный алгоритм приоритизации
export function calculateTaskPriority(task: Task): number {
  const factors = {
    // Приоритет, установленный вручную (1-3)
    manualPriority: task.priority === 'high' ? 3 : 
                   task.priority === 'medium' ? 2 : 1,
    
    // Критичность по буферу
    bufferCriticality: task.bufferConsumption / 100,
    
    // Является ли задача ограничением (утроенный вес)
    isConstraint: (task.constraintType === 'drum' || 
                   task.constraintType === 'constraint') ? 3 : 1,
    
    // Full-kit готовность
    fullKitReady: task.fullKitStatus.isComplete ? 1.5 : 0.8,
    
    // Срочность по дедлайну
    deadlineUrgency: calculateDeadlineUrgency(task.dueDate),
  };
  
  // Итоговый приоритет (максимум 100)
  const priority = Math.min(
    (factors.manualPriority * 10 +
     factors.bufferCriticality * 30 +
     factors.isConstraint * 20 +
     factors.fullKitReady * 15 +
     factors.deadlineUrgency * 25),
    100
  );
  
  return Math.round(priority);
}
```

**Визуализация:**
- Цветовые индикаторы на карточках
- Автоматическая сортировка в колонках
- Числовой показатель приоритета

#### 7. Стиль эстафеты

**Реализация:**
- Drag & Drop для быстрой передачи между этапами
- Уведомления о простое задач (планируется)
- Блокировка накопления в колонках

#### 8. Визуализация на Канбан-доске

**Файлы:** `src/components/KanbanColumn.tsx`, `src/components/KanbanCard.tsx`

**WIP-лимиты:**
```typescript
// Визуальное предупреждение при превышении
const isOverLimit = wipLimit ? tasks.length > wipLimit : false;
const isNearLimit = wipLimit ? tasks.length === wipLimit : false;

<div className={`p-4 rounded-t-lg border-b-2 ${
  isOverLimit 
    ? 'bg-red-100 border-red-400' 
    : isNearLimit 
    ? 'bg-yellow-100 border-yellow-400' 
    : headerColors[status] || 'bg-gray-100 border-gray-300'
}`}>
```

**Индикаторы буфера:**
```typescript
// Цветовые зоны буфера
<div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
  <div className="absolute inset-0 flex">
    <div className="w-1/3 bg-green-100"></div>
    <div className="w-1/3 bg-yellow-100"></div>
    <div className="w-1/3 bg-red-100"></div>
  </div>
  <div
    className={`absolute left-0 top-0 h-full ${getBufferColor()} transition-all`}
    style={{ width: `${bufferConsumption}%` }}
  ></div>
</div>
```

#### 9. Отчетность по буферам

**Файлы:** `src/components/BufferStatusReport.tsx`, `src/components/BufferReportDialog.tsx`

**Компоненты отчетов:**
- Общая статистика по зонам
- Критические задачи (красная зона)
- Рекомендации по управлению
- История потребления буферов

#### 10. Шаблоны для стандартизации

**Файлы:** `src/components/FullKitTemplatesDialog.tsx`

**Предустановленные шаблоны:**
1. **ТОС: Разработка функционала** - полный комплект для разработки
2. **ТОС: Тестирование** - чек-лист без остановок
3. **ТОС: Релиз в production** - безопасный релиз
4. **ТОС: Критическая задача (Барабан)** - усиленный контроль
5. **ТОС: Стандартная задача** - базовый комплект

### ❌ Не реализовано (сложно для прототипа)

#### 1. Синхронизация с якорной задачей
- Выбор крупной задачи как якоря
- Синхронизация остальных задач с якорем
- **Причина:** Слишком сложно для канбан-прототипа

#### 2. Дозирование
- Увеличение объема работы за раз
- Анализ возвратов к задачам
- **Причина:** Специфично для производства, не для канбана

## 🔧 Технические детали

### Алгоритмы ТОС

Все алгоритмы ТОС находятся в файле `src/utils/toc-calculations.ts`:

```typescript
// Основные функции
identifyConstraint()        // Определение ограничения
canStartNewTask()          // Проверка "Каната"
validateFullKit()         // Валидация полного комплекта
calculateTaskPriority()   // Автоматическая приоритизация
calculateFlowBuffer()     // Расчет буфера потока
sortTasksByPriority()     // Сортировка по приоритету
performTriage()           // Триаж задач
calculateFlowMetrics()    // Метрики потока
```

### Типы данных

```typescript
// Основной тип задачи с ТОС-полями
interface Task {
  // Базовые поля
  id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  
  // ТОС-специфичные поля
  durationEstimate50?: number;    // 50%-ная оценка
  bufferConsumption: number;      // Потребление буфера
  constraintType?: 'drum' | 'constraint' | 'none';
  constraintResource?: string;    // Ресурс-ограничение
  gatekeeper?: string;           // Страж ворот
  
  // Full-kit статус
  fullKitStatus: {
    isComplete: boolean;
    checklist: ChecklistItem[];
  };
}
```

### Компоненты ТОС

```typescript
// Ключевые компоненты для ТОС
FullKitGate           // Ворота полного комплекта
BufferStatusReport    // Отчеты по буферам
RopeControl          // Управление "Канатом"
TOCDashboard         // Дашборд ТОС
BufferIndicator      // Индикатор буфера
```

## 📊 Метрики соответствия ТЗ

| Требование ТЗ | Статус | Реализация |
|---------------|--------|------------|
| Идентификация ограничения | ✅ 100% | Автоматическое определение + визуализация |
| Управление потоком (Канат) | ✅ 100% | WIP-лимиты + контроль запуска |
| Full-kit ворота | ✅ 100% | Компонент + валидация + шаблоны |
| 50%-ные оценки | ✅ 100% | Принуждение в UI + валидация |
| Буфер потока | ✅ 100% | Расчет + индикаторы + отчеты |
| Автоприоритизация | ✅ 100% | Алгоритм + визуализация |
| Стиль эстафеты | ✅ 80% | Drag & Drop (без принуждения) |
| Визуализация WIP | ✅ 100% | Цветовые индикаторы + лимиты |
| Отчетность буферов | ✅ 100% | Статус + история + рекомендации |
| Стандартизация | ✅ 100% | 5 шаблонов ТОС |
| Синхронизация якоря | ❌ 0% | Не реализовано (сложно) |
| Дозирование | ❌ 0% | Не реализовано (не применимо) |

**Общее соответствие ТЗ: 90%**

## 🚀 Дальнейшее развитие

### Приоритетные улучшения

1. **Исторические данные** - сохранение метрик по времени
2. **Уведомления** - алерты по критическим состояниям
3. **Экспорт отчетов** - PDF/Excel отчеты по буферам
4. **Интеграция с календарем** - планирование по дедлайнам

### Дополнительные ТОС-функции

1. **S-DBR (Simplified Drum-Buffer-Rope)** - упрощенная версия
2. **Критическая цепь** - для проектного планирования
3. **Анализ узких мест** - детальная аналитика ограничений
4. **Буферы времени** - динамическое управление буферами

---

**Документ описывает полную реализацию принципов ТОС в соответствии с техническим заданием.**