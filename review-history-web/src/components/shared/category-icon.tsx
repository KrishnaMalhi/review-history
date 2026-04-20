'use client';

import {
  Home, Compass, Stethoscope, Wrench, BookOpen, Hammer, Briefcase, Store, Users, Tag,
  Car, Utensils, Plane, GraduationCap, Heart, Scissors, Camera, Music, Palette, Dumbbell,
  Shield, Landmark, Building2, Truck, Wifi, Coffee, ShoppingBag, Baby, Dog, TreePine,
  Zap, Phone, Globe, MapPin, Lightbulb, Cog, Scale, Gavel, Shirt, Gem,
  Bike, Bus, Train, Ship, Fuel, Warehouse, Factory, HardHat, Paintbrush, Sofa,
  PenTool, Monitor, Smartphone, Headphones, Printer, Tv, Gamepad2, BookMarked, Library, School,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Home, Compass, Stethoscope, Wrench, BookOpen, Hammer, Briefcase, Store, Users, Tag,
  Car, Utensils, Plane, GraduationCap, Heart, Scissors, Camera, Music, Palette, Dumbbell,
  Shield, Landmark, Building2, Truck, Wifi, Coffee, ShoppingBag, Baby, Dog, TreePine,
  Zap, Phone, Globe, MapPin, Lightbulb, Cog, Scale, Gavel, Shirt, Gem,
  Bike, Bus, Train, Ship, Fuel, Warehouse, Factory, HardHat, Paintbrush, Sofa,
  PenTool, Monitor, Smartphone, Headphones, Printer, Tv, Gamepad2, BookMarked, Library, School,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Tag;
  return <Icon className={className} />;
}
