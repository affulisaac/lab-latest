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

interface Labware {
  id: string;
  instrument: string;
  slot: number;
}

export default function LabwarePanel() {
  const [labware, setLabware] = useState<Labware[]>([]);
  const [newLabware, setNewLabware] = useState<Labware>({
    id: '',
    instrument: '',
    slot: 1
  });

  const handleAdd = () => {
    if (newLabware.id && newLabware.instrument) {
      setLabware([...labware, { ...newLabware }]);
      setNewLabware({ id: '', instrument: '', slot: 1 });
    }
  };

  const handleDelete = (id: string) => {
    setLabware(labware.filter(item => item.id !== id));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Labware</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Labware</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="labwareId">Labware ID</Label>
                  <Input
                    id="labwareId"
                    value={newLabware.id}
                    onChange={(e) => setNewLabware({ ...newLabware, id: e.target.value })}
                    placeholder="Enter labware ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instrument">Instrument</Label>
                  <Select
                    value={newLabware.instrument}
                    onValueChange={(value) => setNewLabware({ ...newLabware, instrument: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select instrument" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stacker">Stacker</SelectItem>
                      <SelectItem value="liquid_handler">Liquid Handler</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot">Slot</Label>
                  <Input
                    id="slot"
                    type="number"
                    min={1}
                    value={newLabware.slot}
                    onChange={(e) => setNewLabware({ ...newLabware, slot: parseInt(e.target.value) })}
                  />
                </div>
                <Button className="w-full" onClick={handleAdd}>Add Labware</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {labware.map((item) => (
          <Card key={item.id}>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{item.id}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor={`instrument-${item.id}`} className="text-xs">Instrument</Label>
                  <Input 
                    id={`instrument-${item.id}`}
                    value={item.instrument}
                    className="h-7 text-xs"
                    readOnly
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`slot-${item.id}`} className="text-xs">Slot</Label>
                  <Input 
                    id={`slot-${item.id}`}
                    type="number"
                    value={item.slot}
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
        <h3 className="text-sm font-medium mb-2">Labware Templates</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-16 text-xs justify-start">
            <div className="text-left">
              <div className="font-medium">Microplate</div>
              <div className="text-muted-foreground text-xs">96-well standard</div>
            </div>
          </Button>
          <Button variant="outline" className="h-16 text-xs justify-start">
            <div className="text-left">
              <div className="font-medium">Deep Well</div>
              <div className="text-muted-foreground text-xs">24-well plate</div>
            </div>
          </Button>
          <Button variant="outline" className="h-16 text-xs justify-start">
            <div className="text-left">
              <div className="font-medium">Tube Rack</div>
              <div className="text-muted-foreground text-xs">15mL conical</div>
            </div>
          </Button>
          <Button variant="outline" className="h-16 text-xs justify-start">
            <div className="text-left">
              <div className="font-medium">Reservoir</div>
              <div className="text-muted-foreground text-xs">12-channel</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}