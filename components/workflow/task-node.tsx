'use client';

import { Handle, NodeProps, Position } from 'reactflow';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { BeakerIcon, CheckIcon, ChevronDownIcon, TrashIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { labwareOptions } from '@/lib/types/labware';

export default function TaskNode({ data, isConnectable, selected }: NodeProps) {
  const { 
    instrument, 
    selectedTasks = [], 
    selectedLabware = {}, 
    onTaskSelect, 
    onTaskRemove, 
    onLabwareSelect,
    onLabwareRemove,
    onDelete 
  } = data;
  
  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl border-2 shadow-lg backdrop-blur-sm min-w-[280px] transition-all duration-200 group',
        'bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-200 hover:border-primary-300',
        'dark:from-primary-950 dark:to-primary-900/50 dark:border-primary-800 dark:hover:border-primary-700',
        selected && 'ring-2 ring-primary ring-offset-2 dark:ring-offset-background'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className={cn(
          "w-3 h-3 border-2 border-background dark:border-background -translate-y-[2px] transition-transform duration-200 group-hover:scale-110",
          "bg-primary"
        )}
      />
      
      <div className="flex items-center justify-between mb-2">
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1 font-medium"
        >
          <BeakerIcon className="h-4 w-4" />
          {instrument.driver.name}
        </Badge>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v{instrument.driver.version}</Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:text-destructive"
            onClick={onDelete}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="font-medium text-sm mb-3">{data.label}</div>

      <div className="space-y-4">
        {/* Tasks Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Selected Tasks</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Add Task
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {instrument.driver.tasks?.map(task => (
                  <DropdownMenuItem
                    key={task.name}
                    onClick={() => onTaskSelect(task.name)}
                    disabled={selectedTasks.includes(task.name)}
                  >
                    <div className="flex items-center gap-2">
                      {selectedTasks.includes(task.name) && (
                        <CheckIcon className="h-4 w-4" />
                      )}
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-xs text-muted-foreground">{task.description}</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedTasks.length > 0 && (
            <div className="space-y-2">
              {selectedTasks.map(taskName => {
                const task = instrument.driver.tasks?.find(t => t.name === taskName);
                const taskLabware = selectedLabware[taskName] || [];
                
                return (
                  <div key={taskName} className="p-2 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{taskName}</div>
                        {task?.parameters && task.parameters.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {task.parameters.map(param => (
                              <Badge key={param} variant="secondary" className="text-xs">
                                {param}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:text-destructive"
                        onClick={() => onTaskRemove?.(taskName)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Labware Selection */}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-muted-foreground">Labware</div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 text-xs">
                              Add Labware
                              <ChevronDownIcon className="h-3 w-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Available Labware</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {labwareOptions.map(labware => (
                              <DropdownMenuItem
                                key={labware.id}
                                onClick={() => onLabwareSelect?.(taskName, labware.id)}
                                disabled={taskLabware.includes(labware.id)}
                              >
                                <div>
                                  <div className="font-medium">{labware.name}</div>
                                  <div className="text-xs text-muted-foreground">{labware.description}</div>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {taskLabware.length > 0 && (
                        <div className="space-y-1">
                          {taskLabware.map(labwareId => {
                            const labware = labwareOptions.find(l => l.id === labwareId);
                            return (
                              <div key={labwareId} className="flex items-center justify-between bg-background rounded p-1">
                                <div className="text-xs">{labware?.name}</div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 hover:text-destructive"
                                  onClick={() => onLabwareRemove?.(taskName, labwareId)}
                                >
                                  <XIcon className="h-3 w-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className={cn(
          "w-3 h-3 border-2 border-background dark:border-background translate-y-[2px] transition-transform duration-200 group-hover:scale-110",
          "bg-primary"
        )}
      />
    </div>
  );
}