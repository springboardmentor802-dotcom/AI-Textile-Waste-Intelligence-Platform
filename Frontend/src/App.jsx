import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Predictions from './pages/Predictions';
import History from "./pages/History";
import Reports from './pages/Reports';
import ProcessingInsights from './pages/ProcessingInsights';
import Users from './pages/Users';
import PlatformAnalytics from './pages/PlatformAnalytics';
import AIActivity from './pages/AIActivity';
import Profile from './pages/Profile';
import Settings from './pages/Setting';
import SustainabilityOverview from './pages/SustainabilityOverview';
import CarbonReduction from './pages/CarbonReduction';
import WasteDiversion from './pages/WasteDiversion';
import ManufacturerRecoveryInsights from './pages/ManufacturerRecoveryInsights';

function Layout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div
        style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/processing-insights" element={<ProtectedRoute><ProcessingInsights /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={['administrator']}><Users /></ProtectedRoute>} />
          <Route path="/platform-analytics" element={<ProtectedRoute allowedRoles={['administrator']}><PlatformAnalytics /></ProtectedRoute>} />
          <Route path="/ai-activity" element={<ProtectedRoute allowedRoles={['administrator']}><AIActivity /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/setting" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/sustainability-overview" element={<ProtectedRoute><SustainabilityOverview /></ProtectedRoute>} />
          <Route path="/carbon-reduction" element={<ProtectedRoute><CarbonReduction /></ProtectedRoute>} />
          <Route path="/waste-diversion" element={<ProtectedRoute><WasteDiversion /></ProtectedRoute>} />
          <Route path="/manufacturer/recovery-insights" element={<ProtectedRoute><ManufacturerRecoveryInsights /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;