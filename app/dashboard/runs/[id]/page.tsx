'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useParams, useRouter } from 'next/navigation';
import { Run, WorkflowConfig } from '@/lib/types';
import { apiClient } from '@/lib/api/api-client';
import { ChevronLeftIcon, PauseIcon, PlayIcon, SkipForwardIcon, HopIcon as StopIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { format, formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimelineTask {
  id: string;
  type: 'pickup' | 'dropoff' | 'move' | 'action';
  start: number;
  end: number;
  instrument: string;
  dependencies: string[];
  details?: string;
  state: 'RUNNING' | 'COMPLETED' | 'PENDING' | 'FAILED' | 'SKIPPED';
}

interface InstrumentLane {
  id: string;
  name: string;
  tasks: TimelineTask[];
}

function getTaskType(taskId: string, config: WorkflowConfig): TimelineTask['type'] {
  const task = config.tasks[taskId];
  if ('labware_id' in task && 'destination_slot' in task) return 'pickup';
  if ('labware_id' in task && 'destination_task' in task) return 'dropoff';
  if ('labware_moves' in task) return 'move';
  if ('action' in task) return 'action';
  return 'action';
}

function getTaskColor(state: TimelineTask['state']): string {
  switch (state) {
    case 'RUNNING':
      return 'bg-blue-500 animate-pulse';
    case 'COMPLETED':
      return 'bg-green-500';
    case 'FAILED':
      return 'bg-red-500';
    case 'SKIPPED':
      return 'bg-gray-500';
    default:
      return 'bg-muted';
  }
}

function getTaskDetails(taskId: string, config: WorkflowConfig): string {
  const task = config.tasks[taskId];
  if ('action' in task) {
    return `${task.action} (${task.duration}s)`;
  }
  if ('labware_id' in task) {
    return `Labware: ${task.labware_id}`;
  }
  if ('labware_moves' in task) {
    return `${task.labware_moves.length} moves`;
  }
  return '';
}

function calculateTimeline(config: WorkflowConfig): {
  tasks: TimelineTask[];
  lanes: InstrumentLane[];
  totalDuration: number;
} {
  const tasks: TimelineTask[] = [];
  const laneMap = new Map<string, InstrumentLane>();
  let totalDuration = 0;

  // Initialize lanes for each instrument
  Object.entries(config.instruments).forEach(([id, instrument]) => {
    laneMap.set(instrument.type, {
      id: instrument.type,
      name: `Instrument ${instrument.type}`,
      tasks: []
    });
  });

  // Calculate task start times based on dependencies
  const taskStartTimes = new Map<string, number>();
  const taskEndTimes = new Map<string, number>();
  const visited = new Set<string>();

  function calculateTaskTime(taskId: string): number {
    if (visited.has(taskId)) {
      return taskStartTimes.get(taskId) || 0;
    }

    visited.add(taskId);
    const task = config.tasks[taskId];
    const dependencyEndTimes = task.dependencies.map(depId => {
      if (!taskEndTimes.has(depId)) {
        calculateTaskTime(depId);
      }
      return taskEndTimes.get(depId) || 0;
    });

    const startTime = Math.max(0, ...dependencyEndTimes);
    const endTime = startTime + task.duration;

    taskStartTimes.set(taskId, startTime);
    taskEndTimes.set(taskId, endTime);
    totalDuration = Math.max(totalDuration, endTime);

    return startTime;
  }

  // Calculate times for all tasks
  Object.keys(config.tasks).forEach(taskId => {
    if (!visited.has(taskId)) {
      calculateTaskTime(taskId);
    }
  });

  // Create timeline tasks
  Object.entries(config.tasks).forEach(([id, task]) => {
    const startTime = taskStartTimes.get(id) || 0;
    const endTime = taskEndTimes.get(id) || 0;

    const timelineTask: TimelineTask = {
      id,
      type: getTaskType(id, config),
      start: startTime,
      end: endTime,
      instrument: task.instrument_type,
      dependencies: task.dependencies,
      details: getTaskDetails(id, config),
      state: 'PENDING'
    };

    tasks.push(timelineTask);

    const lane = laneMap.get(task.instrument_type);
    if (lane) {
      lane.tasks.push(timelineTask);
    }
  });

  return {
    tasks,
    lanes: Array.from(laneMap.values()),
    totalDuration
  };
}

export default function RunPage() {
  const params = useParams();
  const { toast } = useToast();
  const [run, setRun] = useState<Run | null>(null);
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig | null>(null);
  const [timeline, setTimeline] = useState<{
    tasks: TimelineTask[];
    lanes: InstrumentLane[];
    totalDuration: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const fetchRun = async () => {
      try {
        // Mock data for demonstration
        const mockRun: Run = {
          id: params.id as string,
          workflow_id: '1',
          workcell_id: '1',
          state: 'RUNNING',
          created_at: '2025-04-01T09:30:00Z',
          updated_at: '2025-04-01T09:30:00Z'
        };
        
        setRun(mockRun);

        // Use the complete workflow configuration
        const mockConfig: WorkflowConfig = {
          tasks: {
            pickup_labware_1: {
              id: 'pickup_labware_1',
              instrument_type: 'A',
              duration: 5,
              dependencies: [],
              arguments: {},
              labware_id: 'labware1',
              destination_slot: 1,
              source_task: null
            },
            pickup_labware_2: {
              id: 'pickup_labware_2',
              instrument_type: 'A',
              duration: 5,
              dependencies: [],
              arguments: {},
              labware_id: 'labware2',
              destination_slot: 2,
              source_task: null
            },
            move_labware: {
              id: 'move_labware',
              instrument_type: 'A',
              duration: 5,
              dependencies: ['pickup_labware_1', 'pickup_labware_2'],
              arguments: {},
              labware_moves: [
                {
                  pickup_task: 'pickup_labware_1',
                  dropoff_task: 'dropoff_labware_1'
                },
                {
                  pickup_task: 'pickup_labware_2',
                  dropoff_task: 'dropoff_labware_2'
                }
              ]
            },
            dropoff_labware_1: {
              id: 'dropoff_labware_1',
              instrument_type: 'A',
              duration: 5,
              dependencies: ['move_labware'],
              arguments: {},
              labware_id: 'labware1',
              destination_task: 'do_liquid_handling'
            },
            dropoff_labware_2: {
              id: 'dropoff_labware_2',
              instrument_type: 'A',
              duration: 5,
              dependencies: ['move_labware'],
              arguments: {},
              labware_id: 'labware2',
              destination_task: 'do_liquid_handling'
            },
            do_liquid_handling: {
              id: 'do_liquid_handling',
              instrument_type: 'B',
              duration: 15,
              dependencies: ['dropoff_labware_1', 'dropoff_labware_2'],
              arguments: {
                duration: 15
              },
              action: 'liquid_handling',
              required_labware: {
                labware1: {
                  id: 'labware1',
                  initial_slot: 1,
                  final_slot: 1,
                  quantity: 1
                },
                labware2: {
                  id: 'labware2',
                  initial_slot: 2,
                  final_slot: 2,
                  quantity: 1
                }
              }
            },
            pickup_labware_1_after_lh: {
              id: 'pickup_labware_1_after_lh',
              instrument_type: 'A',
              duration: 5,
              dependencies: ['do_liquid_handling'],
              arguments: {},
              labware_id: 'labware1',
              destination_slot: 1,
              source_task: 'do_liquid_handling'
            },
            pickup_labware_2_after_lh: {
              id: 'pickup_labware_2_after_lh',
              instrument_type: 'A',
              duration: 5,
              dependencies: ['do_liquid_handling'],
              arguments: {},
              labware_id: 'labware2',
              destination_slot: 2,
              source_task: 'do_liquid_handling'
            },
            move_labware_after_lh: {
              id: 'move_labware_after_lh',
              instrument_type: 'A',
              duration: 5,
              dependencies: ['pickup_labware_1_after_lh', 'pickup_labware_2_after_lh'],
              arguments: {},
              labware_moves: [
                {
                  pickup_task: 'pickup_labware_1_after_lh',
                  dropoff_task: 'dropoff_labware_1_after_lh'
                },
                {
                  pickup_task: 'pickup_labware_2_after_lh',
                  dropoff_task: 'dropoff_labware_2_after_lh'
                }
              ]
            },
            dropoff_labware_1_after_lh: {
              id: 'dropoff_labware_1_after_lh',
              instrument_type: 'A',
              duration: 5,
              dependencies: ['move_labware_after_lh'],
              arguments: {},
              labware_id: 'labware1',
              destination_task: 'do_stacking'
            },
            dropoff_labware_2_after_lh: {
              id: 'dropoff_labware_2_after_lh',
              instrument_type: 'A',
              duration: 5,
              dependencies: ['move_labware_after_lh'],
              arguments: {},
              labware_id: 'labware2',
              destination_task: 'do_stacking'
            },
            do_stacking: {
              id: 'do_stacking',
              instrument_type: 'C',
              duration: 5,
              dependencies: ['dropoff_labware_1_after_lh', 'dropoff_labware_2_after_lh'],
              arguments: {
                duration: 5
              },
              action: 'sleep',
              required_labware: {
                labware1: {
                  id: 'labware1',
                  initial_slot: 1,
                  final_slot: 1,
                  quantity: 1
                },
                labware2: {
                  id: 'labware2',
                  initial_slot: 2,
                  final_slot: 2,
                  quantity: 1
                }
              }
            }
          },
          instruments: {
            transport: {
              id: 'transport',
              type: 'A',
              capacity: 2
            },
            liquid_handler: {
              id: 'liquid_handler',
              type: 'B',
              capacity: 2
            },
            stacker: {
              id: 'stacker',
              type: 'C',
              capacity: 2
            }
          },
          labware: {
            labware1: {
              id: 'labware1',
              starting_location: {
                instrument_id: 'stacker',
                slot: 1
              }
            },
            labware2: {
              id: 'labware2',
              starting_location: {
                instrument_id: 'stacker',
                slot: 2
              }
            }
          },
          history: {},
          time_constraints: [],
          instrument_blocks: []
        };

        setWorkflowConfig(mockConfig);

        const newTimeline = calculateTimeline(mockConfig);
        setTimeline(newTimeline);

      } catch (error) {
        console.error('Error fetching run:', error);
        toast({
          title: 'Error',
          description: 'Failed to load run details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRun();

    // Update current time every second for live progress
    const interval = setInterval(() => {
      setCurrentTime(time => {
        if (timeline && time >= timeline.totalDuration) {
          clearInterval(interval);
          return time;
        }
        return time + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [params.id, toast]);

  useEffect(() => {
    if (timeline && currentTime > 0) {
      const updatedTasks = timeline.tasks.map(task => ({
        ...task,
        state: currentTime >= task.end ? 'COMPLETED' :
               currentTime >= task.start ? 'RUNNING' :
               'PENDING'
      }));

      setTimeline(prev => prev ? {
        ...prev,
        tasks: updatedTasks,
        lanes: prev.lanes.map(lane => ({
          ...lane,
          tasks: lane.tasks.map(task => 
            updatedTasks.find(t => t.id === task.id) || task
          )
        }))
      } : null);
    }
  }, [currentTime]);

  const handlePause = async () => {
    try {
      await apiClient.pauseRun(params.id as string);
      toast({
        title: 'Success',
        description: 'Run paused successfully',
      });
    } catch (error) {
      console.error('Error pausing run:', error);
      toast({
        title: 'Error',
        description: 'Failed to pause run',
        variant: 'destructive',
      });
    }
  };

  const handleResume = async () => {
    try {
      await apiClient.resumeRun(params.id as string);
      toast({
        title: 'Success',
        description: 'Run resumed successfully',
      });
    } catch (error) {
      console.error('Error resuming run:', error);
      toast({
        title: 'Error',
        description: 'Failed to resume run',
        variant: 'destructive',
      });
    }
  };

  const handleStop = async () => {
    try {
      await apiClient.stopRun(params.id as string);
      toast({
        title: 'Success',
        description: 'Run stopped successfully',
      });
    } catch (error) {
      console.error('Error stopping run:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop run',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading run details...</div>;
  }

  if (!run || !workflowConfig || !timeline) {
    return <div>Run not found</div>;
  }

  const getWorkflowName = (workflowId: string) => {
    const workflowNames = {
      '1': 'DNA Extraction',
      '2': 'Sample Preparation',
      '3': 'PCR Protocol',
      '4': 'Cell Culture'
    };
    return workflowNames[workflowId as keyof typeof workflowNames] || workflowId;
  };

  const getWorkcellName = (workcellId: string) => {
    const workcellNames = {
      '1': 'Main Lab Workcell',
      '2': 'PCR Station',
      '3': 'Cell Culture Station'
    };
    return workcellNames[workcellId as keyof typeof workcellNames] || workcellId;
  };

  const getStatusBadge = (state: string) => {
    switch (state) {
      case 'RUNNING':
        return <Badge className="bg-blue-500">Running</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'PAUSED':
        return <Badge className="bg-amber-500">Paused</Badge>;
      case 'STOPPED':
        return <Badge className="bg-red-500">Stopped</Badge>;
      default:
        return <Badge variant="outline">{state}</Badge>;
    }
  };

  const taskStats = timeline.tasks.reduce((acc, task) => {
    acc[task.state] = (acc[task.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const instrumentUtil = timeline.lanes.reduce((acc, lane) => {
    const totalTime = lane.tasks.reduce((sum, task) => sum + (task.end - task.start), 0);
    acc[lane.id] = Math.round((totalTime / timeline.totalDuration) * 100);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/runs">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {getWorkflowName(run.workflow_id)}
            </h1>
            <p className="text-sm text-muted-foreground">
              Run started {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {run.state === 'RUNNING' && (
            <>
              <Button variant="outline" onClick={handlePause}>
                <PauseIcon className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button variant="destructive" onClick={handleStop}>
                <StopIcon className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}
          {run.state === 'PAUSED' && (
            <Button variant="outline" onClick={handleResume}>
              <PlayIcon className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Run Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div className="mt-1">{getStatusBadge(run.state)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Workcell</div>
                <div className="mt-1">{getWorkcellName(run.workcell_id)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Started</div>
                <div className="mt-1">{format(new Date(run.created_at), 'PPp')}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                <div className="mt-1">{format(new Date(run.updated_at), 'PPp')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round((currentTime / timeline.totalDuration) * 100)}%</span>
                </div>
                <Progress value={(currentTime / timeline.totalDuration) * 100} />
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Task Status</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Running: {taskStats.RUNNING || 0}</div>
                  <div>Completed: {taskStats.COMPLETED || 0}</div>
                  <div>Failed: {taskStats.FAILED || 0}</div>
                  <div>Skipped: {taskStats.SKIPPED || 0}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Instrument Utilization</div>
                <div className="space-y-1">
                  {Object.entries(instrumentUtil).map(([id, util]) => (
                    <div key={id} className="flex items-center gap-2">
                      <div className="text-sm w-24">Instrument {id}:</div>
                      <Progress value={util} className="flex-1" />
                      <div className="text-sm w-12 text-right">{util}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Task Timeline</CardTitle>
            <CardDescription>
              Execution timeline of workflow tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="space-y-6">
                <div className="relative h-8 border-b">
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: timeline.totalDuration + 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-l first:border-l-0 relative"
                      >
                        <span className="absolute -bottom-6 text-xs text-muted-foreground">
                          {i}s
                        </span>
                      </div>
                    ))}
                  </div>
                  {run.state === 'RUNNING' && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-primary"
                      style={{
                        left: `${(currentTime / timeline.totalDuration) * 100}%`,
                        transition: 'left 1s linear'
                      }}
                    />
                  )}
                </div>

                <div className="space-y-6">
                  {timeline.lanes.map(lane => (
                    <div key={lane.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium">Instrument {lane.name}</h3>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="relative h-16">
                        {lane.tasks.map(task => (
                          <Tooltip key={task.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute h-12 rounded ${getTaskColor(task.state)} transition-all`}
                                style={{
                                  left: `${(task.start / timeline.totalDuration) * 100}%`,
                                  width: `${((task.end - task.start) / timeline.totalDuration) * 100}%`,
                                  top: '50%',
                                  transform: 'translateY(-50%)'
                                }}
                              >
                                <div className="flex items-center h-full px-2">
                                  <span className="text-xs text-white truncate">
                                    {task.id}
                                  </span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <div className="font-medium">{task.id}</div>
                                <div className="text-xs">Type: {task.type}</div>
                                <div className="text-xs">Start: {task.start}s</div>
                                <div className="text-xs">Duration: {task.end - task.start}s</div>
                                {task.details && (
                                  <div className="text-xs">{task.details}</div>
                                )}
                                {task.dependencies.length > 0 && (
                                  <div className="text-xs">
                                    Dependencies: {task.dependencies.join(', ')}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}

                        {lane.tasks.map(task =>
                          task.dependencies.map(depId => {
                            const dep = timeline.tasks.find(t => t.id === depId);
                            if (!dep) return null;

                            return (
                              <svg
                                key={`${task.id}-${depId}`}
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  zIndex: -1
                                }}
                              >
                                <line
                                  x1={`${(dep.end / timeline.totalDuration) * 100}%`}
                                  y1="50%"
                                  x2={`${(task.start / timeline.totalDuration) * 100}%`}
                                  y2="50%"
                                  className="stroke-muted-foreground stroke-[1px]"
                                  strokeDasharray="4"
                                />
                              </svg>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}