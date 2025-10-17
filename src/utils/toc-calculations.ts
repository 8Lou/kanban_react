import { Task } from '../types/task';

/**
 * Утилиты для расчетов по методологии ТОС (Теория ограничений систем)
 */

/**
 * Расчет буфера потока (50% от общей длительности цепочки задач)
 */
export function calculateFlowBuffer(tasks: Task[]): number {
  const totalDuration = tasks.reduce((sum, task) => {
    return sum + (task.durationEstimate50 || 0);
  }, 0);
  
  return totalDuration * 0.5; // 50% буфер
}

/**
 * Расчет процента потребления буфера для задачи
 */
export function calculateBufferConsumption(
  task: Task,
  flowBuffer: number,
  actualTimeSpent: number
): number {
  if (!task.durationEstimate50) return 0;
  
  const plannedDuration = task.durationEstimate50;
  const totalAllowedTime = plannedDuration + flowBuffer;
  
  // Процент потребления буфера = (фактическое время - плановое) / буфер * 100
  const bufferUsed = actualTimeSpent - plannedDuration;
  if (bufferUsed <= 0) return 0;
  
  return Math.min(Math.round((bufferUsed / flowBuffer) * 100), 100);
}

/**
 * Автоматическая приоритизация задач (Авто-Триаж)
 * Приоритет = влияние на проток / усилия
 */
export function calculateTaskPriority(task: Task): number {
  // Базовые факторы для расчета приоритета
  const factors = {
    // Приоритет, установленный вручную (1-3)
    manualPriority: task.priority === 'high' ? 3 : task.priority === 'medium' ? 2 : 1,
    
    // Критичность по буферу (чем ближе к красной зоне, тем выше)
    bufferCriticality: task.bufferConsumption / 100,
    
    // Является ли задача ограничением (утроенный вес)
    isConstraint: (task.constraintType === 'drum' || task.constraintType === 'constraint') ? 3 : 1,
    
    // Full-kit готовность (готовые задачи приоритетнее)
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

/**
 * Расчет срочности по дедлайну (0-1)
 */
function calculateDeadlineUrgency(dueDate?: string): number {
  if (!dueDate) return 0.5; // Средняя срочность если дедлайн не установлен
  
  const now = new Date();
  const deadline = new Date(dueDate);
  const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysUntilDeadline < 0) return 1; // Просрочено
  if (daysUntilDeadline < 1) return 0.9; // Менее дня
  if (daysUntilDeadline < 3) return 0.7; // Менее 3 дней
  if (daysUntilDeadline < 7) return 0.5; // Менее недели
  return 0.3; // Больше недели
}

/**
 * Автоматическое определение ограничения по накоплению WIP
 */
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

/**
 * Проверка возможности запуска новой задачи (логика "Каната")
 */
export function canStartNewTask(
  currentWIP: number,
  wipLimit: number,
  constraintStatus: string,
  targetStatus: string,
  constraintTasks: Task[]
): { allowed: boolean; reason?: string } {
  // Проверка 1: WIP-лимит не превышен
  if (currentWIP >= wipLimit) {
    return {
      allowed: false,
      reason: `WIP-лимит достигнут (${currentWIP}/${wipLimit}). Завершите текущую задачу перед запуском новой.`,
    };
  }
  
  // Проверка 2: Если целевой статус является ограничением
  if (targetStatus === constraintStatus) {
    const constraintWorkload = constraintTasks.reduce((sum, t) => sum + (t.durationEstimate50 || 0), 0);
    if (constraintWorkload > 0) {
      return {
        allowed: false,
        reason: 'Ограничение перегружено. Дождитесь завершения текущих задач.',
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Проверка Full-kit перед переходом в работу
 */
export function validateFullKit(task: Task): { valid: boolean; missingItems: string[] } {
  const missingItems: string[] = [];
  
  // Проверяем чек-лист
  if (task.fullKitStatus.checklist.length === 0) {
    missingItems.push('Чек-лист полного комплекта не создан');
  }
  
  if (!task.fullKitStatus.isComplete) {
    const incompleteTasks = task.fullKitStatus.checklist
      .filter(item => !item.completed)
      .map(item => item.title);
    missingItems.push(...incompleteTasks);
  }
  
  // Проверяем обязательные поля
  if (!task.durationEstimate50 || task.durationEstimate50 === 0) {
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

/**
 * Сортировка задач по автоматическому приоритету
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityA = calculateTaskPriority(a);
    const priorityB = calculateTaskPriority(b);
    return priorityB - priorityA; // От большего к меньшему
  });
}

/**
 * Триаж - определение задач для отмены
 * Возвращает задачи с низкой ценностью и высокими усилиями
 */
export function performTriage(tasks: Task[]): {
  highValue: Task[];
  lowValue: Task[];
  shouldCancel: Task[];
} {
  const categorized = {
    highValue: [] as Task[],
    lowValue: [] as Task[],
    shouldCancel: [] as Task[],
  };
  
  tasks.forEach(task => {
    const priority = calculateTaskPriority(task);
    const effort = task.durationEstimate50 || 0;
    
    // Высокая ценность = высокий приоритет
    if (priority > 60) {
      categorized.highValue.push(task);
    }
    // Низкая ценность + высокие усилия = кандидат на отмену
    else if (priority < 30 && effort > 10) {
      categorized.shouldCancel.push(task);
    }
    // Остальное - низкая ценность
    else {
      categorized.lowValue.push(task);
    }
  });
  
  return categorized;
}

/**
 * Расчет метрик потока
 */
export function calculateFlowMetrics(tasks: Task[]): {
  throughput: number;
  avgCycleTime: number;
  avgLeadTime: number;
  wip: number;
} {
  const completedTasks = tasks.filter(t => t.status === 'done');
  const inProgressTasks = tasks.filter(t => t.status === 'inProgress');
  
  // Throughput = количество завершенных задач
  const throughput = completedTasks.length;
  
  // WIP = количество задач в работе
  const wip = inProgressTasks.length;
  
  // Средний цикл (мок - в реальности нужны даты начала/окончания)
  const avgCycleTime = completedTasks.length > 0
    ? completedTasks.reduce((sum, t) => sum + (t.durationEstimate50 || 0), 0) / completedTasks.length
    : 0;
  
  // Средний lead time (от создания до завершения)
  const avgLeadTime = avgCycleTime * 1.5; // Упрощенный расчет
  
  return {
    throughput,
    avgCycleTime: Math.round(avgCycleTime * 10) / 10,
    avgLeadTime: Math.round(avgLeadTime * 10) / 10,
    wip,
  };
}
