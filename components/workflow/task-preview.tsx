'use client';

import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { BeakerIcon } from 'lucide-react';
import { DriverTask } from '@/lib/types/instrument';

interface TaskPreviewProps {
  task: DriverTask;
  position: { x: number; y: number };
}

export default function TaskPreview({ task, position }: TaskPreviewProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        x: position.x - 140, // Center the preview
        y: position.y - 50,  // Center the preview
        scale: 0.8,
        opacity: 0.8,
      }}
      className="fixed top-0 left-0 z-50 pointer-events-none"
    >
      <div className="px-4 py-3 rounded-xl border-2 shadow-lg backdrop-blur-sm min-w-[280px] bg-background">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="flex items-center gap-1 font-medium">
            <BeakerIcon className="h-4 w-4" />
            {task.name}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">{task.description}</div>
        {task.parameters.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.parameters.map((param) => (
              <Badge key={param} variant="outline" className="text-xs">
                {param}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}