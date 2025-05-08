'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Instrument {
  id: string;
  type: string;
  capacity: number;
}

export default function InstrumentPanel() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [newInstrument, setNewInstrument] = useState<Instrument>({
    id: '',
    type: '',
    capacity: 1
  });

  const handleAdd = () => {
    if (newInstrument.id && newInstrument.type) {
      setInstruments([...instruments, { ...newInstrument }]);
      setNewInstrument({ id: '', type: '', capacity: 1 });
    }
  };

  const handleDelete = (id: string) => {
    setInstruments(instruments.filter(item => item.id !== id));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Instruments</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Instrument</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="instrumentId">Instrument ID</Label>
                  <Input
                    id="instrumentId"
                    value={newInstrument.id}
                    onChange={(e) => setNewInstrument({ ...newInstrument, id: e.target.value })}
                    placeholder="Enter instrument ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newInstrument.type}
                    onValueChange={(value) => setNewInstrument({ ...newInstrument, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Type A</SelectItem>
                      <SelectItem value="B">Type B</SelectItem>
                      <SelectItem value="C">Type C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    value={newInstrument.capacity}
                    onChange={(e) => setNewInstrument({ ...newInstrument, capacity: parseInt(e.target.value) })}
                  />
                </div>
                <Button className="w-full" onClick={handleAdd}>Add Instrument</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {instruments.map((instrument) => (
          <Card key={instrument.id}>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{instrument.id}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => handleDelete(instrument.id)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor={`type-${instrument.id}`} className="text-xs">Type</Label>
                  <Input 
                    id={`type-${instrument.id}`}
                    value={instrument.type}
                    className="h-7 text-xs"
                    readOnly
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`capacity-${instrument.id}`} className="text-xs">Capacity</Label>
                  <Input 
                    id={`capacity-${instrument.id}`}
                    type="number"
                    value={instrument.capacity}
                    className="h-7 text-xs"
                    readOnly
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-medium mb-2">Instrument Templates</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-16 text-xs justify-start">
            <div className="text-left">
              <div className="font-medium">Liquid Handler</div>
              <div className="text-muted-foreground text-xs">8-channel pipettor</div>
            </div>
          </Button>
          <Button variant="outline" className="h-16 text-xs justify-start">
            <div className="text-left">
              <div className="font-medium">Robotic Arm</div>
              <div className="text-muted-foreground text-xs">Labware transport</div>
            </div>
          </Button>
          <Button variant="outline" className="h-16 text-xs justify-start">
            <div className="text-left">
              <div className="font-medium">Stacker</div>
              <div className="text-muted-foreground text-xs">Plate storage</div>
            </div>
          </Button>
          <Button variant="outline" className="h-16 text-xs justify-start">
            <div className="text-left">
              <div className="font-medium">Centrifuge</div>
              <div className="text-muted-foreground text-xs">Sample processing</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}