// Get DOM elements
const tableNumberElement = document.getElementById('tableNumber');
const orderItems = document.getElementById('orderItems');
const subTotalElement = document.getElementById('subTotal');
const orderModal = document.getElementById('orderModal');
const orderForm = document.getElementById('orderForm');
const itemSelect = document.getElementById('itemSelect');
const quantityInput = document.getElementById('quantity');
const orderStatus = document.getElementById('orderStatus');
const orderTime = document.getElementById('orderTime');

// Get table number from URL
const urlParams = new URLSearchParams(window.location.search);
const currentTable = urlParams.get('table');

// Current order
let currentOrder = [];
let orderStartTime = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (!currentTable) {
        window.location.href = 'index.html';
        return;
    }

    tableNumberElement.textContent = currentTable;
    loadMenuItems();
    loadOrder();
});

// Load menu items into select
function loadMenuItems() {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    itemSelect.innerHTML = '<option value="">Choose an item...</option>';
    menuItems.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${item.name} - ₹${item.price}`;
        itemSelect.appendChild(option);
    });
}

// Show add order modal
function showAddOrderModal() {
    orderForm.reset();
    orderModal.style.display = 'block';
}

// Close modal
function closeModal() {
    orderModal.style.display = 'none';
}

// Update order status
function updateOrderStatus() {
    if (currentOrder.length > 0) {
        orderStatus.textContent = 'Occupied';
        orderStatus.className = 'status-badge occupied';
        if (!orderStartTime) {
            orderStartTime = new Date();
            orderTime.textContent = `Started at: ${orderStartTime.toLocaleTimeString()}`;
        }
    } else {
        orderStatus.textContent = 'Available';
        orderStatus.className = 'status-badge available';
        orderStartTime = null;
        orderTime.textContent = '';
    }
}

// Handle form submission
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const selectedIndex = itemSelect.value;
    if (!selectedIndex) {
        alert('Please select an item');
        return;
    }

    const quantity = parseInt(quantityInput.value);
    if (quantity < 1) {
        alert('Please enter a valid quantity');
        return;
    }

    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const selectedItem = menuItems[selectedIndex];
    
    currentOrder.push({
        name: selectedItem.name,
        price: selectedItem.price,
        quantity: quantity,
        total: selectedItem.price * quantity
    });

    updateOrderDisplay();
    updateOrderStatus();
    saveOrder();
    closeModal();
});

// Update order display
function updateOrderDisplay() {
    orderItems.innerHTML = '';
    let subTotal = 0;

    currentOrder.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${item.total}</td>
            <td>
                <button class="btn-danger" onclick="removeItem(${index})">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        `;
        orderItems.appendChild(row);
        subTotal += item.total;
    });

    subTotalElement.textContent = `₹${subTotal.toFixed(2)}`;
    updateOrderStatus();
}

// Remove item from order
function removeItem(index) {
    currentOrder.splice(index, 1);
    updateOrderDisplay();
    saveOrder();
}

// Clear entire order
function clearOrder() {
    if (currentOrder.length === 0) return;
    
    if (confirm('Are you sure you want to clear the entire order?')) {
        currentOrder = [];
        orderStartTime = null;
        updateOrderDisplay();
        updateOrderStatus();
        saveOrder();
    }
}

// Generate bill
function generateBill() {
    if (currentOrder.length === 0) {
        alert('No items in order');
        return;
    }

    // Calculate total
    const total = currentOrder.reduce((sum, item) => sum + item.total, 0);
    
    // Save to history
    saveToHistory(total);

    // Create and open print window
    const printWindow = window.open('', '', 'width=600,height=600');
    let content = `
        <html>
        <head>
            <title>Bill - Pruthvi Restaurant</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                }
                .hotel-name {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .bill-info {
                    margin: 15px 0;
                    display: flex;
                    justify-content: space-between;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0;
                }
                th, td { 
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                .total { 
                    font-weight: bold; 
                    text-align: right;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="hotel-name">Pruthvi Restaurant</div>
                <div>Bill</div>
            </div>
            <div class="bill-info">
                <div>Table ${currentTable}</div>
                <div>${new Date().toLocaleString()}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${currentOrder.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price.toFixed(2)}</td>
                            <td>₹${item.total.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="total">Total Amount:</td>
                        <td class="total">₹${total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            <div class="footer">
                <p>Thank you for dining with us!</p>
                <p>Visit Again</p>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();

    // Clear the order after printing
    currentOrder = [];
    updateOrderDisplay();
    saveOrder();
}

// Save order to history
function saveToHistory(total) {
    const now = new Date();
    const historyEntry = {
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString(),
        tableNo: currentTable,
        items: currentOrder.map(item => `${item.quantity}x ${item.name}`),
        total: total,
        timestamp: now.getTime()
    };

    const history = JSON.parse(localStorage.getItem('tablesHistory')) || [];
    history.push(historyEntry);
    localStorage.setItem('tablesHistory', JSON.stringify(history));
}

// Save current order
function saveOrder() {
    const allOrders = JSON.parse(localStorage.getItem('tableOrders')) || {};
    allOrders[currentTable] = currentOrder;
    localStorage.setItem('tableOrders', JSON.stringify(allOrders));
}

// Load saved order
function loadOrder() {
    const allOrders = JSON.parse(localStorage.getItem('tableOrders')) || {};
    currentOrder = allOrders[currentTable] || [];
    updateOrderDisplay();
    updateOrderStatus();
}

// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target === orderModal) {
        closeModal();
    }
}; 