import { useState, useEffect } from 'react';
import { useApp, TOAST_TYPES } from '../../context/AppContext';
import { useMedicines } from '../../hooks/useMedicines';
import {
    Search,
    Edit2,
    Trash2,
    Pill,
    AlertTriangle,
    ChevronDown,
    Filter,
    Package,
    Building2,
    Calendar,
    Tag
} from 'lucide-react';

/**
 * Medicine List Component
 * Displays all medicines with search, filter, and actions
 */
export default function MedicineList({ onEdit }) {
    const { editMedicine, showToast } = useApp();
    const { medicines, loading, error, remove, search, refresh } = useMedicines();

    // Show toast on hook error if not handled appropriately elsewhere
    useEffect(() => {
        if (error) {
            showToast(error, TOAST_TYPES.ERROR);
        }
    }, [error, showToast]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStock, setFilterStock] = useState('all'); // all, low, in-stock
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Handle search
    useEffect(() => {
        const timer = setTimeout(() => {
            search(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, search]);

    // Filter medicines based on stock filter
    const filteredMedicines = medicines.filter(med => {
        if (filterStock === 'low') return med.quantity < 10;
        if (filterStock === 'in-stock') return med.quantity >= 10;
        return true;
    });

    // Handle edit
    const handleEdit = (medicine) => {
        editMedicine(medicine);
        onEdit?.();
    };

    // Handle delete
    const handleDelete = async (id) => {
        const result = await remove(id);
        if (result.success) {
            showToast('Medicine deleted successfully', TOAST_TYPES.SUCCESS);
        } else {
            showToast(result.error || 'Failed to delete medicine', TOAST_TYPES.ERROR);
        }
        setDeleteConfirm(null);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Check if expired
    const isExpired = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    // Check if expiring soon (within 30 days)
    const isExpiringSoon = (dateString) => {
        if (!dateString) return false;
        const expiryDate = new Date(dateString);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-pharmacy-200 border-t-pharmacy-600 rounded-full animate-spin" />
            </div>
        );
    }

    // Show error state if fetch failed
    if (!medicines && !loading) {
        // Fallback if medicines is null but not caught by error
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">No medicines data available.</p>
                <button onClick={refresh} className="text-pharmacy-600 mt-2 hover:underline">Retry</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search medicines by name, brand, or generic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pharmacy-500/50 focus:border-pharmacy-500 transition-all outline-none"
                    />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <select
                        value={filterStock}
                        onChange={(e) => setFilterStock(e.target.value)}
                        className="appearance-none px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pharmacy-500/50 focus:border-pharmacy-500 transition-all outline-none cursor-pointer"
                    >
                        <option value="all">All Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="in-stock">In Stock</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {/* Medicine Table / Cards */}
            {filteredMedicines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 glass-card">
                    <Package className="w-16 h-16 mb-4" />
                    <p className="text-lg font-medium">No medicines found</p>
                    <p className="text-sm mt-1">
                        {searchQuery ? 'Try a different search term' : 'Add your first medicine to get started'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop Table - Hidden on Mobile */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left px-6 py-4 font-semibold text-slate-600">Details</th>
                                    <th className="text-left px-6 py-4 font-semibold text-slate-600">Supplier</th>
                                    <th className="text-left px-6 py-4 font-semibold text-slate-600">Pricing</th>
                                    <th className="text-left px-6 py-4 font-semibold text-slate-600">Stock</th>
                                    <th className="text-left px-6 py-4 font-semibold text-slate-600">Expiry</th>
                                    <th className="text-center px-6 py-4 font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMedicines.map((medicine, index) => (
                                    <tr
                                        key={medicine.id}
                                        className={`table-row border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-50 transition-colors`}
                                    >
                                        {/* Medicine Details */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-pharmacy-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <Pill className="w-5 h-5 text-pharmacy-600" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-base">{medicine.name}</div>
                                                    <div className="text-xs text-slate-500 font-medium">
                                                        {medicine.genericName || medicine.brandName || 'No Details'}
                                                    </div>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 mt-1">
                                                        {medicine.category || 'Tablet'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Supplier */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm">{medicine.supplierName || 'Unknown'}</span>
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="font-bold text-slate-800 text-base">
                                                    ${parseFloat(medicine.sellingPrice).toFixed(2)}
                                                </div>
                                                {medicine.purchasePrice > 0 && (
                                                    <div className="text-xs text-slate-400">
                                                        Buy: ${parseFloat(medicine.purchasePrice).toFixed(2)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Stock */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-slate-700">{medicine.quantity} Units</span>
                                                {medicine.quantity < 10 ? (
                                                    <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" /> Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium text-green-600">In Stock</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Expiry Date */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-medium ${isExpired(medicine.expiryDate) ? 'text-red-600' :
                                                    isExpiringSoon(medicine.expiryDate) ? 'text-amber-600' : 'text-slate-600'
                                                    }`}>
                                                    {formatDate(medicine.expiryDate)}
                                                </span>
                                                {medicine.batchNumber && (
                                                    <span className="text-xs text-slate-400">Batch: {medicine.batchNumber}</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(medicine)}
                                                    className="p-2 hover:bg-pharmacy-50 rounded-lg text-pharmacy-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>

                                                {deleteConfirm === medicine.id ? (
                                                    <div className="flex items-center gap-1 animate-fade-in">
                                                        <button
                                                            onClick={() => handleDelete(medicine.id)}
                                                            className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="px-3 py-1 bg-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-400 transition-colors"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(medicine.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View - Visible on Mobile (< md) */}
                    <div className="md:hidden space-y-4">
                        {filteredMedicines.map((medicine) => (
                            <div key={medicine.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-pharmacy-100 rounded-lg flex items-center justify-center">
                                            <Pill className="w-5 h-5 text-pharmacy-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-lg">{medicine.name}</p>
                                            <p className="text-xs text-slate-500">{medicine.genericName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-800 text-lg">
                                            ${parseFloat(medicine.sellingPrice).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-slate-400">Stock: {medicine.quantity}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-3 mt-3">
                                    <div className="flex justify-between">
                                        <span>Supplier:</span>
                                        <span className="font-medium">{medicine.supplierName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Expires:</span>
                                        <span className={`${isExpired(medicine.expiryDate) ? 'text-red-500 font-bold' : ''}`}>
                                            {formatDate(medicine.expiryDate)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                                    <button
                                        onClick={() => handleEdit(medicine)}
                                        className="btn-secondary py-2 px-4 text-sm"
                                    >
                                        Edit
                                    </button>
                                    {deleteConfirm === medicine.id ? (
                                        <button
                                            onClick={() => handleDelete(medicine.id)}
                                            className="btn-primary bg-red-500 hover:bg-red-600 py-2 px-4 text-sm"
                                        >
                                            Confirm
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(medicine.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Stats Footer */}
            <div className="flex justify-between items-center text-sm text-slate-500 pt-4 border-t border-slate-200">
                <span>Showing {filteredMedicines.length} of {medicines.length} medicines</span>
                <span>
                    Low stock items: {medicines.filter(m => m.quantity < 10).length}
                </span>
            </div>
        </div>
    );
}
