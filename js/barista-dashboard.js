// Check authentication
let currentUser = null;
let ordersListener = null;
let currentFilter = 'all';

// Check if user is authenticated and has barista role
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    currentUser = user;

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (!userDoc.exists) {
            await auth.signOut();
            window.location.href = '../index.html';
            return;
        }

        const userData = userDoc.data();

        if (userData.role !== 'barista') {
            alert('Access denied. Barista access only.');
            await auth.signOut();
            window.location.href = '../index.html';
            return;
        }

        // Load barista profile
        loadBaristaProfile(userData);

        // Start listening to orders
        listenToOrders();

    } catch (error) {
        console.error('Error verifying user:', error);
        await auth.signOut();
        window.location.href = '../index.html';
    }
});

// Load barista profile info
function loadBaristaProfile(userData) {
    const baristaName = document.getElementById('baristaName');
    const baristaAvatar = document.getElementById('baristaAvatar');

    baristaName.textContent = userData.name || 'Barista';

    if (userData.profileImageUrl) {
        baristaAvatar.src = userData.profileImageUrl;
    } else {
        // Create initial avatar
        const initials = userData.name ? userData.name.charAt(0).toUpperCase() : 'B';
        baristaAvatar.src = `https://ui-avatars.com/api/?name=${initials}&background=2D5F3F&color=fff&size=40`;
    }
}

// Listen to orders in real-time
function listenToOrders() {
    ordersListener = db.collection('orders')
        .where('orderStatus', 'in', ['pending', 'preparing'])
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            const orders = [];
            snapshot.forEach((doc) => {
                orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            displayOrders(orders);
            updateStats(orders);
        }, (error) => {
            console.error('Error listening to orders:', error);
        });

    // Also listen to completed orders for stats update
    db.collection('completed_orders')
        .onSnapshot((snapshot) => {
            // Update completed count whenever a new order is completed
            getCompletedTodayCount();
        }, (error) => {
            console.error('Error listening to completed orders:', error);
        });
}

// Display orders in grid
function displayOrders(orders) {
    const ordersGrid = document.getElementById('ordersGrid');
    const emptyState = document.getElementById('emptyState');

    // Filter orders based on current filter
    let filteredOrders = orders;
    if (currentFilter !== 'all') {
        filteredOrders = orders.filter(order => order.orderStatus === currentFilter);
    }

    if (filteredOrders.length === 0) {
        emptyState.style.display = 'block';
        // Remove all order cards
        const orderCards = ordersGrid.querySelectorAll('.order-card');
        orderCards.forEach(card => card.remove());
        return;
    }

    emptyState.style.display = 'none';

    // Clear existing cards
    const orderCards = ordersGrid.querySelectorAll('.order-card');
    orderCards.forEach(card => card.remove());

    // Create order cards
    filteredOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersGrid.appendChild(orderCard);
    });
}

// Create order card HTML
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.dataset.orderId = order.id;
    card.dataset.status = order.orderStatus;

    const orderTime = order.createdAt ? formatTime(order.createdAt.toDate()) : 'Just now';
    const customerInitial = order.userName ? order.userName.charAt(0).toUpperCase() : 'C';

    const itemsHTML = order.items.map(item => `
        <div class="order-item">
            <div>
                <div class="item-name">${item.quantity}x ${item.coffeeName}</div>
                <div class="item-details">${item.variant}, ${item.size}</div>
            </div>
        </div>
    `).join('');

    const actionsHTML = order.orderStatus === 'pending'
        ? `<button class="btn btn-primary" onclick="startPreparing('${order.id}', this)">Start Preparing</button>`
        : `<button class="btn btn-success" onclick="markAsCompleted('${order.id}', this)">Mark as Done</button>`;

    card.innerHTML = `
        <div class="order-header">
            <div>
                <div class="order-id">#${order.orderId.substring(0, 8).toUpperCase()}</div>
                <div class="order-time">${orderTime}</div>
            </div>
            <div class="order-status ${order.orderStatus}">${order.orderStatus}</div>
        </div>

        <div class="customer-info">
            <div class="customer-avatar">${customerInitial}</div>
            <div class="customer-name">${order.userName || 'Customer'}</div>
        </div>

        <div class="order-items">
            ${itemsHTML}
        </div>

        <div class="order-actions">
            ${actionsHTML}
        </div>
    `;

    return card;
}

// Format timestamp to readable time
function formatTime(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return date.toLocaleDateString();
}

// Update statistics
function updateStats(orders) {
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending');
    const preparingOrders = orders.filter(o => o.orderStatus === 'preparing');

    document.getElementById('pendingCount').textContent = pendingOrders.length;
    document.getElementById('preparingCount').textContent = preparingOrders.length;

    // Get completed orders for today
    getCompletedTodayCount();

    // Update notification badge
    const badge = document.getElementById('notificationBadge');
    if (pendingOrders.length > 0) {
        badge.textContent = pendingOrders.length;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// Get completed orders count for today
async function getCompletedTodayCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = firebase.firestore.Timestamp.fromDate(today);

    try {
        // Query all completed orders from completed_orders collection
        const snapshot = await db.collection('completed_orders')
            .get();

        // Filter for today's orders
        let todayCount = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.completedAt && data.completedAt >= todayTimestamp) {
                todayCount++;
            }
        });

        document.getElementById('completedTodayCount').textContent = todayCount;
        console.log(`Completed today: ${todayCount} out of ${snapshot.size} total completed orders`);
    } catch (error) {
        console.error('Error getting completed count:', error);
        console.error('Error details:', error.message);
        document.getElementById('completedTodayCount').textContent = '0';
    }
}

// Start preparing order
async function startPreparing(orderId, buttonElement) {
    if (!confirm('Start preparing this order?')) return;

    const button = buttonElement || event.target;
    button.disabled = true;
    button.textContent = 'Processing...';

    try {
        await db.collection('orders').doc(orderId).update({
            orderStatus: 'preparing',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('Order marked as preparing:', orderId);

    } catch (error) {
        console.error('Error updating order:', error);
        alert('Failed to update order. Please try again.');
        button.disabled = false;
        button.textContent = 'Start Preparing';
    }
}

// Mark order as completed
async function markAsCompleted(orderId, buttonElement) {
    if (!confirm('Mark this order as completed?')) return;

    const button = buttonElement || event.target;
    button.disabled = true;
    button.textContent = 'Processing...';

    try {
        console.log('Starting to complete order:', orderId);

        // Get current pickup counter
        console.log('Fetching pickup counter...');
        const counterDoc = await db.collection('pickup_counter').doc('daily_counter').get();
        let currentCounter = counterDoc.exists ? counterDoc.data().counter : 0;
        console.log('Current counter:', currentCounter);

        // Increment counter
        currentCounter += 1;
        const pickupNumber = String(currentCounter).padStart(4, '0');
        console.log('Generated pickup number:', pickupNumber);

        // Get the order data first
        console.log('Fetching order data...');
        const orderDoc = await db.collection('orders').doc(orderId).get();

        if (!orderDoc.exists) {
            throw new Error('Order not found in orders collection');
        }

        const orderData = orderDoc.data();
        console.log('Order data retrieved:', orderData);

        // Prepare updated order data with completed status
        const completedOrderData = {
            ...orderData,
            orderStatus: 'completed',
            pickupNumber: pickupNumber,
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        console.log('Preparing batch write...');

        // Use batch to: 1) Save to completed_orders, 2) Update counter, 3) Delete from orders
        const batch = db.batch();

        // Save to completed_orders collection
        const completedOrderRef = db.collection('completed_orders').doc(orderId);
        batch.set(completedOrderRef, completedOrderData);
        console.log('Added to batch: Save to completed_orders');

        // Update pickup counter
        const counterRef = db.collection('pickup_counter').doc('daily_counter');
        batch.set(counterRef, {
            counter: currentCounter,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Added to batch: Update counter');

        // Delete from orders collection
        const orderRef = db.collection('orders').doc(orderId);
        batch.delete(orderRef);
        console.log('Added to batch: Delete from orders');

        console.log('Committing batch...');
        await batch.commit();

        console.log('✅ Order completed successfully with pickup number:', pickupNumber);
        alert(`Order completed! Pickup number: ${pickupNumber}`);

    } catch (error) {
        console.error('❌ Error completing order:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error:', error);

        let errorMessage = 'Failed to complete order. ';
        if (error.code === 'permission-denied') {
            errorMessage += 'Permission denied. Check Firestore security rules.';
        } else if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Please check console for details.';
        }

        alert(errorMessage);
        button.disabled = false;
        button.textContent = 'Mark as Done';
    }
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update filter
        currentFilter = btn.dataset.filter;

        // Trigger re-render (the real-time listener will handle this)
        // Just trigger a manual update of displayed orders
        const ordersGrid = document.getElementById('ordersGrid');
        const allCards = ordersGrid.querySelectorAll('.order-card');

        if (currentFilter === 'all') {
            allCards.forEach(card => card.style.display = 'block');
        } else {
            allCards.forEach(card => {
                if (card.dataset.status === currentFilter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // Check if empty
        const visibleCards = Array.from(allCards).filter(card => card.style.display !== 'none');
        const emptyState = document.getElementById('emptyState');
        emptyState.style.display = visibleCards.length === 0 ? 'block' : 'none';
    });
});

// Logout function
async function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) return;

    try {
        // Remove listener
        if (ordersListener) {
            ordersListener();
        }

        await auth.signOut();
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (ordersListener) {
        ordersListener();
    }
});

console.log('Barista dashboard loaded');
