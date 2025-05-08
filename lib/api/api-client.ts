import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  UserInput, 
  UserListResponse, 
  User, 
  WorkcellInput, 
  WorkcellListResponse, 
  Workcell, 
  WorkflowInput, 
  WorkflowListResponse, 
  Workflow, 
  RunInput, 
  RunListResponse, 
  Run, 
  TaskSchedule 
} from '@/lib/types';

class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL: this.baseUrl,
    });

    // Add auth token to requests if available
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // User endpoints
  async getUsers(skip = 0, limit = 20): Promise<UserListResponse> {
    const response = await this.client.get<UserListResponse>(`/api/v1/users/?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.client.get<User>(`/api/v1/users/${id}`);
    return response.data;
  }

  async createUser(user: UserInput): Promise<void> {
    await this.client.post('/api/v1/users/', user);
  }

  async updateUser(id: string, user: UserInput): Promise<User> {
    const response = await this.client.put<User>(`/api/v1/users/${id}`, user);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete(`/api/v1/users/${id}`);
  }

  // Workcell endpoints
  async getWorkcells(skip = 0, limit = 20): Promise<WorkcellListResponse> {
    const response = await this.client.get<WorkcellListResponse>(`/api/v1/workcells/?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getWorkcell(id: string): Promise<Workcell> {
    const response = await this.client.get<Workcell>(`/api/v1/workcells/${id}`);
    return response.data;
  }

  async createWorkcell(workcell: WorkcellInput): Promise<void> {
    await this.client.post('/api/v1/workcells/', workcell);
  }

  async updateWorkcell(id: string, workcell: WorkcellInput): Promise<Workcell> {
    const response = await this.client.put<Workcell>(`/api/v1/workcells/${id}`, workcell);
    return response.data;
  }

  async deleteWorkcell(id: string): Promise<void> {
    await this.client.delete(`/api/v1/workcells/${id}`);
  }

  async initialiseWorkcell(id: string): Promise<void> {
    await this.client.post(`/api/v1/workcells/${id}/initialise`);
  }

  async initialiseWorkcellInstruments(id: string, instrumentIds: string[]): Promise<void> {
    await this.client.post(`/api/v1/workcells/${id}/instruments/initialise`, instrumentIds);
  }

  // Workflow endpoints
  async getWorkflows(skip = 0, limit = 20): Promise<WorkflowListResponse> {
    const response = await this.client.get<WorkflowListResponse>(`/api/v1/workflows/?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getWorkflow(id: string): Promise<Workflow> {
    const response = await this.client.get<Workflow>(`/api/v1/workflows/${id}`);
    return response.data;
  }

  async createWorkflow(workflow: WorkflowInput): Promise<void> {
    await this.client.post('/api/v1/workflows/', workflow);
  }

  async updateWorkflow(id: string, workflow: WorkflowInput): Promise<Workflow> {
    const response = await this.client.put<Workflow>(`/api/v1/workflows/${id}`, workflow);
    return response.data;
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.client.delete(`/api/v1/workflows/${id}`);
  }

  async getWorkflowSchedule(id: string): Promise<Record<string, TaskSchedule>> {
    const response = await this.client.get<Record<string, TaskSchedule>>(`/api/v1/workflows/${id}/schedule`);
    return response.data;
  }

  async scheduleWorkflow(id: string, workcellId: string, schedulerVersion: string): Promise<void> {
    await this.client.post(`/api/v1/workflows/${id}/schedule`, {
      workcell_id: workcellId,
      scheduler_version: schedulerVersion
    });
  }

  // Run endpoints
  async getRuns(skip = 0, limit = 20): Promise<RunListResponse> {
    const response = await this.client.get<RunListResponse>(`/api/v1/runs/?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getRun(id: string): Promise<Run> {
    const response = await this.client.get<Run>(`/api/v1/runs/${id}`);
    return response.data;
  }

  async startRun(runInput: RunInput): Promise<Run> {
    const response = await this.client.post<Run>('/api/v1/runs/start', runInput);
    return response.data;
  }

  async stopRun(id: string): Promise<void> {
    await this.client.post(`/api/v1/runs/${id}/stop`);
  }

  async pauseRun(id: string): Promise<void> {
    await this.client.post(`/api/v1/runs/${id}/pause`);
  }

  async resumeRun(id: string): Promise<void> {
    await this.client.post(`/api/v1/runs/${id}/resume`);
  }

  async skipTask(runId: string, taskId: string): Promise<void> {
    await this.client.post(`/api/v1/runs/${runId}/tasks/${taskId}/skip`);
  }

  async retryTask(runId: string, taskId: string): Promise<void> {
    await this.client.post(`/api/v1/runs/${runId}/tasks/${taskId}/retry`);
  }

  // Mock login endpoint for demo purposes
  async login(email: string, password: string): Promise<{ token: string }> {
    // In a real app, this would call an actual endpoint
    // This is mocked for demonstration
    return { token: 'demo-jwt-token' };
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();