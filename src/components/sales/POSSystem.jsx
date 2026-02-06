import { useState, useEffect, useMemo } from 'react';
import { useApp, TOAST_TYPES } from '../../context/AppContext';
import { useMedicines } from '../../hooks/useMedicines';
import { createSale, createCustomSale } from '../../db/db';
import {
    ShoppingCart,
    Search,
    Plus,
    Minus,
    DollarSign,
    Package,
    AlertCircle,
    CheckCircle,
    Pill,
    X,
    PenTool
} from 'lucide-react';

export default function POSSystem() {
    const { showToast } = useApp();
    const { medicines } = useMedicines(); // Now real-time!

    const [mode, setMode] = useState('inventory'); // 'inventory' or 'custom'

    // Inventory State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showDropdown, setShowDropdown] = useState(false);

    // Custom State
    const [customItem, setCustomItem] = useState({ name: '', price: '', quantity: 1 });

    const [isProcessing, setIsProcessing] = useState(false);

    // Filter medicines
    const filteredMedicines = useMemo(() => {
        if (!searchQuery.trim()) return medicines;
        return medicines.filter(med =>
            med.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [medicines, searchQuery]);

    // Inventory Sale Logic
    const handleSelectMedicine = (medicine) => {
        setSelectedMedicine(medicine);
        setSearchQuery(medicine.name);
        setShowDropdown(false);
        setQuantity(1);
    };

    const handleSale = async () => {
        setIsProcessing(true);
        try {
            let result;
            if (mode === 'inventory') {
                if (!selectedMedicine) return;
                result = await createSale(selectedMedicine.id, quantity);
            } else {
                // Custom Sale
                if (!customItem.name || !customItem.price) return;
                result = await createCustomSale({
                    name: customItem.name,
                    quantity: parseInt(customItem.quantity),
                    totalPrice: parseFloat(customItem.price) * parseInt(customItem.quantity)
                });
            }

            if (result.success) {
                showToast('Sale completed successfully!', TOAST_TYPES.SUCCESS);
                // Reset
                setSelectedMedicine(null);
                setSearchQuery('');
                setQuantity(1);
                setCustomItem({ name: '', price: '', quantity: 1 });
            } else {
                showToast(result.error || 'Sale failed', TOAST_TYPES.ERROR);
            }
        } catch (error) {
            showToast('Error processing sale', TOAST_TYPES.ERROR);
        } finally {
            setIsProcessing(false);
        }
    };

    const inventoryTotal = selectedMedicine ? selectedMedicine.price * quantity : 0;
    const customTotal = customItem.price ? parseFloat(customItem.price) * customItem.quantity : 0;
    const currentTotal = mode === 'inventory' ? inventoryTotal : customTotal;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Point of Sale</h1>
                <p className="text-slate-500 mt-1">Process sales via inventory or custom entry</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Card */}
                <div className="glass-card p-6 space-y-6">
                    {/* Mode Switcher */}
                    <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                        <button
                            onClick={() => setMode('inventory')}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${mode === 'inventory' ? 'bg-white text-pharmacy-600 shadow-md' : 'text-slate-500'
                                }`}
                        >
                            Inventory Search
                        </button>
                        <button
                            onClick={() => setMode('custom')}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${mode === 'custom' ? 'bg-white text-pharmacy-600 shadow-md' : 'text-slate-500'
                                }`}
                        >
                            Custom Item
                        </button>
                    </div>

                    {mode === 'inventory' ? (
                        <div className="space-y-6">
                            {/* Medicine Search */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Select Medicine</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search inventory..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowDropdown(true);
                                            if (selectedMedicine && e.target.value !== selectedMedicine.name) {
                                                setSelectedMedicine(null);
                                            }
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        className="input-field pl-12"
                                    />
                                </div>
                                {showDropdown && !selectedMedicine && filteredMedicines.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-auto">
                                        {filteredMedicines.map((med) => (
                                            <button
                                                key={med.id}
                                                onClick={() => handleSelectMedicine(med)}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100"
                                            >
                                                <p className="font-medium">{med.name}</p>
                                                <p className="text-sm text-slate-500">${med.price} - Stock: {med.quantity}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedMedicine && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                            min="1" max={selectedMedicine.quantity}
                                            className="input-field text-center font-bold text-lg"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Item Name</label>
                                <input
                                    type="text"
                                    value={customItem.name}
                                    onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g. Bandages"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        value={customItem.price}
                                        onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
                                        className="input-field"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        value={customItem.quantity}
                                        onChange={(e) => setCustomItem({ ...customItem, quantity: parseInt(e.target.value) || 1 })}
                                        className="input-field"
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Checkout Logic */}
                    <div className="pt-6 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-lg font-bold text-slate-800">Total</span>
                            <span className="text-2xl font-bold text-pharmacy-600">
                                ${currentTotal.toFixed(2)}
                            </span>
                        </div>

                        <button
                            onClick={handleSale}
                            disabled={isProcessing || (mode === 'inventory' && !selectedMedicine)}
                            className="w-full btn-primary py-4 text-lg"
                        >
                            {isProcessing ? 'Processing...' : 'Confirm Sale'}
                        </button>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="glass-card p-6 bg-gradient-to-br from-pharmacy-900 to-pharmacy-800 text-white">
                    <h2 className="text-xl font-bold mb-4">Sale Summary</h2>
                    <p className="text-pharmacy-200 mb-8">Review the transaction details before confirming.</p>
                    {/* Add real-time feed here later */}
                </div>
            </div>
        </div>
    );
}
