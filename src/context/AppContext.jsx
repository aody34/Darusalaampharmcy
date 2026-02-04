import { createContext, useContext, useState, useCallback } from 'react';

// Create Context
const AppContext = createContext(null);

// Toast types
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning'
};

/**
 * App Context Provider
 * Manages global state: current page, toast notifications, loading states
 */
export function AppProvider({ children }) {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [toast, setToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);

    // Show toast notification
    const showToast = useCallback((message, type = TOAST_TYPES.SUCCESS) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    // Hide toast
    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    // Navigate to a page
    const navigateTo = useCallback((page) => {
        setCurrentPage(page);
        setEditingMedicine(null);
    }, []);

    // Edit medicine
    const editMedicine = useCallback((medicine) => {
        setEditingMedicine(medicine);
        setCurrentPage('medicines');
    }, []);

    // Clear editing state
    const clearEditing = useCallback(() => {
        setEditingMedicine(null);
    }, []);

    const value = {
        currentPage,
        navigateTo,
        toast,
        showToast,
        hideToast,
        isLoading,
        setIsLoading,
        editingMedicine,
        editMedicine,
        clearEditing
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

/**
 * Custom hook to use App Context
 */
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
