import { useState, useEffect } from 'react';
import { useApp, TOAST_TYPES } from '../../context/AppContext';
import { useMedicines } from '../../hooks/useMedicines';
import { getSuppliers } from '../../db/db';
import { Pill, Save, X, AlertCircle, Plus, Building2 } from 'lucide-react';

/**
 * Medicine Form Component
 * Add/Edit medicine with enhanced V2 fields
 */
export default function MedicineForm({ onSuccess, onCancel }) {
    const { editingMedicine, clearEditing, showToast } = useApp();
    const { add, update } = useMedicines();

    const [suppliers, setSuppliers] = useState([]);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        brandName: '',
        genericName: '',
        category: 'Tablet',
        batchNumber: '',
        purchasePrice: '',
        sellingPrice: '',
        quantity: '',
        expiryDate: '',
        supplierId: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch suppliers on mount
    useEffect(() => {
        const fetchSuppliers = async () => {
            setIsLoadingSuppliers(true);
            const result = await getSuppliers();
            if (result.success) {
                setSuppliers(result.data);
            }
            setIsLoadingSuppliers(false);
        };
        fetchSuppliers();
    }, []);

    // Load editing medicine data
    useEffect(() => {
        if (editingMedicine) {
            setFormData({
                name: editingMedicine.name || '',
                brandName: editingMedicine.brandName || '',
                genericName: editingMedicine.genericName || '',
                category: editingMedicine.category || 'Tablet',
                batchNumber: editingMedicine.batchNumber || '',
                purchasePrice: editingMedicine.purchasePrice?.toString() || '',
                sellingPrice: editingMedicine.sellingPrice?.toString() || '',
                quantity: editingMedicine.quantity?.toString() || '',
                expiryDate: editingMedicine.expiryDate ? new Date(editingMedicine.expiryDate).toISOString().split('T')[0] : '',
                supplierId: editingMedicine.supplierId || ''
            });
        }
    }, [editingMedicine]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Medicine name is required';
        if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) newErrors.sellingPrice = 'Valid selling price is required';
        if (formData.purchasePrice && parseFloat(formData.purchasePrice) < 0) newErrors.purchasePrice = 'Valid purchase price is required';
        if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = 'Valid quantity is required';

        if (!formData.expiryDate) {
            newErrors.expiryDate = 'Expiry date is required';
        } else {
            const expiryDate = new Date(formData.expiryDate);
            if (expiryDate < new Date()) {
                newErrors.expiryDate = 'Expiry date must be in the future';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);

        // Prepare payload with correct types
        const payload = {
            ...formData,
            purchasePrice: parseFloat(formData.purchasePrice) || 0,
            sellingPrice: parseFloat(formData.sellingPrice),
            quantity: parseInt(formData.quantity),
            supplierId: formData.supplierId || null
        };

        try {
            let result;

            if (editingMedicine) {
                result = await update(editingMedicine.id, payload);
                if (result.success) {
                    showToast('Medicine updated successfully!', TOAST_TYPES.SUCCESS);
                    clearEditing();
                }
            } else {
                result = await add(payload);
                if (result.success) {
                    showToast('Medicine added successfully!', TOAST_TYPES.SUCCESS);
                }
            }

            if (result.success) {
                // Reset form
                setFormData({
                    name: '', brandName: '', genericName: '', category: 'Tablet',
                    batchNumber: '', purchasePrice: '', sellingPrice: '',
                    quantity: '', expiryDate: '', supplierId: ''
                });
                onSuccess?.();
            } else {
                showToast(result.error || 'Operation failed', TOAST_TYPES.ERROR);
            }
        } catch (error) {
            showToast('An unexpected error occurred: ' + error.message, TOAST_TYPES.ERROR);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setFormData({
            name: '', brandName: '', genericName: '', category: 'Tablet',
            batchNumber: '', purchasePrice: '', sellingPrice: '',
            quantity: '', expiryDate: '', supplierId: ''
        });
        setErrors({});
        clearEditing();
        onCancel?.();
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Form Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-pharmacy-500 to-pharmacy-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pharmacy-500/30">
                    <Pill className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                    </h2>
                    <p className="text-slate-500">
                        {editingMedicine ? 'Update medicine details' : 'Fill in the details to add to inventory'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Section 1: Basic Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-pharmacy-500" /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Medicine Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Medicine Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Panadol Extra"
                                className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-500/50' : ''}`}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        {/* Generic Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Generic Name</label>
                            <input
                                type="text"
                                name="genericName"
                                value={formData.genericName}
                                onChange={handleChange}
                                placeholder="e.g. Paracetamol"
                                className="input-field"
                            />
                        </div>
                        {/* Brand Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Brand Name</label>
                            <input
                                type="text"
                                name="brandName"
                                value={formData.brandName}
                                onChange={handleChange}
                                placeholder="e.g. GSK"
                                className="input-field"
                            />
                        </div>
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="input-field cursor-pointer"
                            >
                                <option value="Tablet">Tablet</option>
                                <option value="Capsule">Capsule</option>
                                <option value="Syrup">Syrup</option>
                                <option value="Injection">Injection</option>
                                <option value="Ointment">Ointment</option>
                                <option value="Drops">Drops</option>
                                <option value="Inhaler">Inhaler</option>
                                <option value="Cream">Cream</option>
                                <option value="Liquid">Liquid</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2: Pricing & Inventory */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-pharmacy-500" /> Inventory & Pricing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Selling Price */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Selling Price ($) *</label>
                            <input
                                type="number"
                                name="sellingPrice"
                                value={formData.sellingPrice}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                className={`input-field ${errors.sellingPrice ? 'border-red-400' : ''}`}
                            />
                            {errors.sellingPrice && <p className="text-red-500 text-xs mt-1">{errors.sellingPrice}</p>}
                        </div>
                        {/* Purchase Price */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Price ($)</label>
                            <input
                                type="number"
                                name="purchasePrice"
                                value={formData.purchasePrice}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                className="input-field"
                            />
                        </div>
                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Quantity *</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder="0"
                                className={`input-field ${errors.quantity ? 'border-red-400' : ''}`}
                            />
                            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                        </div>
                    </div>
                </div>

                {/* Section 3: Batch & Supplier */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-pharmacy-500" /> Batch & Supplier
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Expiry Date */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date *</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className={`input-field ${errors.expiryDate ? 'border-red-400' : ''}`}
                            />
                            {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                        </div>
                        {/* Batch Number */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Batch Number</label>
                            <input
                                type="text"
                                name="batchNumber"
                                value={formData.batchNumber}
                                onChange={handleChange}
                                placeholder="Batch-001"
                                className="input-field"
                            />
                        </div>
                        {/* Supplier */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Supplier</label>
                            <select
                                name="supplierId"
                                value={formData.supplierId}
                                onChange={handleChange}
                                className="input-field cursor-pointer"
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(sup => (
                                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                                ))}
                            </select>
                            <div className="flex justify-end mt-1">
                                <a href="/suppliers" className="text-xs text-pharmacy-600 cursor-pointer hover:underline flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> New Supplier
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
