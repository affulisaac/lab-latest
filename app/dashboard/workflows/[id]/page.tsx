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
import { useParams, useRouter } from 'next/navigation';
import { Workflow } from '@/lib/types';
import { apiClient } from '@/lib/api/api-client';
import { ChevronLeftIcon, PlayIcon, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import WorkflowBuilder from '@/components/workflow/workflow-builder';

export default function WorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        // In a real app, this would use the API client
        // const data = await apiClient.getWorkflow(params.id);
        // setWorkflow(data);
        
        // Mock data for demonstration
        const mockWorkflow: Workflow = {
          id: params.id as string,
          name: 'DNA Extraction',
          config: {
            tasks: {},
            instruments: {},
            labware: {},
            history: {},
            time_constraints: [],
            instrument_blocks: []
          },
          created_at: '2025-03-15T10:00:00Z',
          updated_at: '2025-03-15T10:00:00Z'
        };
        
        setWorkflow(mockWorkflow);
      } catch (error) {
        console.error('Error fetching workflow:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workflow',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [params.id, toast]);

  const handleSave = async () => {
    if (!workflow) return;

    try {
      setIsSaving(true);
      // In a real app, this would call the API
      // await apiClient.updateWorkflow(params.id, workflow);
      
      toast({
        title: 'Success',
        description: 'Workflow saved successfully',
      });
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workflow',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading workflow...</div>;
  }

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/workflows">
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/workflows/${workflow.id}/run`}>
              <PlayIcon className="h-4 w-4 mr-2" />
              Run Workflow
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <WorkflowBuilder 
          initialWorkflow={workflow.config}
          onSave={(config) => {
            setWorkflow({ ...workflow, config });
            handleSave();
          }}
        />
      </div>
    </div>
  );
}