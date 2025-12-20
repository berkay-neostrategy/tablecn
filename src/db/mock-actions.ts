import { customAlphabet } from "nanoid";
import { mockDataStore } from "./mock-data";
import { generateRandomTask } from "@/app/lib/utils";
import type { CreateTaskSchema, UpdateTaskSchema } from "@/app/lib/validations";
import type { Task } from "./schema";
import { generateId } from "@/lib/id";

export async function createTaskMock(input: CreateTaskSchema) {
  const newTask: Task = {
    id: generateId("task"),
    code: `TASK-${customAlphabet("0123456789", 4)()}`,
    title: input.title,
    status: input.status,
    label: input.label,
    priority: input.priority,
    estimatedHours: input.estimatedHours ?? 0,
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Eski bir task'ı sil (toplam sayıyı sabit tutmak için)
  const allTasks = mockDataStore.getTasks();
  if (allTasks.length > 0) {
    const oldestTask = allTasks.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )[0];
    if (oldestTask && oldestTask.id !== newTask.id) {
      mockDataStore.deleteTask(oldestTask.id);
    }
  }

  mockDataStore.createTask(newTask);

  return {
    data: null,
    error: null,
  };
}

export async function updateTaskMock(input: UpdateTaskSchema & { id: string }) {
  const existingTask = mockDataStore.getTaskById(input.id);
  if (!existingTask) {
    return {
      data: null,
      error: "Task not found",
    };
  }

  const updates: Partial<Task> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.label !== undefined) updates.label = input.label;
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.estimatedHours !== undefined) updates.estimatedHours = input.estimatedHours;

  const updatedTask = mockDataStore.updateTask(input.id, updates);
  if (!updatedTask) {
    return {
      data: null,
      error: "Failed to update task",
    };
  }

  return {
    data: null,
    error: null,
  };
}

export async function updateTasksMock(input: {
  ids: string[];
  label?: Task["label"];
  status?: Task["status"];
  priority?: Task["priority"];
}) {
  const updates: Partial<Task> = {};
  if (input.label !== undefined) updates.label = input.label;
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;

  mockDataStore.updateTasks(input.ids, updates);

  return {
    data: null,
    error: null,
  };
}

export async function deleteTaskMock(input: { id: string }) {
  const deleted = mockDataStore.deleteTask(input.id);
  if (!deleted) {
    return {
      data: null,
      error: "Task not found",
    };
  }

  // Yeni bir task oluştur (toplam sayıyı sabit tutmak için)
  mockDataStore.createTask(generateRandomTask());

  return {
    data: null,
    error: null,
  };
}

export async function deleteTasksMock(input: { ids: string[] }) {
  const deletedCount = mockDataStore.deleteTasks(input.ids);

  // Silinen her task için yeni bir task oluştur
  for (let i = 0; i < deletedCount; i++) {
    mockDataStore.createTask(generateRandomTask());
  }

  return {
    data: null,
    error: null,
  };
}

export async function seedTasksMock(input: { count: number }) {
  const count = input.count ?? 100;
  mockDataStore.reset();

  // Yeni task'lar oluştur
  for (let i = 0; i < count; i++) {
    mockDataStore.createTask(generateRandomTask());
  }

  console.log("📝 Mock data: Inserted tasks", count);
}

