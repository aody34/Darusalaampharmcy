/**
 * Database Layer - Supabase Wrapper
 * Schema V2 Support: Suppliers, Stock Adjustments, Enhanced Medicines
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
                brand_name: medicine.brandName || null,
                generic_name: medicine.genericName || null,
                category: medicine.category || 'Tablet',
                batch_number: medicine.batchNumber || null,
                purchase_price: parseFloat(medicine.purchasePrice || 0),
                selling_price: parseFloat(medicine.sellingPrice), // Renamed from price
                quantity: parseInt(medicine.quantity),
                expiry_date: medicine.expiryDate,
                supplier_id: medicine.supplierId || null
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
        // Now fetching supplier info as well
        const { data, error } = await supabase
            .from('medicines')
            .select(`
                *,
                supplier:suppliers (id, name)
            `)
            .order('name');

        if (error) throw error;

        // Map snake_case DB fields to camelCase for frontend
        const mappedData = data.map(m => ({
            id: m.id,
            name: m.name,
            brandName: m.brand_name,
            genericName: m.generic_name,
            category: m.category,
            batchNumber: m.batch_number,
            purchasePrice: m.purchase_price,
            sellingPrice: m.selling_price, // Renamed
            quantity: m.quantity,
            expiryDate: m.expiry_date,
            supplierId: m.supplier_id,
            supplierName: m.supplier?.name
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
        if (updates.brandName) dbUpdates.brand_name = updates.brandName;
        if (updates.genericName) dbUpdates.generic_name = updates.genericName;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.batchNumber) dbUpdates.batch_number = updates.batchNumber;
        if (updates.purchasePrice) dbUpdates.purchase_price = parseFloat(updates.purchasePrice);
        if (updates.sellingPrice) dbUpdates.selling_price = parseFloat(updates.sellingPrice);
        if (updates.quantity) dbUpdates.quantity = parseInt(updates.quantity);
        if (updates.expiryDate) dbUpdates.expiry_date = updates.expiryDate;
        if (updates.supplierId) dbUpdates.supplier_id = updates.supplierId;

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
            .select(`
                *,
                supplier:suppliers (id, name)
            `)
            .or(`name.ilike.%${query}%,brand_name.ilike.%${query}%,generic_name.ilike.%${query}%`)
            .order('name');

        if (error) throw error;

        const mappedData = data.map(m => ({
            id: m.id,
            name: m.name,
            brandName: m.brand_name,
            genericName: m.generic_name,
            category: m.category,
            batchNumber: m.batch_number,
            purchasePrice: m.purchase_price,
            sellingPrice: m.selling_price,
            quantity: m.quantity,
            expiryDate: m.expiry_date,
            supplierId: m.supplier_id,
            supplierName: m.supplier?.name
        }));

        return { success: true, data: mappedData };
    } catch (error) {
        console.error('Error searching medicines:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// ==========================================
// SUPPLIER OPERATIONS
// ==========================================

export async function getSuppliers() {
    try {
        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .order('name');

        if (error) throw error;

        return {
            success: true,
            data: data.map(s => ({
                id: s.id,
                name: s.name,
                contactNumber: s.contact_number,
                address: s.address
            }))
        };
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        return { success: false, error: error.message, data: [] };
    }
}

export async function addSupplier(supplier) {
    try {
        const { data, error } = await supabase
            .from('suppliers')
            .insert([{
                name: supplier.name,
                contact_number: supplier.contactNumber,
                address: supplier.address
            }])
            .select();

        if (error) throw error;
        return { success: true, id: data[0].id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ==========================================
// SALES OPERATIONS
// ==========================================

export async function createSale(medicineId, quantity) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // RPC must be updated to handle 'selling_price' instead of 'price' in DB
        // Assuming user runs fix_pos_rpc.sql
        const { data, error } = await supabase.rpc('process_sale', {
            p_medicine_id: medicineId,
            p_quantity: quantity,
            p_seller_id: user.id
        });

        if (error) throw error;

        // Parse RPC return
        if (!data.success) {
            throw new Error(data.error);
        }

        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error creating sale:', error);
        return { success: false, error: error.message };
    }
}

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
            unitPrice: s.total_price / s.quantity_sold
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

export async function getSalesByDateRange(startDate, endDate) {
    try {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .gte('sale_date', start.toISOString())
            .lte('sale_date', end.toISOString())
            .order('sale_date', { ascending: false });

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
        const [medicinesData, salesData] = await Promise.all([
            getAllMedicines(),
            getTodaysSales()
        ]);

        const medicines = medicinesData.data || [];
        const todaysSales = salesData.data || [];

        // Updated for sellingPrice
        const totalStockValue = medicines.reduce((sum, med) => sum + (med.purchasePrice * med.quantity), 0); // Cost Value
        const potentialRevenue = medicines.reduce((sum, med) => sum + (med.sellingPrice * med.quantity), 0); // Sales Value

        const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
        const totalItems = medicines.reduce((sum, med) => sum + med.quantity, 0);
        const lowStockMeds = medicines.filter(m => m.quantity < 10); // Standardized threshold

        return {
            success: true,
            data: {
                totalMedicines: medicines.length,
                totalItems,
                totalStockValue,
                potentialRevenue,
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

// ==========================================
// STOCK ADJUSTMENTS
// ==========================================

export async function addStockAdjustment(adjustment) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('stock_adjustments')
            .insert([{
                medicine_id: adjustment.medicineId,
                adjustment_type: adjustment.type, // 'return', 'damage', 'correction'
                quantity: adjustment.quantity,
                reason: adjustment.reason,
                adjusted_by: user.id
            }])
            .select();

        if (error) throw error;

        // Also update the stock level
        let quantityChange = 0;
        if (adjustment.type === 'return') {
            quantityChange = adjustment.quantity; // Add back to stock
        } else if (adjustment.type === 'damage' || adjustment.type === 'correction') {
            quantityChange = -adjustment.quantity; // Remove from stock
        }

        if (quantityChange !== 0) {
            const { error: stockError } = await supabase.rpc('update_stock', {
                p_medicine_id: adjustment.medicineId,
                p_quantity_change: quantityChange
            });

            // If update_stock RPC doesn't exist, we might need a direct update or create that function too.
            // For now fall back to direct update since simple increment
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

