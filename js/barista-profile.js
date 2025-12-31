// Check authentication
let currentUser = null;

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

        // Load profile data
        loadProfileData(userData);

        // Load statistics
        loadStatistics();

    } catch (error) {
        console.error('Error verifying user:', error);
        await auth.signOut();
        window.location.href = '../index.html';
    }
});

// Load profile data
function loadProfileData(userData) {
    // Profile header
    document.getElementById('profileName').textContent = userData.name || 'Barista';
    document.getElementById('profileEmail').textContent = userData.email || '';

    // Profile avatar
    const profileAvatar = document.getElementById('profileAvatar');
    if (userData.profileImageUrl) {
        profileAvatar.src = userData.profileImageUrl;
    } else {
        const initials = userData.name ? userData.name.charAt(0).toUpperCase() : 'B';
        profileAvatar.src = `https://ui-avatars.com/api/?name=${initials}&background=2D5F3F&color=fff&size=120`;
    }

    // Personal information
    document.getElementById('infoName').textContent = userData.name || '-';
    document.getElementById('infoEmail').textContent = userData.email || '-';
    document.getElementById('infoPhone').textContent = userData.phone || '-';
    document.getElementById('infoRole').textContent = userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'Barista';

    // Load settings
    if (userData.emailNotifications !== undefined) {
        document.getElementById('emailNotifications').checked = userData.emailNotifications;
    }
    if (userData.soundAlerts !== undefined) {
        document.getElementById('soundAlerts').checked = userData.soundAlerts;
    }
}

// Load statistics
async function loadStatistics() {
    try {
        // Get total completed orders from completed_orders collection
        const totalSnapshot = await db.collection('completed_orders')
            .get();

        document.getElementById('totalCompleted').textContent = totalSnapshot.size;

        // Get today's completed orders from completed_orders collection
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySnapshot = await db.collection('completed_orders')
            .where('completedAt', '>=', firebase.firestore.Timestamp.fromDate(today))
            .get();

        document.getElementById('todayCompleted').textContent = todaySnapshot.size;

        // Get currently preparing orders
        const preparingSnapshot = await db.collection('orders')
            .where('orderStatus', '==', 'preparing')
            .get();

        document.getElementById('currentPreparing').textContent = preparingSnapshot.size;

    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Save notification settings
document.getElementById('emailNotifications').addEventListener('change', async (e) => {
    if (!currentUser) return;

    try {
        await db.collection('users').doc(currentUser.uid).update({
            emailNotifications: e.target.checked
        });

        console.log('Email notifications updated:', e.target.checked);
    } catch (error) {
        console.error('Error updating email notifications:', error);
        // Revert checkbox
        e.target.checked = !e.target.checked;
    }
});

// Save sound alerts settings
document.getElementById('soundAlerts').addEventListener('change', async (e) => {
    if (!currentUser) return;

    try {
        await db.collection('users').doc(currentUser.uid).update({
            soundAlerts: e.target.checked
        });

        console.log('Sound alerts updated:', e.target.checked);
    } catch (error) {
        console.error('Error updating sound alerts:', error);
        // Revert checkbox
        e.target.checked = !e.target.checked;
    }
});

// Logout function
async function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) return;

    try {
        await auth.signOut();
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
    }
}

console.log('Barista profile loaded');
