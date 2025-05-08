'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Activity, 
  BarChart4Icon, 
  FlaskConicalIcon, 
  Gauge, 
  ListChecksIcon, 
  PlusIcon, 
  RefreshCcwIcon 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data
const recentRuns = [
  { id: '1', workflow: 'Sample Preparation', status: 'COMPLETED', date: '2025-04-01 09:30' },
  { id: '2', workflow: 'DNA Extraction', status: 'RUNNING', date: '2025-04-01 10:15' },
  { id: '3', workflow: 'Protein Analysis', status: 'PAUSED', date: '2025-03-31 14:20' },
  { id: '4', workflow: 'Cell Culture', status: 'STOPPED', date: '2025-03-30 11:05' },
];

const workflowStats = [
  { name: 'Jan', runs: 4 },
  { name: 'Feb', runs: 7 },
  { name: 'Mar', runs: 12 },
  { name: 'Apr', runs: 9 },
  { name: 'May', runs: 15 },
  { name: 'Jun', runs: 18 },
];

const instrumentUsage = [
  { name: 'Liquid Handler', value: 40 },
  { name: 'Centrifuge', value: 30 },
  { name: 'Stacker', value: 20 },
  { name: 'Transport', value: 10 },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const statusColors = {
  'COMPLETED': 'text-green-500',
  'RUNNING': 'text-blue-500',
  'PAUSED': 'text-amber-500',
  'STOPPED': 'text-red-500',
};

const statusBgColors = {
  'COMPLETED': 'bg-green-100 dark:bg-green-900',
  'RUNNING': 'bg-blue-100 dark:bg-blue-900',
  'PAUSED': 'bg-amber-100 dark:bg-amber-900',
  'STOPPED': 'bg-red-100 dark:bg-red-900',
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCcwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/workflows/new">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Workflow
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardCard 
              title="Active Runs" 
              value="3" 
              description="Currently executing workflows"
              icon={<Activity className="h-4 w-4 text-primary" />}
              linkHref="/dashboard/runs"
              linkText="View all runs"
            />
            <DashboardCard 
              title="Workflows" 
              value="12" 
              description="Total configured workflows"
              icon={<ListChecksIcon className="h-4 w-4 text-primary" />}
              linkHref="/dashboard/workflows"
              linkText="Manage workflows"
            />
            <DashboardCard 
              title="Workcells" 
              value="4" 
              description="Connected lab equipment"
              icon={<FlaskConicalIcon className="h-4 w-4 text-primary" />}
              linkHref="/dashboard/workcells"
              linkText="View workcells"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Runs</CardTitle>
                <CardDescription>
                  Workflow execution history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${run.status === 'RUNNING' ? 'animate-pulse' : ''} ${statusBgColors[run.status as keyof typeof statusBgColors]}`} />
                        <div>
                          <div className="font-medium">{run.workflow}</div>
                          <div className="text-xs text-muted-foreground">{run.date}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${statusColors[run.status as keyof typeof statusColors]}`}>
                        {run.status}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/dashboard/runs">View all runs</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Activity</CardTitle>
                <CardDescription>
                  Number of runs in the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={workflowStats}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="runs" 
                        stroke="hsl(var(--chart-1))" 
                        fillOpacity={1} 
                        fill="url(#colorRuns)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardCard 
              title="Avg. Run Time" 
              value="42m" 
              description="Average workflow execution time"
              icon={<Gauge className="h-4 w-4 text-primary" />}
            />
            <DashboardCard 
              title="Success Rate" 
              value="94%" 
              description="Completed runs without errors"
              icon={<BarChart4Icon className="h-4 w-4 text-primary" />}
            />
            <DashboardCard 
              title="Total Tasks" 
              value="367" 
              description="Tasks executed this month"
              icon={<ListChecksIcon className="h-4 w-4 text-primary" />}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Run times by workflow type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Sample Prep', time: 35 },
                      { name: 'DNA Extract', time: 62 },
                      { name: 'Protein Analysis', time: 48 },
                      { name: 'Cell Culture', time: 120 },
                      { name: 'Sequencing', time: 90 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value} min`, 'Run Time']} />
                    <Bar dataKey="time" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Instrument Usage</CardTitle>
                <CardDescription>
                  Distribution of instrument usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={instrumentUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {instrumentUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Workcell Utilization</CardTitle>
                <CardDescription>
                  Operating time by workcell
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Workcell A', hours: 156, capacity: 240 },
                        { name: 'Workcell B', hours: 132, capacity: 240 },
                        { name: 'Workcell C', hours: 198, capacity: 240 },
                        { name: 'Workcell D', hours: 87, capacity: 240 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="hours" fill="hsl(var(--chart-3))" name="Operating Hours" />
                      <Bar dataKey="capacity" fill="hsl(var(--chart-5))" fillOpacity={0.3} name="Capacity" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  linkHref?: string;
  linkText?: string;
}

function DashboardCard({ title, value, description, icon, linkHref, linkText }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {linkHref && linkText && (
          <div className="mt-4">
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href={linkHref}>{linkText}</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}