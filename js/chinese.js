// Get DOM elements
const itemSelect = document.getElementById('itemSelect');
const quantityInput = document.getElementById('quantity');
const billItems = document.getElementById('billItems');
const subTotalElement = document.getElementById('subTotal');

// Current bill items
let currentBill = [];

// Load items when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
    loadBill();
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

// Add item to order
function addToOrder() {
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
    
    currentBill.push({
        name: selectedItem.name,
        price: selectedItem.price,
        quantity: quantity,
        total: selectedItem.price * quantity
    });

    updateBillDisplay();
    saveBill();

    // Reset inputs
    itemSelect.value = '';
    quantityInput.value = '1';
}

// Update bill display
function updateBillDisplay() {
    billItems.innerHTML = '';
    let subTotal = 0;

    currentBill.forEach((item, index) => {
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
        billItems.appendChild(row);
        subTotal += item.total;
    });

    subTotalElement.textContent = `₹${subTotal.toFixed(2)}`;
}

// Remove item from bill
function removeItem(index) {
    currentBill.splice(index, 1);
    updateBillDisplay();
    saveBill();
}

// Clear entire bill
function clearBill() {
    if (currentBill.length === 0) return;
    
    if (confirm('Are you sure you want to clear the entire bill?')) {
        currentBill = [];
        updateBillDisplay();
        saveBill();
    }
}

// Print bill
function printBill() {
    if (currentBill.length === 0) {
        alert('No items in bill');
        return;
    }

    const printWindow = window.open('', '', 'width=600,height=600');
    let content = `
        <html>
        <head>
            <title>Bill - Pruthviraj Hotel</title>
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
                    padding: 12px 10px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .total-section {
                    margin-top: 20px;
                    border-top: 2px solid #333;
                    padding-top: 10px;
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
                .date-time {
                    font-size: 14px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="hotel-name">Pruthviraj Hotel</div>
                <div>Chinese Section Bill</div>
            </div>
            <div class="bill-info">
                <div>Chinese Section</div>
                <div class="date-time">${new Date().toLocaleString()}</div>
            </div>
            <table class="bill-table">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Item Name</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    `;

    let subTotal = 0;
    currentBill.forEach((item, index) => {
        content += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${item.total.toFixed(2)}</td>
            </tr>
        `;
        subTotal += item.total;
    });

    content += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" class="text-right"><strong>Total Amount:</strong></td>
                        <td><strong>₹${subTotal.toFixed(2)}</strong></td>
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
}

// Save bill to localStorage
function saveBill() {
    localStorage.setItem('currentBill', JSON.stringify(currentBill));
}

// Load bill from localStorage
function loadBill() {
    currentBill = JSON.parse(localStorage.getItem('currentBill')) || [];
    updateBillDisplay();
} 