'use client';

import { useState } from 'react';
import {
  Home, Compass, Stethoscope, Wrench, BookOpen, Hammer, Briefcase, Store, Users, Tag,
  Car, Utensils, Plane, GraduationCap, Heart, Scissors, Camera, Music, Palette, Dumbbell,
  Shield, Landmark, Building2, Truck, Wifi, Coffee, ShoppingBag, Baby, Dog, TreePine,
  Zap, Phone, Globe, MapPin, Lightbulb, Cog, Scale, Gavel, Shirt, Gem,
  Bike, Bus, Train, Ship, Fuel, Warehouse, Factory, HardHat, Paintbrush, Sofa,
  PenTool, Monitor, Smartphone, Headphones, Printer, Tv, Gamepad2, BookMarked, Library, School,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ICON_MAP: Record<string, React.ElementType> = {
  Home, Compass, Stethoscope, Wrench, BookOpen, Hammer, Briefcase, Store, Users, Tag,
  Car, Utensils, Plane, GraduationCap, Heart, Scissors, Camera, Music, Palette, Dumbbell,
  Shield, Landmark, Building2, Truck, Wifi, Coffee, ShoppingBag, Baby, Dog, TreePine,
  Zap, Phone, Globe, MapPin, Lightbulb, Cog, Scale, Gavel, Shirt, Gem,
  Bike, Bus, Train, Ship, Fuel, Warehouse, Factory, HardHat, Paintbrush, Sofa,
  PenTool, Monitor, Smartphone, Headphones, Printer, Tv, Gamepad2, BookMarked, Library, School,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const SelectedIcon = ICON_MAP[value] ?? Tag;

  const filtered = search
    ? ICON_NAMES.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
    : ICON_NAMES;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">Icon</label>

      {/* Current selection */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
          <SelectedIcon className="h-5 w-5 text-primary-dark" />
        </div>
        <span className="text-sm font-medium text-foreground">{value || 'None selected'}</span>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons..."
        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {/* Grid */}
      <div className="grid max-h-52 grid-cols-8 gap-1.5 overflow-y-auto rounded-lg border border-border bg-white p-2">
        {filtered.map((name) => {
          const Icon = ICON_MAP[name];
          const isSelected = name === value;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              title={name}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition-all hover:scale-110',
                isSelected
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-muted hover:bg-primary-light hover:text-primary-dark',
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Render a Lucide icon by name string */
export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Tag;
  return <Icon className={className} />;
}
