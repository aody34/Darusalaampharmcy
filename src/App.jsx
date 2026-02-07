import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import MedicineManager from './components/medicines/MedicineManager';
import POSSystem from './components/sales/POSSystem';
import Reports from './components/reports/Reports';
import SettingsPage from './components/settings/SettingsPage';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import SupplierList from './components/suppliers/SupplierList';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/medicines" element={<MedicineManager />} />
                  <Route path="/sales" element={<POSSystem />} />

                  {/* Admin Only Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/suppliers" element={<SupplierList />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
