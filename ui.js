/**
 * Al-Hikma Library - UI Rendering Components & Utilities
 */
const UI = (function() {

    function renderStars(rating) {
        let starsHtml = '';
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHtml += `<i class="fas fa-star text-amber-500 text-xs"></i>`;
            } else if (i === fullStars + 1 && hasHalf) {
                starsHtml += `<i class="fas fa-star-half-alt text-amber-500 text-xs"></i>`;
            } else {
                starsHtml += `<i class="far fa-star text-slate-300 dark:text-slate-600 text-xs"></i>`;
            }
        }
        return `<div class="flex items-center gap-1">${starsHtml} <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-1">${rating}</span></div>`;
    }

    function createBookCard(book) {
        const inWishlist = AppStore.isInWishlist(book.id);
        const wishlistClass = inWishlist ? 'text-rose-500 fill-current' : 'text-slate-600 hover:text-rose-500';
        
        return `
        <div class="book-card bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between relative group" data-book-id="${book.id}">
            <div>
                <!-- Cover Image & Overlay -->
                <div class="book-cover-wrap relative mb-4 h-64 w-full bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden">
                    <img src="${book.cover}" alt="${book.title}" class="w-full h-full object-cover rounded-xl" loading="lazy" onError="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'">
                    
                    ${book.badge ? `<span class="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md z-10">${book.badge}</span>` : ''}

                    <!-- Wishlist Quick Toggle Button -->
                    <button onclick="UI.handleWishlistToggle('${book.id}', event)" class="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md flex items-center justify-center shadow-md ${wishlistClass} transition-colors z-10" title="أضف للمفضلة">
                        <i class="${inWishlist ? 'fas' : 'far'} fa-heart text-base"></i>
                    </button>

                    <!-- Quick View Overlay -->
                    <div class="book-overlay absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center gap-3 p-4">
                        <button onclick="AppRouter.navigate('book-details', {id: '${book.id}'})" class="bg-white text-slate-900 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg hover:bg-amber-500 hover:text-white transition-all transform hover:scale-105 flex items-center gap-1.5">
                            <i class="fas fa-eye"></i> التفاصيل
                        </button>
                        ${book.sampleExcerpt ? `
                        <button onclick="UI.openPdfSampleModal('${book.id}')" class="bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg hover:bg-amber-600 transition-all transform hover:scale-105 flex items-center gap-1.5">
                            <i class="fas fa-book-open"></i> عينة
                        </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Category & Title -->
                <div class="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">
                    <span>${book.category}</span>
                    <span class="text-slate-400 dark:text-slate-500 font-normal"><i class="far fa-file-alt ml-1"></i> ${book.pages} ص</span>
                </div>
                
                <h3 onclick="AppRouter.navigate('book-details', {id: '${book.id}'})" class="font-bold text-slate-900 dark:text-white text-base mb-1 line-clamp-1 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors" title="${book.title}">
                    ${book.title}
                </h3>
                
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">${book.author}</p>
            </div>

            <div>
                <!-- Rating & Price -->
                <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 mb-3">
                    ${renderStars(book.rating)}
                    <div class="text-left">
                        <span class="text-sm font-extrabold text-slate-900 dark:text-white">${book.borrowPrice} ر.س</span>
                        <span class="text-[10px] text-slate-400 block">سعر الاستعارة</span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="UI.handleBorrowClick('${book.id}')" class="bg-slate-900 dark:bg-amber-500 hover:bg-amber-600 dark:hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1">
                        <i class="fas fa-hand-holding-heart"></i> استعارة
                    </button>
                    <button onclick="UI.handleBuyClick('${book.id}')" class="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1">
                        <i class="fas fa-shopping-cart"></i> شراء (${book.price})
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    function showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: 'fa-check-circle text-emerald-500',
            error: 'fa-exclamation-circle text-rose-500',
            info: 'fa-info-circle text-amber-500'
        };

        const toast = document.createElement('div');
        toast.className = `toast-item bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xl flex items-center gap-3 text-sm text-slate-800 dark:text-slate-100`;
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info} text-xl"></i>
            <span class="flex-1 font-medium">${message}</span>
            <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-100%)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 3500);
    }

    async function openPdfSampleModal(bookId) {
        const book = await BooksDataService.getBookById(bookId);
        if (!book) return;

        const modalHtml = `
        <div id="pdf-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-900/70 backdrop-blur-sm">
            <div class="modal-content bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <!-- Modal Header -->
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-book-open text-amber-500 text-xl"></i>
                        <div>
                            <h3 class="font-bold text-slate-900 dark:text-white text-base">معاينة عينة مجانية: ${book.title}</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400">الكاتب: ${book.author} | دار النشر: ${book.publisher}</p>
                        </div>
                    </div>
                    <button onclick="document.getElementById('pdf-modal').remove()" class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Simulated PDF Reader Body -->
                <div class="p-6 overflow-y-auto flex-1 font-literary text-lg leading-relaxed text-slate-800 dark:text-slate-200 bg-amber-50/30 dark:bg-slate-950/40">
                    <div class="max-w-xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
                        <div class="text-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                            <span class="text-xs font-sans text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold">عينة المقتطف الأولي</span>
                            <h2 class="text-2xl font-bold font-literary mt-2 text-slate-900 dark:text-white">${book.title}</h2>
                            <p class="text-sm font-sans text-slate-500 mt-1">${book.author}</p>
                        </div>
                        <p class="first-letter:text-4xl first-letter:font-bold first-letter:text-amber-600">
                            ${book.sampleExcerpt}
                        </p>
                        <p class="text-base text-slate-600 dark:text-slate-400">
                            ... هذا النص يمثل عينة للقراءة المجانية لتمكين القارئ من الاطلاع على أسلوب الكاتب ورؤية الفكرة الأساسية قبل إتمام الاستعارة أو الشراء.
                        </p>
                        <div class="bg-amber-100/50 dark:bg-amber-900/20 border-r-4 border-amber-500 p-4 rounded-l-xl text-sm font-sans text-amber-900 dark:text-amber-300 my-6">
                            <i class="fas fa-lightbulb ml-2"></i> هل أعجبك الأسلوب؟ يمكنك طلب استعارة الكتاب كاملاً بنقرة واحدة لقراءته إلكترونياً أو استلام النسخة الورقية!
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <span class="text-xs text-slate-500 dark:text-slate-400 font-sans"><i class="fas fa-lock ml-1"></i> جميع الحقوق محفوظة لدار النشر</span>
                    <div class="flex gap-3 font-sans">
                        <button onclick="document.getElementById('pdf-modal').remove(); UI.handleBorrowClick('${book.id}');" class="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all">
                            استعارة الكتاب الآن
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    let mapInstance = null;
    function initLeafletMap(containerId = 'contact-map') {
        const container = document.getElementById(containerId);
        if (!container || typeof L === 'undefined') return;

        if (mapInstance) {
            mapInstance.remove();
        }

        const lat = 30.0444;
        const lng = 31.2357;

        mapInstance = L.map(containerId).setView([lat, lng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);

        const customIcon = L.divIcon({
            className: 'custom-map-pin',
            html: `<div class="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white"><i class="fas fa-book-reader text-lg"></i></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        L.marker([lat, lng], { icon: customIcon })
            .addTo(mapInstance)
            .bindPopup(`<div class="font-sans text-right"><b>مكتبة الحكمة الفرع الرئيسي</b><br>شارع الثقافة، وسط البلد</div>`)
            .openPopup();
    }

    return {
        renderStars,
        createBookCard,
        showToast,
        openPdfSampleModal,
        initLeafletMap,

        handleWishlistToggle: (bookId, event) => {
            if (event) event.stopPropagation();
            const { added } = AppStore.toggleWishlist(bookId);
            if (added) {
                showToast('تمت إضافة الكتاب إلى المفضلة', 'success');
            } else {
                showToast('تم إزالة الكتاب من المفضلة', 'info');
            }
        },

        handleBorrowClick: (bookId) => {
            AppStore.addToCart({ bookId, type: 'borrow', qty: 1, days: 14, price: 12 });
            showToast('تمت إضافة طلب الاستعارة لسلة الطلبات', 'success');
        },

        handleBuyClick: (bookId) => {
            AppStore.addToCart({ bookId, type: 'buy', qty: 1, price: 45 });
            showToast('تمت إضافة نسخة الشراء لـ عربة التسوق', 'success');
        }
    };
})();