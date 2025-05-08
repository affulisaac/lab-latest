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
import {
  AlertCircleIcon,
  ArrowUpDownIcon,
  BeakerIcon,
  BoltIcon,
  FilterIcon,
  LayoutGridIcon,
  LayoutListIcon,
  MoreHorizontalIcon,
  PlusIcon,
  PowerIcon,
  SearchIcon,
  SettingsIcon,
  WifiIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from '@/components/ui/tooltip';
import { useWorkcells } from '@/lib/hooks/use-workcells';

export default function WorkcellsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const {
    workcells,
    isLoading,
    initialiseWorkcell,
    initialiseInstruments,
    deleteWorkcell
  } = useWorkcells();

  const filteredWorkcells = workcells
    ?.filter((workcell) =>
      workcell.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    }) || [];

  const handleInitialize = async (id: string) => {
    try {
      await initialiseWorkcell.mutateAsync(id);
    } catch (error) {
      console.error('Error initializing workcell:', error);
    }
  };

  const handleInitializeInstruments = async (id: string, instrumentIds: string[]) => {
    try {
      await initialiseInstruments.mutateAsync({ id, instrumentIds });
    } catch (error) {
      console.error('Error initializing instruments:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkcell.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting workcell:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading workcells...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workcells</h1>
            <p className="text-sm text-muted-foreground">
              Manage and monitor your laboratory workcells
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/workcells/new">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Workcell
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workcells..."
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
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
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
                </DropdownMenuGroup>
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

        {filteredWorkcells.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-muted p-3">
                <AlertCircleIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No workcells found</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {searchTerm 
                  ? `No workcells match "${searchTerm}". Try a different search term.` 
                  : "You haven't created any workcells yet."}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/workcells/new">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Workcell
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkcells.map((workcell) => {
              const instrumentCount = Object.keys(workcell.instruments).length;
              
              return (
                <Card key={workcell.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{workcell.name}</CardTitle>
                        <CardDescription>
                          {instrumentCount} instrument{instrumentCount !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/workcells/${workcell.id}`}>
                              Configure
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleInitialize(workcell.id)}>
                            Initialize
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(workcell.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(workcell.instruments).map(([id, instrument]) => (
                          <Tooltip key={id}>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="cursor-help">
                                <BeakerIcon className="w-3 h-3 mr-1" />
                                {instrument.driver.name} v{instrument.driver.version}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>ID: {id}</p>
                              <p>Config: {JSON.stringify(instrument.driver.config)}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 border-t">
                    <div className="flex w-full justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/workcells/${workcell.id}`}>
                          <SettingsIcon className="h-4 w-4 mr-2" />
                          Configure
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleInitialize(workcell.id)}
                      >
                        <PowerIcon className="h-4 w-4 mr-2" />
                        Initialize
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Instruments</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkcells.map((workcell) => {
                  const instrumentCount = Object.keys(workcell.instruments).length;
                  
                  return (
                    <TableRow key={workcell.id}>
                      <TableCell>
                        <div className="font-medium">{workcell.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {instrumentCount} instrument{instrumentCount !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(workcell.instruments).map(([id, instrument]) => (
                            <Tooltip key={id}>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="cursor-help">
                                  {instrument.driver.name}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Version: {instrument.driver.version}</p>
                                <p>Config: {JSON.stringify(instrument.driver.config)}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(workcell.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(workcell.updated_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/workcells/${workcell.id}`}>
                              <SettingsIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleInitialize(workcell.id)}>
                                Initialize
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const instrumentIds = Object.keys(workcell.instruments);
                                handleInitializeInstruments(workcell.id, instrumentIds);
                              }}>
                                Initialize Instruments
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDelete(workcell.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}