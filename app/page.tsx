import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { BeakerIcon, FlaskConicalIcon, GanttChartIcon, ListChecksIcon } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero section */}
      <section className="relative w-full bg-gradient-to-br from-background via-background to-accent py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 flex flex-col items-center text-center z-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Lab Automation System
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl">
            Design, manage and execute lab workflows with a powerful and intuitive automation platform
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/dashboard">Demo Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<FlaskConicalIcon className="h-10 w-10 text-primary" />}
              title="Workflow Designer"
              description="Create and modify lab workflows with an intuitive visual interface"
            />
            <FeatureCard 
              icon={<BeakerIcon className="h-10 w-10 text-primary" />}
              title="Workcell Management"
              description="Configure and control lab instruments and equipment"
            />
            <FeatureCard 
              icon={<GanttChartIcon className="h-10 w-10 text-primary" />}
              title="Run Monitoring"
              description="Track workflow execution in real-time with detailed visualizations"
            />
            <FeatureCard 
              icon={<ListChecksIcon className="h-10 w-10 text-primary" />}
              title="Task Scheduling"
              description="Optimize and automate complex multi-step laboratory processes"
            />
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to automate your lab?</h2>
          <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join leading laboratories that are transforming their operations with our automation platform.
          </p>
          <Button asChild size="lg">
            <Link href="/login">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}