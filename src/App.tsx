import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import Activity from './pages/Activity';
import AITrades from './pages/AITrades';
import Labs from './pages/Labs';
import Performance from './pages/Performance';
import Pro from './pages/Pro';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<AITrades />} />
          <Route path="/ai-trades" element={<AITrades />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/pro" element={<Pro />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
