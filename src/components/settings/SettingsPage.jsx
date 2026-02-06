import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useApp, TOAST_TYPES } from '../../context/AppContext';
import { User, Save, Shield, UserPlus } from 'lucide-react';

export default function SettingsPage() {
    const { profile } = useAuth();
    const { showToast } = useApp();
    const [activeTab, setActiveTab] = useState('profile');
    const [settings, setSettings] = useState({
        pharmacy_name: '',
        address: '',
        phone: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .single();

            if (data) {
                setSettings(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from('settings')
            .update(settings)
            .eq('id', 1);

        if (error) {
            showToast('Failed to update settings', TOAST_TYPES.ERROR);
        } else {
            showToast('Settings updated successfully', TOAST_TYPES.SUCCESS);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
                <p className="text-slate-500 mt-1">Manage pharmacy profile and system preferences</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Settings Tabs */}
                <div className="w-full md:w-64 glass-card p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-pharmacy-50 text-pharmacy-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Shield className="w-5 h-5" />
                        Pharmacy Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'team' ? 'bg-pharmacy-50 text-pharmacy-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <User className="w-5 h-5" />
                        Team Members
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 glass-card p-8 w-full">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateSettings} className="space-y-6 max-w-xl">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                <div className="w-16 h-16 bg-pharmacy-100 rounded-full flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-pharmacy-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Pharmacy Details</h2>
                                    <p className="text-sm text-slate-500">Information used on receipts and reports</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Pharmacy Name</label>
                                <input
                                    type="text"
                                    value={settings.pharmacy_name}
                                    onChange={(e) => setSettings({ ...settings, pharmacy_name: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                                <textarea
                                    value={settings.address}
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                    className="input-field h-24 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={settings.phone}
                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="btn-primary flex items-center gap-2">
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'team' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Team Management</h2>
                                        <p className="text-sm text-slate-500">View and manage staff accounts</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => showToast('Invite users via Supabase Dashboard', TOAST_TYPES.WARNING)}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Invite Staff
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-pharmacy-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {profile?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{profile?.full_name || 'Current User'}</p>
                                            <p className="text-sm text-slate-500">{profile?.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${profile?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {profile?.role || 'Staff'}
                                    </span>
                                </div>

                                {/* Note: A real implementation would map over a list of users fetched from Supabase */}
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    Manage additional users in the Supabase Authentication Dashboard
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
