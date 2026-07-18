import fs from "node:fs";
import path from "node:path";

/**
 * Хранилище заявок (бэклог П1, п.1). Файловое (JSON-массив на постоянном томе) —
 * без native-зависимостей, чтобы не рисковать сборкой в Alpine-контейнере.
 * Том монтируется в docker-compose (DATA_DIR=/data). Бэкап = копия файла.
 */

export type LeadStatus = "new" | "in_progress" | "closed";

export interface Lead {
  id: string;
  name: string;
  contact: string;
  solution: string;
  message: string;
  source: string;
  at: string; // ISO
  status: LeadStatus;
  note: string;
}

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "leads.json");

function ensure(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]", "utf8");
}

function readAll(): Lead[] {
  ensure();
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Lead[];
  } catch {
    return [];
  }
}

function writeAll(leads: Lead[]): void {
  ensure();
  fs.writeFileSync(FILE, JSON.stringify(leads, null, 2), "utf8");
}

export function addLead(input: Omit<Lead, "id" | "at" | "status" | "note">): Lead {
  const leads = readAll();
  const lead: Lead = {
    ...input,
    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    at: new Date().toISOString(),
    status: "new",
    note: "",
  };
  leads.push(lead);
  writeAll(leads);
  return lead;
}

export function listLeads(): Lead[] {
  return readAll().sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function updateLead(id: string, patch: Partial<Pick<Lead, "status" | "note">>): boolean {
  const leads = readAll();
  const i = leads.findIndex((l) => l.id === id);
  if (i === -1) return false;
  if (patch.status) leads[i].status = patch.status;
  if (patch.note !== undefined) leads[i].note = patch.note.slice(0, 2000);
  writeAll(leads);
  return true;
}

export function leadStats(): { total: number; new: number; week: number } {
  const leads = readAll();
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  return {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    week: leads.filter((l) => new Date(l.at).getTime() > weekAgo).length,
  };
}
