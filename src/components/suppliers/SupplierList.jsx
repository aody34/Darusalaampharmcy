import { useState, useEffect } from 'react';
import { useApp, TOAST_TYPES } from '../../context/AppContext';
import { getSuppliers, addSupplier } from '../../db/db';
import {
    Building2,
    Plus,
    Search,
    Phone,
    MapPin,
    MoreVertical,
    Save,
    X,
    Truck
} from 'lucide-react';

export default function SupplierList() {
    const { showToast } = useApp();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // New Supplier Form State
    const [newSupplier, setNewSupplier] = useState({
        name: '',
        contactNumber: '',
        address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load Suppliers
    const fetchSuppliers = async () => {
        setLoading(true);
        const result = await getSuppliers();
        if (result.success) {
            setSuppliers(result.data);
        } else {
            showToast('Failed to load suppliers', TOAST_TYPES.ERROR);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    // Handle Add Supplier
    const handleAddSupplier = async (e) => {
        e.preventDefault();
        if (!newSupplier.name.trim()) {
            showToast('Supplier Name is required', TOAST_TYPES.ERROR);
            return;
        }

        setIsSubmitting(true);
        const result = await addSupplier(newSupplier);

        if (result.success) {
            showToast('Supplier added successfully!', TOAST_TYPES.SUCCESS);
            setNewSupplier({ name: '', contactNumber: '', address: '' });
            setIsAdding(false);
            fetchSuppliers(); // Refresh list
        } else {
            showToast(result.error || 'Failed to add supplier', TOAST_TYPES.ERROR);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Truck className="w-8 h-8 text-pharmacy-600" />
                        Supplier Management
                    </h1>
                    <p className="text-slate-500">Manage your medicine suppliers and contact details</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Supplier
                </button>
            </div>

            {/* Add Supplier Modal / Inline Form */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">New Supplier</h2>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSupplier} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                                <input
                                    type="text"
                                    value={newSupplier.name}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g. PharmaCorp Logistics"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                                <input
                                    type="text"
                                    value={newSupplier.contactNumber}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, contactNumber: e.target.value })}
                                    className="input-field"
                                    placeholder="+252 ..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <textarea
                                    value={newSupplier.address}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                                    className="input-field min-h-[80px]"
                                    placeholder="Office location..."
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" /> Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Suppliers List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-pharmacy-200 border-t-pharmacy-600 rounded-full animate-spin" />
                </div>
            ) : suppliers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No suppliers found</p>
                    <p className="text-sm text-slate-400">Add your first supplier to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map((supplier) => (
                        <div key={supplier.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-pharmacy-50 rounded-xl text-pharmacy-600 group-hover:bg-pharmacy-100 transition-colors">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <button className="text-slate-300 hover:text-slate-600">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="font-bold text-slate-800 text-lg mb-1">{supplier.name}</h3>

                            <div className="space-y-2 mt-4">
                                <div className="flex items-center gap-3 text-slate-500 text-sm">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span>{supplier.contactNumber || 'No contact'}</span>
                                </div>
                                <div className="flex items-start gap-3 text-slate-500 text-sm">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{supplier.address || 'No address'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
