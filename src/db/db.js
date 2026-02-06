/**
 * Database Layer - Supabase Wrapper
 * Migrated from Dexie.js to Supabase (PostgreSQL)
 */

import { supabase } from '../lib/supabase';

// ==========================================
// MEDICINE CRUD OPERATIONS
// ==========================================

export async function addMedicine(medicine) {
    try {
        const { data, error } = await supabase
            .from('medicines')
            .insert([{
                name: medicine.name,
                price: parseFloat(medicine.price),
                quantity: parseInt(medicine.quantity),
                expiry_date: medicine.expiryDate // Note snake_case mapping
            }])
            .select();

        if (error) throw error;
        return { success: true, id: data[0].id };
    } catch (error) {
        console.error('Error adding medicine:', error);
        return { success: false, error: error.message };
    }
}

export async function getAllMedicines() {
    try {
        const { data, error } = await supabase
            .from('medicines')
            .select('*')
            .order('name');

        if (error) throw error;

        // Map back to camelCase for frontend compatibility
        const mappedData = data.map(m => ({
            ...m,
            expiryDate: m.expiry_date
        }));

        return { success: true, data: mappedData };
    } catch (error) {
        console.error('Error fetching medicines:', error);
        return { success: false, error: error.message, data: [] };
    }
}

export async function updateMedicine(id, updates) {
    try {
        const dbUpdates = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.price) dbUpdates.price = parseFloat(updates.price);
        if (updates.quantity) dbUpdates.quantity = parseInt(updates.quantity);
        if (updates.expiryDate) dbUpdates.expiry_date = updates.expiryDate;

        const { error } = await supabase
            .from('medicines')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error updating medicine:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteMedicine(id) {
    try {
        const { error } = await supabase
            .from('medicines')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting medicine:', error);
        return { success: false, error: error.message };
    }
}

export async function searchMedicines(query) {
    try {
        const { data, error } = await supabase
            .from('medicines')
            .select('*')
            .ilike('name', `%${query}%`);

        if (error) throw error;

        const mappedData = data.map(m => ({
            ...m,
            expiryDate: m.expiry_date
        }));

        return { success: true, data: mappedData };
    } catch (error) {
        return { success: false, error: error.message, data: [] };
    }
}

// ==========================================
// SALES OPERATIONS
// ==========================================

export async function createSale(medicineId, quantity) {
    try {
        // Check if we have a custom item (no ID)
        // Actually, hybrid input might mean ID is null? 
        // If ID is provided, use the RPC.

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Call the Postgres function for atomic transaction
        const { data, error } = await supabase.rpc('process_sale', {
            p_medicine_id: medicineId,
            p_quantity: quantity,
            p_seller_id: user.id
        });

        if (error) throw error;

        // data return from RPC is already a JSON object { success, data/error }
        // but rpc returns the function result. My function returns { success: boolean, ... }

        if (!data.success) {
            throw new Error(data.error);
        }

        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error creating sale:', error);
        return { success: false, error: error.message };
    }
}

// New function for custom items sale (no stock tracking)
export async function createCustomSale(itemDetails) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('sales')
            .insert([{
                medicine_name: itemDetails.name,
                quantity_sold: itemDetails.quantity,
                total_price: itemDetails.totalPrice,
                seller_id: user.id
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            data: {
                medicineName: data.medicine_name,
                quantitySold: data.quantity_sold,
                totalPrice: data.total_price
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getSalesHistory() {
    try {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .order('sale_date', { ascending: false });

        if (error) throw error;

        const mappedData = data.map(s => ({
            ...s,
            medicineName: s.medicine_name,
            quantitySold: s.quantity_sold,
            totalPrice: s.total_price,
            saleDate: s.sale_date,
            unitPrice: s.total_price / s.quantity_sold // Derived
        }));

        return { success: true, data: mappedData };
    } catch (error) {
        return { success: false, error: error.message, data: [] };
    }
}

export async function getTodaysSales() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .gte('sale_date', today.toISOString());

        if (error) throw error;

        const mappedData = data.map(s => ({
            ...s,
            medicineName: s.medicine_name,
            quantitySold: s.quantity_sold,
            totalPrice: s.total_price,
            saleDate: s.sale_date
        }));

        return { success: true, data: mappedData };
    } catch (error) {
        return { success: false, error: error.message, data: [] };
    }
}

// ==========================================
// DASHBOARD STATS
// ==========================================

export async function getDashboardStats() {
    try {
        // Run parallel queries
        const [medicinesData, salesData] = await Promise.all([
            getAllMedicines(),
            getTodaysSales()
        ]);

        const medicines = medicinesData.data || [];
        const todaysSales = salesData.data || [];

        const totalStockValue = medicines.reduce((sum, med) => sum + (med.price * med.quantity), 0);
        const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
        const totalItems = medicines.reduce((sum, med) => sum + med.quantity, 0);
        const lowStockMeds = medicines.filter(m => m.quantity < 5);

        return {
            success: true,
            data: {
                totalMedicines: medicines.length,
                totalItems,
                totalStockValue,
                todaysSalesCount: todaysSales.length,
                todaysRevenue,
                lowStockCount: lowStockMeds.length,
                lowStockItems: lowStockMeds
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
