// Store table data
let tables = {};

// Initialize tables
function initializeTables() {
    const allOrders = JSON.parse(localStorage.getItem('tableOrders')) || {};
    for (let i = 1; i <= 9; i++) {
        tables[i] = {
            status: allOrders[i] && allOrders[i].length > 0 ? 'Occupied' : 'Available'
        };
    }
}

// Open table billing
function openTable(tableNumber) {
    localStorage.setItem('currentTable', tableNumber);
    window.location.href = `table.html?table=${tableNumber}`;
}

// Update table card status
function updateTableStatus() {
    const tableCards = document.querySelectorAll('.table-card');
    const allOrders = JSON.parse(localStorage.getItem('tableOrders')) || {};

    tableCards.forEach((card, index) => {
        const tableNumber = index + 1;
        const status = allOrders[tableNumber] && allOrders[tableNumber].length > 0 ? 'Occupied' : 'Available';
        const statusSpan = card.querySelector('.status');
        
        if (status === 'Occupied') {
            statusSpan.style.backgroundColor = '#fee2e2';
            statusSpan.style.color = 'var(--danger-color)';
        } else {
            statusSpan.style.backgroundColor = '#dcfce7';
            statusSpan.style.color = 'var(--success-color)';
        }
        
        statusSpan.textContent = status;
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeTables();
    updateTableStatus();
    
    // Update status every 30 seconds
    setInterval(updateTableStatus, 30000);
}); 