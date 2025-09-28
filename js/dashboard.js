// js/dashboard.js - Enhanced dashboard functionality

class Dashboard {
    constructor() {
        this.user = null;
        this.categories = JSON.parse(localStorage.getItem('lababil-categories')) || ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
        this.products = [
            { id: 1, name: 'Laptop Asus X441', price: 7500000, costPrice: 6500000, stock: 15, category: 'Electronics', minStock: 5, supplier: 'PT. Tech Supplier' },
            { id: 2, name: 'Mouse Wireless Logitech', price: 350000, costPrice: 250000, stock: 45, category: 'Electronics', minStock: 10, supplier: 'Gadget Store' },
            { id: 3, name: 'Keyboard Mechanical', price: 1200000, costPrice: 900000, stock: 25, category: 'Electronics', minStock: 8, supplier: 'PT. Tech Supplier' },
            { id: 4, name: 'Monitor 24 inch', price: 2500000, costPrice: 2000000, stock: 8, category: 'Electronics', minStock: 3, supplier: 'Gadget Store' },
            { id: 5, name: 'Headphone Sony', price: 850000, costPrice: 600000, stock: 20, category: 'Electronics', minStock: 5, supplier: 'PT. Tech Supplier' }
        ];
        this.sales = [
            { id: 1, date: '2024-09-28', customer: 'John Doe', phone: '08123456789', items: [{name: 'Laptop Asus X441', qty: 1, price: 7500000}], total: 7500000, status: 'completed' },
            { id: 2, date: '2024-09-27', customer: 'Jane Smith', phone: '08987654321', items: [{name: 'Mouse Wireless Logitech', qty: 2, price: 350000}], total: 700000, status: 'completed' },
            { id: 3, date: '2024-09-27', customer: 'Bob Wilson', phone: '08555666777', items: [{name: 'Monitor 24 inch', qty: 1, price: 2500000}], total: 2500000, status: 'completed' }
        ];
        this.purchases = [
            { id: 1, date: '2024-09-28', supplier: 'PT. Tech Supplier', phone: '08123456789', items: [{name: 'Laptop Asus X441', qty: 5, costPrice: 6500000}], totalItems: 5, totalCost: 32500000, status: 'completed' },
            { id: 2, date: '2024-09-27', supplier: 'Gadget Store', phone: '08987654321', items: [{name: 'Mouse Wireless Logitech', qty: 10, costPrice: 250000}], totalItems: 10, totalCost: 2500000, status: 'completed' }
        ];
        this.customers = [
            { id: 1, name: 'John Doe', phone: '08123456789', email: 'john@example.com', address: 'Jakarta', totalPurchases: 7500000, lastPurchase: '2024-09-28' },
            { id: 2, name: 'Jane Smith', phone: '08987654321', email: 'jane@example.com', address: 'Bandung', totalPurchases: 700000, lastPurchase: '2024-09-27' },
            { id: 3, name: 'Bob Wilson', phone: '08555666777', email: 'bob@example.com', address: 'Surabaya', totalPurchases: 2500000, lastPurchase: '2024-09-27' }
        ];
        this.settings = {
            companyName: 'Lababil Solution',
            taxRate: 11,
            darkMode: false,
            lowStockThreshold: 10,
            currency: 'IDR'
        };
        this.notifications = [];
        this.isLoading = false;
    }

    init() {
        this.loadUserData();
        this.loadCategories();
        this.applyRoleBasedAccess(); // Apply role restrictions first
        this.loadProducts();
        this.loadRecentSales();
        this.loadRecentPurchases();
        this.loadReports(); // Phase 2: Load enhanced reports
        this.setupRealTimeSync(); // Phase 2: Real-time sync
        this.setupEventListeners();
        this.checkLowStock(); // Phase 2: Check for low stock on init
    }

    loadCategories() {
        const categorySelect = document.getElementById('productCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '';
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
    }

    addCategory() {
        const newCategoryName = prompt('Enter new category name:');
        if (!newCategoryName || newCategoryName.trim() === '') {
            this.showNotification('Category name cannot be empty', 'error');
            return;
        }
        const trimmedName = newCategoryName.trim();
        if (this.categories.includes(trimmedName)) {
            this.showNotification('Category already exists', 'error');
            return;
        }
        this.categories.push(trimmedName);
        localStorage.setItem('lababil-categories', JSON.stringify(this.categories));
        this.loadCategories();
        this.showNotification('Category added successfully!', 'success');
    }

    loadUserData() {
        this.user = window.auth.getUser();
        if (!this.user) {
            window.location.href = '/';
            return;
        }
        this.updateUserInfo();
    }

    updateUserInfo() {
        const welcomeEl = document.getElementById('userWelcome');
        if (welcomeEl) {
            welcomeEl.textContent = `Welcome, ${this.user.name || this.user.username}`;
        }

        const elements = {
            sessionUsername: this.user.username,
            sessionRole: this.user.role,
            loginTime: this.getLoginTime()
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    getLoginTime() {
        try {
            const token = window.auth.getToken();
            const tokenData = JSON.parse(atob(token));
            return new Date(tokenData.loginTime).toLocaleString();
        } catch (e) {
            return new Date().toLocaleString();
        }
    }

    setupEventListeners() {
        // Add Product Form
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => this.handleAddProduct(e));
        }

        // Sale Form
        const saleForm = document.getElementById('saleForm');
        if (saleForm) {
            saleForm.addEventListener('submit', (e) => this.handleNewSale(e));
        }

        // Purchase Form
        const purchaseForm = document.getElementById('purchaseForm');
        if (purchaseForm) {
            purchaseForm.addEventListener('submit', (e) => this.handleNewPurchase(e));
        }

        // Add category button
        const addCategoryBtn = document.querySelector('#addProductForm button[onclick="addCategory()"]');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.addCategory());
        }

        // Remove item listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const saleItem = e.target.closest('.sale-item');
                if (saleItem) {
                    this.removeSaleItem(e.target);
                } else {
                    const purchaseItem = e.target.closest('.purchase-item');
                    if (purchaseItem) {
                        this.removePurchaseItem(e.target);
                    }
                }
            }
        });

        // Product select change listeners
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('product-select')) {
                const saleItem = e.target.closest('.sale-item');
                if (saleItem) {
                    this.updateProductPrice(e.target);
                }
                // For purchases, no price update needed, but update total
                this.updateTotals();
            }
            if (e.target.classList.contains('quantity-input') || e.target.classList.contains('price-input') || e.target.classList.contains('cost-price-input')) {
                this.updateTotals();
            }
        });

        // Quantity input listeners
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('quantity-input') || e.target.classList.contains('cost-price-input')) {
                this.updateTotals();
            }
        });
    }

    loadProducts() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium text-gray-900">${product.name}</div>
                    <div class="text-sm text-gray-500">ID: ${product.id}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatCurrency(product.price)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                        ${product.stock} units
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.category}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editProduct(${product.id})" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update product selects in sale form
        this.updateProductSelects();
    }

    updateProductSelects() {
        const selects = document.querySelectorAll('.product-select');
        selects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select Product</option>';
            
            this.products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} - ${this.formatCurrency(product.price)}`;
                option.dataset.price = product.price;
                select.appendChild(option);
            });
            
            select.value = currentValue;
        });
    }

    loadRecentSales() {
        const tbody = document.getElementById('recentSalesBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.sales.slice(-10).reverse().forEach(sale => {
            const row = document.createElement('tr');
            const itemsText = sale.items.map(item => `${item.name} (${item.qty})`).join(', ');
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.date}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium text-gray-900">${sale.customer}</div>
                    <div class="text-sm text-gray-500">${sale.phone}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">${itemsText}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${this.formatCurrency(sale.total)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="printReceipt(${sale.id})" class="text-blue-600 hover:text-blue-900">Print</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    handleAddProduct(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const name = document.getElementById('productName').value.trim();
        const price = parseInt(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const category = document.getElementById('productCategory').value;

        const validationError = this.validateProductData(name, price, stock, category);
        if (validationError) {
            this.showNotification(validationError, 'error');
            return;
        }

        const newProduct = {
            id: this.products.length + 1,
            name: name,
            price: price,
            costPrice: 0,
            stock: stock,
            category: category,
            minStock: 5,
            supplier: ''
        };

        this.products.push(newProduct);
        this.loadProducts();
        this.hideAddProductModal();
        form.reset();
        
        this.showNotification('Product added successfully!', 'success');
        this.saveDataToStorage();
    }

    handleNewSale(e) {
        e.preventDefault();
        
        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;
        
        if (!customerName.trim()) {
            this.showNotification('Please enter customer name', 'error');
            return;
        }

        const saleItems = this.collectSaleItems();
        
        if (saleItems.length === 0) {
            this.showNotification('Please add at least one item', 'error');
            return;
        }

        const total = saleItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
        
        const newSale = {
            id: this.sales.length + 1,
            date: new Date().toISOString().split('T')[0],
            customer: customerName,
            phone: customerPhone,
            items: saleItems,
            total: total
        };

        // Update stock
        saleItems.forEach(saleItem => {
            const product = this.products.find(p => p.id === saleItem.productId);
            if (product) {
                product.stock -= saleItem.qty;
            }
        });

        this.sales.push(newSale);
        this.loadProducts();
        this.loadRecentSales();
        
        // Reset form
        document.getElementById('saleForm').reset();
        this.resetSaleItems();
        
        this.showNotification('Sale processed successfully!', 'success');
        
        // Ask if user wants to print receipt
        if (confirm('Sale completed! Do you want to print the receipt?')) {
            this.printReceipt(newSale.id);
        }
    }

    collectSaleItems() {
        const items = [];
        const saleItemDivs = document.querySelectorAll('.sale-item');
        
        saleItemDivs.forEach(div => {
            const select = div.querySelector('.product-select');
            const qtyInput = div.querySelector('.quantity-input');
            const priceInput = div.querySelector('.price-input');
            
            if (select.value && qtyInput.value && priceInput.value) {
                const product = this.products.find(p => p.id === parseInt(select.value));
                items.push({
                    productId: parseInt(select.value),
                    name: product.name,
                    qty: parseInt(qtyInput.value),
                    price: parseInt(priceInput.value)
                });
            }
        });
        
        return items;
    }

    updateProductPrice(select) {
        const saleItem = select.closest('.sale-item');
        const priceInput = saleItem.querySelector('.price-input');
        
        if (select.value) {
            const product = this.products.find(p => p.id === parseInt(select.value));
            if (product) {
                priceInput.value = product.price;
                priceInput.removeAttribute('readonly'); // Allow editing
            }
        } else {
            priceInput.value = '';
            priceInput.setAttribute('readonly', true);
        }
        
        this.updateSaleTotal();
    }

    updateSaleTotal() {
        const saleItems = this.collectSaleItems();
        const total = saleItems.reduce((sum, item) => sum + (item.qty * item.price), 0);

        const totalElement = document.getElementById('saleTotal');
        if (totalElement) {
            totalElement.textContent = this.formatNumber(total);
        }
    }

    updateTotals() {
        this.updateSaleTotal();
        this.updatePurchaseTotal();
    }

    addSaleItem() {
        const saleItemsContainer = document.getElementById('saleItems');
        if (!saleItemsContainer) return;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'sale-item bg-gray-50 p-4 rounded-md';
        itemDiv.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select class="product-select border-gray-300 rounded-md">
                    <option value="">Select Product</option>
                </select>
                <input type="number" placeholder="Quantity" class="quantity-input border-gray-300 rounded-md" min="1" value="1">
                <input type="number" placeholder="Price (Rp)" class="price-input border-gray-300 rounded-md" min="0">
                <button type="button" class="remove-item bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600">Remove</button>
            </div>
        `;
        
        saleItemsContainer.appendChild(itemDiv);
        this.updateProductSelects();
    }

    removeSaleItem(button) {
        const saleItem = button.closest('.sale-item');
        saleItem.remove();
        this.updateTotals();
    }

    resetSaleItems() {
        const container = document.getElementById('saleItems');
        if (!container) return;

        container.innerHTML = `
            <div class="sale-item bg-gray-50 p-4 rounded-md">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select class="product-select border-gray-300 rounded-md">
                        <option value="">Select Product</option>
                    </select>
                    <input type="number" placeholder="Quantity" class="quantity-input border-gray-300 rounded-md" min="1" value="1">
                    <input type="number" placeholder="Price (Rp)" class="price-input border-gray-300 rounded-md" min="0">
                    <button type="button" class="remove-item bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600">Remove</button>
                </div>
            </div>
        `;
        this.updateProductSelects();
        this.updateSaleTotal();
    }

    loadRecentPurchases() {
        const tbody = document.getElementById('recentPurchasesBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.purchases.slice(-10).reverse().forEach(purchase => {
            const row = document.createElement('tr');
            const itemsText = purchase.items.map(item => `${item.name} (${item.qty})`).join(', ');

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${purchase.date}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium text-gray-900">${purchase.supplier}</div>
                    <div class="text-sm text-gray-500">${purchase.phone}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">${itemsText}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${purchase.totalItems}
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    handleNewPurchase(e) {
        e.preventDefault();

        const supplierName = document.getElementById('supplierName').value.trim();
        const supplierPhone = document.getElementById('supplierPhone').value;

        if (!supplierName) {
            this.showNotification('Please enter supplier name', 'error');
            return;
        }

        const purchaseItems = this.collectPurchaseItems();

        if (purchaseItems.length === 0) {
            this.showNotification('Please add at least one item', 'error');
            return;
        }

        const totalItems = purchaseItems.reduce((sum, item) => sum + item.qty, 0);
        const totalCost = purchaseItems.reduce((sum, item) => sum + (item.qty * item.costPrice), 0);

        const newPurchase = {
            id: this.purchases.length + 1,
            date: new Date().toISOString().split('T')[0],
            supplier: supplierName,
            phone: supplierPhone,
            items: purchaseItems,
            totalItems: totalItems,
            totalCost: totalCost
        };

        // Update stock and costPrice
        purchaseItems.forEach(purchaseItem => {
            const product = this.products.find(p => p.id === purchaseItem.productId);
            if (product) {
                product.stock += purchaseItem.qty;
                if (purchaseItem.costPrice > (product.costPrice || 0)) {
                    product.costPrice = purchaseItem.costPrice;
                }
            }
        });

        this.purchases.push(newPurchase);
        this.loadProducts();
        this.loadRecentPurchases();
        this.loadReports();

        // Reset form
        document.getElementById('purchaseForm').reset();
        this.resetPurchaseItems();

        this.showNotification('Purchase processed successfully!', 'success');
        this.saveDataToStorage();
    }

    collectPurchaseItems() {
        const items = [];
        const purchaseItemDivs = document.querySelectorAll('.purchase-item');

        purchaseItemDivs.forEach(div => {
            const select = div.querySelector('.product-select');
            const qtyInput = div.querySelector('.quantity-input');
            const costInput = div.querySelector('.cost-price-input');

            if (select.value && qtyInput.value) {
                const product = this.products.find(p => p.id === parseInt(select.value));
                items.push({
                    productId: parseInt(select.value),
                    name: product.name,
                    qty: parseInt(qtyInput.value),
                    costPrice: parseInt(costInput.value) || 0
                });
            }
        });

        return items;
    }

    updatePurchaseTotal() {
        const purchaseItems = this.collectPurchaseItems();
        const totalCost = purchaseItems.reduce((sum, item) => sum + (item.qty * item.costPrice), 0);

        const totalElement = document.getElementById('purchaseTotal');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(totalCost);
        }
    }

    addPurchaseItem() {
        const purchaseItemsContainer = document.getElementById('purchaseItems');
        if (!purchaseItemsContainer) return;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'purchase-item bg-gray-50 p-4 rounded-md';
        itemDiv.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select class="product-select border-gray-300 rounded-md">
                    <option value="">Select Product</option>
                </select>
                <input type="number" placeholder="Quantity" class="quantity-input border-gray-300 rounded-md" min="1" value="1">
                <input type="number" placeholder="Cost Price (Rp)" class="cost-price-input border-gray-300 rounded-md" min="0" value="0">
                <button type="button" class="remove-item bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600">Remove</button>
            </div>
        `;

        purchaseItemsContainer.appendChild(itemDiv);
        this.updateProductSelects();
    }

    removePurchaseItem(button) {
        const purchaseItem = button.closest('.purchase-item');
        purchaseItem.remove();
        this.updateTotals();
    }

    resetPurchaseItems() {
        const container = document.getElementById('purchaseItems');
        if (!container) return;

        container.innerHTML = `
            <div class="purchase-item bg-gray-50 p-4 rounded-md">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select class="product-select border-gray-300 rounded-md">
                        <option value="">Select Product</option>
                    </select>
                    <input type="number" placeholder="Quantity" class="quantity-input border-gray-300 rounded-md" min="1" value="1">
                    <input type="number" placeholder="Cost Price (Rp)" class="cost-price-input border-gray-300 rounded-md" min="0" value="0">
                    <button type="button" class="remove-item bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600">Remove</button>
                </div>
            </div>
        `;
        this.updateProductSelects();
        this.updatePurchaseTotal();
    }

    printReceipt(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (!sale) return;

        const receiptWindow = window.open('', '_blank');
        const receiptContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${sale.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                    .item { display: flex; justify-content: space-between; margin: 5px 0; }
                    .total { border-top: 1px solid #000; padding-top: 10px; margin-top: 15px; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${this.settings.companyName}</h2>
                    <p>Sales Receipt</p>
                    <p>Date: ${sale.date}</p>
                    <p>Receipt #: ${sale.id}</p>
                </div>
                
                <div class="customer">
                    <p><strong>Customer:</strong> ${sale.customer}</p>
                    <p><strong>Phone:</strong> ${sale.phone}</p>
                </div>
                
                <div class="items">
                    <h3>Items:</h3>
                    ${sale.items.map(item => `
                        <div class="item">
                            <span>${item.name} x${item.qty}</span>
                            <span>${this.formatCurrency(item.qty * item.price)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="total">
                    <div class="item">
                        <span>Subtotal:</span>
                        <span>${this.formatCurrency(sale.total)}</span>
                    </div>
                    <div class="item">
                        <span>Tax (${this.settings.taxRate}%):</span>
                        <span>${this.formatCurrency(sale.total * this.settings.taxRate / 100)}</span>
                    </div>
                    <div class="item">
                        <span><strong>Total:</strong></span>
                        <span><strong>${this.formatCurrency(sale.total + (sale.total * this.settings.taxRate / 100))}</strong></span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Powered by Lababil Sales System v2.0</p>
                </div>
            </body>
            </html>
        `;
        
        receiptWindow.document.write(receiptContent);
        receiptWindow.document.close();
        receiptWindow.print();
    }

    // Phase 2: Enhanced inventory management with low stock alerts
    checkLowStock() {
        this.products.forEach(product => {
            if (product.stock <= product.minStock) {
                this.showNotification(`Low stock alert: ${product.name} (Stock: ${product.stock})`, 'warning');
            }
        });
    }

    // Phase 2: Enhanced reporting with analytics and simple chart
    loadReports() {
        // Calculate analytics
        const totalRevenue = this.sales.reduce((sum, sale) => sum + sale.total, 0);
        const monthlyRevenue = this.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            const now = new Date();
            return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        }).reduce((sum, sale) => sum + sale.total, 0);
        const topProduct = this.getTopProduct();

        // Calculate total COGS
        let totalCOGS = 0;
        this.sales.forEach(sale => {
            sale.items.forEach(item => {
                const product = this.products.find(p => p.name === item.name);
                if (product && product.costPrice) {
                    totalCOGS += item.qty * product.costPrice;
                }
            });
        });
        const profit = totalRevenue - totalCOGS;

        // Update report cards
        document.querySelector('#section-reports [text-3xl.font-bold.text-blue-600]').textContent = this.formatCurrency(monthlyRevenue);
        document.querySelector('#section-reports [text-3xl.font-bold.text-green-600]').textContent = this.formatCurrency(totalRevenue);
        if (topProduct) {
            document.querySelector('#section-reports [text-lg.font-bold.text-purple-600]').textContent = topProduct.name;
        }
        const profitElement = document.querySelector('.profit-value');
        if (profitElement) {
            profitElement.textContent = this.formatCurrency(profit);
        }

        // Simple canvas chart for sales trend (last 7 days)
        this.renderSalesChart();
    }

    getTopProduct() {
        const productSales = {};
        this.sales.forEach(sale => {
            sale.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.qty;
            });
        });
        return Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b, null);
    }

    renderSalesChart() {
        const canvas = document.getElementById('salesChart');
        if (!canvas) {
            // Create canvas if not exists
            const reportsSection = document.getElementById('section-reports');
            const chartDiv = document.createElement('div');
            chartDiv.innerHTML = '<canvas id="salesChart" width="400" height="200"></canvas>';
            reportsSection.insertAdjacentElement('afterbegin', chartDiv.firstElementChild);
            canvas = document.getElementById('salesChart');
        }

        const ctx = canvas.getContext('2d');
        // Simple bar chart data (mock last 7 days sales)
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const salesData = [1200000, 2500000, 1800000, 3000000, 2200000, 1500000, 2800000];
        const maxSales = Math.max(...salesData);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw bars
        salesData.forEach((sales, index) => {
            const barWidth = 40;
            const barHeight = (sales / maxSales) * 150;
            const x = index * 50 + 20;
            const y = canvas.height - barHeight - 20;

            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x, y, barWidth, barHeight);
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(days[index], x, canvas.height - 5);
            ctx.fillText(this.formatCurrency(sales), x, y - 5);
        });

        // Responsive: Scale canvas on resize
        window.addEventListener('resize', () => {
            canvas.width = Math.min(400, window.innerWidth - 100);
            this.renderSalesChart();
        });
    }

    // Phase 2: Real-time updates via localStorage events
    setupRealTimeSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'lababil-data') {
                try {
                    const data = JSON.parse(e.newValue);
                    this.products = data.products || this.products;
                    this.sales = data.sales || this.sales;
                    this.purchases = data.purchases || this.purchases;
                    this.categories = data.categories || this.categories;
                    this.loadCategories();
                    this.loadProducts();
                    this.loadRecentSales();
                    this.loadRecentPurchases();
                    this.loadReports();
                    this.showNotification('Data synced from another tab', 'info');
                } catch (error) {
                    console.error('Sync error:', error);
                }
            }
        });

        // Save data to localStorage on changes
        this.saveDataToStorage = () => {
            localStorage.setItem('lababil-data', JSON.stringify({
                products: this.products,
                sales: this.sales,
                purchases: this.purchases,
                customers: this.customers,
                categories: this.categories,
                settings: this.settings
            }));
        };
    }

    // Phase 3: Enhanced error handling and validation
    validateProductData(name, price, stock, category) {
        if (!name || name.trim().length < 2) return 'Product name must be at least 2 characters';
        if (price <= 0) return 'Price must be greater than 0';
        if (stock < 0) return 'Stock cannot be negative';
        if (!category) return 'Please select a category';
        return null;
    }

    validateSaleData(customerName, items) {
        if (!customerName || customerName.trim().length < 2) return 'Customer name must be at least 2 characters';
        if (items.length === 0) return 'Add at least one item';
        for (let item of items) {
            if (item.qty <= 0 || this.products.find(p => p.id === item.productId)?.stock < item.qty) {
                return 'Invalid quantity or insufficient stock';
            }
        }
        return null;
    }

    // Phase 3: Loading states
    showLoading(elementId) {
        this.isLoading = true;
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="flex justify-center items-center py-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';
        }
    }

    hideLoading(elementId) {
        this.isLoading = false;
        // Reload content after hiding loading
    }

    // Phase 3: Enhanced notifications with dismiss
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 max-w-sm ${
            type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
        }`;
        notification.innerHTML = `
            ${message}
            <button onclick="this.parentElement.remove()" class="ml-2 text-current opacity-70 hover:opacity-100">&times;</button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    // Export and Import methods (fix placement)
    exportData() {
        try {
            this.showNotification('Preparing data export...', 'info');
            const data = {
                products: this.products,
                sales: this.sales,
                purchases: this.purchases,
                customers: this.customers || [],
                settings: this.settings,
                exportDate: new Date().toISOString(),
                version: '2.0.0',
                exportedBy: this.user ? this.user.username : 'Unknown'
            };
            if (!Array.isArray(data.products) || !Array.isArray(data.sales)) {
                throw new Error('Invalid data structure');
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lababil-sales-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showNotification('Data exported successfully!', 'success');
            this.saveDataToStorage();
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Failed to export data: ' + error.message, 'error');
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            this.showLoading('section-settings');
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    if (!importedData || typeof importedData !== 'object') {
                        throw new Error('Invalid file format');
                    }
                    if (importedData.products && Array.isArray(importedData.products)) {
                        this.products = importedData.products;
                    }
                    if (importedData.sales && Array.isArray(importedData.sales)) {
                        this.sales = importedData.sales;
                    }
                    if (importedData.purchases && Array.isArray(importedData.purchases)) {
                        this.purchases = importedData.purchases;
                    }
                    if (importedData.customers && Array.isArray(importedData.customers)) {
                        this.customers = importedData.customers;
                    }
                    if (importedData.settings && typeof importedData.settings === 'object') {
                        this.settings = { ...this.settings, ...importedData.settings };
                    }
                    this.loadProducts();
                    this.loadRecentSales();
                    this.loadRecentPurchases();
                    this.loadReports();
                    this.hideLoading('section-settings');
                    this.showNotification('Data imported successfully!', 'success');
                    this.saveDataToStorage();
                } catch (error) {
                    console.error('Import error:', error);
                    this.showNotification('Failed to import data: ' + error.message, 'error');
                    this.hideLoading('section-settings');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('id-ID').format(number);
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            window.auth.logout();
        }
    }

    // Apply role-based access control
    applyRoleBasedAccess() {
        if (!this.user) return;

        const role = this.user.role;
        const navItems = {
            dashboard: document.getElementById('nav-dashboard'),
            products: document.getElementById('nav-products'),
            sales: document.getElementById('nav-sales'),
            purchases: document.getElementById('nav-purchases'),
            reports: document.getElementById('nav-reports'),
            settings: document.getElementById('nav-settings')
        };

        const sections = {
            dashboard: document.getElementById('section-dashboard'),
            products: document.getElementById('section-products'),
            sales: document.getElementById('section-sales'),
            purchases: document.getElementById('section-purchases'),
            reports: document.getElementById('section-reports'),
            settings: document.getElementById('section-settings')
        };

        // Hide all navigation items and sections first
        Object.values(navItems).forEach(item => {
            if (item) item.style.display = 'none';
        });

        Object.values(sections).forEach(section => {
            if (section) section.style.display = 'none';
        });

        // Show sections based on role
        if (role === 'kasir') {
            // Kasir can only access sales and dashboard
            if (navItems.sales) navItems.sales.style.display = 'block';
            if (navItems.dashboard) navItems.dashboard.style.display = 'block';
            if (sections.sales) sections.sales.style.display = 'block';
            if (sections.dashboard) sections.dashboard.style.display = 'block';
            // Auto-show sales section for kasir
            this.showSection('sales');
        } else if (role === 'admin1') {
            // Admin1 can only access purchases and dashboard
            if (navItems.purchases) navItems.purchases.style.display = 'block';
            if (navItems.dashboard) navItems.dashboard.style.display = 'block';
            if (sections.purchases) sections.purchases.style.display = 'block';
            if (sections.dashboard) sections.dashboard.style.display = 'block';
            // Auto-show purchases section for admin1
            this.showSection('purchases');
        } else if (role === 'admin') {
            // Admin can access everything
            Object.values(navItems).forEach(item => {
                if (item) item.style.display = 'block';
            });
            Object.values(sections).forEach(section => {
                if (section) section.style.display = 'block';
            });
            // Show dashboard by default
            this.showSection('dashboard');
        } else {
            // Default: show dashboard only
            if (navItems.dashboard) navItems.dashboard.style.display = 'block';
            if (sections.dashboard) sections.dashboard.style.display = 'block';
            this.showSection('dashboard');
        }
    }

    // Role-based showSection method
    showSection(sectionName) {
        if (!this.user) return;

        const role = this.user.role;
        const allowedSections = {
            kasir: ['dashboard', 'sales'],
            admin1: ['dashboard', 'purchases'],
            admin: ['dashboard', 'products', 'sales', 'purchases', 'reports', 'settings'],
            user: ['dashboard'],
            demo: ['dashboard']
        };

        // Check if user is allowed to access this section
        if (!allowedSections[role] || !allowedSections[role].includes(sectionName)) {
            this.showNotification('You do not have permission to access this section', 'error');
            return;
        }

        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`section-${sectionName}`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('bg-gray-100', 'text-gray-900');
            item.classList.add('text-gray-600', 'hover:bg-gray-50', 'hover:text-gray-900');
        });

        const activeNav = document.getElementById(`nav-${sectionName}`);
        if (activeNav) {
            activeNav.classList.add('bg-gray-100', 'text-gray-900');
            activeNav.classList.remove('text-gray-600', 'hover:bg-gray-50', 'hover:text-gray-900');
        }
    }
}

// Global functions for HTML onclick handlers
function showSection(sectionName) {
    if (window.dashboard && window.dashboard.user) {
        window.dashboard.showSection(sectionName);
    } else {
        // Fallback if dashboard not ready
        const targetSection = document.getElementById(`section-${sectionName}`);
        if (targetSection) {
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('active');
            });
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
        }
    }
}



function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function hideAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function addSaleItem() {
    if (window.dashboard) {
        window.dashboard.addSaleItem();
    }
}

function addPurchaseItem() {
    if (window.dashboard) {
        window.dashboard.addPurchaseItem();
    }
}

function editProduct(productId) {
    alert(`Edit product functionality for ID: ${productId} - Coming soon!`);
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        if (window.dashboard) {
            window.dashboard.products = window.dashboard.products.filter(p => p.id !== productId);
            window.dashboard.loadProducts();
            window.dashboard.showNotification('Product deleted successfully!', 'success');
        }
    }
}

function printReceipt(saleId) {
    if (window.dashboard) {
        window.dashboard.printReceipt(saleId);
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    
    // Update toggle button
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) {
        const span = toggle.querySelector('span');
        if (isDark) {
            toggle.classList.remove('bg-gray-200');
            toggle.classList.add('bg-blue-600');
            span.classList.remove('translate-x-0');
            span.classList.add('translate-x-5');
        } else {
            toggle.classList.add('bg-gray-200');
            toggle.classList.remove('bg-blue-600');
            span.classList.add('translate-x-0');
            span.classList.remove('translate-x-5');
        }
    }
    
    localStorage.setItem('darkMode', isDark);
}



function logout() {
    if (window.dashboard) {
        window.dashboard.logout();
    } else {
        window.auth.logout();
    }
}

// Initialize dashboard functionality
function initializeDashboard() {
    window.dashboard = new Dashboard();
    window.dashboard.init();
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        toggleDarkMode();
    }
    
    console.log('Dashboard initialized with full functionality');
}