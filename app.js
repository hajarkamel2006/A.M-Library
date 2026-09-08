 // 1. قاعدة بيانات الكتب (Data Model)
const BOOKS = [
    {
        id: 1,
        title: "مبادئ هندسة البرمجيات الحديثة",
        author: "م. أحمد الشناوي",
        category: "programming",
        categoryName: "برمجة وتقنية",
        price: 240,
        rating: 4.9,
        reviewsCount: 38,
        pages: 360,
        publishedYear: 2025,
        image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80",
        description: "دليل تطبيقي شامل يتناول أنماط التصميم (Design Patterns) وتصميم الأنظمة الكبيرة ومبادئ Clean Code لتأهيلك لسوق العمل."
    },
    {
        id: 2,
        title: "العادات الذرية",
        author: "جيمس كلير",
        category: "self-help",
        categoryName: "تطوير الذات",
        price: 180,
        rating: 4.8,
        reviewsCount: 142,
        pages: 320,
        publishedYear: 2023,
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        description: "كيف يمكن للتغييرات الصغيرة جداً واليومية أن تقود إلى نتائج مذهلة واستثنائية على المدى الطويل في حياتك وعملك."
    },
    {
        id: 3,
        title: "مائة عام من العزلة",
        author: "غابرييل غارثيا ماركيز",
        category: "novels",
        categoryName: "روايات وأدب",
        price: 160,
        rating: 4.7,
        reviewsCount: 95,
        pages: 480,
        publishedYear: 2022,
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
        description: "الملحمة الأدبية العالمية التي تروي قصة قرية ماكوندو وسلالة بوينديا في إطار الواقعية السحرية الخالدة."
    },
    {
        id: 4,
        title: "إتقان جافاسكريبت وريأكت",
        author: "فريق مسار المطورين",
        category: "programming",
        categoryName: "برمجة وتقنية",
        price: 290,
        rating: 5.0,
        reviewsCount: 47,
        pages: 420,
        publishedYear: 2026,
        image: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=600&q=80",
        description: "من المفاهيم الأساسية والـ ES6+ وحتى بنية المكونات المتقدمة وإدارة الحالة في تطبيقات React الحديثة."
    },
    {
        id: 5,
        title: "فن التفكير الواضح",
        author: "رولف دوبلي",
        category: "self-help",
        categoryName: "تطوير الذات",
        price: 150,
        rating: 4.6,
        reviewsCount: 68,
        pages: 280,
        publishedYear: 2024,
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
        description: "يكشف لك هذا الكتاب أكثر من 50 مغالطة وخطأ فكري يقع فيه الإنسان يومياً ويساعدك على اتخاذ قرارات أفضل."
    },
    {
        id: 6,
        title: "أرض زيكولا",
        author: "عمرو عبد الحميد",
        category: "novels",
        categoryName: "روايات وأدب",
        price: 120,
        rating: 4.9,
        reviewsCount: 210,
        pages: 288,
        publishedYear: 2023,
        image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
        description: "رواية خيالية مشوقة تأخذك إلى أرض لا يتعامل أهلها بالنقود بل بوحدات الذكاء، ومن يفلس يواجه مصيراً محتوماً."
    }
];

// 2. إدارة السلة وتخزين البيانات (Cart Module)
const Cart = {
    items: JSON.parse(localStorage.getItem('bookstore_cart_v1')) || [],

    save() {
        localStorage.setItem('bookstore_cart_v1', JSON.stringify(this.items));
        this.render();
        this.updateBadge();
    },

    addItem(bookId) {
        const book = BOOKS.find(b => b.id === Number(bookId));
        if (!book) return;

        const existing = this.items.find(item => item.id === book.id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push({
                id: book.id,
                title: book.title,
                price: book.price,
                image: book.image,
                qty: 1
            });
        }
        this.save();
        UI.openCart();
    },

    changeQty(bookId, delta) {
        const item = this.items.find(i => i.id === Number(bookId));
        if (!item) return;

        item.qty += delta;
        if (item.qty <= 0) {
            this.items = this.items.filter(i => i.id !== Number(bookId));
        }
        this.save();
    },

    removeItem(bookId) {
        this.items = this.items.filter(i => i.id !== Number(bookId));
        this.save();
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },

    getCount() {
        return this.items.reduce((sum, item) => sum + item.qty, 0);
    },

    clear() {
        this.items = [];
        this.save();
    },

    updateBadge() {
        const badge = document.getElementById('cartBadge');
        const count = this.getCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    },

    render() {
        const container = document.getElementById('cartItemsContainer');
        const totalEl = document.getElementById('cartTotalPrice');

        if (this.items.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 3rem 1rem; color: var(--text-muted);">
                    <i class="fa-solid fa-basket-shopping" style="font-size: 2.5rem; margin-bottom: 0.75rem; color: #cbd5e1;"></i>
                    <p style="font-size: 0.9rem;">السلة فارغة حالياً</p>
                </div>
            `;
            totalEl.textContent = "0 ج.م";
            return;
        }

        container.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <div class="cart-item-price">${item.price} ج.م × ${item.qty}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="Cart.changeQty(${item.id}, -1)">-</button>
                    <span class="qty-number">${item.qty}</span>
                    <button class="qty-btn" onclick="Cart.changeQty(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="Cart.removeItem(${item.id})" aria-label="حذف">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        `).join('');

        totalEl.textContent = `${this.getTotal()} ج.م`;
    }
};

// 3. إدارة الواجهات والتفاعل (UI Module)
const UI = {
    activeCategory: 'all',
    searchQuery: '',

    init() {
        this.renderBooks();
        this.bindEvents();
        Cart.updateBadge();
        Cart.render();
    },

    renderBooks() {
        const container = document.getElementById('booksContainer');
        const noResults = document.getElementById('noResults');

        const filtered = BOOKS.filter(book => {
            const matchesCat = (this.activeCategory === 'all') || (book.category === this.activeCategory);
            const matchesSearch = book.title.toLowerCase().includes(this.searchQuery) || 
                                  book.author.toLowerCase().includes(this.searchQuery);
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            container.innerHTML = '';
            noResults.classList.remove('hidden');
            return;
        }

        noResults.classList.add('hidden');
        container.innerHTML = filtered.map(book => `
            <article class="book-card">
                <div class="book-image-wrap" onclick="UI.openModal(${book.id})" style="cursor:pointer">
                    <img src="${book.image}" alt="غلاف ${book.title}" loading="lazy">
                </div>
                <div class="book-card-content">
                    <div>
                        <span class="book-category">${book.categoryName}</span>
                        <h3 class="book-title" onclick="UI.openModal(${book.id})">${book.title}</h3>
                        <p class="book-author">${book.author}</p>
                    </div>
                    <div class="book-card-footer">
                        <span class="book-price">${book.price} <small>ج.م</small></span>
                        <button class="btn-icon-cart" onclick="Cart.addItem(${book.id})" aria-label="أضف للسلة">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');
    },

    openModal(bookId) {
        const book = BOOKS.find(b => b.id === Number(bookId));
        if (!book) return;

        const modalContainer = document.getElementById('modalDetailsContainer');
        modalContainer.innerHTML = `
            <div class="modal-grid">
                <div class="modal-img-wrap">
                    <img src="${book.image}" alt="${book.title}">
                </div>
                <div class="modal-details">
                    <div>
                        <span class="book-category">${book.categoryName}</span>
                        <h2 style="font-size: 1.5rem; font-weight:800; color:var(--secondary); margin-bottom:0.5rem;">${book.title}</h2>
                        <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom: 0.75rem;">المؤلف: <strong>${book.author}</strong></p>
                        <div style="color:var(--accent); font-size:0.85rem; margin-bottom:1rem;">
                            <i class="fa-solid fa-star"></i> <strong>${book.rating}</strong> (${book.reviewsCount} تقييم)
                        </div>
                        <p style="font-size:0.88rem; color:var(--text-main); line-height:1.6; margin-bottom:1.25rem;">
                            ${book.description}
                        </p>
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1.5rem;">
                            <span>الصفحات: ${book.pages}</span> | <span>سنة النشر: ${book.publishedYear}</span>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--border-color); padding-top:1rem;">
                        <span class="book-price" style="font-size:1.4rem;">${book.price} <small>ج.م</small></span>
                        <button class="btn btn-primary" onclick="Cart.addItem(${book.id}); UI.closeModal();">
                            <i class="fa-solid fa-cart-plus"></i> إضافة إلى السلة
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('bookModalOverlay').classList.add('active');
    },

    closeModal() {
        document.getElementById('bookModalOverlay').classList.remove('active');
    },

    openCart() {
        document.getElementById('cartDrawer').classList.add('active');
        document.getElementById('cartOverlay').classList.add('active');
    },

    closeCart() {
        document.getElementById('cartDrawer').classList.remove('active');
        document.getElementById('cartOverlay').classList.remove('active');
    },

    bindEvents() {
        // فلترة التصنيفات
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeCategory = btn.dataset.category;
                this.renderBooks();
            });
        });

        // البحث الفوري
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.renderBooks();
        });

        // أحداث السلة
        document.getElementById('openCartBtn').addEventListener('click', () => this.openCart());
        document.getElementById('closeCartBtn').addEventListener('click', () => this.closeCart());
        document.getElementById('cartOverlay').addEventListener('click', () => this.closeCart());

        // أحداث النافذة المنبثقة
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('bookModalOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'bookModalOverlay') this.closeModal();
        });

        // إتمام الشراء
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            if (Cart.items.length === 0) {
                alert('سلة التسوق فارغة!');
                return;
            }
            alert(`تم تأكيد طلبك بنجاح بمبلغ إجمالي قدره: ${Cart.getTotal()} ج.م. سيتم الشحن فوراً!`);
            Cart.clear();
            this.closeCart();
        });
    }
};

// بدء تشغيل التطبيق عند اكتمال تحميل DOM
document.addEventListener('DOMContentLoaded', () => UI.init());
