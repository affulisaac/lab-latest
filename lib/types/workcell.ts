export interface DriverConfig {
  name: string;
  version: string;
  config: Record<string, any>;
}

export interface InstrumentInput {
  id: string;
  driver: DriverConfig;
}

export interface Instrument {
  id: string;
  driver: DriverConfig;
}

export interface WorkcellInput {
  name: string;
  instruments: Record<string, InstrumentInput>;
}

export interface Workcell {
  id: string;
  name: string;
  instruments: Record<string, Instrument>;
  created_at: string;
  updated_at: string;
}

export interface WorkcellListResponse {
  items: Workcell[];
  total: number;
}

export interface ExecuteActionInput {
  action: string;
  arguments: Record<string, any>;
}