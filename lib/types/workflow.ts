export interface LabwareLocation {
  instrument_id: string;
  slot: number;
}

export interface Labware {
  id: string;
  starting_location: LabwareLocation;
}

export interface TaskLabware {
  id: string;
  initial_slot: number;
  final_slot: number;
  quantity: number;
}

export interface BaseTask {
  id: string;
  instrument_type: string;
  duration: number;
  dependencies: string[];
  arguments: Record<string, any>;
}

export interface PickupTask extends BaseTask {
  labware_id: string;
  destination_slot: number;
  source_task: string | null;
}

export interface DropoffTask extends BaseTask {
  labware_id: string;
  destination_task: string;
}

export interface LabwareMove {
  pickup_task: string;
  dropoff_task: string;
}

export interface MoveTask extends BaseTask {
  labware_moves: LabwareMove[];
}

export interface ActionTask extends BaseTask {
  action: string;
  required_labware: Record<string, TaskLabware>;
}

export type Task = PickupTask | DropoffTask | MoveTask | ActionTask;

export interface WorkflowInstrument {
  id: string;
  type: string;
  capacity: number;
}

export interface History {
  task_id: string;
  instrument_id: string;
  start: number;
  end: number;
}

export interface TimeConstraint {
  type: 'START_TO_START' | 'START_TO_END' | 'END_TO_START' | 'END_TO_END';
  start_task: string;
  end_task: string;
  duration: number;
}

export interface InstrumentBlock {
  start_task: string;
  end_task: string;
}

export interface WorkflowConfig {
  tasks: Record<string, Task>;
  instruments: Record<string, WorkflowInstrument>;
  labware: Record<string, Labware>;
  history: Record<string, History>;
  time_constraints: TimeConstraint[];
  instrument_blocks: InstrumentBlock[];
}

export interface WorkflowInput {
  name: string;
  config: WorkflowConfig;
}

export interface Workflow {
  id: string;
  name: string;
  config: WorkflowConfig;
  created_at: string;
  updated_at: string;
}

export interface WorkflowListResponse {
  items: Workflow[];
  total: number;
}

export interface TaskSchedule {
  task_id: string;
  instrument_id: string;
  start: number;
  end: number;
}