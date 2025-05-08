'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircleIcon, ArrowUpDownIcon, CheckCircle2Icon, ClockIcon, PauseIcon, PlayIcon, SearchIcon, SkipForwardIcon, HopIcon as StopIcon } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Run, RunState } from '@/lib/types/run';
import { apiClient } from '@/lib/api/api-client';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        // In a real app, this would use the API client
        // const data = await apiClient.getRuns();
        // setRuns(data.items);
        
        // Mock data for demonstration
        const mockRuns: Run[] = [
          {
            id: '1',
            workflow_id: '1',
            workcell_id: '1',
            state: 'RUNNING',
            created_at: '2025-04-01T09:30:00Z',
            updated_at: '2025-04-01T09:30:00Z'
          },
          {
            id: '2',
            workflow_id: '2',
            workcell_id: '1',
            state: 'COMPLETED',
            created_at: '2025-03-31T14:20:00Z',
            updated_at: '2025-03-31T15:45:00Z'
          },
          {
            id: '3',
            workflow_id: '3',
            workcell_id: '2',
            state: 'PAUSED',
            created_at: '2025-03-30T11:05:00Z',
            updated_at: '2025-03-30T11:35:00Z'
          },
          {
            id: '4',
            workflow_id: '4',
            workcell_id: '3',
            state: 'STOPPED',
            created_at: '2025-03-29T16:15:00Z',
            updated_at: '2025-03-29T16:40:00Z'
          },
          {
            id: '5',
            workflow_id: '1',
            workcell_id: '2',
            state: 'STARTING',
            created_at: '2025-04-01T10:15:00Z',
            updated_at: '2025-04-01T10:15:00Z'
          }
        ];
        
        setRuns(mockRuns);
      } catch (error) {
        console.error('Error fetching runs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRuns();
  }, []);

  const filteredRuns = runs.filter((run) =>
    // In a real app, this would filter by workflow name, etc.
    run.workflow_id.includes(searchTerm) || 
    run.workcell_id.includes(searchTerm) ||
    run.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock function to get workflow name
  const getWorkflowName = (workflowId: string) => {
    const workflowNames = {
      '1': 'DNA Extraction',
      '2': 'Sample Preparation',
      '3': 'PCR Protocol',
      '4': 'Cell Culture'
    };
    return workflowNames[workflowId as keyof typeof workflowNames] || workflowId;
  };

  // Mock function to get workcell name
  const getWorkcellName = (workcellId: string) => {
    const workcellNames = {
      '1': 'Main Lab Workcell',
      '2': 'PCR Station',
      '3': 'Cell Culture Station'
    };
    return workcellNames[workcellId as keyof typeof workcellNames] || workcellId;
  };

  // Mock function to get run completion percentage
  const getRunProgress = (run: Run) => {
    switch (run.state) {
      case 'COMPLETED':
        return 100;
      case 'STOPPED':
        return Math.floor(Math.random() * 100);
      case 'RUNNING':
        return Math.floor(Math.random() * 80) + 10;
      case 'PAUSED':
        return Math.floor(Math.random() * 90) + 5;
      case 'STARTING':
        return 5;
      default:
        return 0;
    }
  };

  const getStatusBadge = (state: RunState) => {
    switch (state) {
      case 'RUNNING':
        return <Badge className="bg-blue-500">Running</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'PAUSED':
        return <Badge className="bg-amber-500">Paused</Badge>;
      case 'STOPPED':
        return <Badge className="bg-red-500">Stopped</Badge>;
      case 'STARTING':
        return <Badge className="bg-purple-500">Starting</Badge>;
      default:
        return <Badge variant="outline">{state}</Badge>;
    }
  };

  // Mock function to get run duration
  const getRunDuration = (run: Run) => {
    const start = new Date(run.created_at);
    const end = run.state === 'COMPLETED' ? new Date(run.updated_at) : new Date();
    const durationMs = end.getTime() - start.getTime();
    
    // Convert to minutes and seconds
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading runs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Runs</h1>
        <Button asChild>
          <Link href="/dashboard/workflows">
            Start New Run
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search runs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <ArrowUpDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>All Runs</DropdownMenuItem>
            <DropdownMenuItem>Active Runs</DropdownMenuItem>
            <DropdownMenuItem>Completed Runs</DropdownMenuItem>
            <DropdownMenuItem>Failed Runs</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredRuns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3">
              <AlertCircleIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No runs found</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {searchTerm 
                ? `No runs match "${searchTerm}". Try a different search term.` 
                : "You haven't started any workflow runs yet."}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/workflows">
                Start New Run
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Workcell</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRuns.map((run) => {
                const progress = getRunProgress(run);
                
                return (
                  <TableRow key={run.id}>
                    <TableCell>
                      <div className="font-medium">{getWorkflowName(run.workflow_id)}</div>
                    </TableCell>
                    <TableCell>
                      {getWorkcellName(run.workcell_id)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(run.state)}
                    </TableCell>
                    <TableCell>
                      <div className="w-full flex items-center gap-2">
                        <Progress value={progress} className="h-2" />
                        <span className="text-xs tabular-nums">{progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRunDuration(run)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {run.state === 'RUNNING' && (
                          <>
                            <Button variant="outline" size="icon" className="h-8 w-8" title="Pause">
                              <PauseIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-red-500" title="Stop">
                              <StopIcon className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {run.state === 'PAUSED' && (
                          <>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-green-500" title="Resume">
                              <PlayIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-red-500" title="Stop">
                              <StopIcon className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {(run.state === 'RUNNING' || run.state === 'PAUSED') && (
                          <Button variant="outline" size="icon" className="h-8 w-8" title="Skip Task">
                            <SkipForwardIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/runs/${run.id}`}>
                            Details
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}