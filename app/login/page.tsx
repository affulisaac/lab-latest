'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth/auth-provider';
import { motion } from 'framer-motion';
import { FlaskConicalIcon, Loader2Icon, LockIcon, MailIcon } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const floatingBubbleVariants = {
  initial: (i: number) => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    scale: Math.random() * 0.5 + 0.5,
  }),
  animate: (i: number) => ({
    x: [
      Math.random() * window.innerWidth,
      Math.random() * window.innerWidth,
      Math.random() * window.innerWidth,
    ],
    y: [
      Math.random() * window.innerHeight,
      Math.random() * window.innerHeight,
      Math.random() * window.innerHeight,
    ],
    transition: {
      duration: 20 + i * 5,
      repeat: Infinity,
      ease: "linear",
    },
  }),
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'admin@lab.com',
      password: 'password123',
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      await login(values.email, values.password);
      toast({
        title: 'Welcome back! 👋',
        description: 'Successfully logged in to your account.',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={floatingBubbleVariants}
            initial="initial"
            animate="animate"
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle at center, hsl(var(--primary) / 0.2), transparent)`,
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              filter: 'blur(40px)',
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md mx-4"
      >
        <motion.div
          variants={itemVariants}
          className="bg-background/80 backdrop-blur-xl rounded-2xl shadow-2xl border p-8"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="bg-primary/10 p-3 rounded-2xl mb-4"
            >
              <FlaskConicalIcon className="w-8 h-8 text-primary" />
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-2xl font-bold tracking-tight"
            >
              Welcome back
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-sm text-muted-foreground mt-1"
            >
              Sign in to your account to continue
            </motion.p>
          </motion.div>

          <motion.form
            variants={itemVariants}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="relative">
                <MailIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  {...form.register('email')}
                  className="h-11 pl-10 pr-4 bg-muted/50"
                />
                {form.formState.errors.email && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-destructive absolute -bottom-5 left-0"
                  >
                    {form.formState.errors.email.message}
                  </motion.span>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="relative">
                <LockIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  {...form.register('password')}
                  className="h-11 pl-10 pr-16 bg-muted/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                {form.formState.errors.password && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-destructive absolute -bottom-5 left-0"
                  >
                    {form.formState.errors.password.message}
                  </motion.span>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full h-11 mt-6 relative overflow-hidden"
                disabled={isLoading}
              >
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isLoading ? 1 : 0,
                    scale: isLoading ? 1 : 0.8,
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-primary"
                >
                  <Loader2Icon className="w-5 h-5 animate-spin" />
                </motion.div>
                <motion.span
                  initial={false}
                  animate={{
                    opacity: isLoading ? 0 : 1,
                    y: isLoading ? 20 : 0,
                  }}
                >
                  Sign in
                </motion.span>
              </Button>
            </motion.div>
          </motion.form>

          <motion.p
            variants={itemVariants}
            className="text-sm text-center text-muted-foreground mt-6"
          >
            Demo credentials: admin@lab.com / password123
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}