'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { WorkflowConfig, WorkflowInput } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/api-client';
import { Input } from '@/components/ui/input';

// Dynamically import WorkflowBuilder with no SSR
const WorkflowBuilder = dynamic(
  () => import('@/components/workflow/workflow-builder'),
  { ssr: false }
);

export default function NewWorkflowPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('Untitled Workflow');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig | null>(null);

  // Only show the component after mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    if (!workflowConfig) {
      toast({
        title: 'Error',
        description: 'Please create a workflow before saving',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const workflowInput: WorkflowInput = {
        name,
        config: workflowConfig
      };
      
      // In a real application, call the API to save the workflow
      // await apiClient.createWorkflow(workflowInput);
      
      toast({
        title: 'Workflow saved',
        description: 'Your workflow has been saved successfully.',
      });
      
      // Redirect to the workflows list
      router.push('/dashboard/workflows');
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: 'Error saving workflow',
        description: 'There was a problem saving your workflow. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) {
    return null; // Return null on server-side and first render
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/workflows">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          {isEditing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                }
              }}
              className="text-2xl font-bold h-auto py-1 px-2 w-auto min-w-[300px]"
              autoFocus
            />
          ) : (
            <h1 
              className="text-3xl font-bold tracking-tight cursor-pointer hover:bg-accent hover:bg-opacity-50 rounded px-2 py-1"
              onClick={() => setIsEditing(true)}
            >
              {name}
            </h1>
          )}
        </div>
        <Button disabled={isSaving} onClick={handleSave}>
          <SaveIcon className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Workflow'}
        </Button>
      </div>

      <div className="space-y-2">
        <WorkflowBuilder 
          onSave={(config) => setWorkflowConfig(config)} 
        />
      </div>
    </div>
  );
}