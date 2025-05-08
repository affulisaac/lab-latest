'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ActivityIcon, BellIcon, FlaskConicalIcon, HomeIcon, LayoutDashboardIcon, ListChecksIcon, LogOutIcon, MenuIcon, MoonIcon, Settings2Icon, SunIcon, ImportIcon as SupportIcon, UsersIcon, XIcon, BarChart3Icon, ChevronRightIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth/auth-provider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '../ui/badge';

interface DashboardShellProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface GroupItem {
  name: string;
  color: string;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation: NavigationItem[] = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Workflows',
      href: '/dashboard/workflows',
      icon: ActivityIcon,
      badge: 10,
    },
    {
      name: 'Workcells',
      href: '/dashboard/workcells',
      icon: ListChecksIcon,
    },
    {
      name: 'Runs',
      href: '/dashboard/runs',
      icon: BellIcon,
      badge: 21,
    },
    {
      name: 'Users',
      href: '/dashboard/users',
      icon: UsersIcon,
    },
    {
      name: 'Reports',
      href: '/dashboard/reports',
      icon: BarChart3Icon,
    },
  ];

  const groups: GroupItem[] = [
    { name: 'Notifications', color: 'bg-green-500' },
    { name: 'Report', color: 'bg-blue-500' },
    { name: 'Settings', color: 'bg-amber-500' },
  ];

  const initials = user ? 
    `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() : 
    'LU';

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col justify-between h-full py-4">
      <div className="space-y-4">
        <div className={cn(
          "px-4 flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-2">
            <FlaskConicalIcon className="h-8 w-8 text-primary" />
            {!isCollapsed && <h1 className="text-xl font-bold">AutoLab</h1>}
          </div>
          {mobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <XIcon className="h-5 w-5" />
            </Button>
          )}
          {!mobile && !isCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className={cn(
          "px-4 flex items-center rounded-lg bg-muted/50",
          isCollapsed ? "mx-2 justify-center py-2" : "mx-0"
        )}>
          {isCollapsed ? (
            <SearchIcon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-2 py-2 w-full mx-3">
              <SearchIcon className="h-5 w-5 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
            </div>
          )}
        </div>

        <div className="space-y-1">
          {!isCollapsed && <div className="px-4 text-xs font-medium text-muted-foreground">Menu</div>}
          <nav className="flex flex-col gap-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-3 my-2 text-sm font-medium transition-colors relative",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => mobile && setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && (
                  <>
                    {item.name}
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "ml-auto",
                          pathname === item.href && "bg-primary-foreground text-primary"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -right-2 -top-2 h-5 w-5 flex items-center justify-center p-0"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-1">
          {!isCollapsed && <div className="px-4 text-xs font-medium text-muted-foreground">Groups</div>}
          <nav className="flex flex-col gap-1 px-2">
            {groups.map((group) => (
              <Button
                key={group.name}
                variant="ghost"
                className="justify-start"
              >
                <span className={cn("h-2 w-2 rounded-full mr-3", group.color)} />
                {!isCollapsed && group.name}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <Separator />
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          )}
          <div className={cn(
            "flex items-center gap-1",
            isCollapsed && "flex-col"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
            >
              <LogOutIcon className="h-5 w-5" />
            </Button>
            {!mobile && isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(false)}
              >
                <ChevronRightIcon className="h-5 w-5 rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 border-r transition-all duration-300",
        isCollapsed ? "lg:w-20" : "lg:w-64"
      )}>
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed left-4 top-4 z-40">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent mobile />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        isCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        <main className="flex-1 px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}