import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import './index.css';

/**
 * Pharmacy Management System
 * 
 * A modern React-based pharmacy management application using:
 * - React 18 with Functional Components & Hooks
 * - Tailwind CSS for styling
 * - IndexedDB (via Dexie.js) for client-side database
 * 
 * Features:
 * - Dashboard with real-time statistics
 * - Medicine inventory management (CRUD)
 * - Point of Sale system with transactional safety
 * - Reports and analytics
 */
function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}

export default App;
