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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useParams, useRouter } from 'next/navigation';
import { Workflow, Workcell } from '@/lib/types';
import { apiClient } from '@/lib/api/api-client';
import { ChevronLeftIcon, PlayIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function RunWorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [workcells, setWorkcells] = useState<Workcell[]>([]);
  const [selectedWorkcell, setSelectedWorkcell] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, these would use the API client
        // const workflowData = await apiClient.getWorkflow(params.id);
        // const workcellsData = await apiClient.getWorkcells();
        
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
        
        const mockWorkcells: Workcell[] = [
          {
            id: '1',
            name: 'Main Lab Workcell',
            instruments: {},
            created_at: '2025-01-15T10:00:00Z',
            updated_at: '2025-03-20T14:30:00Z'
          },
          {
            id: '2',
            name: 'PCR Station',
            instruments: {},
            created_at: '2025-02-10T09:15:00Z',
            updated_at: '2025-02-10T09:15:00Z'
          }
        ];
        
        setWorkflow(mockWorkflow);
        setWorkcells(mockWorkcells);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workflow details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, toast]);

  const handleStart = async () => {
    if (!selectedWorkcell) {
      toast({
        title: 'Error',
        description: 'Please select a workcell',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsStarting(true);
      
      // In a real app, this would call the API
      
      // const run = await apiClient.startRun({
      //   workflow_id: params.id,
      //   workcell_id: selectedWorkcell,
      //   em_version: '1.0.0'
      // });
      
      toast({
        title: 'Success',
        description: 'Workflow run started successfully',
      });
      
      // Navigate to the run page
      router.push('/dashboard/runs/1');
    } catch (error) {
      console.error('Error starting run:', error);
      toast({
        title: 'Error',
        description: 'Failed to start workflow run',
        variant: 'destructive',
      });
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/workflows/${workflow.id}`}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Run Workflow</h1>
            <p className="text-sm text-muted-foreground">{workflow.name}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run Configuration</CardTitle>
          <CardDescription>
            Configure the workflow run settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Workcell</label>
            <Select value={selectedWorkcell} onValueChange={setSelectedWorkcell}>
              <SelectTrigger>
                <SelectValue placeholder="Select a workcell" />
              </SelectTrigger>
              <SelectContent>
                {workcells.map((workcell) => (
                  <SelectItem key={workcell.id} value={workcell.id}>
                    {workcell.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleStart} disabled={isStarting || !selectedWorkcell}>
          <PlayIcon className="h-4 w-4 mr-2" />
          {isStarting ? 'Starting...' : 'Start Run'}
        </Button>
      </div>
    </div>
  );
}