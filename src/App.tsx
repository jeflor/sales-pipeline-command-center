import {
  HashRouter,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AppStateProvider } from "./state/AppState";
import { DashboardPage } from "./pages/Dashboard";
import { PipelinePage } from "./pages/Pipeline";
import { TasksPage } from "./pages/Tasks";
import { LeadsPage } from "./pages/Leads";
import { ActivityPage } from "./pages/Activity";
import { ReportsPage } from "./pages/Reports";
import { TeamPage } from "./pages/Team";
import { SettingsPage } from "./pages/Settings";

function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppStateProvider>
  );
}

export default App;
