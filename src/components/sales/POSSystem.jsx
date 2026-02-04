import { useState, useEffect, useMemo } from 'react';
import { useApp, TOAST_TYPES } from '../../context/AppContext';
import { useMedicines } from '../../hooks/useMedicines';
import { useSales } from '../../hooks/useSales';
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
    X
} from 'lucide-react';

/**
 * POS System Component
 * Point of Sale interface for processing medicine sales
 * 
 * TRANSACTION FLOW:
 * 1. Search/Select medicine from dropdown
 * 2. Enter quantity to sell
 * 3. System validates stock availability
 * 4. On submit: atomically reduces stock AND creates sale record
 */
export default function POSSystem() {
    const { showToast } = useApp();
    const { medicines, refresh: refreshMedicines } = useMedicines();
    const { sell, todaysSales, refresh: refreshSales, getTotals } = useSales();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [lastSale, setLastSale] = useState(null);

    // Filter medicines for search dropdown
    const filteredMedicines = useMemo(() => {
        if (!searchQuery.trim()) return medicines;
        return medicines.filter(med =>
            med.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [medicines, searchQuery]);

    // Calculate sale total
    const saleTotal = useMemo(() => {
        if (!selectedMedicine) return 0;
        return selectedMedicine.price * quantity;
    }, [selectedMedicine, quantity]);

    // Handle medicine selection
    const handleSelectMedicine = (medicine) => {
        setSelectedMedicine(medicine);
        setSearchQuery(medicine.name);
        setShowDropdown(false);
        setQuantity(1);
    };

    // Handle quantity change
    const handleQuantityChange = (value) => {
        const newQty = Math.max(1, Math.min(value, selectedMedicine?.quantity || 1));
        setQuantity(newQty);
    };

    // Process the sale
    const handleSale = async () => {
        if (!selectedMedicine) {
            showToast('Please select a medicine', TOAST_TYPES.WARNING);
            return;
        }

        if (quantity > selectedMedicine.quantity) {
            showToast(`Insufficient stock! Only ${selectedMedicine.quantity} available`, TOAST_TYPES.ERROR);
            return;
        }

        setIsProcessing(true);

        try {
            const result = await sell(selectedMedicine.id, quantity);

            if (result.success) {
                setLastSale(result.data);
                showToast(`Sale completed! ${result.data.medicineName} x${quantity}`, TOAST_TYPES.SUCCESS);

                // Reset form
                setSelectedMedicine(null);
                setSearchQuery('');
                setQuantity(1);

                // Refresh data
                await refreshMedicines();
            } else {
                showToast(result.error || 'Sale failed', TOAST_TYPES.ERROR);
            }
        } catch (error) {
            showToast('An unexpected error occurred', TOAST_TYPES.ERROR);
        } finally {
            setIsProcessing(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Get today's totals
    const totals = getTotals();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Point of Sale</h1>
                <p className="text-slate-500 mt-1">Process medicine sales and manage transactions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sale Form */}
                <div className="lg:col-span-2 glass-card p-6 space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <ShoppingCart className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">New Sale</h2>
                            <p className="text-slate-500">Select medicine and quantity</p>
                        </div>
                    </div>

                    {/* Medicine Search/Select */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Select Medicine
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search medicines..."
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
                            {selectedMedicine && (
                                <button
                                    onClick={() => {
                                        setSelectedMedicine(null);
                                        setSearchQuery('');
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown */}
                        {showDropdown && !selectedMedicine && filteredMedicines.length > 0 && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-auto">
                                {filteredMedicines.map((med) => (
                                    <button
                                        key={med.id}
                                        onClick={() => handleSelectMedicine(med)}
                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-pharmacy-50 transition-colors border-b border-slate-100 last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-pharmacy-100 rounded-lg flex items-center justify-center">
                                                <Pill className="w-4 h-4 text-pharmacy-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-slate-800">{med.name}</p>
                                                <p className="text-sm text-slate-500">{formatCurrency(med.price)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-sm font-medium ${med.quantity < 5 ? 'text-red-500' : 'text-green-600'}`}>
                                                {med.quantity} in stock
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showDropdown && !selectedMedicine && filteredMedicines.length === 0 && searchQuery && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-6 text-center text-slate-500">
                                No medicines found
                            </div>
                        )}
                    </div>

                    {/* Selected Medicine Info */}
                    {selectedMedicine && (
                        <div className="p-4 bg-pharmacy-50 border border-pharmacy-100 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-pharmacy-100 rounded-xl flex items-center justify-center">
                                        <Pill className="w-6 h-6 text-pharmacy-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{selectedMedicine.name}</p>
                                        <p className="text-pharmacy-600 font-semibold">{formatCurrency(selectedMedicine.price)} per unit</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Available Stock</p>
                                    <p className={`font-bold text-lg ${selectedMedicine.quantity < 5 ? 'text-red-500' : 'text-green-600'}`}>
                                        {selectedMedicine.quantity} units
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    {selectedMedicine && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Quantity
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-5 h-5 text-slate-600" />
                                </button>

                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                    className="w-24 text-center text-2xl font-bold py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pharmacy-500/50 focus:border-pharmacy-500 outline-none"
                                    min="1"
                                    max={selectedMedicine.quantity}
                                />

                                <button
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                    disabled={quantity >= selectedMedicine.quantity}
                                >
                                    <Plus className="w-5 h-5 text-slate-600" />
                                </button>

                                {quantity > selectedMedicine.quantity && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        Exceeds available stock
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sale Summary */}
                    {selectedMedicine && (
                        <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="font-medium">{formatCurrency(saleTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                <span className="text-lg font-bold text-slate-800">Total</span>
                                <span className="text-2xl font-bold text-pharmacy-600">{formatCurrency(saleTotal)}</span>
                            </div>
                        </div>
                    )}

                    {/* Process Sale Button */}
                    <button
                        onClick={handleSale}
                        disabled={!selectedMedicine || isProcessing || quantity > selectedMedicine?.quantity}
                        className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Complete Sale
                            </span>
                        )}
                    </button>
                </div>

                {/* Today's Summary */}
                <div className="space-y-6">
                    {/* Today's Stats */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Today's Summary</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                    <span className="text-slate-600">Revenue</span>
                                </div>
                                <span className="text-xl font-bold text-green-600">
                                    {formatCurrency(totals.todaysRevenue)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                                    <span className="text-slate-600">Transactions</span>
                                </div>
                                <span className="text-xl font-bold text-blue-600">
                                    {totals.todaysSalesCount}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Last Sale */}
                    {lastSale && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Last Sale</h3>
                            <div className="p-4 bg-pharmacy-50 rounded-xl border border-pharmacy-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="font-medium text-green-700">Sale Completed</span>
                                </div>
                                <p className="text-slate-800 font-medium">{lastSale.medicineName}</p>
                                <p className="text-slate-500 text-sm">Quantity: {lastSale.quantitySold}</p>
                                <p className="text-pharmacy-600 font-bold mt-2">{formatCurrency(lastSale.totalPrice)}</p>
                                <p className="text-slate-400 text-xs mt-2">
                                    Remaining stock: {lastSale.remainingStock} units
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Recent Sales */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Sales</h3>
                        {todaysSales.length > 0 ? (
                            <div className="space-y-3 max-h-64 overflow-auto">
                                {todaysSales.slice(0, 5).map((sale) => (
                                    <div key={sale.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm">{sale.medicineName}</p>
                                            <p className="text-slate-500 text-xs">x{sale.quantitySold}</p>
                                        </div>
                                        <span className="font-semibold text-pharmacy-600">
                                            {formatCurrency(sale.totalPrice)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                <Package className="w-10 h-10 mb-2" />
                                <p className="text-sm">No sales today yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
