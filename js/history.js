// Get DOM elements
const historyTableBody = document.getElementById('historyTableBody');
const totalRevenueElement = document.getElementById('totalRevenue');
const totalTablesElement = document.getElementById('totalTables');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDatePickers();
    updateHistoryDisplay('all');
    updateTotalStats();
});

// Initialize date pickers
function initializeDatePickers() {
    // Initialize start date picker
    flatpickr(startDateInput, {
        defaultDate: new Date().setDate(new Date().getDate() - 30),
        dateFormat: 'Y-m-d',
        onChange: function(selectedDates) {
            endDatePicker.set('minDate', selectedDates[0]);
            updateHistoryDisplay('custom');
        }
    });

    // Initialize end date picker
    const endDatePicker = flatpickr(endDateInput, {
        defaultDate: 'today',
        dateFormat: 'Y-m-d',
        onChange: function() {
            updateHistoryDisplay('custom');
        }
    });
}

// Update history display based on filter
function updateHistoryDisplay(filter) {
    const history = JSON.parse(localStorage.getItem('tablesHistory')) || [];
    const now = new Date();
    
    // Apply filter
    const filteredHistory = history.filter(entry => {
        const entryDate = new Date(entry.date);
        switch(filter) {
            case 'today':
                return entry.date === now.toISOString().split('T')[0];
            case 'week':
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                return new Date(entry.date) >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                return new Date(entry.date) >= monthAgo;
            case 'custom':
                const startDate = new Date(startDateInput.value);
                const endDate = new Date(endDateInput.value);
                return new Date(entry.date) >= startDate && new Date(entry.date) <= endDate;
            default:
                return true;
        }
    });

    // Sort by most recent first
    filteredHistory.sort((a, b) => b.timestamp - a.timestamp);

    // Update table
    historyTableBody.innerHTML = filteredHistory.map(entry => `
        <tr>
            <td>${entry.date}</td>
            <td>${entry.time}</td>
            <td>Table ${entry.tableNo}</td>
            <td><div class="items-list" title="${entry.items.join(', ')}">${entry.items.join(', ')}</div></td>
            <td>₹${entry.total.toFixed(2)}</td>
            <td>
                <button class="btn-primary" onclick="viewBillDetails(${entry.timestamp})">
                    <span class="material-icons">receipt</span>
                </button>
            </td>
        </tr>
    `).join('');

    // Update filtered stats
    updateFilteredStats(filteredHistory);
}

// Update total statistics
function updateTotalStats() {
    const history = JSON.parse(localStorage.getItem('tablesHistory')) || [];
    const totalRevenue = history.reduce((sum, entry) => sum + entry.total, 0);
    const totalTables = history.length;

    totalRevenueElement.textContent = `₹${totalRevenue.toFixed(2)}`;
    totalTablesElement.textContent = totalTables;
}

// Update filtered statistics
function updateFilteredStats(filteredHistory) {
    const filteredRevenue = filteredHistory.reduce((sum, entry) => sum + entry.total, 0);
    const filteredTables = filteredHistory.length;

    totalRevenueElement.textContent = `₹${filteredRevenue.toFixed(2)}`;
    totalTablesElement.textContent = filteredTables;
}

// Filter history
function filterHistory(period) {
    // Update active button
    document.querySelectorAll('.history-filters button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(period)) {
            btn.classList.add('active');
        }
    });
    
    updateHistoryDisplay(period);
}

// View bill details
function viewBillDetails(timestamp) {
    const history = JSON.parse(localStorage.getItem('tablesHistory')) || [];
    const entry = history.find(e => e.timestamp === timestamp);
    
    if (!entry) return;

    const printWindow = window.open('', '', 'width=600,height=600');
    let content = `
        <html>
        <head>
            <title>Bill Details - Pruthvi Chinese Center</title>
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
                <div class="hotel-name">Pruthvi Chinese Center</div>
                <div>Bill Details</div>
            </div>
            <div class="bill-info">
                <div>Table ${entry.tableNo}</div>
                <div>${entry.date} ${entry.time}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${entry.items.map(item => {
                        const [qty, ...nameParts] = item.split('x ');
                        return `
                            <tr>
                                <td>${nameParts.join('x ')}</td>
                                <td>${qty}</td>
                                <td>₹${entry.total.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" class="total">Total Amount:</td>
                        <td class="total">₹${entry.total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            <div class="footer">
                <p>Thank you for dining with us!</p>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
} 