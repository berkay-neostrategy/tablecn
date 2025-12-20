import type { Task } from "./schema";
import { mockDataStore } from "./mock-data";
import type { GetTasksSchema } from "@/app/lib/validations";
import type { ExtendedColumnFilter, JoinOperator } from "@/types/data-table";

/**
 * Mock data için filtreleme ve sıralama helper fonksiyonları
 */

function matchesFilter(
  task: Task,
  filter: ExtendedColumnFilter<any>,
  joinOperator: JoinOperator,
): boolean {
  const value = task[filter.id as keyof Task];
  const filterValue = filter.value;

  switch (filter.operator) {
    case "iLike":
      if (filter.variant === "text" && typeof filterValue === "string") {
        return String(value)
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      return false;

    case "notILike":
      if (filter.variant === "text" && typeof filterValue === "string") {
        return !String(value)
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      return false;

    case "eq":
      if (filter.variant === "date" || filter.variant === "dateRange") {
        const date = new Date(Number(filterValue));
        const taskDate = new Date(value as Date);
        return (
          taskDate >= new Date(date.setHours(0, 0, 0, 0)) &&
          taskDate <= new Date(date.setHours(23, 59, 59, 999))
        );
      }
      return value === filterValue;

    case "ne":
      if (filter.variant === "date" || filter.variant === "dateRange") {
        const date = new Date(Number(filterValue));
        const taskDate = new Date(value as Date);
        return !(
          taskDate >= new Date(date.setHours(0, 0, 0, 0)) &&
          taskDate <= new Date(date.setHours(23, 59, 59, 999))
        );
      }
      return value !== filterValue;

    case "inArray":
      if (Array.isArray(filterValue)) {
        return filterValue.includes(value);
      }
      return false;

    case "notInArray":
      if (Array.isArray(filterValue)) {
        return !filterValue.includes(value);
      }
      return false;

    case "lt":
      if (filter.variant === "number" || filter.variant === "range") {
        return Number(value) < Number(filterValue);
      }
      if (filter.variant === "date" && typeof filterValue === "string") {
        return new Date(value as Date) < new Date(Number(filterValue));
      }
      return false;

    case "lte":
      if (filter.variant === "number" || filter.variant === "range") {
        return Number(value) <= Number(filterValue);
      }
      if (filter.variant === "date" && typeof filterValue === "string") {
        return new Date(value as Date) <= new Date(Number(filterValue));
      }
      return false;

    case "gt":
      if (filter.variant === "number" || filter.variant === "range") {
        return Number(value) > Number(filterValue);
      }
      if (filter.variant === "date" && typeof filterValue === "string") {
        return new Date(value as Date) > new Date(Number(filterValue));
      }
      return false;

    case "gte":
      if (filter.variant === "number" || filter.variant === "range") {
        return Number(value) >= Number(filterValue);
      }
      if (filter.variant === "date" && typeof filterValue === "string") {
        return new Date(value as Date) >= new Date(Number(filterValue));
      }
      return false;

    case "isBetween":
      if (
        (filter.variant === "date" || filter.variant === "dateRange") &&
        Array.isArray(filterValue) &&
        filterValue.length === 2
      ) {
        const taskDate = new Date(value as Date);
        const start = new Date(Number(filterValue[0]));
        start.setHours(0, 0, 0, 0);
        const end = new Date(Number(filterValue[1]));
        end.setHours(23, 59, 59, 999);
        return taskDate >= start && taskDate <= end;
      }
      if (
        (filter.variant === "number" || filter.variant === "range") &&
        Array.isArray(filterValue) &&
        filterValue.length === 2
      ) {
        const numValue = Number(value);
        const first = filterValue[0] ? Number(filterValue[0]) : null;
        const second = filterValue[1] ? Number(filterValue[1]) : null;
        if (first === null && second === null) return false;
        if (first !== null && second === null) return numValue === first;
        if (first === null && second !== null) return numValue === second;
        return numValue >= first! && numValue <= second!;
      }
      return false;

    default:
      return true;
  }
}

function matchesFilters(
  task: Task,
  filters: ExtendedColumnFilter<any>[],
  joinOperator: JoinOperator,
): boolean {
  if (filters.length === 0) return true;

  const results = filters.map((filter) => matchesFilter(task, filter, joinOperator));

  return joinOperator === "and"
    ? results.every((r) => r)
    : results.some((r) => r);
}

function matchesSimpleFilters(task: Task, input: GetTasksSchema): boolean {
  // Title filter
  if (input.title && !task.title?.toLowerCase().includes(input.title.toLowerCase())) {
    return false;
  }

  // Status filter
  if (input.status.length > 0 && !input.status.includes(task.status)) {
    return false;
  }

  // Priority filter
  if (input.priority.length > 0 && !input.priority.includes(task.priority)) {
    return false;
  }

  // Estimated hours filter
  if (input.estimatedHours.length > 0) {
    const [min, max] = input.estimatedHours;
    if (min !== undefined && task.estimatedHours < min) return false;
    if (max !== undefined && task.estimatedHours > max) return false;
  }

  // Created at filter
  if (input.createdAt.length > 0) {
    const [start, end] = input.createdAt;
    const taskDate = new Date(task.createdAt);
    if (start !== undefined) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      if (taskDate < startDate) return false;
    }
    if (end !== undefined) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      if (taskDate > endDate) return false;
    }
  }

  return true;
}

export async function getTasksMock(input: GetTasksSchema) {
  const allTasks = mockDataStore.getTasks();
  const advancedTable =
    input.filterFlag === "advancedFilters" || input.filterFlag === "commandFilters";

  // Filtreleme
  let filteredTasks = allTasks;

  if (advancedTable) {
    filteredTasks = allTasks.filter((task) =>
      matchesFilters(task, input.filters, input.joinOperator),
    );
  } else {
    filteredTasks = allTasks.filter((task) => matchesSimpleFilters(task, input));
  }

  // Sıralama
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (input.sort.length === 0) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    for (const sortItem of input.sort) {
      const aValue = a[sortItem.id as keyof Task];
      const bValue = b[sortItem.id as keyof Task];

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      }

      if (comparison !== 0) {
        return sortItem.desc ? -comparison : comparison;
      }
    }

    return 0;
  });

  // Pagination
  const offset = (input.page - 1) * input.perPage;
  const paginatedTasks = sortedTasks.slice(offset, offset + input.perPage);
  const total = filteredTasks.length;
  const pageCount = Math.ceil(total / input.perPage);

  return { data: paginatedTasks, pageCount };
}

export async function getTaskStatusCountsMock() {
  const tasks = mockDataStore.getTasks();
  const counts = {
    todo: 0,
    "in-progress": 0,
    done: 0,
    canceled: 0,
  };

  for (const task of tasks) {
    counts[task.status] = (counts[task.status] ?? 0) + 1;
  }

  return counts;
}

export async function getTaskPriorityCountsMock() {
  const tasks = mockDataStore.getTasks();
  const counts = {
    low: 0,
    medium: 0,
    high: 0,
  };

  for (const task of tasks) {
    counts[task.priority] = (counts[task.priority] ?? 0) + 1;
  }

  return counts;
}

export async function getEstimatedHoursRangeMock() {
  const tasks = mockDataStore.getTasks();
  if (tasks.length === 0) return { min: 0, max: 0 };

  const hours = tasks.map((task) => task.estimatedHours);
  return {
    min: Math.min(...hours),
    max: Math.max(...hours),
  };
}

