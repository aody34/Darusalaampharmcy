import { useState } from 'react';
import MedicineForm from './MedicineForm';
import MedicineList from './MedicineList';
import { Plus, List } from 'lucide-react';

/**
 * Medicine Manager Component
 * Container for medicine form and list with tab navigation
 */
export default function MedicineManager() {
    const [activeTab, setActiveTab] = useState('list');
    const [refreshKey, setRefreshKey] = useState(0);

    // Force refresh of list when medicine is added/edited
    const handleMedicineChange = () => {
        setRefreshKey(prev => prev + 1);
        setActiveTab('list');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Medicine Inventory</h1>
                    <p className="text-slate-500 mt-1">Manage your pharmacy stock and inventory</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-100 rounded-xl p-1">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${activeTab === 'list'
                                ? 'bg-white text-pharmacy-600 shadow-md'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <List className="w-4 h-4" />
                        View All
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${activeTab === 'add'
                                ? 'bg-white text-pharmacy-600 shadow-md'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        Add New
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="glass-card p-6">
                {activeTab === 'list' ? (
                    <MedicineList key={refreshKey} onEdit={() => setActiveTab('add')} />
                ) : (
                    <MedicineForm onSuccess={handleMedicineChange} onCancel={() => setActiveTab('list')} />
                )}
            </div>
        </div>
    );
}
