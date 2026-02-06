import {
    LayoutDashboard,
    Pill,
    ShoppingCart,
    BarChart3,
    Settings,
    LogOut,
    Heart,
    User,
    X,
    Truck
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, profile, isAdmin } = useAuth();

    const navItems = [
        { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
        { id: '/medicines', label: 'Medicines', icon: Pill, roles: ['admin', 'staff'] },
        { id: '/sales', label: 'Point of Sale', icon: ShoppingCart, roles: ['admin', 'staff'] },
        { id: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['admin'] },
        { id: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin'] },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleNavClick = (path) => {
        navigate(path);
        if (onClose) onClose(); // Close sidebar on mobile when item clicked
    };

    return (
        <aside className="glass-sidebar w-72 h-full flex flex-col p-6 shadow-2xl lg:shadow-none lg:min-h-screen relative">
            {/* Mobile Close Button (Redundant due to backdrop click, but good UX) */}
            <button
                onClick={onClose}
                className="lg:hidden absolute top-4 right-4 text-white/50 hover:text-white"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Logo Section */}
            <div className="mb-10 mt-2 lg:mt-0">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-white to-pharmacy-200 rounded-xl flex items-center justify-center shadow-lg">
                        <Pill className="w-7 h-7 text-pharmacy-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Darusalaam</h1>
                        <p className="text-pharmacy-300 text-sm">Pharmacy System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 overflow-y-auto">
                {navItems.filter(item => item.roles.includes(profile?.role || 'staff')).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.id);

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group
                ${isActive
                                    ? 'bg-white/20 text-white shadow-lg shadow-pharmacy-900/30'
                                    : 'text-pharmacy-200 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="font-medium text-base">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User & Settings Section */}
            <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
                {isAdmin && (
                    <button
                        onClick={() => handleNavClick('/settings')}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 ${location.pathname === '/settings' ? 'text-white bg-white/10' : 'text-pharmacy-300 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                    </button>
                )}

                <div className="px-4 py-4 bg-white/5 rounded-xl mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-pharmacy-400 flex items-center justify-center text-white font-bold shrink-0">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <p className="text-white text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                            <p className="text-pharmacy-300 text-xs capitalize">{profile?.role || 'Staff'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-red-300 hover:text-red-200 text-sm transition-colors py-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
