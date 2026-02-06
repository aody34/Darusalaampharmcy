import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp, TOAST_TYPES } from '../../context/AppContext';
import { useEffect } from 'react';

export default function AdminRoute() {
    const { user, isAdmin, loading } = useAuth();
    const { showToast } = useApp();

    useEffect(() => {
        if (!loading && user && !isAdmin) {
            showToast('Access denied: Admins only', TOAST_TYPES.WARNING);
        }
    }, [loading, user, isAdmin, showToast]);

    if (loading) return null;

    if (!user) return <Navigate to="/login" replace />;

    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
