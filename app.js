// Product Management Application
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Sample product data for testing
    let products = JSON.parse(localStorage.getItem('products')) || [
        { 
            id: 1, 
            code: 'PRD001', 
            name: 'Laptop', 
            description: 'High performance laptop with 16GB RAM', 
            price: encrypt('999.99'), 
            lastEdited: null 
        },
        { 
            id: 2, 
            code: 'PRD002', 
            name: 'Smartphone', 
            description: 'Latest smartphone with 5G support', 
            price: encrypt('699.99'), 
            lastEdited: null 
        }
    ];
    
    // DOM Elements
    const productsContainer = document.getElementById('productsContainer');
    const productFormContainer = document.getElementById('productFormContainer');
    const productForm = document.getElementById('productForm');
    const addProductBtn = document.getElementById('addProductBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const lastEditedInfo = document.getElementById('lastEditedInfo');
    
    // Current state
    let currentProductId = null;
    let autoSaveTimer = null;
    
    // Initialize the app
    renderProductList();
    
    // Event Listeners
    addProductBtn.addEventListener('click', showAddProductForm);
    cancelBtn.addEventListener('click', hideProductForm);
    deleteBtn.addEventListener('click', deleteProduct);
    productForm.addEventListener('submit', saveProduct);
    
    // Real-time saving for description and name
    document.getElementById('description').addEventListener('input', () => {
        debounceAutoSave('description');
    });
    
    document.getElementById('productName').addEventListener('input', () => {
        debounceAutoSave('productName');
    });
    
    // Check for unsaved changes on page load
    checkForUnsavedChanges();
    
    // Functions
    function renderProductList() {
        productsContainer.innerHTML = '';
        
        if (products.length === 0) {
            productsContainer.innerHTML = '<p>No products found. Add your first product!</p>';
            return;
        }
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <h3>${product.name} (${product.code})</h3>
                <p>${product.description.substring(0, 50)}...</p>
                <p>Price: $${decrypt(product.price)}</p>
                ${product.lastEdited ? `<p class="timestamp">Last edited: ${formatTimestamp(product.lastEdited)}</p>` : ''}
            `;
            
            productCard.addEventListener('click', () => showEditProductForm(product.id));
            productsContainer.appendChild(productCard);
        });
    }
    
    function showAddProductForm() {
        currentProductId = null;
        document.getElementById('formTitle').textContent = 'Add New Product';
        document.getElementById('productId').value = '';
        document.getElementById('productCode').value = '';
        document.getElementById('productName').value = '';
        document.getElementById('description').value = '';
        document.getElementById('price').value = '';
        lastEditedInfo.textContent = 'No edit history';
        deleteBtn.style.display = 'none';
        
        // Check for unsaved changes in sessionStorage
        const unsavedChanges = sessionStorage.getItem('unsavedProduct');
        if (unsavedChanges) {
            const product = JSON.parse(unsavedChanges);
            if (confirm('You have unsaved changes. Would you like to restore them?')) {
                document.getElementById('productCode').value = product.code || '';
                document.getElementById('productName').value = product.name || '';
                document.getElementById('description').value = product.description || '';
                document.getElementById('price').value = product.price ? decrypt(product.price) : '';
            } else {
                sessionStorage.removeItem('unsavedProduct');
            }
        }
        
        productFormContainer.style.display = 'block';
        window.scrollTo(0, document.body.scrollHeight);
    }
    
    function showEditProductForm(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        currentProductId = productId;
        document.getElementById('formTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productCode').value = product.code;
        document.getElementById('productName').value = product.name;
        document.getElementById('description').value = product.description;
        document.getElementById('price').value = decrypt(product.price);
        deleteBtn.style.display = 'inline-block';
        
        if (product.lastEdited) {
            lastEditedInfo.innerHTML = `
                <strong>Date:</strong> ${formatTimestamp(product.lastEdited.date)}<br>
                <strong>By:</strong> ${product.lastEdited.staffId} (${product.lastEdited.staffName})<br>
                <strong>Field:</strong> ${product.lastEdited.field || 'Unknown'}
            `;
        } else {
            lastEditedInfo.textContent = 'No edit history';
        }
        
        productFormContainer.style.display = 'block';
        window.scrollTo(0, document.body.scrollHeight);
    }
    
    function hideProductForm() {
        productFormContainer.style.display = 'none';
        currentProductId = null;
        sessionStorage.removeItem('unsavedProduct');
    }
    
    function saveProduct(e) {
        e.preventDefault();
        
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const productId = document.getElementById('productId').value;
        const productCode = document.getElementById('productCode').value;
        const productName = document.getElementById('productName').value;
        const description = document.getElementById('description').value;
        const price = encrypt(document.getElementById('price').value);
        
        const editedField = document.activeElement ? document.activeElement.id : 'multiple';
        
        const timestamp = {
            date: new Date().toISOString(),
            staffId: currentUser.id,
            staffName: currentUser.name,
            field: editedField
        };
        
        if (productId) {
            // Update existing product
            const index = products.findIndex(p => p.id === parseInt(productId));
            if (index !== -1) {
                products[index] = {
                    ...products[index],
                    code: productCode,
                    name: productName,
                    description: description,
                    price: price,
                    lastEdited: timestamp
                };
            }
        } else {
            // Add new product
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({
                id: newId,
                code: productCode,
                name: productName,
                description: description,
                price: price,
                lastEdited: timestamp
            });
        }
        
        // Save to localStorage
        localStorage.setItem('products', JSON.stringify(products));
        
        // Clear any unsaved changes
        sessionStorage.removeItem('unsavedProduct');
        
        // Update UI
        renderProductList();
        hideProductForm();
    }
    
    function deleteProduct() {
        if (!currentProductId || !confirm('Are you sure you want to delete this product?')) return;
        
        products = products.filter(p => p.id !== currentProductId);
        localStorage.setItem('products', JSON.stringify(products));
        
        // Clear any unsaved changes
        sessionStorage.removeItem('unsavedProduct');
        
        renderProductList();
        hideProductForm();
    }
    
    function debounceAutoSave(fieldName) {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }
        
        autoSaveTimer = setTimeout(() => {
            autoSaveChanges(fieldName);
        }, 1000);
    }
    
    function autoSaveChanges(fieldName) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        
        const productData = {
            id: document.getElementById('productId').value || null,
            code: document.getElementById('productCode').value,
            name: document.getElementById('productName').value,
            description: document.getElementById('description').value,
            price: encrypt(document.getElementById('price').value || '0'),
            lastEdited: {
                date: new Date().toISOString(),
                staffId: currentUser.id,
                staffName: currentUser.name,
                field: fieldName
            }
        };
        
        // Save to sessionStorage
        sessionStorage.setItem('unsavedProduct', JSON.stringify(productData));
        
        console.log('Auto-saved changes to', fieldName);
    }
    
    function checkForUnsavedChanges() {
        const unsavedProduct = sessionStorage.getItem('unsavedProduct');
        if (unsavedProduct) {
            const product = JSON.parse(unsavedProduct);
            if (confirm(`You have unsaved changes for ${product.name || 'a new product'}. Would you like to continue editing?`)) {
                if (product.id) {
                    showEditProductForm(parseInt(product.id));
                } else {
                    showAddProductForm();
                }
            }
        }
    }
    
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
});