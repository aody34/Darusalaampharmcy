import {
    LayoutDashboard,
    Pill,
    ShoppingCart,
    BarChart3,
    Settings,
    LogOut,
    Heart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * Sidebar Component
 * Modern glassmorphic navigation with active state indicators
 */
export default function Sidebar() {
    const { currentPage, navigateTo } = useApp();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'medicines', label: 'Medicines', icon: Pill },
        { id: 'sales', label: 'Point of Sale', icon: ShoppingCart },
        { id: 'reports', label: 'Reports', icon: BarChart3 },
    ];

    return (
        <aside className="glass-sidebar w-72 min-h-screen p-6 flex flex-col">
            {/* Logo Section */}
            <div className="mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-white to-pharmacy-200 rounded-xl flex items-center justify-center shadow-lg">
                        <Pill className="w-7 h-7 text-pharmacy-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Darusalaampharmcy</h1>
                        <p className="text-pharmacy-300 text-sm">Management System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigateTo(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group
                ${isActive
                                    ? 'bg-white/20 text-white shadow-lg shadow-pharmacy-900/30'
                                    : 'text-pharmacy-200 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto pt-6 border-t border-white/10">
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-pharmacy-300 hover:bg-white/10 hover:text-white transition-all duration-300">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                </button>

                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                    <p className="text-pharmacy-300 text-xs text-center">
                        Made with <Heart className="w-3 h-3 inline text-red-400" /> for pharmacies
                    </p>
                    <p className="text-pharmacy-400 text-xs text-center mt-1">
                        v1.0.0
                    </p>
                </div>
            </div>
        </aside>
    );
}
