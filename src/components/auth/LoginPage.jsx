import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp, TOAST_TYPES } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Pill, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const { showToast } = useApp();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log("Attempting login with:", { email }); // Log email (don't log password)
        try {
            const result = await login(email, password);
            console.log("Login success:", result);
            showToast('Welcome back!', TOAST_TYPES.SUCCESS);
            navigate('/');
        } catch (error) {
            console.error("Login failed:", error);
            // Log the full error object to debug 400 details
            if (error.message) console.log("Error message:", error.message);
            if (error.code) console.log("Error code:", error.code);

            showToast(error.message || 'Login failed', TOAST_TYPES.ERROR);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pharmacy-800 to-pharmacy-950 p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-white to-pharmacy-100 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                        <Pill className="w-8 h-8 text-pharmacy-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Darusalaam</h1>
                    <p className="text-pharmacy-200">Pharmacy Management System</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-pharmacy-100 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pharmacy-300" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-pharmacy-700 rounded-xl text-white placeholder-pharmacy-400 focus:ring-2 focus:ring-pharmacy-400 focus:border-transparent outline-none transition-all"
                                placeholder="admin@darusalaam.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-pharmacy-100 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pharmacy-300" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-pharmacy-700 rounded-xl text-white placeholder-pharmacy-400 focus:ring-2 focus:ring-pharmacy-400 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-pharmacy-400 to-pharmacy-600 hover:from-pharmacy-500 hover:to-pharmacy-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pharmacy-900/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
