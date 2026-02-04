# Darusalaampharmcy 🏥

A modern, offline-first web application for managing pharmacy inventory, sales, and analytics. Built with **React**, **Tailwind CSS**, and **IndexedDB** (via Dexie.js).

## 📚 Educational Foundation

Before diving into the code, let's understand the core technology powering this application.

### Why IndexedDB?
We chose **IndexedDB** over LocalStorage for this project because a pharmacy system manages complex, structured data (thousands of medicines, sales records) that requires:
1.  **Large Capacity**: IndexedDB can store hundreds of megabytes (vs LocalStorage's 5MB).
2.  **Performance**: Operations are asynchronous (non-blocking), keeping the UI smooth.
3.  **Complex Queries**: We need to search medicines by name and filter sales by date.
4.  **Transactions**: Creating a sale must *simultaneously* deduct stock and record the transaction. If one fails, both must fail (ACID compliance).

| Feature | LocalStorage | IndexedDB |
|---------|--------------|-----------|
| **Data Type** | Strings only | Objects, Files, Arrays |
| **Capacity** | ~5MB | 50MB+ (Disk Quota) |
| **Speed** | Synchronous (Slow) | Asynchronous (Fast) |
| **Search** | No indexing | Full Indexing Support |

### The CRUD Flow
Data moves through the application in a unidirectional flow:
1.  **User Input**: User fills the "Add Medicine" form.
2.  **Validation**: React state validates inputs (e.g., price > 0).
3.  **Database Call**: `db.medicines.add(data)` is called via our `db.js` wrapper.
4.  **IndexedDB Transaction**: The browser commits the data to disk.
5.  **UI Update**: The list component detects the change (via `useMedicines` hook) and re-renders.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1.  **Install dependencies**
    ```bash
    npm install
    ```

2.  **Start the development server**
    ```bash
    npm run dev
    ```

3.  Open your browser to `http://localhost:5173`

---

## 🏗️ Project Architecture

### Folder Structure
```
src/
├── components/         # UI Components
│   ├── dashboard/      # Stats & Overview
│   ├── layout/         # Sidebar & Main Wrapper
│   ├── medicines/      # Inventory Management
│   ├── sales/          # POS System
│   └── reports/        # Analytics
├── context/            # Global State (AppProvider)
├── db/                 # Database Layer (db.js)
├── hooks/              # Custom Data Hooks
└── index.css           # Global Styles & Tailwind
```

### Key Modules

#### 1. Database Wrapper (`src/db/db.js`)
We use **Dexie.js** to wrap IndexedDB. This allows us to write clean, promise-based code instead of complex event handling.
```javascript
// Example: Transactional Sale
export async function createSale(medicineId, quantity) {
  return db.transaction('rw', db.medicines, db.sales, async () => {
    // 1. Get Medicine & Check Stock
    // 2. Decuct Stock
    // 3. Add Sale Record
  });
}
```

#### 2. Layout & State (`src/context/AppContext.jsx`)
Manages global UI state like the current active page, toast notifications, and loading spinners. Prevents prop-drilling across the app.

#### 3. Medicine Management
- **MedicineForm**: Handles adding/editing with validation logic.
- **MedicineList**: Displays inventory with "Low Stock" (< 5 units) indicators.

#### 4. POS System
A robust Point of Sale interface that:
- Real-time search for medicines.
- Validates stock before adding to cart.
- Updates inventory and sales history in a single atomic transaction.

---

## ⚠️ Error Handling

Robust applications need to handle failures gracefully. We implemented:

1.  **Database Connection**: If Dexie fails to open, catch blocks log errors to console.
2.  **Stock Validation**: The POS prevents selling more items than available.
3.  **User Feedback**: A custom **Toast Notification** system gives immediate feedback for success (Green), errors (Red), or warnings (Yellow).

```javascript
/* Example Error Handling in UI */
try {
  await sell(id, quantity);
  showToast('Sale Success!', 'success');
} catch (err) {
  showToast(err.message, 'error'); // e.g., "Insufficient Stock"
}
```

---

## 🛡️ Best Practices Used
- **Custom Hooks**: Logic extracted into `useMedicines` and `useSales` for reusability.
- **Component Composition**: Small, focused components (Sidebar, StatsCard, TableRow).
- **Tailwind Utility Classes**: Rapid styling with a consistent design system (`text-slate-800`, `bg-pharmacy-500`).
- **Semantic HTML**: Proper table structures and form labeling.

---

*Built for the User by Antigravity AI*
