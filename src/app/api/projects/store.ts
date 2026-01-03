// In-memory storage for demo purposes
// In production, this would be replaced with a database
class ProjectStore {
  private store: Map<string, any>;

  constructor() {
    this.store = new Map();
  }

  set(id: string, data: any) {
    this.store.set(id, data);
  }

  get(id: string) {
    return this.store.get(id);
  }

  getAll() {
    return Array.from(this.store.values());
  }

  delete(id: string) {
    return this.store.delete(id);
  }

  has(id: string) {
    return this.store.has(id);
  }
}

// Export a singleton instance
export const projectsStore = new ProjectStore();
