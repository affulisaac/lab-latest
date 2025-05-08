'use client';

import { DragEvent, useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { DriverTask } from '@/lib/types/instrument';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: DriverTask[];
  onTaskDragStart: (task: DriverTask) => void;
  onTaskDragEnd: () => void;
}

export default function TaskList({ tasks, onTaskDragStart, onTaskDragEnd }: TaskListProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, task: DriverTask) => {
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    setDraggedTask(task.name);
    onTaskDragStart(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    onTaskDragEnd();
  };

  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="space-y-2 p-2">
        {tasks.map((task) => (
          <Card
            key={task.name}
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
            onDragEnd={handleDragEnd}
            className={cn(
              'p-3 cursor-move hover:shadow-md transition-all',
              draggedTask === task.name && 'opacity-50'
            )}
          >
            <div className="font-medium text-sm">{task.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{task.description}</div>
            {task.parameters.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {task.parameters.map((param) => (
                  <Badge key={param} variant="secondary" className="text-xs">
                    {param}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}