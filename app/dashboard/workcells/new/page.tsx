'use client';

import { useState } from 'react';
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
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { WorkcellInput } from '@/lib/types';
import { apiClient } from '@/lib/api/api-client';

export default function NewWorkcellPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const workcell: WorkcellInput = {
        name,
        instruments: {}
      };
      
      // In a real app, this would call the API
      // await apiClient.createWorkcell(workcell);
      
      toast({
        title: 'Success',
        description: 'Workcell created successfully',
      });
      
      router.push('/dashboard/workcells');
    } catch (error) {
      console.error('Error creating workcell:', error);
      toast({
        title: 'Error',
        description: 'Failed to create workcell',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/workcells">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">New Workcell</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Workcell Details</CardTitle>
            <CardDescription>
              Enter the basic information for your workcell
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workcell Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workcell name"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isLoading}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Creating...' : 'Create Workcell'}
          </Button>
        </div>
      </form>
    </div>
  );
}