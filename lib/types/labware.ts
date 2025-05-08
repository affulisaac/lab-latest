export interface Labware {
  id: string;
  name: string;
  type: string;
  description: string;
  slots: number;
}

export const labwareOptions: Labware[] = [
  {
    id: 'microplate_96',
    name: 'Microplate 96-Well',
    type: 'plate',
    description: '96-well standard microplate',
    slots: 96
  },
  {
    id: 'deepwell_24',
    name: 'Deepwell 24-Well',
    type: 'plate',
    description: '24-well deepwell plate',
    slots: 24
  },
  {
    id: 'tuberack_15ml',
    name: 'Tube Rack 15mL',
    type: 'rack',
    description: '15mL conical tube rack',
    slots: 24
  },
  {
    id: 'reservoir_12ch',
    name: 'Reservoir 12-Channel',
    type: 'reservoir',
    description: '12-channel reagent reservoir',
    slots: 12
  }
];