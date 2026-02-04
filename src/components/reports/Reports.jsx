import { useState, useEffect, useMemo } from 'react';
import { useSales } from '../../hooks/useSales';
import {
    BarChart3,
    Calendar,
    DollarSign,
    TrendingUp,
    Package,
    Clock,
    Filter,
    Download,
    Pill
} from 'lucide-react';

/**
 * Reports Component
 * Sales analytics, daily tracker, and transaction history
 */
export default function Reports() {
    const { sales, todaysSales, loading, getByDateRange, refresh } = useSales();

    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [viewMode, setViewMode] = useState('all'); // all, today, range

    // Handle date filter
    const handleDateFilter = async () => {
        if (viewMode === 'range' && dateRange.start && dateRange.end) {
            await getByDateRange(dateRange.start, dateRange.end);
        } else if (viewMode === 'all') {
            await refresh();
        }
    };

    // Get displayed sales based on view mode
    const displayedSales = useMemo(() => {
        if (viewMode === 'today') {
            return todaysSales;
        }
        return sales;
    }, [viewMode, sales, todaysSales]);

    // Calculate statistics
    const stats = useMemo(() => {
        const totalRevenue = displayedSales.reduce((sum, s) => sum + s.totalPrice, 0);
        const totalItems = displayedSales.reduce((sum, s) => sum + s.quantitySold, 0);
        const avgTransaction = displayedSales.length > 0 ? totalRevenue / displayedSales.length : 0;

        // Group by medicine
        const byMedicine = displayedSales.reduce((acc, sale) => {
            const name = sale.medicineName;
            if (!acc[name]) {
                acc[name] = { name, quantity: 0, revenue: 0 };
            }
            acc[name].quantity += sale.quantitySold;
            acc[name].revenue += sale.totalPrice;
            return acc;
        }, {});

        const topSelling = Object.values(byMedicine)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return {
            totalRevenue,
            totalItems,
            totalTransactions: displayedSales.length,
            avgTransaction,
            topSelling
        };
    }, [displayedSales]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-16 h-16 border-4 border-pharmacy-200 border-t-pharmacy-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
                    <p className="text-slate-500 mt-1">Track sales performance and transaction history</p>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* View Mode Tabs */}
                    <div className="flex bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => { setViewMode('all'); refresh(); }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'all' ? 'bg-white text-pharmacy-600 shadow-md' : 'text-slate-500'
                                }`}
                        >
                            All Time
                        </button>
                        <button
                            onClick={() => setViewMode('today')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'today' ? 'bg-white text-pharmacy-600 shadow-md' : 'text-slate-500'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setViewMode('range')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'range' ? 'bg-white text-pharmacy-600 shadow-md' : 'text-slate-500'
                                }`}
                        >
                            Date Range
                        </button>
                    </div>

                    {/* Date Range Picker */}
                    {viewMode === 'range' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pharmacy-500/50 outline-none"
                            />
                            <span className="text-slate-400">to</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pharmacy-500/50 outline-none"
                            />
                            <button
                                onClick={handleDateFilter}
                                className="px-4 py-2 bg-pharmacy-500 text-white rounded-lg hover:bg-pharmacy-600 transition-colors flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                Apply
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="stat-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                {formatCurrency(stats.totalRevenue)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Total Transactions */}
                <div className="stat-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Transactions</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                {stats.totalTransactions}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Items Sold */}
                <div className="stat-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Items Sold</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                {stats.totalItems}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Average Transaction */}
                <div className="stat-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Avg. Transaction</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                {formatCurrency(stats.avgTransaction)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Selling Items */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Top Selling Medicines</h2>
                    {stats.topSelling.length > 0 ? (
                        <div className="space-y-4">
                            {stats.topSelling.map((item, index) => (
                                <div
                                    key={item.name}
                                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                            index === 1 ? 'bg-slate-400' :
                                                index === 2 ? 'bg-amber-700' : 'bg-slate-300'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800">{item.name}</p>
                                        <p className="text-sm text-slate-500">{item.quantity} units sold</p>
                                    </div>
                                    <span className="font-bold text-pharmacy-600">
                                        {formatCurrency(item.revenue)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <Pill className="w-12 h-12 mb-3" />
                            <p className="font-medium">No sales data yet</p>
                        </div>
                    )}
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Transaction History</h2>
                        <span className="text-sm text-slate-500">
                            {displayedSales.length} transactions
                        </span>
                    </div>

                    {displayedSales.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-sm">Date/Time</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-sm">Medicine</th>
                                        <th className="text-center px-4 py-3 font-semibold text-slate-600 text-sm">Qty</th>
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600 text-sm">Unit Price</th>
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600 text-sm">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedSales.slice(0, 15).map((sale, index) => (
                                        <tr
                                            key={sale.id}
                                            className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDate(sale.saleDate)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-slate-800">{sale.medicineName}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600 text-sm">
                                                    x{sale.quantitySold}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600">
                                                {formatCurrency(sale.unitPrice)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-bold text-pharmacy-600">
                                                    {formatCurrency(sale.totalPrice)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Package className="w-16 h-16 mb-4" />
                            <p className="text-lg font-medium">No transactions found</p>
                            <p className="text-sm mt-1">Sales will appear here once recorded</p>
                        </div>
                    )}

                    {displayedSales.length > 15 && (
                        <p className="text-center text-slate-500 mt-4 text-sm">
                            Showing 15 of {displayedSales.length} transactions
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
