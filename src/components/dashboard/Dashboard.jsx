import { useState, useEffect } from 'react';
import {
    Package,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    Pill,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    Clock
} from 'lucide-react';
import { getDashboardStats } from '../../db/db';
import { useApp } from '../../context/AppContext';

/**
 * Dashboard Component
 * Overview of pharmacy statistics with real-time data from IndexedDB
 */
export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { navigateTo } = useApp();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        setError(null);
        const result = await getDashboardStats();
        if (result.success) {
            setStats(result.data);
        } else {
            setError(result.error || 'Failed to load dashboard statistics');
        }
        setLoading(false);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Get current time greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-16 h-16 border-4 border-pharmacy-200 border-t-pharmacy-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to load dashboard</h3>
                <p className="text-slate-500 mb-6 max-w-md">{error}</p>
                <button
                    onClick={loadStats}
                    className="btn-primary"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{getGreeting()}! 👋</h1>
                    <p className="text-slate-500 mt-1">Here's what's happening with your pharmacy today.</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Stock Value */}
                <div className="stat-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Stock Value</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                {formatCurrency(stats?.totalStockValue || 0)}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-green-600">
                                <ArrowUpRight className="w-4 h-4" />
                                <span className="text-sm font-medium">{stats?.totalItems || 0} items</span>
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Package className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                {/* Today's Revenue */}
                <div className="stat-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Today's Revenue</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                {formatCurrency(stats?.todaysRevenue || 0)}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-green-600">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-medium">{stats?.todaysSalesCount || 0} sales</span>
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                            <DollarSign className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                {/* Total Medicines */}
                <div className="stat-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Medicine Types</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                {stats?.totalMedicines || 0}
                            </p>
                            <button
                                onClick={() => navigateTo('medicines')}
                                className="flex items-center gap-1 mt-2 text-pharmacy-600 hover:text-pharmacy-700 transition-colors"
                            >
                                <span className="text-sm font-medium">View inventory</span>
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Pill className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="stat-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Low Stock Alert</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                {stats?.lowStockCount || 0}
                            </p>
                            <div className={`flex items-center gap-1 mt-2 ${stats?.lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {stats?.lowStockCount > 0 ? (
                                    <>
                                        <ArrowDownRight className="w-4 h-4" />
                                        <span className="text-sm font-medium">Needs attention</span>
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm font-medium">All stocked</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${stats?.lowStockCount > 0
                            ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30'
                            : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-400/30'
                            }`}>
                            <AlertTriangle className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Low Stock Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigateTo('medicines')}
                            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-pharmacy-50 to-pharmacy-100 rounded-2xl hover:scale-105 transition-transform duration-300 group"
                        >
                            <div className="w-12 h-12 bg-pharmacy-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Pill className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-medium text-slate-700">Add Medicine</span>
                        </button>

                        <button
                            onClick={() => navigateTo('sales')}
                            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:scale-105 transition-transform duration-300 group"
                        >
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-medium text-slate-700">New Sale</span>
                        </button>
                    </div>
                </div>

                {/* Low Stock Items */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Low Stock Items</h2>
                    {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
                        <div className="space-y-3">
                            {stats.lowStockItems.slice(0, 5).map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                            <Pill className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{item.name}</p>
                                            <p className="text-sm text-red-600">Only {item.quantity} left</p>
                                        </div>
                                    </div>
                                    <span className="badge-low-stock">Low Stock</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <Package className="w-12 h-12 mb-3" />
                            <p className="font-medium">All items are well stocked!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
