import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import Vendors from './pages/Vendors';
import Leads from './pages/Leads';
import Alerts from './pages/Alerts';
import VendorDashboard from './pages/VendorDashboard';
import ToastContainer from './components/Toast';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Dashboard Principal (Gestor) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="leads" element={<Leads />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>

          {/* Dashboard Individual do Vendedor */}
          <Route path="/vendor/:vendorId" element={<VendorDashboard />} />
        </Routes>
      </BrowserRouter>

      {/* Sistema de Notificações */}
      <ToastContainer />
    </>
  );
}

export default App;
