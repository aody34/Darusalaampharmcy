import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useApp, TOAST_TYPES } from '../../context/AppContext';
import { User, Save, Shield, UserPlus, Mail, Lock } from 'lucide-react';

// Staff Registration Form Component
function StaffRegistrationForm({ showToast }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // First, signup the user (this creates auth record)
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: null, // No email verification needed
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (signUpError) throw signUpError;

            // Create profile manually
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: signUpData.user.id,
                    email: email,
                    full_name: fullName,
                    role: 'staff'
                }]);

            if (profileError) throw profileError;

            showToast(`Staff member ${fullName} created successfully!`, TOAST_TYPES.SUCCESS);

            // Reset form
            setEmail('');
            setPassword('');
            setFullName('');
        } catch (error) {
            console.error('Error creating staff:', error);
            showToast(error.message || 'Failed to create staff member', TOAST_TYPES.ERROR);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleCreateStaff} className="space-y-5 max-w-xl">
            {/* Full Name */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                </label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pharmacy-500 focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                        required
                    />
                </div>
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                </label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pharmacy-500 focus:border-transparent outline-none transition-all"
                        placeholder="staff@darusalaam.com"
                        required
                    />
                </div>
            </div>

            {/* Password */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pharmacy-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>
                <p className="mt-2 text-xs text-slate-500">Minimum 6 characters</p>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pharmacy-600 hover:bg-pharmacy-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Staff...
                    </>
                ) : (
                    <>
                        <UserPlus className="w-5 h-5" />
                        Create Staff Account
                    </>
                )}
            </button>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> New staff members can access Dashboard, Medicines, and Point of Sale. Only admins can access Suppliers, Reports, and Settings.
                </p>
            </div>
        </form>
    );
}

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
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <UserPlus className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Register New Staff</h2>
                                    <p className="text-sm text-slate-500">Create accounts for pharmacy staff members</p>
                                </div>
                            </div>

                            <StaffRegistrationForm showToast={showToast} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
