import React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Wand2,
  KeyRound,
  Folder,
  GitBranch,
  BarChart,
  Shield,
  Terminal,
  HelpCircle,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Overview', icon: Home, path: '/' },
  { label: 'Migration Wizard', icon: Wand2, path: '/wizard' },
  { label: 'Credential Management', icon: KeyRound, path: '/credentials' },
  { label: 'Projects', icon: Folder, path: '/projects' },
  { label: 'Migration Steps', icon: GitBranch, path: '/steps' },
  { label: 'Analytics & Reports', icon: BarChart, path: '/analytics' },
  { label: 'Security', icon: Shield, path: '/security' },
  { label: 'Scripting Console', icon: Terminal, path: '/console' },
  { label: 'Help & Tutorials', icon: HelpCircle, path: '/help' },
];

export const Sidebar: React.FC = () => {
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-full w-64 bg-sirsi-950 text-white"
    >
      <div className="flex h-16 items-center justify-center border-b border-sirsi-800">
        <h1 className="text-xl font-bold">Sirsi Nexus</h1>
      </div>
      <nav className="mt-6 px-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.path}
              href={item.path}
              className="mb-2 flex items-center rounded-lg px-4 py-2 text-sm text-sirsi-100 transition-colors hover:bg-sirsi-800"
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </a>
          );
        })}
      </nav>
    </motion.div>
  );
};
