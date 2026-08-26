import {
  Building2,
  Home,
  PawPrint,
  Phone,
  ShoppingBasket,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { PublicActionRecord } from "../types";

export function getActionIcon(action: PublicActionRecord): LucideIcon {
  const text = `${action.id} ${action.title}`.toLowerCase();
  if (text.includes("dog") || text.includes("pet") || text.includes("streetdogs")) return PawPrint;
  if (text.includes("hire") || text.includes("partner") || text.includes("employer")) return Building2;
  if (text.includes("reentry") || text.includes("ready-to-work") || text.includes("ready to work")) return Users;
  if (text.includes("housing") || text.includes("shelter")) return Home;
  if (text.includes("transport") || text.includes("out")) return Truck;
  if (text.includes("food") || text.includes("storage") || text.includes("distribution") || text.includes("donate") || text.includes("suppl")) return ShoppingBasket;
  if (text.includes("call")) return Phone;
  return PawPrint;
}
