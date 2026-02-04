import { useState, useEffect } from 'react';
import { useApp, TOAST_TYPES } from '../../context/AppContext';
import { useMedicines } from '../../hooks/useMedicines';
import { Pill, Save, X, AlertCircle } from 'lucide-react';

/**
 * Medicine Form Component
 * Add/Edit medicine with validation
 */
export default function MedicineForm({ onSuccess, onCancel }) {
    const { editingMedicine, clearEditing, showToast } = useApp();
    const { add, update } = useMedicines();

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        quantity: '',
        expiryDate: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load editing medicine data
    useEffect(() => {
        if (editingMedicine) {
            setFormData({
                name: editingMedicine.name || '',
                price: editingMedicine.price?.toString() || '',
                quantity: editingMedicine.quantity?.toString() || '',
                expiryDate: editingMedicine.expiryDate || ''
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

        if (!formData.name.trim()) {
            newErrors.name = 'Medicine name is required';
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Valid price is required';
        }

        if (!formData.quantity || parseInt(formData.quantity) < 0) {
            newErrors.quantity = 'Valid quantity is required';
        }

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

        try {
            let result;

            if (editingMedicine) {
                result = await update(editingMedicine.id, formData);
                if (result.success) {
                    showToast('Medicine updated successfully!', TOAST_TYPES.SUCCESS);
                    clearEditing();
                }
            } else {
                result = await add(formData);
                if (result.success) {
                    showToast('Medicine added successfully!', TOAST_TYPES.SUCCESS);
                }
            }

            if (result.success) {
                // Reset form
                setFormData({ name: '', price: '', quantity: '', expiryDate: '' });
                onSuccess?.();
            } else {
                showToast(result.error || 'Operation failed', TOAST_TYPES.ERROR);
            }
        } catch (error) {
            showToast('An unexpected error occurred', TOAST_TYPES.ERROR);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setFormData({ name: '', price: '', quantity: '', expiryDate: '' });
        setErrors({});
        clearEditing();
        onCancel?.();
    };

    return (
        <div className="max-w-2xl mx-auto">
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
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Medicine Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Medicine Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter medicine name"
                        className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                    />
                    {errors.name && (
                        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Price & Quantity Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Price ($)
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className={`input-field ${errors.price ? 'border-red-400 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                        />
                        {errors.price && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.price}
                            </p>
                        )}
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Quantity
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            className={`input-field ${errors.quantity ? 'border-red-400 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                        />
                        {errors.quantity && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.quantity}
                            </p>
                        )}
                    </div>
                </div>

                {/* Expiry Date */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Expiry Date
                    </label>
                    <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        className={`input-field ${errors.expiryDate ? 'border-red-400 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                    />
                    {errors.expiryDate && (
                        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.expiryDate}
                        </p>
                    )}
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
