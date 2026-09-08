/**
 * Al-Hikma Library - Application Engine & SPA Router
 */
const AppRouter = (function() {
    let currentPage = 'home';
    let currentParams = {};

    function navigate(page, params = {}) {
        currentPage = page;
        currentParams = params;

        // Hide all page sections
        const pages = document.querySelectorAll('.page-section');
        pages.forEach(p => p.classList.add('hidden'));

        // Show target page section
        const target = document.getElementById(`page-${page}`) || document.getElementById('page-404');
        if (target) {
            target.classList.remove('hidden');
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update active nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Trigger page-specific lifecycle hook
        renderPageContent(page, params);
    }

    async function renderPageContent(page, params) {
        switch (page) {
            case 'home':
                await renderHomePage();
                break;
            case 'catalog':
                await renderCatalogPage(params);
                break;
            case 'book-details':
                await renderBookDetailsPage(params);
                break;
            case 'wishlist':
                await renderWishlistPage();
                break;
            case 'cart':
                await renderCartPage();
                break;
            case 'dashboard':
                await renderDashboardPage();
                break;
            case 'contact':
                setTimeout(() => UI.initLeafletMap('contact-map'), 200);
                break;
        }
    }

    async function renderHomePage() {
        const books = await BooksDataService.getAllBooks();
        
        // Best sellers (featured)
        const featuredContainer = document.getElementById('home-featured-grid');
        if (featuredContainer) {
            const featuredBooks = books.filter(b => b.featured).slice(0, 4);
            featuredContainer.innerHTML = featuredBooks.map(UI.createBookCard).join('');
        }

        // New Arrivals
        const newArrivalsContainer = document.getElementById('home-new-arrivals-grid');
        if (newArrivalsContainer) {
            const newBooks = books.filter(b => b.newArrival || b.badge === 'حديث').slice(0, 4);
            newArrivalsContainer.innerHTML = newBooks.map(UI.createBookCard).join('');
        }
    }

    async function renderCatalogPage(params = {}) {
        const books = await BooksDataService.getAllBooks();
        const grid = document.getElementById('catalog-books-grid');
        const countSpan = document.getElementById('catalog-count');

        let filtered = [...books];

        // Filter by category
        if (params.category) {
            filtered = filtered.filter(b => b.categorySlug === params.category || b.category === params.category);
            const catFilterSelect = document.getElementById('filter-category');
            if (catFilterSelect) catFilterSelect.value = params.category;
        }

        // Filter by search query
        const searchInput = document.getElementById('catalog-search-input');
        if (searchInput && searchInput.value.trim()) {
            const query = searchInput.value.trim().toLowerCase();
            filtered = filtered.filter(b => 
                b.title.toLowerCase().includes(query) || 
                b.author.toLowerCase().includes(query) ||
                b.isbn.includes(query)
            );
        }

        if (countSpan) countSpan.textContent = filtered.length;

        if (grid) {
            if (filtered.length === 0) {
                grid.innerHTML = `
                <div class="col-span-full py-16 text-center">
                    <i class="fas fa-search text-5xl text-slate-300 dark:text-slate-600 mb-4"></i>
                    <h4 class="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">عذراً، لم نجد نتائج تتطابق مع بحثك</h4>
                    <p class="text-slate-500 text-sm">جرب اختيار تصنيف آخر أو تنظيف كلمات البحث.</p>
                </div>
                `;
            } else {
                grid.innerHTML = filtered.map(UI.createBookCard).join('');
            }
        }
    }

    async function renderBookDetailsPage(params) {
        const container = document.getElementById('book-details-content');
        if (!container) return;

        if (!params.id) {
            navigate('catalog');
            return;
        }

        const book = await BooksDataService.getBookById(params.id);
        if (!book) {
            navigate('404');
            return;
        }

        const allBooks = await BooksDataService.getAllBooks();
        const relatedBooks = allBooks.filter(b => b.category === book.category && b.id !== book.id).slice(0, 3);

        const inWishlist = AppStore.isInWishlist(book.id);

        container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <!-- Book Cover Column -->
            <div class="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm text-center">
                <div class="relative rounded-2xl overflow-hidden shadow-2xl mb-6 max-w-sm mx-auto">
                    <img src="${book.cover}" alt="${book.title}" class="w-full h-auto object-cover">
                    ${book.badge ? `<span class="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">${book.badge}</span>` : ''}
                </div>
                <div class="flex items-center justify-center gap-3">
                    <button onclick="UI.handleWishlistToggle('${book.id}', event); AppRouter.navigate('book-details', {id:'${book.id}'});" class="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-2 ${inWishlist ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 border-rose-200' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}">
                        <i class="${inWishlist ? 'fas' : 'far'} fa-heart text-base ${inWishlist ? 'text-rose-500' : ''}"></i> ${inWishlist ? 'في المفضلة' : 'إضافة للمفضلة'}
                    </button>
                    ${book.sampleExcerpt ? `
                    <button onclick="UI.openPdfSampleModal('${book.id}')" class="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg">
                        <i class="fas fa-book-open text-base"></i> قراءة عينة PDF
                    </button>
                    ` : ''}
                </div>
            </div>

            <!-- Details Info Column -->
            <div class="lg:col-span-7 space-y-6">
                <div>
                    <div class="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
                        <span>${book.category}</span>
                        <span>•</span>
                        <span>${book.language}</span>
                    </div>
                    <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 font-literary">${book.title}</h1>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">تأليف: <span class="font-bold text-slate-800 dark:text-slate-200">${book.author}</span></p>
                    
                    <div class="flex items-center gap-4 py-3 border-y border-slate-100 dark:border-slate-800">
                        ${UI.renderStars(book.rating)}
                        <span class="text-xs text-slate-400">(${book.reviewCount} مراجعة قارئ)</span>
                    </div>
                </div>

                <!-- Price Cards -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-800 border border-amber-200/60 dark:border-slate-700">
                        <span class="text-xs text-amber-800 dark:text-amber-400 font-semibold block mb-1">رسوم الاستعارة (14 يوم)</span>
                        <div class="text-2xl font-black text-slate-900 dark:text-white">${book.borrowPrice} ر.س</div>
                        <button onclick="UI.handleBorrowClick('${book.id}')" class="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-xl">
                            طلب استعارة
                        </button>
                    </div>
                    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                        <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">شراء نسخة دائمة</span>
                        <div class="text-2xl font-black text-slate-900 dark:text-white">${book.price} ر.س</div>
                        <button onclick="UI.handleBuyClick('${book.id}')" class="mt-3 w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl">
                            إضافة للسلة
                        </button>
                    </div>
                </div>

                <!-- Description & Specifications -->
                <div>
                    <h3 class="font-bold text-slate-900 dark:text-white text-base mb-2">نبذة عن الكتاب:</h3>
                    <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">${book.description}</p>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-xs text-slate-600 dark:text-slate-400">
                    <div><span class="block font-bold text-slate-900 dark:text-white">عدد الصفحات:</span> ${book.pages} صفحة</div>
                    <div><span class="block font-bold text-slate-900 dark:text-white">الناشر:</span> ${book.publisher}</div>
                    <div><span class="block font-bold text-slate-900 dark:text-white">سنة النشر:</span> ${book.publishYear}</div>
                    <div><span class="block font-bold text-slate-900 dark:text-white">رمز ISBN:</span> ${book.isbn}</div>
                </div>

                <!-- Reviews Section -->
                <div class="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h3 class="font-bold text-slate-900 dark:text-white text-lg mb-4">مراجعات وتقييمات القراء</h3>
                    
                    <div id="reviews-list" class="space-y-4 mb-6">
                        ${book.reviews && book.reviews.length > 0 ? book.reviews.map(r => `
                            <div class="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-xs">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="font-bold text-slate-900 dark:text-white">${r.userName}</span>
                                    <span class="text-slate-400">${r.date}</span>
                                </div>
                                ${UI.renderStars(r.rating)}
                                <p class="mt-2 text-slate-600 dark:text-slate-300">${r.comment}</p>
                            </div>
                        `).join('') : '<p class="text-xs text-slate-400">لا توجد تقييمات سابقة. كن أول من يضيف مراجعة لهذا الكتاب!</p>'}
                    </div>

                    <!-- Add Review Form -->
                    <div class="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                        <h4 class="font-bold text-xs text-slate-800 dark:text-slate-200 mb-3">أضف تقييمك ومراجعتك:</h4>
                        <form onsubmit="AppRouter.submitReview(event, '${book.id}')" class="space-y-3">
                            <div class="grid grid-cols-2 gap-3">
                                <input type="text" id="review-user" placeholder="اسمك الكريم" required class="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs w-full">
                                <select id="review-rating" class="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs w-full">
                                    <option value="5">★★★★★ (5/5)</option>
                                    <option value="4">★★★★☆ (4/5)</option>
                                    <option value="3">★★★☆☆ (3/5)</option>
                                </select>
                            </div>
                            <textarea id="review-comment" placeholder="اكتب انطباعك عن الكتاب بكلمات بسيطة..." required rows="2" class="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs w-full"></textarea>
                            <button type="submit" class="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all">
                                نشر المراجعة
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Related Books Section -->
        ${relatedBooks.length > 0 ? `
        <div class="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">كتب ذات صلة بنفس التصنيف</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${relatedBooks.map(UI.createBookCard).join('')}
            </div>
        </div>
        ` : ''}
        `;
    }

    async function submitReview(e, bookId) {
        e.preventDefault();
        const name = document.getElementById('review-user').value;
        const rating = parseInt(document.getElementById('review-rating').value);
        const comment = document.getElementById('review-comment').value;

        await BooksDataService.addReview(bookId, {
            userName: name,
            rating: rating,
            date: new Date().toISOString().split('T')[0],
            comment: comment
        });

        UI.showToast('شكراً لك! تم نشر مراجعتك بنجاح', 'success');
        renderBookDetailsPage({ id: bookId });
    }

    async function renderWishlistPage() {
        const ids = AppStore.getWishlist();
        const allBooks = await BooksDataService.getAllBooks();
        const container = document.getElementById('wishlist-grid');

        if (!container) return;

        const wishBooks = allBooks.filter(b => ids.includes(b.id));

        if (wishBooks.length === 0) {
            container.innerHTML = `
            <div class="col-span-full py-16 text-center">
                <i class="far fa-heart text-5xl text-rose-300 mb-4"></i>
                <h4 class="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">قائمة المفضلة فارغة حالياً</h4>
                <p class="text-slate-500 text-sm mb-6">استكشف الكتب وقم بإضافة الكتب التي تود قراءتها لاحقاً!</p>
                <button onclick="AppRouter.navigate('catalog')" class="bg-amber-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg hover:bg-amber-600 transition-all">
                    تصفح كتب المكتبة
                </button>
            </div>
            `;
        } else {
            container.innerHTML = wishBooks.map(UI.createBookCard).join('');
        }
    }

    async function renderCartPage() {
        const cartItems = AppStore.getCart();
        const allBooks = await BooksDataService.getAllBooks();
        const itemsContainer = document.getElementById('cart-items-list');
        const summaryContainer = document.getElementById('cart-summary-box');

        if (!itemsContainer || !summaryContainer) return;

        if (cartItems.length === 0) {
            itemsContainer.innerHTML = `
            <div class="py-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <i class="fas fa-shopping-bag text-5xl text-slate-300 dark:text-slate-600 mb-3"></i>
                <h4 class="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">السلة فارغة</h4>
                <p class="text-slate-400 text-xs mb-4">لم تقم بإضافة أي طلبات استعارة أو شراء حتى الآن.</p>
                <button onclick="AppRouter.navigate('catalog')" class="bg-amber-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl">
                    تصفح الكتب
                </button>
            </div>
            `;
            summaryContainer.innerHTML = '';
            return;
        }

        let total = 0;
        let itemsHtml = '';

        cartItems.forEach(ci => {
            const book = allBooks.find(b => b.id === ci.bookId);
            if (!book) return;

            const itemPrice = ci.type === 'borrow' ? book.borrowPrice : book.price;
            const subtotal = itemPrice * ci.qty;
            total += subtotal;

            itemsHtml += `
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <img src="${book.cover}" alt="${book.title}" class="w-14 h-18 object-cover rounded-lg shadow-xs">
                    <div>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${ci.type === 'borrow' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'}">
                            ${ci.type === 'borrow' ? 'طلب استعارة (14 يوم)' : 'شراء نسخة'}
                        </span>
                        <h4 class="font-bold text-slate-900 dark:text-white text-sm mt-1">${book.title}</h4>
                        <p class="text-xs text-slate-500">${book.author}</p>
                    </div>
                </div>

                <div class="flex items-center gap-6">
                    <div class="text-left">
                        <span class="font-extrabold text-slate-900 dark:text-white text-base">${subtotal} ر.س</span>
                        <span class="block text-[10px] text-slate-400">سعر الوحدة: ${itemPrice} ر.س</span>
                    </div>
                    <button onclick="AppStore.removeFromCart('${ci.bookId}', '${ci.type}'); AppRouter.renderCartPage();" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors">
                        <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                </div>
            </div>
            `;
        });

        itemsContainer.innerHTML = itemsHtml;

        summaryContainer.innerHTML = `
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
            <h3 class="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3">ملخص الطلب</h3>
            <div class="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div class="flex justify-between">
                    <span>إجمالي العناصر:</span>
                    <span class="font-bold text-slate-900 dark:text-white">${total} ر.س</span>
                </div>
                <div class="flex justify-between">
                    <span>رسوم التوصيل/الإرجاع:</span>
                    <span class="text-emerald-600 font-bold">مجاني</span>
                </div>
            </div>

            <div class="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span class="font-bold text-slate-900 dark:text-white text-sm">الإجمالي النهائي:</span>
                <span class="text-2xl font-black text-amber-600 dark:text-amber-400">${total} ر.س</span>
            </div>

            <button onclick="AppRouter.showCheckoutSuccessModal()" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all">
                تأكيد الطلب وتحديد عنوان الاستلام
            </button>
        </div>
        `;
    }

    function showCheckoutSuccessModal() {
        AppStore.clearCart();
        UI.showToast('تمت المرافقة وتأكيد طلبك بنجاح! شكراً لاستخدامك مكتبة الحكمة', 'success');
        navigate('dashboard');
    }

    async function renderDashboardPage() {
        const user = AppStore.getUser();
        const nameEl = document.getElementById('dash-user-name');
        const emailEl = document.getElementById('dash-user-email');
        const borrowedContainer = document.getElementById('dash-borrowed-books');

        if (nameEl) nameEl.textContent = user.name || 'القارئ العزيز';
        if (emailEl) emailEl.textContent = user.email || 'user@example.com';

        if (borrowedContainer) {
            if (user.borrowedBooks && user.borrowedBooks.length > 0) {
                borrowedContainer.innerHTML = user.borrowedBooks.map(b => `
                <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                            <i class="fas fa-book"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-900 dark:text-white text-sm">${b.title}</h4>
                            <p class="text-xs text-slate-400">تاريخ الاستعارة: ${b.borrowDate} | تاريخ الإعادة: ${b.dueDate}</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        ${b.status}
                    </span>
                </div>
                `).join('');
            } else {
                borrowedContainer.innerHTML = `<p class="text-xs text-slate-400 py-4">لا توجد كتب مستعارة حالياً.</p>`;
            }
        }
    }

    function updateBadgeCounts() {
        const wishList = AppStore.getWishlist();
        const cartList = AppStore.getCart();

        const wishBadge = document.getElementById('badge-wishlist');
        const cartBadge = document.getElementById('badge-cart');

        if (wishBadge) wishBadge.textContent = wishList.length;
        if (cartBadge) cartBadge.textContent = cartList.length;
    }

    return {
        init: function() {
            AppStore.subscribe(() => updateBadgeCounts());
            updateBadgeCounts();

            const currentTheme = AppStore.getTheme();
            if (currentTheme === 'dark') {
                document.documentElement.classList.add('dark');
            }

            navigate('home');
        },
        navigate,
        renderCartPage,
        submitReview,
        showCheckoutSuccessModal,
        toggleTheme: function() {
            const isDark = document.documentElement.classList.toggle('dark');
            AppStore.setTheme(isDark ? 'dark' : 'light');
            UI.showToast(isDark ? 'تم تفعيل الوضع الداكن' : 'تم تفعيل الوضع الفاتح', 'info');
        }
    };
})();

// Document Ready Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    AppRouter.init();
});