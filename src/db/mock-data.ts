import type { Skater, Task } from "./schema";
import { generateRandomSkater, generateRandomTask } from "@/app/lib/utils";

/**
 * Mock data store - in-memory veri deposu
 * Veritabanı bağlantısı olmadığında kullanılır
 */
class MockDataStore {
  private tasks: Task[] = [];
  private skaters: Skater[] = [];

  constructor() {
    // Başlangıçta 100 task ve 100 skater oluştur
    this.initialize();
  }

  private initialize() {
    // Tasks oluştur
    for (let i = 0; i < 100; i++) {
      this.tasks.push(generateRandomTask());
    }

    // Skaters oluştur
    for (let i = 0; i < 100; i++) {
      this.skaters.push(generateRandomSkater());
    }
  }

  // Tasks işlemleri
  getTasks(): Task[] {
    return [...this.tasks];
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  createTask(task: Task): Task {
    this.tasks.push(task);
    return task;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) return undefined;

    this.tasks[index] = { ...this.tasks[index], ...updates, updatedAt: new Date() };
    return this.tasks[index];
  }

  updateTasks(ids: string[], updates: Partial<Task>): Task[] {
    const updated: Task[] = [];
    for (const id of ids) {
      const task = this.updateTask(id, updates);
      if (task) updated.push(task);
    }
    return updated;
  }

  deleteTask(id: string): boolean {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }

  deleteTasks(ids: string[]): number {
    let deleted = 0;
    for (const id of ids) {
      if (this.deleteTask(id)) deleted++;
    }
    return deleted;
  }

  // Skaters işlemleri
  getSkaters(): Skater[] {
    return [...this.skaters];
  }

  getSkaterById(id: string): Skater | undefined {
    return this.skaters.find((skater) => skater.id === id);
  }

  createSkater(skater: Skater): Skater {
    this.skaters.push(skater);
    return skater;
  }

  createSkaters(skaters: Skater[]): Skater[] {
    this.skaters.push(...skaters);
    return skaters;
  }

  updateSkater(id: string, updates: Partial<Skater>): Skater | undefined {
    const index = this.skaters.findIndex((skater) => skater.id === id);
    if (index === -1) return undefined;

    this.skaters[index] = { ...this.skaters[index], ...updates, updatedAt: new Date() };
    return this.skaters[index];
  }

  updateSkaters(updates: Array<{ id: string; changes: Partial<Skater> }>): Skater[] {
    const updated: Skater[] = [];
    for (const { id, changes } of updates) {
      const skater = this.updateSkater(id, changes);
      if (skater) updated.push(skater);
    }
    return updated;
  }

  deleteSkater(id: string): boolean {
    const index = this.skaters.findIndex((skater) => skater.id === id);
    if (index === -1) return false;
    this.skaters.splice(index, 1);
    return true;
  }

  deleteSkaters(ids: string[]): number {
    let deleted = 0;
    for (const id of ids) {
      if (this.deleteSkater(id)) deleted++;
    }
    return deleted;
  }

  // Reset - tüm verileri temizle ve yeniden oluştur
  reset() {
    this.tasks = [];
    this.skaters = [];
    this.initialize();
  }
}

// Singleton instance
export const mockDataStore = new MockDataStore();

