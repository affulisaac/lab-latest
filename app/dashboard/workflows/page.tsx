'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  AlertCircleIcon, 
  ArrowUpDownIcon, 
  BookOpenIcon,
  ClockIcon,
  FileIcon,
  FilterIcon,
  LayoutGridIcon,
  LayoutListIcon,
  PlusIcon, 
  SearchIcon, 
  StarIcon,
  TagIcon,
  TrashIcon,
  UploadIcon 
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Workflow, WorkflowConfig } from '@/lib/types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontalIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api/api-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';

export default function WorkflowsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        // In a real app, this would use the API client
        // const data = await apiClient.getWorkflows();
        // setWorkflows(data.items);
        
        // Mock data for demonstration
        const mockWorkflows: Workflow[] = [
          {
            id: '1',
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
          },
          {
            id: '2',
            name: 'Sample Preparation',
            config: {
              tasks: {},
              instruments: {},
              labware: {},
              history: {},
              time_constraints: [],
              instrument_blocks: []
            },
            created_at: '2025-03-10T14:30:00Z',
            updated_at: '2025-03-12T09:15:00Z'
          },
          {
            id: '3',
            name: 'PCR Protocol',
            config: {
              tasks: {},
              instruments: {},
              labware: {},
              history: {},
              time_constraints: [],
              instrument_blocks: []
            },
            created_at: '2025-02-28T11:20:00Z',
            updated_at: '2025-03-05T16:45:00Z'
          },
          {
            id: '4',
            name: 'Cell Culture',
            config: {
              tasks: {},
              instruments: {},
              labware: {},
              history: {},
              time_constraints: [],
              instrument_blocks: []
            },
            created_at: '2025-03-01T08:00:00Z',
            updated_at: '2025-03-01T08:00:00Z'
          },
        ];
        
        setWorkflows(mockWorkflows);
      } catch (error) {
        console.error('Error fetching workflows:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportedFile(file);
    }
  };

  const handleImport = async () => {
    if (!importedFile) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const workflow = JSON.parse(content);

          // Basic validation
          if (!workflow.name || !workflow.config) {
            throw new Error('Invalid workflow format');
          }

          // In a real app, you would call the API to create the workflow
          // await apiClient.createWorkflow(workflow);

          toast({
            title: 'Success',
            description: 'Workflow imported successfully',
          });

          setShowImportDialog(false);
          setImportedFile(null);
          
          // Navigate to the new workflow page with the imported config
          router.push('/dashboard/workflows/new');
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Invalid workflow file format',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(importedFile);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import workflow',
        variant: 'destructive',
      });
    }
  };

  const filteredWorkflows = workflows
    .filter((workflow) =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const countTasksByType = (workflow: Workflow) => {
    const tasks = workflow.config.tasks;
    const counts = {
      pickup: 0,
      dropoff: 0,
      move: 0,
      action: 0
    };
    
    Object.values(tasks).forEach(task => {
      if ('labware_id' in task && 'destination_slot' in task) {
        counts.pickup++;
      } else if ('labware_id' in task && 'destination_task' in task) {
        counts.dropoff++;
      } else if ('labware_moves' in task) {
        counts.move++;
      } else if ('action' in task) {
        counts.action++;
      }
    });
    
    return counts;
  };

  const getWorkflowComplexity = (workflow: Workflow) => {
    const taskCount = Object.keys(workflow.config.tasks).length;
    if (taskCount > 15) return { label: 'Complex', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' };
    if (taskCount > 8) return { label: 'Moderate', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' };
    return { label: 'Simple', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-sm text-muted-foreground">
            Design and manage your laboratory automation workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
            <FileIcon className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button asChild>
            <Link href="/dashboard/workflows/new">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Workflow
            </Link>
          </Button>
        </div>
      </div>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Workflow</DialogTitle>
            <DialogDescription>
              Upload a workflow JSON file to import its configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="workflow-file">Workflow File</Label>
              <Input 
                id="workflow-file" 
                type="file" 
                accept=".json"
                onChange={handleFileChange}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleImport}
              disabled={!importedFile}
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              Import Workflow
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('asc'); }}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('desc'); }}>
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('desc'); }}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('asc'); }}>
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center rounded-md border bg-muted">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-none rounded-l-md"
              onClick={() => setView('grid')}
            >
              <LayoutGridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-none rounded-r-md"
              onClick={() => setView('list')}
            >
              <LayoutListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredWorkflows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3">
              <AlertCircleIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No workflows found</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {searchTerm 
                ? `No workflows match "${searchTerm}". Try a different search term.` 
                : "You haven't created any workflows yet. Get started by creating a new workflow."}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/workflows/new">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Workflow
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow) => {
            const taskCounts = countTasksByType(workflow);
            const complexity = getWorkflowComplexity(workflow);
            const totalTasks = Object.values(taskCounts).reduce((a, b) => a + b, 0);
            
            return (
              <Card key={workflow.id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <CardDescription>
                        {totalTasks} tasks · Last modified {format(new Date(workflow.updated_at), 'MMM d, yyyy')}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/workflows/${workflow.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/workflows/${workflow.id}/run`}>Run</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className={complexity.color}>
                      {complexity.label}
                    </Badge>
                    {taskCounts.pickup > 0 && (
                      <Badge variant="outline">{taskCounts.pickup} pickup</Badge>
                    )}
                    {taskCounts.dropoff > 0 && (
                      <Badge variant="outline">{taskCounts.dropoff} dropoff</Badge>
                    )}
                    {taskCounts.move > 0 && (
                      <Badge variant="outline">{taskCounts.move} move</Badge>
                    )}
                    {taskCounts.action > 0 && (
                      <Badge variant="outline">{taskCounts.action} action</Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <div className="flex w-full justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/workflows/${workflow.id}`}>
                        <BookOpenIcon className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/workflows/${workflow.id}/run`}>
                        Run Workflow
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Complexity</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.map((workflow) => {
                const taskCounts = countTasksByType(workflow);
                const complexity = getWorkflowComplexity(workflow);
                
                return (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div className="font-medium">{workflow.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={complexity.color}>
                        {complexity.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {taskCounts.pickup > 0 && (
                          <Badge variant="outline">{taskCounts.pickup} pickup</Badge>
                        )}
                        {taskCounts.dropoff > 0 && (
                          <Badge variant="outline">{taskCounts.dropoff} dropoff</Badge>
                        )}
                        {taskCounts.move > 0 && (
                          <Badge variant="outline">{taskCounts.move} move</Badge>
                        )}
                        {taskCounts.action > 0 && (
                          <Badge variant="outline">{taskCounts.action} action</Badge>
                        )}
                        {Object.values(taskCounts).every(count => count === 0) && (
                          <span className="text-muted-foreground text-sm">No tasks</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <ClockIcon className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(workflow.created_at), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(workflow.updated_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/workflows/${workflow.id}`}>
                            <BookOpenIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/workflows/${workflow.id}`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/workflows/${workflow.id}/run`}>Run</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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