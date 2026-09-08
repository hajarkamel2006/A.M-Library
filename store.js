/**
 * Al-Hikma Library - State & LocalStorage Store
 */
const AppStore = (function() {
    const LISTENERS = [];

    const STORAGE_KEYS = {
        WISHLIST: 'alhikma_wishlist',
        CART: 'alhikma_cart',
        USER: 'alhikma_user',
        THEME: 'alhikma_theme'
    };

    function getStorage(key, defaultVal) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultVal;
        } catch (e) {
            console.error('Error reading localStorage', e);
            return defaultVal;
        }
    }

    function setStorage(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
            notifyListeners(key, val);
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    }

    function notifyListeners(key, val) {
        LISTENERS.forEach(fn => fn(key, val));
    }

    const defaultUser = {
        name: 'عبد الله العربي',
        email: 'abdallah@example.com',
        loggedIn: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        memberSince: '2025',
        borrowedBooks: [
            {
                bookId: 'book-1',
                title: 'ثلاثية غرناطة',
                borrowDate: '2026-02-25',
                dueDate: '2026-03-12',
                status: 'نشط'
            }
        ],
        readingHistory: [
            { bookId: 'book-3', title: 'العادات الذكية وتشكيل الذات', readDate: '2026-01-10' },
            { bookId: 'book-5', title: 'تاريخ الحضارات الإسلامية والعلوم', readDate: '2025-12-05' }
        ]
    };

    return {
        subscribe: (fn) => LISTENERS.push(fn),

        // Wishlist
        getWishlist: () => getStorage(STORAGE_KEYS.WISHLIST, ['book-1', 'book-3']),
        toggleWishlist: (bookId) => {
            let list = getStorage(STORAGE_KEYS.WISHLIST, ['book-1', 'book-3']);
            const index = list.indexOf(bookId);
            let added = false;
            if (index > -1) {
                list.splice(index, 1);
            } else {
                list.push(bookId);
                added = true;
            }
            setStorage(STORAGE_KEYS.WISHLIST, list);
            return { list, added };
        },
        isInWishlist: (bookId) => {
            const list = getStorage(STORAGE_KEYS.WISHLIST, []);
            return list.includes(bookId);
        },

        // Cart
        getCart: () => getStorage(STORAGE_KEYS.CART, [
            { bookId: 'book-2', type: 'borrow', qty: 1, days: 14, price: 15 },
            { bookId: 'book-8', type: 'buy', qty: 1, price: 65 }
        ]),
        addToCart: (item) => {
            let cart = getStorage(STORAGE_KEYS.CART, []);
            const existing = cart.find(c => c.bookId === item.bookId && c.type === item.type);
            if (existing) {
                existing.qty += (item.qty || 1);
            } else {
                cart.push({
                    bookId: item.bookId,
                    type: item.type || 'borrow',
                    qty: item.qty || 1,
                    days: item.days || 14,
                    price: item.price || 0
                });
            }
            setStorage(STORAGE_KEYS.CART, cart);
            return cart;
        },
        removeFromCart: (bookId, type) => {
            let cart = getStorage(STORAGE_KEYS.CART, []);
            cart = cart.filter(c => !(c.bookId === bookId && c.type === type));
            setStorage(STORAGE_KEYS.CART, cart);
            return cart;
        },
        clearCart: () => {
            setStorage(STORAGE_KEYS.CART, []);
        },

        // User Auth
        getUser: () => getStorage(STORAGE_KEYS.USER, defaultUser),
        loginUser: (email, name) => {
            const user = {
                name: name || 'زائر مميز',
                email: email,
                loggedIn: true,
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                memberSince: '2026',
                borrowedBooks: [],
                readingHistory: []
            };
            setStorage(STORAGE_KEYS.USER, user);
            return user;
        },
        logoutUser: () => {
            const user = { loggedIn: false };
            setStorage(STORAGE_KEYS.USER, user);
            return user;
        },

        // Theme
        getTheme: () => getStorage(STORAGE_KEYS.THEME, 'light'),
        setTheme: (theme) => setStorage(STORAGE_KEYS.THEME, theme)
    };
})();