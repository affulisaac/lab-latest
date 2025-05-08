import { Workcell, WorkcellInput, ExecuteActionInput } from '@/lib/types';

// Mock data
const mockWorkcells: Workcell[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Main Lab Workcell',
    instruments: {
      'transport-robot': {
        id: 'transport-robot',
        driver: {
          name: 'RobotArm',
          version: '1.0.0',
          config: {
            port: '/dev/ttyUSB0',
            speed: 100
          }
        }
      },
      'liquid-handler': {
        id: 'liquid-handler',
        driver: {
          name: 'PipettingRobot',
          version: '2.1.0',
          config: {
            ip: '192.168.1.10',
            channels: 8
          }
        }
      }
    },
    created_at: '2025-01-15T10:00:00.000Z',
    updated_at: '2025-03-20T14:30:00.000Z'
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001',
    name: 'PCR Station',
    instruments: {
      'pcr-thermocycler': {
        id: 'pcr-thermocycler',
        driver: {
          name: 'Thermocycler',
          version: '3.0.0',
          config: {
            ip: '192.168.1.11'
          }
        }
      }
    },
    created_at: '2025-02-10T09:15:00.000Z',
    updated_at: '2025-02-10T09:15:00.000Z'
  }
];

export interface WorkcellService {
  getWorkcells(skip?: number, limit?: number): Promise<{ items: Workcell[]; total: number }>;
  getWorkcell(id: string): Promise<Workcell | null>;
  createWorkcell(workcell: WorkcellInput): Promise<Workcell>;
  updateWorkcell(id: string, workcell: WorkcellInput): Promise<Workcell>;
  deleteWorkcell(id: string): Promise<void>;
  initialiseWorkcell(id: string): Promise<void>;
  initialiseWorkcellInstruments(id: string, instrumentIds: string[]): Promise<void>;
  executeInstrumentAction(id: string, instrumentId: string, action: ExecuteActionInput): Promise<void>;
}

class MockWorkcellService implements WorkcellService {
  private workcells: Workcell[] = [...mockWorkcells];

  async getWorkcells(skip = 0, limit = 20): Promise<{ items: Workcell[]; total: number }> {
    const total = this.workcells.length;
    const items = this.workcells.slice(skip, skip + limit);
    return Promise.resolve({ items, total });
  }

  async getWorkcell(id: string): Promise<Workcell | null> {
    const workcell = this.workcells.find(w => w.id === id);
    return Promise.resolve(workcell || null);
  }

  async createWorkcell(workcell: WorkcellInput): Promise<Workcell> {
    const newWorkcell: Workcell = {
      id: crypto.randomUUID(),
      ...workcell,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.workcells.push(newWorkcell);
    return Promise.resolve(newWorkcell);
  }

  async updateWorkcell(id: string, workcell: WorkcellInput): Promise<Workcell> {
    const index = this.workcells.findIndex(w => w.id === id);
    if (index === -1) {
      throw new Error('Workcell not found');
    }

    const updatedWorkcell: Workcell = {
      ...this.workcells[index],
      ...workcell,
      updated_at: new Date().toISOString()
    };

    this.workcells[index] = updatedWorkcell;
    return Promise.resolve(updatedWorkcell);
  }

  async deleteWorkcell(id: string): Promise<void> {
    const index = this.workcells.findIndex(w => w.id === id);
    if (index !== -1) {
      this.workcells.splice(index, 1);
    }
    return Promise.resolve();
  }

  async initialiseWorkcell(id: string): Promise<void> {
    const workcell = this.workcells.find(w => w.id === id);
    if (workcell) {
      workcell.updated_at = new Date().toISOString();
    }
    return Promise.resolve();
  }

  async initialiseWorkcellInstruments(id: string, instrumentIds: string[]): Promise<void> {
    const workcell = this.workcells.find(w => w.id === id);
    if (workcell) {
      workcell.updated_at = new Date().toISOString();
    }
    return Promise.resolve();
  }

  async executeInstrumentAction(id: string, instrumentId: string, action: ExecuteActionInput): Promise<void> {
    const workcell = this.workcells.find(w => w.id === id);
    if (!workcell) {
      throw new Error('Workcell not found');
    }
    if (!workcell.instruments[instrumentId]) {
      throw new Error('Instrument not found');
    }
    // In a real implementation, this would execute the action on the instrument
    return Promise.resolve();
  }
}

export const workcellService = new MockWorkcellService();