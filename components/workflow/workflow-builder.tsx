'use client';

import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  EdgeTypes,
  NodeTypes,
  Panel,
  ReactFlowProvider,
  XYPosition,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import TaskNode from './task-node';
import { 
  ChevronRightIcon,
  FileJsonIcon, 
  GripVerticalIcon,
  PanelLeftIcon, 
  PanelRightIcon, 
  TrashIcon,
  XIcon,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import TaskPanel from './task-panel';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import LabwarePanel from './labware-panel';
import { WorkflowConfig } from '@/lib/types';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useWorkcells } from '@/lib/hooks/use-workcells';
import { Badge } from '../ui/badge';
import { driverOptions } from '@/lib/types/instrument';

interface WorkflowBuilderProps {
  initialWorkflow?: WorkflowConfig;
  onSave?: (workflow: WorkflowConfig) => void;
}

const nodeTypes: NodeTypes = {
  task: TaskNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const edgeOptions = {
  animated: true,
  style: {
    strokeWidth: 2,
    stroke: 'hsl(var(--primary))',
  },
};

export default function WorkflowBuilder({ initialWorkflow, onSave }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Node | null>(null);
  const [selectedWorkcellId, setSelectedWorkcellId] = useState<string>('');
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string>('');

  const { workcells, isLoading } = useWorkcells();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, ...edgeOptions }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedTask(node);
    setShowRightPanel(true);
  }, []);

  const onDeleteNode = useCallback((nodeId: string) => {
    setNodes(nodes => nodes.filter(node => node.id !== nodeId));
    setEdges(edges => edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedTask?.id === nodeId) {
      setSelectedTask(null);
    }
  }, [setNodes, setEdges, selectedTask]);

  const selectedWorkcell = workcells.find(w => w.id === selectedWorkcellId);
  const selectedInstrument = selectedWorkcell?.instruments[selectedInstrumentId];

  const createInstrumentNode = useCallback(() => {
    if (!selectedInstrument) return;

    const nodeCount = nodes.length;
    const position = {
      x: 100 + (nodeCount * 50),
      y: 100 + (nodeCount * 50)
    };

    const nodeId = `${selectedInstrumentId}-${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: 'task',
      position,
      data: {
        label: selectedInstrumentId,
        taskType: 'instrument',
        instrument: {
          ...selectedInstrument,
          driver: {
            ...selectedInstrument.driver,
            tasks: driverOptions.find(d => d.name === selectedInstrument.driver.name)?.tasks || []
          }
        },
        selectedTasks: [],
        selectedLabware: {},
        onTaskSelect: (taskName: string) => {
          setNodes(nodes => nodes.map(node => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  selectedTasks: [...(node.data.selectedTasks || []), taskName],
                  selectedLabware: {
                    ...node.data.selectedLabware,
                    [taskName]: []
                  }
                }
              };
            }
            return node;
          }));
        },
        onTaskRemove: (taskName: string) => {
          setNodes(nodes => nodes.map(node => {
            if (node.id === nodeId) {
              const { [taskName]: removed, ...remainingLabware } = node.data.selectedLabware;
              return {
                ...node,
                data: {
                  ...node.data,
                  selectedTasks: node.data.selectedTasks.filter(t => t !== taskName),
                  selectedLabware: remainingLabware
                }
              };
            }
            return node;
          }));
        },
        onLabwareSelect: (taskName: string, labwareId: string) => {
          setNodes(nodes => nodes.map(node => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  selectedLabware: {
                    ...node.data.selectedLabware,
                    [taskName]: [...(node.data.selectedLabware[taskName] || []), labwareId]
                  }
                }
              };
            }
            return node;
          }));
        },
        onLabwareRemove: (taskName: string, labwareId: string) => {
          setNodes(nodes => nodes.map(node => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  selectedLabware: {
                    ...node.data.selectedLabware,
                    [taskName]: node.data.selectedLabware[taskName].filter(id => id !== labwareId)
                  }
                }
              };
            }
            return node;
          }));
        },
        onDelete: () => onDeleteNode(nodeId)
      }
    };

    setNodes(nodes => [...nodes, newNode]);
  }, [selectedInstrument, selectedInstrumentId, setNodes, nodes.length, onDeleteNode]);

  const generateWorkflowConfig = (): WorkflowConfig => {
    const tasks = nodes.reduce((acc, node) => {
      acc[node.id] = node.data.task;
      return acc;
    }, {});
    
    return {
      tasks,
      instruments: {},
      labware: {},
      history: {},
      time_constraints: [],
      instrument_blocks: []
    };
  };

  const jsonOutput = useMemo(() => {
    const config = generateWorkflowConfig();
    return JSON.stringify(config, null, 2);
  }, [nodes, edges]);

  if (isLoading) {
    return <div>Loading workcells...</div>;
  }

  return (
    <ReactFlowProvider>
      <div className="h-[calc(100vh-8rem)] border rounded-xl overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <ResizablePanelGroup direction="horizontal">
          {showLeftPanel && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <div className="h-full border-r">
                  <div className="p-4 border-b bg-card">
                    <h2 className="text-lg font-semibold">Workflow Builder</h2>
                    <p className="text-sm text-muted-foreground">Design your automation workflow</p>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Workcell</label>
                      <Select value={selectedWorkcellId} onValueChange={setSelectedWorkcellId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a workcell" />
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

                    {selectedWorkcell && (
                      <div className="space-y-4">
                        <Separator />
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Select Instrument</label>
                          <Select value={selectedInstrumentId} onValueChange={setSelectedInstrumentId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an instrument" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(selectedWorkcell.instruments).map(([id, instrument]) => (
                                <SelectItem key={id} value={id}>
                                  {id} - {instrument.driver.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedInstrument && (
                          <div className="space-y-4">
                            <Separator />
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium">Available Tasks</h3>
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">{selectedInstrumentId}</CardTitle>
                                  <p className="text-xs text-muted-foreground">
                                    {selectedInstrument.driver.name} v{selectedInstrument.driver.version}
                                  </p>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {selectedInstrument.driver.tasks?.map(task => (
                                      <div key={task.name} className="p-2 border rounded-lg">
                                        <div className="font-medium text-sm">{task.name}</div>
                                        <div className="text-xs text-muted-foreground">{task.description}</div>
                                        {task.parameters && (
                                          <div className="mt-1 flex flex-wrap gap-1">
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
                                </CardContent>
                              </Card>
                              <Button 
                                className="w-full" 
                                onClick={createInstrumentNode}
                                disabled={!selectedInstrument}
                              >
                                Add to Workflow
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle>
                <GripVerticalIcon className="h-4 w-4" />
              </ResizableHandle>
            </>
          )}
          
          <ResizablePanel defaultSize={showLeftPanel && showRightPanel ? 60 : 80}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={edgeOptions}
              fitView
            >
              <Background 
                variant="dots"
                gap={12}
                size={1}
                color="hsl(var(--muted-foreground))"
                className="opacity-5"
              />
              <Controls 
                className="bg-background/80 backdrop-blur-sm border rounded-lg p-2"
                showInteractive={false}
              />
              <MiniMap 
                nodeColor={(node) => {
                  switch (node.data?.taskType) {
                    case 'instrument': return 'hsl(var(--primary))';
                    default: return 'hsl(var(--muted-foreground))';
                  }
                }}
                maskColor="rgba(0, 0, 0, 0.1)"
                className="bg-background/80 backdrop-blur-sm rounded-lg"
              />
              
              <Panel position="top-right" className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setShowLeftPanel(!showLeftPanel)}>
                  {showLeftPanel ? <PanelLeftIcon className="h-4 w-4" /> : <PanelRightIcon className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={() => setShowRightPanel(!showRightPanel)}>
                  <FileJsonIcon className="h-4 w-4" />
                </Button>
              </Panel>
            </ReactFlow>
          </ResizablePanel>

          {showRightPanel && (
            <>
              <ResizableHandle withHandle>
                <GripVerticalIcon className="h-4 w-4" />
              </ResizableHandle>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <div className="h-full border-l">
                  <div className="p-4 border-b bg-card flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Configuration</h3>
                      <p className="text-sm text-muted-foreground">Workflow JSON Output</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowRightPanel(false)}>
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="h-[calc(100vh-16rem)] p-4">
                    <pre className="text-xs font-mono bg-muted p-2 rounded-lg overflow-x-auto">
                      {jsonOutput}
                    </pre>
                  </ScrollArea>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </ReactFlowProvider>
  );
}