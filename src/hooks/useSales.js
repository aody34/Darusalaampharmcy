import { useState, useEffect, useCallback } from 'react';
import {
    getSalesHistory,
    getTodaysSales,
    getSalesByDateRange,
    createSale
} from '../db/db';

/**
 * Custom Hook for Sales Operations
 * Provides reactive access to sales data
 */
export function useSales() {
    const [sales, setSales] = useState([]);
    const [todaysSales, setTodaysSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all sales
    const fetchSales = useCallback(async () => {
        setLoading(true);
        setError(null);

        const [historyResult, todayResult] = await Promise.all([
            getSalesHistory(),
            getTodaysSales()
        ]);

        if (historyResult.success) {
            setSales(historyResult.data);
        } else {
            setError(historyResult.error);
        }

        if (todayResult.success) {
            setTodaysSales(todayResult.data);
        }

        setLoading(false);
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    // Create a sale
    const sell = useCallback(async (medicineId, quantity) => {
        const result = await createSale(medicineId, quantity);
        if (result.success) {
            await fetchSales();
        }
        return result;
    }, [fetchSales]);

    // Get sales by date range
    const getByDateRange = useCallback(async (startDate, endDate) => {
        setLoading(true);
        const result = await getSalesByDateRange(startDate, endDate);
        if (result.success) {
            setSales(result.data);
        }
        setLoading(false);
        return result;
    }, []);

    // Calculate totals
    const getTotals = useCallback(() => {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
        const totalItems = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
        const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.totalPrice, 0);

        return {
            totalRevenue,
            totalItems,
            todaysRevenue,
            todaysSalesCount: todaysSales.length
        };
    }, [sales, todaysSales]);

    return {
        sales,
        todaysSales,
        loading,
        error,
        refresh: fetchSales,
        sell,
        getByDateRange,
        getTotals
    };
}
