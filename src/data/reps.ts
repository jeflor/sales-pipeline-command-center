import type { Rep } from "./types";

export const reps: Rep[] = [
  {
    id: "rep_morgan",
    name: "Morgan Avery",
    initials: "MA",
    email: "morgan.avery@northwind.io",
    role: "rep",
    avatarColor: "#5a85fb",
    quota: 240000,
  },
  {
    id: "rep_priya",
    name: "Priya Shankar",
    initials: "PS",
    email: "priya.shankar@northwind.io",
    role: "rep",
    avatarColor: "#10b981",
    quota: 240000,
  },
  {
    id: "rep_dante",
    name: "Dante Russo",
    initials: "DR",
    email: "dante.russo@northwind.io",
    role: "rep",
    avatarColor: "#f59e0b",
    quota: 220000,
  },
  {
    id: "rep_kenji",
    name: "Kenji Tanaka",
    initials: "KT",
    email: "kenji.tanaka@northwind.io",
    role: "rep",
    avatarColor: "#8b5cf6",
    quota: 200000,
  },
  {
    id: "rep_sloane",
    name: "Sloane Whitaker",
    initials: "SW",
    email: "sloane.whitaker@northwind.io",
    role: "rep",
    avatarColor: "#ef4444",
    quota: 220000,
  },
  {
    id: "mgr_jordan",
    name: "Jordan Reyes",
    initials: "JR",
    email: "jordan.reyes@northwind.io",
    role: "manager",
    avatarColor: "#1f2533",
    quota: 0,
  },
];

export const repsById = Object.fromEntries(reps.map((r) => [r.id, r]));

export const CURRENT_REP_ID = "rep_morgan";
export const CURRENT_MANAGER_ID = "mgr_jordan";
