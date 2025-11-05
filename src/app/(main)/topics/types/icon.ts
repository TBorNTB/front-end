// types/icons.ts
import { Shield, Wifi, Zap, Search, Cloud, AlertTriangle, Code, Lock } from 'lucide-react';
import { CategoryType } from './category';

export const CategoryIcons: Record<CategoryType, any> = {
  [CategoryType.SYSTEM_HACKING]: Zap,
  [CategoryType.WEB_HACKING]: Code,
  [CategoryType.DIGITAL_FORENSICS]: Search,
  [CategoryType.REVERSING]: Lock,
  [CategoryType.CRYPTOGRAPHY]: Shield,
  [CategoryType.NETWORK_SECURITY]: Wifi,
  [CategoryType.IOT_SECURITY]: AlertTriangle
} as const;

export const CategoryColors: Record<CategoryType, string> = {
  [CategoryType.SYSTEM_HACKING]: 'bg-red-500',
  [CategoryType.WEB_HACKING]: 'bg-blue-500',
  [CategoryType.DIGITAL_FORENSICS]: 'bg-yellow-500',
  [CategoryType.REVERSING]: 'bg-purple-500',
  [CategoryType.CRYPTOGRAPHY]: 'bg-green-500',
  [CategoryType.NETWORK_SECURITY]: 'bg-cyan-500',
  [CategoryType.IOT_SECURITY]: 'bg-orange-500'
} as const;
