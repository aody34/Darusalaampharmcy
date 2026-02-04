import { useState, useEffect, useCallback } from 'react';
import {
    getAllMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    searchMedicines,
    getLowStockMedicines
} from '../db/db';

/**
 * Custom Hook for Medicine Operations
 * Provides reactive access to medicine data with automatic refresh
 */
export function useMedicines() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all medicines
    const fetchMedicines = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await getAllMedicines();
        if (result.success) {
            setMedicines(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    // Add medicine
    const add = useCallback(async (medicine) => {
        const result = await addMedicine(medicine);
        if (result.success) {
            await fetchMedicines();
        }
        return result;
    }, [fetchMedicines]);

    // Update medicine
    const update = useCallback(async (id, updates) => {
        const result = await updateMedicine(id, updates);
        if (result.success) {
            await fetchMedicines();
        }
        return result;
    }, [fetchMedicines]);

    // Delete medicine
    const remove = useCallback(async (id) => {
        const result = await deleteMedicine(id);
        if (result.success) {
            await fetchMedicines();
        }
        return result;
    }, [fetchMedicines]);

    // Search medicines
    const search = useCallback(async (query) => {
        if (!query.trim()) {
            return fetchMedicines();
        }
        setLoading(true);
        const result = await searchMedicines(query);
        if (result.success) {
            setMedicines(result.data);
        }
        setLoading(false);
        return result;
    }, [fetchMedicines]);

    // Get low stock
    const getLowStock = useCallback(async (threshold = 5) => {
        const result = await getLowStockMedicines(threshold);
        return result;
    }, []);

    return {
        medicines,
        loading,
        error,
        refresh: fetchMedicines,
        add,
        update,
        remove,
        search,
        getLowStock
    };
}
