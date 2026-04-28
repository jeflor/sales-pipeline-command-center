import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { CURRENT_MANAGER_ID, CURRENT_REP_ID, repsById } from "../data/reps";

export type Role = "rep" | "manager";

type AIAssistantState = {
  open: boolean;
  contextLeadId: string | null;
};

type AppStateValue = {
  role: Role;
  setRole: (r: Role) => void;
  currentUserId: string;
  currentUser: ReturnType<typeof getUser>;
  // Lead drawer
  openLeadId: string | null;
  openLead: (id: string) => void;
  closeLead: () => void;
  // AI Assistant
  ai: AIAssistantState;
  openAI: (leadId?: string | null) => void;
  closeAI: () => void;
};

function getUser(role: Role) {
  return role === "manager"
    ? repsById[CURRENT_MANAGER_ID]
    : repsById[CURRENT_REP_ID];
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("rep");
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [ai, setAI] = useState<AIAssistantState>({
    open: false,
    contextLeadId: null,
  });

  const openLead = useCallback((id: string) => setOpenLeadId(id), []);
  const closeLead = useCallback(() => setOpenLeadId(null), []);
  const openAI = useCallback(
    (leadId: string | null = null) =>
      setAI({ open: true, contextLeadId: leadId }),
    [],
  );
  const closeAI = useCallback(
    () => setAI((s) => ({ ...s, open: false })),
    [],
  );

  const currentUserId =
    role === "manager" ? CURRENT_MANAGER_ID : CURRENT_REP_ID;

  const value = useMemo<AppStateValue>(
    () => ({
      role,
      setRole,
      currentUserId,
      currentUser: getUser(role),
      openLeadId,
      openLead,
      closeLead,
      ai,
      openAI,
      closeAI,
    }),
    [role, currentUserId, openLeadId, openLead, closeLead, ai, openAI, closeAI],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx)
    throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
