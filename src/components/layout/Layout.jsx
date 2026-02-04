import { useApp, TOAST_TYPES } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Dashboard from '../dashboard/Dashboard';
import MedicineManager from '../medicines/MedicineManager';
import POSSystem from '../sales/POSSystem';
import Reports from '../reports/Reports';
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

/**
 * Layout Component
 * Main application shell with sidebar and content area
 */
export default function Layout() {
    const { currentPage, toast, hideToast } = useApp();

    // Render current page content
    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'medicines':
                return <MedicineManager />;
            case 'sales':
                return <POSSystem />;
            case 'reports':
                return <Reports />;
            default:
                return <Dashboard />;
        }
    };

    // Get toast icon based on type
    const getToastIcon = (type) => {
        switch (type) {
            case TOAST_TYPES.SUCCESS:
                return <CheckCircle className="w-5 h-5" />;
            case TOAST_TYPES.ERROR:
                return <XCircle className="w-5 h-5" />;
            case TOAST_TYPES.WARNING:
                return <AlertTriangle className="w-5 h-5" />;
            default:
                return <CheckCircle className="w-5 h-5" />;
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-7xl mx-auto animate-fade-in">
                    {renderContent()}
                </div>
            </main>

            {/* Toast Notification */}
            {toast && (
                <div className={`toast toast-${toast.type} flex items-center gap-3`}>
                    {getToastIcon(toast.type)}
                    <span className="font-medium">{toast.message}</span>
                    <button
                        onClick={hideToast}
                        className="ml-4 hover:opacity-80 transition-opacity"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
