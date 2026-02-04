/**
 * Database Layer - Dexie.js Wrapper for IndexedDB
 * 
 * This module provides a clean, promise-based API for all database operations.
 * Using Dexie.js simplifies IndexedDB's complex event-driven API into simple async/await calls.
 * 
 * DATABASE SCHEMA:
 * ================
 * medicines: { id (auto), name, price, quantity, expiryDate, createdAt }
 * sales: { id (auto), medicineId, medicineName, quantitySold, unitPrice, totalPrice, saleDate }
 */

import Dexie from 'dexie';

// Create database instance
const db = new Dexie('PharmacyDB');

// Define schema with version 1
// The '++id' means auto-incrementing primary key
// Other fields after the primary key are indexed for fast queries
db.version(1).stores({
    medicines: '++id, name, price, quantity, expiryDate, createdAt',
    sales: '++id, medicineId, medicineName, saleDate'
});

// ==========================================
// MEDICINE CRUD OPERATIONS
// ==========================================

/**
 * Add a new medicine to the inventory
 * @param {Object} medicine - { name, price, quantity, expiryDate }
 * @returns {Promise<number>} - The auto-generated ID
 */
export async function addMedicine(medicine) {
    try {
        const id = await db.medicines.add({
            ...medicine,
            price: parseFloat(medicine.price),
            quantity: parseInt(medicine.quantity),
            createdAt: new Date().toISOString()
        });
        return { success: true, id };
    } catch (error) {
        console.error('Error adding medicine:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all medicines from the inventory
 * @returns {Promise<Array>} - Array of all medicines
 */
export async function getAllMedicines() {
    try {
        const medicines = await db.medicines.toArray();
        return { success: true, data: medicines };
    } catch (error) {
        console.error('Error fetching medicines:', error);
        return { success: false, error: error.message, data: [] };
    }
}

/**
 * Get a single medicine by ID
 * @param {number} id - Medicine ID
 * @returns {Promise<Object>} - Medicine object
 */
export async function getMedicineById(id) {
    try {
        const medicine = await db.medicines.get(id);
        return { success: true, data: medicine };
    } catch (error) {
        console.error('Error fetching medicine:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing medicine
 * @param {number} id - Medicine ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Success status
 */
export async function updateMedicine(id, updates) {
    try {
        await db.medicines.update(id, {
            ...updates,
            price: updates.price ? parseFloat(updates.price) : undefined,
            quantity: updates.quantity ? parseInt(updates.quantity) : undefined
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating medicine:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a medicine from the inventory
 * @param {number} id - Medicine ID
 * @returns {Promise<Object>} - Success status
 */
export async function deleteMedicine(id) {
    try {
        await db.medicines.delete(id);
        return { success: true };
    } catch (error) {
        console.error('Error deleting medicine:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Search medicines by name
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Matching medicines
 */
export async function searchMedicines(query) {
    try {
        const medicines = await db.medicines
            .filter(med => med.name.toLowerCase().includes(query.toLowerCase()))
            .toArray();
        return { success: true, data: medicines };
    } catch (error) {
        console.error('Error searching medicines:', error);
        return { success: false, error: error.message, data: [] };
    }
}

/**
 * Get medicines with low stock (quantity < threshold)
 * @param {number} threshold - Stock threshold (default: 5)
 * @returns {Promise<Array>} - Low stock medicines
 */
export async function getLowStockMedicines(threshold = 5) {
    try {
        const medicines = await db.medicines
            .filter(med => med.quantity < threshold)
            .toArray();
        return { success: true, data: medicines };
    } catch (error) {
        console.error('Error fetching low stock medicines:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// ==========================================
// SALES OPERATIONS
// ==========================================

/**
 * Create a sale with transactional safety
 * This ensures stock is reduced AND sale is recorded atomically
 * 
 * @param {number} medicineId - The medicine being sold
 * @param {number} quantity - Quantity to sell
 * @returns {Promise<Object>} - Sale result
 */
export async function createSale(medicineId, quantity) {
    try {
        // Use Dexie transaction for atomic operation
        const result = await db.transaction('rw', db.medicines, db.sales, async () => {
            // Step 1: Get the medicine
            const medicine = await db.medicines.get(medicineId);

            if (!medicine) {
                throw new Error('Medicine not found');
            }

            // Step 2: Check stock availability
            if (medicine.quantity < quantity) {
                throw new Error(`Insufficient stock. Available: ${medicine.quantity}, Requested: ${quantity}`);
            }

            // Step 3: Calculate sale details
            const totalPrice = medicine.price * quantity;
            const newQuantity = medicine.quantity - quantity;

            // Step 4: Update medicine stock
            await db.medicines.update(medicineId, { quantity: newQuantity });

            // Step 5: Create sale record
            const saleId = await db.sales.add({
                medicineId,
                medicineName: medicine.name,
                quantitySold: quantity,
                unitPrice: medicine.price,
                totalPrice,
                saleDate: new Date().toISOString()
            });

            return {
                saleId,
                medicineName: medicine.name,
                quantitySold: quantity,
                totalPrice,
                remainingStock: newQuantity
            };
        });

        return { success: true, data: result };
    } catch (error) {
        console.error('Error creating sale:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all sales history
 * @returns {Promise<Array>} - All sales records
 */
export async function getSalesHistory() {
    try {
        const sales = await db.sales.reverse().toArray();
        return { success: true, data: sales };
    } catch (error) {
        console.error('Error fetching sales history:', error);
        return { success: false, error: error.message, data: [] };
    }
}

/**
 * Get today's sales
 * @returns {Promise<Array>} - Today's sales
 */
export async function getTodaysSales() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sales = await db.sales
            .filter(sale => new Date(sale.saleDate) >= today)
            .toArray();

        return { success: true, data: sales };
    } catch (error) {
        console.error('Error fetching today\'s sales:', error);
        return { success: false, error: error.message, data: [] };
    }
}

/**
 * Get sales by date range
 * @param {Date} startDate - Start of range
 * @param {Date} endDate - End of range
 * @returns {Promise<Array>} - Sales in range
 */
export async function getSalesByDateRange(startDate, endDate) {
    try {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const sales = await db.sales
            .filter(sale => {
                const saleDate = new Date(sale.saleDate);
                return saleDate >= start && saleDate <= end;
            })
            .toArray();

        return { success: true, data: sales };
    } catch (error) {
        console.error('Error fetching sales by date range:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} - Dashboard stats
 */
export async function getDashboardStats() {
    try {
        const medicines = await db.medicines.toArray();
        const todaysSales = await getTodaysSales();
        const lowStockMeds = await getLowStockMedicines(5);

        // Calculate total stock value
        const totalStockValue = medicines.reduce((sum, med) => {
            return sum + (med.price * med.quantity);
        }, 0);

        // Calculate today's revenue
        const todaysRevenue = todaysSales.data.reduce((sum, sale) => {
            return sum + sale.totalPrice;
        }, 0);

        // Count total items
        const totalItems = medicines.reduce((sum, med) => sum + med.quantity, 0);

        return {
            success: true,
            data: {
                totalMedicines: medicines.length,
                totalItems,
                totalStockValue,
                todaysSalesCount: todaysSales.data.length,
                todaysRevenue,
                lowStockCount: lowStockMeds.data.length,
                lowStockItems: lowStockMeds.data
            }
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { success: false, error: error.message };
    }
}

// Export the database instance for advanced use cases
export { db };
