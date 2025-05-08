'use client';

import { Node } from 'reactflow';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { ArrowDownToLineIcon, ArrowUpFromLineIcon, BeakerIcon, MoveIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FormEvent } from 'react';

interface TaskPanelProps {
  onAddTask: (taskType: string, label: string) => void;
  selectedTask: Node | null;
}

export default function TaskPanel({ onAddTask, selectedTask }: TaskPanelProps) {
  const handleTaskProperties = (e: FormEvent) => {
    e.preventDefault();
    // Update task properties
  };

  const handleAddTask = (taskType: string) => {
    const defaultLabels = {
      pickup: 'Pick Up Labware',
      dropoff: 'Drop Off Labware',
      move: 'Move Labware',
      action: 'Execute Action'
    };
    
    onAddTask(taskType, defaultLabels[taskType as keyof typeof defaultLabels]);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Add New Task</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 text-xs"
            onClick={() => handleAddTask('pickup')}
          >
            <ArrowUpFromLineIcon className="h-6 w-6" />
            Pickup
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 text-xs"
            onClick={() => handleAddTask('dropoff')}
          >
            <ArrowDownToLineIcon className="h-6 w-6" />
            Dropoff
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 text-xs"
            onClick={() => handleAddTask('move')}
          >
            <MoveIcon className="h-6 w-6" />
            Move
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 text-xs"
            onClick={() => handleAddTask('action')}
          >
            <BeakerIcon className="h-6 w-6" />
            Action
          </Button>
        </div>
      </div>

      <Separator />

      {selectedTask ? (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Task Properties</h3>
          <Tabs defaultValue="general">
            <TabsList className="w-full">
              <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
              <TabsTrigger value="dependencies" className="flex-1">Dependencies</TabsTrigger>
              <TabsTrigger value="arguments" className="flex-1">Arguments</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <form onSubmit={handleTaskProperties} className="space-y-3 mt-3">
                <div className="space-y-1">
                  <Label htmlFor="taskId">Task ID</Label>
                  <Input id="taskId" defaultValue={selectedTask.id} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="taskLabel">Label</Label>
                  <Input id="taskLabel" defaultValue={selectedTask.data?.label || ''} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="taskDuration">Duration (s)</Label>
                  <Input 
                    id="taskDuration" 
                    type="number" 
                    defaultValue={selectedTask.data?.task?.duration || 0} 
                    min="1"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="instrumentType">Instrument Type</Label>
                  <Input id="instrumentType" defaultValue={selectedTask.data?.task?.instrument_type || ''} />
                </div>
                <Button type="submit" className="w-full">Update Task</Button>
              </form>
            </TabsContent>
            <TabsContent value="dependencies">
              <div className="p-3 text-sm text-muted-foreground">
                Dependencies configuration will be added here.
              </div>
            </TabsContent>
            <TabsContent value="arguments">
              <div className="p-3 text-sm text-muted-foreground">
                Task-specific arguments will be added here.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Select a task to view and edit its properties
          </CardContent>
        </Card>
      )}
    </div>
  );
}