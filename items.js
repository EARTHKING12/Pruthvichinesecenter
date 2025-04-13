// Store for menu items
let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];

// DOM Elements
const itemsTableBody = document.getElementById('itemsTableBody');
const itemModal = document.getElementById('itemModal');
const itemForm = document.getElementById('itemForm');
let editingItemId = null;

// Load items when page loads
document.addEventListener('DOMContentLoaded', loadItems);

// Load items into table
function loadItems() {
    itemsTableBody.innerHTML = '';
    menuItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>₹${item.price}</td>
            <td>
                <button class="btn-secondary" onclick="editItem(${index})">
                    <span class="material-icons">edit</span>
                </button>
                <button class="btn-danger" onclick="deleteItem(${index})">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        `;
        itemsTableBody.appendChild(row);
    });
}

// Show add item modal
function showAddItemModal() {
    editingItemId = null;
    itemForm.reset();
    document.getElementById('modalTitle').textContent = 'Add New Item';
    itemModal.style.display = 'block';
}

// Show edit item modal
function editItem(index) {
    editingItemId = index;
    const item = menuItems[index];
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('modalTitle').textContent = 'Edit Item';
    itemModal.style.display = 'block';
}

// Delete item
function deleteItem(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        menuItems.splice(index, 1);
        saveItems();
        loadItems();
    }
}

// Close modal
function closeModal() {
    itemModal.style.display = 'none';
}

// Handle form submission
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('itemPrice').value);

    if (editingItemId !== null) {
        menuItems[editingItemId] = { name, price };
    } else {
        menuItems.push({ name, price });
    }

    saveItems();
    loadItems();
    closeModal();
});

// Save items to localStorage
function saveItems() {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
}

// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target === itemModal) {
        closeModal();
    }
}; 