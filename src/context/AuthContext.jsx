import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp, TOAST_TYPES } from './AppContext';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useApp();

    const [error, setError] = useState(null);

    useEffect(() => {
        // Safety check for env vars
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            setLoading(false);
            return;
        }

        const initAuth = async () => {
            try {
                // Timeout promise
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Connection timeout')), 5000)
                );

                // Auth check promise
                const authPromise = async () => {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    if (error) throw error;
                    return session;
                };

                // Race against timeout
                const session = await Promise.race([authPromise(), timeoutPromise]);

                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setLoading(false);
                }
            } catch (e) {
                console.error("Auth init error:", e);
                setError(e.message || 'Failed to connect to database');
                setLoading(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                // Only fetch if not already loaded or different user
                if (!profile || profile.id !== session.user.id) {
                    await fetchProfile(session.user.id);
                }
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        initAuth();

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            showToast('Error signing out', TOAST_TYPES.ERROR);
        } else {
            showToast('Signed out successfully', TOAST_TYPES.SUCCESS);
        }
    };

    const isAdmin = profile?.role === 'admin';

    // Retry initialization
    const retryInit = () => {
        setLoading(true);
        setError(null);
        window.location.reload();
    };

    return (
        <AuthContext.Provider value={{ user, profile, isAdmin, login, logout, loading }}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-pharmacy-200 border-t-pharmacy-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Initializing Application...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Connection Failed</h2>
                        <p className="text-slate-600 mb-6">{error}</p>
                        <button
                            onClick={retryInit}
                            className="bg-pharmacy-600 text-white px-6 py-2 rounded-xl hover:bg-pharmacy-700 transition-colors"
                        >
                            Retry Connection
                        </button>
                    </div>
                </div>
            ) : (
                (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) ? (
                    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Configuration Error</h2>
                            <p className="text-slate-600 mb-6">
                                The application is missing required environment variables.
                            </p>
                            <div className="text-left bg-slate-900 text-slate-300 p-4 rounded-lg text-xs font-mono mb-6 overflow-x-auto">
                                <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}</p>
                                <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</p>
                            </div>
                            <p className="text-sm text-slate-500">
                                Please add these to your Vercel Project Settings.
                            </p>
                        </div>
                    </div>
                ) : (
                    children
                )
            )}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
