import { FileText, MapPin, Users } from "lucide-react";
import type { WorkRecord } from "../types";

export function workIcon(type: WorkRecord["type"]) {
  if (type === "investigation") return MapPin;
  if (type === "field_work") return Users;
  return FileText;
}
