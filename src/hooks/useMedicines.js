import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
    getAllMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    searchMedicines
} from '../db/db';

export function useMedicines() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMedicines = useCallback(async () => {
        // setLoading(true); // Don't set loading on every refresh to avoid flicker
        const result = await getAllMedicines();
        if (result.success) {
            setMedicines(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchMedicines();

        // Realtime Subscription
        const subscription = supabase
            .channel('medicines_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'medicines' }, (payload) => {
                console.log('Real-time update:', payload);
                fetchMedicines(); // Refresh list on any change
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchMedicines]);

    // Wrappers
    const add = async (medicine) => addMedicine(medicine);
    const update = async (id, updates) => updateMedicine(id, updates);
    const remove = async (id) => deleteMedicine(id);
    const search = async (query) => {
        if (!query.trim()) return fetchMedicines();
        setLoading(true);
        const result = await searchMedicines(query);
        if (result.success) setMedicines(result.data);
        setLoading(false);
        return result;
    };

    return {
        medicines,
        loading,
        error,
        refresh: fetchMedicines,
        add,
        update,
        remove,
        search
    };
}
