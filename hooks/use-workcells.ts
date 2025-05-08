import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workcellService } from '@/lib/api/workcell-service';
import { WorkcellInput } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function useWorkcells() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: workcells,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['workcells'],
    queryFn: () => workcellService.getWorkcells(),
  });

  const createWorkcell = useMutation({
    mutationFn: (workcell: WorkcellInput) => workcellService.createWorkcell(workcell),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workcells'] });
      toast({
        title: 'Success',
        description: 'Workcell created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create workcell',
        variant: 'destructive',
      });
    },
  });

  const updateWorkcell = useMutation({
    mutationFn: ({ id, workcell }: { id: string; workcell: WorkcellInput }) =>
      workcellService.updateWorkcell(id, workcell),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workcells'] });
      toast({
        title: 'Success',
        description: 'Workcell updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update workcell',
        variant: 'destructive',
      });
    },
  });

  const deleteWorkcell = useMutation({
    mutationFn: (id: string) => workcellService.deleteWorkcell(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workcells'] });
      toast({
        title: 'Success',
        description: 'Workcell deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete workcell',
        variant: 'destructive',
      });
    },
  });

  const initialiseWorkcell = useMutation({
    mutationFn: (id: string) => workcellService.initialiseWorkcell(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workcells'] });
      toast({
        title: 'Success',
        description: 'Workcell initialized successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to initialize workcell',
        variant: 'destructive',
      });
    },
  });

  const initialiseInstruments = useMutation({
    mutationFn: ({ id, instrumentIds }: { id: string; instrumentIds: string[] }) =>
      workcellService.initialiseWorkcellInstruments(id, instrumentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workcells'] });
      toast({
        title: 'Success',
        description: 'Instruments initialized successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to initialize instruments',
        variant: 'destructive',
      });
    },
  });

  return {
    workcells,
    isLoading,
    error,
    createWorkcell,
    updateWorkcell,
    deleteWorkcell,
    initialiseWorkcell,
    initialiseInstruments,
  };
}