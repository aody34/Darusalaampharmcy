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
    Package
} from 'lucide-react';

/**
 * Medicine List Component
 * Displays all medicines with search, filter, and actions
 */
export default function MedicineList({ onEdit }) {
    const { editMedicine, showToast } = useApp();
    const { medicines, loading, remove, search, refresh } = useMedicines();

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
        if (filterStock === 'low') return med.quantity < 5;
        if (filterStock === 'in-stock') return med.quantity >= 5;
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
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Check if expired
    const isExpired = (dateString) => {
        return new Date(dateString) < new Date();
    };

    // Check if expiring soon (within 30 days)
    const isExpiringSoon = (dateString) => {
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

    return (
        <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search medicines..."
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

            {/* Medicine Table */}
            {filteredMedicines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Package className="w-16 h-16 mb-4" />
                    <p className="text-lg font-medium">No medicines found</p>
                    <p className="text-sm mt-1">
                        {searchQuery ? 'Try a different search term' : 'Add your first medicine to get started'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-6 py-4 font-semibold text-slate-600">Medicine</th>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600">Price</th>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600">Stock</th>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600">Expiry Date</th>
                                <th className="text-center px-6 py-4 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicines.map((medicine, index) => (
                                <tr
                                    key={medicine.id}
                                    className={`table-row border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                >
                                    {/* Medicine Name */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-pharmacy-100 rounded-lg flex items-center justify-center">
                                                <Pill className="w-5 h-5 text-pharmacy-600" />
                                            </div>
                                            <span className="font-medium text-slate-800">{medicine.name}</span>
                                        </div>
                                    </td>

                                    {/* Price */}
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-slate-800">
                                            ${parseFloat(medicine.price).toFixed(2)}
                                        </span>
                                    </td>

                                    {/* Stock */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-700">{medicine.quantity}</span>
                                            {medicine.quantity < 5 ? (
                                                <span className="badge-low-stock flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="badge-in-stock">In Stock</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Expiry Date */}
                                    <td className="px-6 py-4">
                                        <span className={`font-medium ${isExpired(medicine.expiryDate)
                                                ? 'text-red-600'
                                                : isExpiringSoon(medicine.expiryDate)
                                                    ? 'text-amber-600'
                                                    : 'text-slate-700'
                                            }`}>
                                            {formatDate(medicine.expiryDate)}
                                            {isExpired(medicine.expiryDate) && (
                                                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                    Expired
                                                </span>
                                            )}
                                            {isExpiringSoon(medicine.expiryDate) && !isExpired(medicine.expiryDate) && (
                                                <span className="ml-2 text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                                                    Expiring Soon
                                                </span>
                                            )}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(medicine)}
                                                className="p-2 hover:bg-pharmacy-50 rounded-lg text-pharmacy-600 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>

                                            {deleteConfirm === medicine.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDelete(medicine.id)}
                                                        className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="px-2 py-1 bg-slate-300 text-slate-700 text-xs rounded-lg hover:bg-slate-400 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(medicine.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Stats Footer */}
            <div className="flex justify-between items-center text-sm text-slate-500 pt-4 border-t border-slate-200">
                <span>Showing {filteredMedicines.length} of {medicines.length} medicines</span>
                <span>
                    Low stock items: {medicines.filter(m => m.quantity < 5).length}
                </span>
            </div>
        </div>
    );
}
