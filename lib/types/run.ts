export type RunState = 
  | 'STARTING' 
  | 'RUNNING' 
  | 'STOPPING' 
  | 'STOPPED' 
  | 'COMPLETED' 
  | 'RESUMING' 
  | 'PAUSING' 
  | 'PAUSED';

export interface Run {
  id: string;
  workflow_id: string;
  workcell_id: string;
  state: RunState;
  created_at: string;
  updated_at: string;
}

export interface RunInput {
  workflow_id: string;
  workcell_id: string;
  em_version: string;
}

export interface RunListResponse {
  items: Run[];
  total: number;
}