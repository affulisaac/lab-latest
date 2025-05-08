export interface DriverTask {
  name: string;
  description: string;
  parameters: string[];
}

export interface DriverOption {
  name: string;
  versions: string[];
  description: string;
  tasks: DriverTask[];
}

export const driverOptions: DriverOption[] = [
  {
    name: 'RobotArm',
    versions: ['1.0.0', '1.1.0', '2.0.0'],
    description: 'Robotic arm for labware transport',
    tasks: [
      { name: 'initialize_instrument', description: 'Initialize the instrument', parameters: [] },
      { name: 'calibrate_instrument', description: 'Calibrate the instrument', parameters: [] },
      { name: 'pickup', description: 'Pick up labware from a location', parameters: ['source_position'] },
      { name: 'place', description: 'Place labware at a location', parameters: ['target_position'] },
      { name: 'home_instrument', description: 'Move to home position', parameters: [] },
      { name: 'move_to_home', description: 'Return to home position', parameters: [] },
      { name: 'move_to', description: 'Move to specific coordinates', parameters: ['x', 'y', 'z'] },
      { name: 'pause_task', description: 'Pause current task', parameters: [] },
      { name: 'resume_task', description: 'Resume paused task', parameters: [] }
    ]
  },
  {
    name: 'PipettingRobot',
    versions: ['2.0.0', '2.1.0', '2.2.0'],
    description: '8-channel liquid handling robot',
    tasks: [
      { name: 'initialize_instrument', description: 'Initialize the instrument', parameters: [] },
      { name: 'calibrate_instrument', description: 'Calibrate the instrument', parameters: [] },
      { name: 'aspirate_liquid', description: 'Aspirate liquid', parameters: ['volume', 'flow_rate'] },
      { name: 'dispense_liquid', description: 'Dispense liquid', parameters: ['volume', 'flow_rate'] },
      { name: 'mix_liquid', description: 'Mix liquid by repeated aspiration/dispense', parameters: ['volume', 'repetitions'] },
      { name: 'transfer_liquid', description: 'Transfer liquid between positions', parameters: ['volume', 'source', 'destination'] },
      { name: 'touch_tip', description: 'Touch tip to remove droplets', parameters: ['location'] },
      { name: 'blow_out', description: 'Blow out any remaining liquid', parameters: [] },
      { name: 'load_tip', description: 'Load a new pipette tip', parameters: ['tip_location'] },
      { name: 'eject_tip', description: 'Eject current pipette tip', parameters: ['waste_location'] }
    ]
  },
  {
    name: 'Thermocycler',
    versions: ['3.0.0', '3.1.0'],
    description: 'PCR thermal cycler',
    tasks: [
      { name: 'initialize_instrument', description: 'Initialize the instrument', parameters: [] },
      { name: 'calibrate_instrument', description: 'Calibrate the instrument', parameters: [] },
      { name: 'set_temperature', description: 'Set block temperature', parameters: ['temperature', 'hold_time'] },
      { name: 'run_protocol', description: 'Run thermal profile', parameters: ['profile_name'] },
      { name: 'heat', description: 'Heat to target temperature', parameters: ['temperature', 'rate'] },
      { name: 'cool', description: 'Cool to target temperature', parameters: ['temperature', 'rate'] },
      { name: 'open_lid', description: 'Open the lid', parameters: [] },
      { name: 'close_lid', description: 'Close the lid', parameters: [] },
      { name: 'wait', description: 'Wait for specified duration', parameters: ['duration'] }
    ]
  },
  {
    name: 'Centrifuge',
    versions: ['1.0.0', '1.5.0'],
    description: 'Sample processing centrifuge',
    tasks: [
      { name: 'initialize_instrument', description: 'Initialize the instrument', parameters: [] },
      { name: 'calibrate_instrument', description: 'Calibrate the instrument', parameters: [] },
      { name: 'spin', description: 'Centrifuge samples', parameters: ['speed', 'time'] },
      { name: 'balance_check', description: 'Check rotor balance', parameters: [] },
      { name: 'open_door', description: 'Open centrifuge door', parameters: [] },
      { name: 'close_door', description: 'Close centrifuge door', parameters: [] },
      { name: 'wait', description: 'Wait for specified duration', parameters: ['duration'] }
    ]
  },
  {
    name: 'Stacker',
    versions: ['1.0.0', '1.1.0'],
    description: 'Plate storage and stacking system',
    tasks: [
      { name: 'initialize_instrument', description: 'Initialize the instrument', parameters: [] },
      { name: 'calibrate_instrument', description: 'Calibrate the instrument', parameters: [] },
      { name: 'load_plate', description: 'Load plate from stack', parameters: ['stack_position'] },
      { name: 'unload_plate', description: 'Return plate to stack', parameters: ['stack_position'] },
      { name: 'get_stack_status', description: 'Check stack status', parameters: [] },
      { name: 'reset_stacks', description: 'Reset all stacks', parameters: [] },
      { name: 'wait', description: 'Wait for specified duration', parameters: ['duration'] }
    ]
  },
  {
    name: 'PlateReader',
    versions: ['2.0.0', '2.1.0'],
    description: 'Microplate absorbance reader',
    tasks: [
      { name: 'initialize_instrument', description: 'Initialize the instrument', parameters: [] },
      { name: 'calibrate_instrument', description: 'Calibrate the instrument', parameters: [] },
      { name: 'read_absorbance', description: 'Measure absorbance', parameters: ['wavelength'] },
      { name: 'read_fluorescence', description: 'Measure fluorescence', parameters: ['excitation', 'emission'] },
      { name: 'shake', description: 'Shake plate', parameters: ['speed', 'time'] },
      { name: 'wait', description: 'Wait for specified duration', parameters: ['duration'] }
    ]
  }
];