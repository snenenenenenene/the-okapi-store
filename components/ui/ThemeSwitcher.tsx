'use client';

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from './Button';
import { useEffect, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';

const themes = [
  { id: 'light', name: 'Light', icon: Sun },
  { id: 'dark', name: 'Dark', icon: Moon },
  { id: 'system', name: 'System', icon: Monitor },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="sm" className="w-9 h-9" />;
  }

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-sandstone-600 dark:text-slate-300 hover:text-sandstone-900 dark:hover:text-slate-50"
        >
          <Icon className="h-5 w-5" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-[200px] rounded-md border border-sandstone-200 bg-sandstone-300 p-2 shadow-md dark:border-slate-800 dark:bg-vintage-black"
          sideOffset={5}
          align="end"
        >
          <div className="grid gap-1">
            {themes.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={`flex w-full items-center justify-start gap-2 px-2 py-1.5 ${
                    theme === item.id
                      ? 'bg-sandstone-200 text-sandstone-900 dark:bg-slate-800 dark:text-slate-50'
                      : 'text-sandstone-600 hover:text-sandstone-900 dark:text-slate-300 dark:hover:text-slate-50'
                  }`}
                  onClick={() => setTheme(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Button>
              );
            })}
          </div>
          <Popover.Arrow className="fill-sandstone-300 dark:fill-vintage-black" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
