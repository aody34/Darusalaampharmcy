import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useApp, TOAST_TYPES } from '../../context/AppContext';
import Sidebar from './Sidebar';
import { X, CheckCircle, AlertTriangle, XCircle, Menu } from 'lucide-react';

/**
 * Layout Component
 * Main application shell with sidebar and router outlet
 */
export default function Layout() {
    const { toast, hideToast } = useApp();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="flex min-h-screen bg-slate-50">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-pharmacy-900 z-40 flex items-center justify-between px-4 shadow-md">
                <span className="text-white font-bold text-lg">Darusalaam</span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar - Desktop: Static, Mobile: Fixed Overlay */}
            <div className={`
        fixed lg:static inset-0 z-50 transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <Sidebar onClose={() => setIsMobileMenuOpen(false)} />

                {/* Mobile Backdrop */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[-1] lg:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-10 pt-20 lg:pt-10 overflow-auto w-full">
                <div className="max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>

            {/* Toast Notification */}
            {toast && (
                <div className={`toast toast-${toast.type} flex items-center gap-3 fixed bottom-4 right-4 z-[60]`}>
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
