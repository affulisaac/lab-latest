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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useParams, useRouter } from 'next/navigation';
import { Workcell } from '@/lib/types';
import { ChevronLeftIcon, PowerIcon, SaveIcon, TrashIcon, PlusIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWorkcells } from '@/lib/hooks/use-workcells';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { driverOptions } from '@/lib/types/instrument';

// Schema matches API payload structure
const driverConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  version: z.string().min(1, "Version is required"),
  config: z.record(z.any()).default({})
});

const instrumentSchema = z.object({
  id: z.string().min(1, "ID is required"),
  driver: driverConfigSchema
});

const workcellSchema = z.object({
  name: z.string().min(1, "Name is required"),
  instruments: z.record(instrumentSchema).default({})
});

type FormValues = z.infer<typeof workcellSchema>;

export default function WorkcellPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showAddInstrument, setShowAddInstrument] = useState(false);
  const [newInstrument, setNewInstrument] = useState({
    id: '',
    driver: {
      name: '',
      version: '',
      config: {} as Record<string, any>
    }
  });

  const {
    workcells,
    updateWorkcell,
    deleteWorkcell,
    initialiseWorkcell,
    initialiseInstruments,
    executeInstrumentAction
  } = useWorkcells();

  const workcell = workcells.find(w => w.id === params.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(workcellSchema),
    defaultValues: {
      name: workcell?.name || '',
      instruments: workcell?.instruments || {}
    }
  });

  useEffect(() => {
    if (workcell) {
      form.reset({
        name: workcell.name,
        instruments: workcell.instruments
      });
      setIsLoading(false);
    }
  }, [workcell, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateWorkcell.mutateAsync({
        id: params.id as string,
        workcell: values
      });
      toast({
        title: 'Success',
        description: 'Workcell updated successfully',
      });
    } catch (error) {
      console.error('Error updating workcell:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workcell',
        variant: 'destructive',
      });
    }
  };

  // Get available versions for selected driver
  const availableVersions = driverOptions.find(
    driver => driver.name === newInstrument.driver.name
  )?.versions || [];

  // Get available tasks for selected driver
  const availableTasks = driverOptions.find(
    driver => driver.name === newInstrument.driver.name
  )?.tasks || [];

  const handleAddInstrument = () => {
    if (!newInstrument.id || !newInstrument.driver.name || !newInstrument.driver.version) {
      toast({
        title: 'Error',
        description: 'Instrument ID, driver name, and version are required',
        variant: 'destructive',
      });
      return;
    }

    const instruments = form.getValues('instruments');
    form.setValue('instruments', {
      ...instruments,
      [newInstrument.id]: newInstrument
    });
    setShowAddInstrument(false);
    setNewInstrument({
      id: '',
      driver: {
        name: '',
        version: '',
        config: {}
      }
    });
  };

  const handleRemoveInstrument = (instrumentId: string) => {
    const instruments = form.getValues('instruments');
    const { [instrumentId]: removed, ...rest } = instruments;
    form.setValue('instruments', rest);
  };

  const handleDelete = async () => {
    try {
      await deleteWorkcell.mutateAsync(params.id as string);
      router.push('/dashboard/workcells');
    } catch (error) {
      console.error('Error deleting workcell:', error);
    }
  };

  const handleInitialize = async () => {
    try {
      await initialiseWorkcell.mutateAsync(params.id as string);
      toast({
        title: 'Success',
        description: 'Workcell initialized successfully',
      });
    } catch (error) {
      console.error('Error initializing workcell:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize workcell',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading workcell...</div>;
  }

  if (!workcell) {
    return <div>Workcell not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/workcells">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{workcell.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="text-red-500" onClick={handleDelete}>
            <TrashIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleInitialize}>
            <PowerIcon className="h-4 w-4" />
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={updateWorkcell.isPending}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {updateWorkcell.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic workcell configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workcell Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Connected Instruments</CardTitle>
                  <CardDescription>Configure and manage instruments in this workcell</CardDescription>
                </div>
                <Dialog open={showAddInstrument} onOpenChange={setShowAddInstrument}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Instrument
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Instrument</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Instrument ID</Label>
                        <Input
                          value={newInstrument.id}
                          onChange={(e) => setNewInstrument({
                            ...newInstrument,
                            id: e.target.value
                          })}
                          placeholder="Enter instrument ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Driver</Label>
                        <Select
                          value={newInstrument.driver.name}
                          onValueChange={(value) => setNewInstrument({
                            ...newInstrument,
                            driver: {
                              ...newInstrument.driver,
                              name: value,
                              version: '' // Reset version when driver changes
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {driverOptions.map(driver => (
                              <SelectItem key={driver.name} value={driver.name}>
                                <div>
                                  <div>{driver.name}</div>
                                  <div className="text-xs text-muted-foreground">{driver.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Version</Label>
                        <Select
                          value={newInstrument.driver.version}
                          onValueChange={(value) => setNewInstrument({
                            ...newInstrument,
                            driver: {
                              ...newInstrument.driver,
                              version: value
                            }
                          })}
                          disabled={!newInstrument.driver.name}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select version" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableVersions.map(version => (
                              <SelectItem key={version} value={version}>
                                {version}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Configuration</Label>
                        <div className="space-y-2">
                          {Object.entries(newInstrument.driver.config).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <Input
                                placeholder="Key"
                                value={key}
                                onChange={(e) => {
                                  const { [key]: oldValue, ...rest } = newInstrument.driver.config;
                                  setNewInstrument({
                                    ...newInstrument,
                                    driver: {
                                      ...newInstrument.driver,
                                      config: {
                                        ...rest,
                                        [e.target.value]: value
                                      }
                                    }
                                  });
                                }}
                              />
                              <Input
                                placeholder="Value"
                                value={value}
                                onChange={(e) => {
                                  setNewInstrument({
                                    ...newInstrument,
                                    driver: {
                                      ...newInstrument.driver,
                                      config: {
                                        ...newInstrument.driver.config,
                                        [key]: e.target.value
                                      }
                                    }
                                  });
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const { [key]: removed, ...rest } = newInstrument.driver.config;
                                  setNewInstrument({
                                    ...newInstrument,
                                    driver: {
                                      ...newInstrument.driver,
                                      config: rest
                                    }
                                  });
                                }}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setNewInstrument({
                                ...newInstrument,
                                driver: {
                                  ...newInstrument.driver,
                                  config: {
                                    ...newInstrument.driver.config,
                                    '': ''
                                  }
                                }
                              });
                            }}
                          >
                            Add Config Field
                          </Button>
                        </div>
                      </div>
                      {newInstrument.driver.name && (
                        <div className="space-y-2">
                          <Label>Available Tasks</Label>
                          <div className="space-y-2">
                            {availableTasks.map(task => (
                              <div key={task.name} className="p-2 border rounded-lg">
                                <div className="font-medium">{task.name}</div>
                                <div className="text-sm text-muted-foreground">{task.description}</div>
                                {task.parameters.length > 0 && (
                                  <div className="mt-1 flex gap-1 flex-wrap">
                                    {task.parameters.map(param => (
                                      <Badge key={param} variant="secondary" className="text-xs">
                                        {param}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <Button 
                        className="w-full" 
                        onClick={handleAddInstrument}
                        disabled={!newInstrument.id || !newInstrument.driver.name || !newInstrument.driver.version}
                      >
                        Add Instrument
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(form.watch('instruments')).map(([id, instrument]) => {
                  const driverInfo = driverOptions.find(d => d.name === instrument.driver.name);
                  return (
                    <Card key={id}>
                      <CardHeader className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{instrument.id}</CardTitle>
                            <CardDescription>
                              {instrument.driver.name} v{instrument.driver.version}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Connected</Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveInstrument(id)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4">
                          {Object.entries(instrument.driver.config).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <Input
                                placeholder="Key"
                                value={key}
                                onChange={(e) => {
                                  const instruments = form.getValues('instruments');
                                  const { [key]: oldValue, ...rest } = instruments[id].driver.config;
                                  form.setValue('instruments', {
                                    ...instruments,
                                    [id]: {
                                      ...instrument,
                                      driver: {
                                        ...instrument.driver,
                                        config: {
                                          ...rest,
                                          [e.target.value]: value
                                        }
                                      }
                                    }
                                  });
                                }}
                              />
                              <Input
                                placeholder="Value"
                                value={value as string}
                                onChange={(e) => {
                                  const instruments = form.getValues('instruments');
                                  form.setValue('instruments', {
                                    ...instruments,
                                    [id]: {
                                      ...instrument,
                                      driver: {
                                        ...instrument.driver,
                                        config: {
                                          ...instrument.driver.config,
                                          [key]: e.target.value
                                        }
                                      }
                                    }
                                  });
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const instruments = form.getValues('instruments');
                                  const { [key]: removed, ...rest } = instruments[id].driver.config;
                                  form.setValue('instruments', {
                                    ...instruments,
                                    [id]: {
                                      ...instrument,
                                      driver: {
                                        ...instrument.driver,
                                        config: rest
                                      }
                                    }
                                  });
                                }}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              const instruments = form.getValues('instruments');
                              form.setValue('instruments', {
                                ...instruments,
                                [id]: {
                                  ...instrument,
                                  driver: {
                                    ...instrument.driver,
                                    config: {
                                      ...instrument.driver.config,
                                      '': ''
                                    }
                                  }
                                }
                              });
                            }}
                          >
                            Add Config Field
                          </Button>
                        </div>
                        {driverInfo && (
                          <div className="space-y-2">
                            <Label>Available Tasks</Label>
                            <div className="space-y-2">
                              {driverInfo.tasks.map(task => (
                                <div key={task.name} className="p-2 border rounded-lg">
                                  <div className="font-medium">{task.name}</div>
                                  <div className="text-sm text-muted-foreground">{task.description}</div>
                                  {task.parameters.length > 0 && (
                                    <div className="mt-1 flex gap-1 flex-wrap">
                                      {task.parameters.map(param => (
                                        <Badge key={param} variant="secondary" className="text-xs">
                                          {param}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => initialiseInstruments.mutate({
                              id: params.id as string,
                              instrumentIds: [id]
                            })}
                          >
                            Initialize
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => executeInstrumentAction.mutate({
                              id: params.id as string,
                              instrumentId: id,
                              action: {
                                action: 'home',
                                arguments: {}
                              }
                            })}
                          >
                            Home
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => executeInstrumentAction.mutate({
                              id: params.id as string,
                              instrumentId: id,
                              action: {
                                action: 'reset',
                                arguments: {}
                              }
                            })}
                          >
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}