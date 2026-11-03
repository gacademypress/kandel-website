/**
 * Main Application Logic for Penerbit Kandel (kandel.co.id)
 * Features:
 * - Dynamic Hash Routing (#/home, #/catalogue, #/authors, #/join-us, #/about-us, #/book/:id, #/login)
 * - Live Redaction / Editorial CMS for Admin (Home, Join Us, About Us)
 * - Authors & Illustrators Management (Add, Edit, Delete)
 * - Catalog Book Sliders & Single Post Detail with Front/Back Cover Slider
 * - Direct Email Dispatch to redaksi@kandel.co.id with CC to finance@kandel.co.id
 */

// Router State
let currentPage = 'home';
let currentBookId = null;
let catalogueSort = 'new-old';
let cataloguePage = 1;
const ITEMS_PER_PAGE = 10;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  handleRoute();
  window.addEventListener('hashchange', handleRoute);
});

// Routing
function handleRoute() {
  const hash = window.location.hash || '#/home';
  const parts = hash.replace(/^#\/?/, '').split('/');
  const route = parts[0] || 'home';
  const param = parts[1] || null;

  currentPage = route;
  currentBookId = param;

  updateActiveNav(route);
  updateAdminStatusBar();

  // Route dispatcher
  switch (route) {
    case 'home':
      renderHomePage();
      break;
    case 'catalogue':
      renderCataloguePage();
      break;
    case 'authors':
      renderAuthorsPage();
      break;
    case 'join-us':
      renderJoinUsPage();
      break;
    case 'about-us':
      renderAboutUsPage();
      break;
    case 'book':
      if (param) {
        renderBookDetailPage(param);
      } else {
        window.location.hash = '#/catalogue';
      }
      break;
    case 'login':
      openLoginModal();
      break;
    default:
      renderHomePage();
      break;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateActiveNav(route) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const target = link.getAttribute('data-route');
    if (target === route) {
      link.classList.add('text-amber-700', 'font-bold', 'border-b-2', 'border-amber-700');
      link.classList.remove('text-gray-700');
    } else {
      link.classList.remove('text-amber-700', 'font-bold', 'border-b-2', 'border-amber-700');
      link.classList.add('text-gray-700');
    }
  });
}

function setupNavigation() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-nav');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  document.querySelectorAll('#mobile-nav a').forEach(a => {
    a.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.add('hidden');
    });
  });
}

// -------------------------------------------------------------
// 1. HOME PAGE (DENGAN EDIT REDAKSI LIVE UNTUK ADMIN)
// -------------------------------------------------------------
function renderHomePage() {
  const app = document.getElementById('app');
  const newReleases = store.getNewReleases();
  const bestSellers = store.getBestSellers();
  const content = store.getSiteContent('home');
  const isAdmin = store.isAdminLoggedIn();

  app.innerHTML = `
    <!-- Top Edit Redaksi Banner (Admin Only) -->
    ${isAdmin ? `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div class="bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-2 text-xs text-amber-900 font-medium">
            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            <span>Anda sedang login sebagai Admin Kandel. Anda dapat mengubah teks redaksi tampilan awal halaman Home.</span>
          </div>
          <button onclick="openEditHomeContentModal()" class="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5">
            ✏️ Edit Redaksi Home
          </button>
        </div>
      </div>
    ` : ''}

    <!-- Hero Banner -->
    <section class="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white py-14 px-4 sm:px-6 lg:px-8 mb-12 shadow-lg relative overflow-hidden mt-2">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            ${escapeHtml(content.heroBadge)}
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight mb-4">
            ${escapeHtml(content.heroTitle)}
          </h1>
          <p class="text-slate-300 text-base sm:text-lg mb-6 leading-relaxed">
            ${escapeHtml(content.heroSubtitle)}
          </p>
          <div class="flex flex-wrap gap-4">
            <a href="#/catalogue" class="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-md transition duration-200 inline-flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              Jelajahi Katalog
            </a>
            <a href="#/about-us" class="px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition duration-200">
              Tentang Kandel
            </a>
          </div>
        </div>
        <div class="hidden md:flex items-center justify-center">
          <div class="relative w-72 h-80 bg-gradient-to-tr from-amber-600/30 to-indigo-500/20 rounded-2xl p-6 border border-white/10 shadow-2xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <span class="text-xs uppercase tracking-widest text-amber-400 font-bold">${escapeHtml(content.spotlightSubtitle || 'Kandel Spotlight')}</span>
              <h3 class="text-xl font-serif text-white mt-1">${escapeHtml(content.spotlightTitle)}</h3>
              <p class="text-xs text-slate-300 mt-2">${escapeHtml(content.spotlightDesc)}</p>
            </div>
            <div class="space-y-2 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div class="flex justify-between"><span>Lokasi:</span><strong class="text-white">OnePM Building Serpong</strong></div>
              <div class="flex justify-between"><span>Distribusi:</span><strong class="text-white">Nasional (kandel.co.id)</strong></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 1: NEW RELEASE -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div class="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div>
          <span class="text-xs font-bold text-amber-700 uppercase tracking-wider">Koleksi Terbaru</span>
          <h2 class="text-2xl sm:text-3xl font-serif text-slate-900 mt-0.5">New Release</h2>
          <p class="text-sm text-gray-500">Menampilkan karya teranyar Kandel (geser hingga 10 judul)</p>
        </div>
        <!-- Slider Controls -->
        <div class="flex items-center gap-2">
          <button onclick="slideCarousel('slider-new', -1)" aria-label="Sebelumnya" class="w-10 h-10 rounded-full border border-gray-300 hover:border-slate-800 hover:bg-slate-800 hover:text-white flex items-center justify-center transition shadow-sm text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <button onclick="slideCarousel('slider-new', 1)" aria-label="Berikutnya" class="w-10 h-10 rounded-full border border-gray-300 hover:border-slate-800 hover:bg-slate-800 hover:text-white flex items-center justify-center transition shadow-sm text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      <!-- Carousel Container (3 cards desktop) -->
      <div id="slider-new" class="slider-container flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
        ${renderBookCardsHtml(newReleases, 'new')}
      </div>
    </section>

    <!-- SECTION 2: BEST SELLER -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div class="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div>
          <span class="text-xs font-bold text-amber-700 uppercase tracking-wider">Paling Diminati</span>
          <h2 class="text-2xl sm:text-3xl font-serif text-slate-900 mt-0.5">Best Seller</h2>
          <p class="text-sm text-gray-500">Buku dan alat peraga terfavorit pilihan pembaca & pendidik</p>
        </div>
        <!-- Slider Controls -->
        <div class="flex items-center gap-2">
          <button onclick="slideCarousel('slider-bestseller', -1)" aria-label="Sebelumnya" class="w-10 h-10 rounded-full border border-gray-300 hover:border-slate-800 hover:bg-slate-800 hover:text-white flex items-center justify-center transition shadow-sm text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <button onclick="slideCarousel('slider-bestseller', 1)" aria-label="Berikutnya" class="w-10 h-10 rounded-full border border-gray-300 hover:border-slate-800 hover:bg-slate-800 hover:text-white flex items-center justify-center transition shadow-sm text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      <!-- Carousel Container (3 cards desktop) -->
      <div id="slider-bestseller" class="slider-container flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
        ${renderBookCardsHtml(bestSellers, 'bestseller')}
      </div>
    </section>

    <!-- Educational Mission Quote -->
    <section class="bg-amber-50/60 border-y border-amber-100 py-12 px-4 sm:px-6 lg:px-8 mb-12">
      <div class="max-w-4xl mx-auto text-center">
        <svg class="w-10 h-10 text-amber-600/40 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
        <p class="font-serif text-xl sm:text-2xl text-slate-800 italic leading-relaxed">
          "${escapeHtml(content.quoteText)}"
        </p>
        <p class="text-sm font-semibold text-amber-800 mt-4 tracking-wide uppercase">— ${escapeHtml(content.quoteAuthor)}</p>
      </div>
    </section>
  `;
}

function openEditHomeContentModal() {
  const content = store.getSiteContent('home');
  let modal = document.getElementById('edit-content-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-content-modal';
    document.body.appendChild(modal);
  }

  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop overflow-y-auto';
  modal.innerHTML = `
    <div class="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden my-4">
      <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <h3 class="font-serif font-bold text-base">Edit Redaksi Tampilan Awal (Home)</h3>
        <button onclick="closeEditContentModal()" class="text-gray-400 hover:text-white">&times;</button>
      </div>
      <form onsubmit="handleSaveHomeContent(event)" class="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Badge Atas Hero</label>
          <input type="text" id="edit-home-badge" value="${escapeHtml(content.heroBadge)}" required class="w-full border rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Judul Utama Hero (Heading 1)</label>
          <input type="text" id="edit-home-title" value="${escapeHtml(content.heroTitle)}" required class="w-full border rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Deskripsi / Subtitel Hero</label>
          <textarea id="edit-home-sub" rows="3" required class="w-full border rounded-lg px-3 py-2">${escapeHtml(content.heroSubtitle)}</textarea>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Spotlight Judul</label>
            <input type="text" id="edit-spotlight-title" value="${escapeHtml(content.spotlightTitle)}" class="w-full border rounded-lg px-3 py-2">
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Spotlight Deskripsi</label>
            <input type="text" id="edit-spotlight-desc" value="${escapeHtml(content.spotlightDesc)}" class="w-full border rounded-lg px-3 py-2">
          </div>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Teks Kutipan / Misi Filosofis</label>
          <textarea id="edit-quote-text" rows="2" class="w-full border rounded-lg px-3 py-2">${escapeHtml(content.quoteText)}</textarea>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Penulis / Atribusi Kutipan</label>
          <input type="text" id="edit-quote-author" value="${escapeHtml(content.quoteAuthor)}" class="w-full border rounded-lg px-3 py-2">
        </div>
        <div class="pt-3 border-t flex justify-end gap-3">
          <button type="button" onclick="closeEditContentModal()" class="px-4 py-2 border rounded-lg">Batal</button>
          <button type="submit" class="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg">Simpan Redaksi Home</button>
        </div>
      </form>
    </div>
  `;
}

function handleSaveHomeContent(e) {
  e.preventDefault();
  store.updateSiteContent('home', {
    heroBadge: document.getElementById('edit-home-badge').value.trim(),
    heroTitle: document.getElementById('edit-home-title').value.trim(),
    heroSubtitle: document.getElementById('edit-home-sub').value.trim(),
    spotlightTitle: document.getElementById('edit-spotlight-title').value.trim(),
    spotlightDesc: document.getElementById('edit-spotlight-desc').value.trim(),
    quoteText: document.getElementById('edit-quote-text').value.trim(),
    quoteAuthor: document.getElementById('edit-quote-author').value.trim()
  });
  closeEditContentModal();
  alert('Redaksi tampilan awal Home berhasil diperbarui!');
  renderHomePage();
}

function closeEditContentModal() {
  const modal = document.getElementById('edit-content-modal');
  if (modal) modal.remove();
}

// -------------------------------------------------------------
// HELPER: RENDER BOOK CARDS UNTUK SLIDERS
// -------------------------------------------------------------
function renderBookCardsHtml(books, badgeType) {
  if (!books || books.length === 0) {
    return `<div class="p-8 text-center text-gray-500 w-full">Belum ada katalog dalam kategori ini.</div>`;
  }

  const isAdmin = store.isAdminLoggedIn();

  return books.map(book => `
    <div class="book-card flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div class="relative mb-4 overflow-hidden rounded-lg bg-gray-100 aspect-[3/4] flex items-center justify-center">
          <a href="#/book/${book.id}" class="block w-full h-full">
            <img src="${book.frontCover}" alt="${escapeHtml(book.title)}" class="w-full h-full object-cover book-cover-wrap hover:scale-105 transition duration-300" loading="lazy">
          </a>
          <span class="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded shadow-sm ${badgeType === 'new' ? 'badge-new' : 'badge-bestseller'}">
            ${badgeType === 'new' ? 'Baru' : 'Best Seller'}
          </span>
          ${isAdmin ? `
            <span class="absolute bottom-2 right-2 bg-slate-900/80 text-amber-300 text-[10px] px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 font-mono">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              ${book.views || 0}
            </span>
          ` : ''}
        </div>
        <div class="mb-2">
          <span class="text-xs uppercase font-semibold text-amber-700 tracking-wider">${escapeHtml(book.category || 'Katalog')}</span>
          <h3 class="font-serif font-bold text-lg text-slate-900 line-clamp-2 mt-1 leading-snug">
            <a href="#/book/${book.id}" class="hover:text-amber-700 transition">
              ${escapeHtml(book.title)}
            </a>
          </h3>
          <p class="text-xs text-gray-500 mt-1 line-clamp-1 italic">${escapeHtml(book.subtitle || '')}</p>
          <p class="text-sm text-gray-700 font-medium mt-2">Oleh: <span class="text-slate-900">${escapeHtml(book.author)}</span></p>
        </div>
      </div>
      <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
        <span class="text-xs text-gray-500">${escapeHtml(book.releaseDate || '')}</span>
        <a href="#/book/${book.id}" class="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1">
          Detail Buku
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </a>
      </div>
    </div>
  `).join('');
}

function slideCarousel(id, direction) {
  const container = document.getElementById(id);
  if (!container) return;
  const card = container.querySelector('.book-card');
  const scrollAmount = card ? (card.offsetWidth + 24) : 320;
  container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// -------------------------------------------------------------
// 2. CATALOGUE PAGE
// -------------------------------------------------------------
function renderCataloguePage() {
  const app = document.getElementById('app');
  let books = store.getBooks();

  const searchInput = document.getElementById('cat-search');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  if (query) {
    books = books.filter(b => 
      b.title.toLowerCase().includes(query) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(query)) ||
      b.author.toLowerCase().includes(query) ||
      (b.isbn && b.isbn.toLowerCase().includes(query))
    );
  }

  books = store.sortBooks(books, catalogueSort);

  const totalItems = books.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  if (cataloguePage > totalPages) cataloguePage = totalPages;
  if (cataloguePage < 1) cataloguePage = 1;

  const startIndex = (cataloguePage - 1) * ITEMS_PER_PAGE;
  const paginatedBooks = books.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  app.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <div class="text-xs text-gray-500 mb-2">
          <a href="#/home" class="hover:text-amber-700">Home</a> / <span class="text-slate-800 font-medium">Catalogue</span>
        </div>
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <h1 class="text-3xl font-serif text-slate-900">Katalog Buku & Alat Peraga</h1>
            <p class="text-sm text-gray-600 mt-1">Menampilkan 10 judul per halaman dari total ${totalItems} koleksi cetakan Kandel</p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="relative">
              <input 
                type="text" 
                id="cat-search" 
                value="${escapeHtml(query)}"
                placeholder="Cari judul, penulis, ISBN..." 
                onkeyup="handleSearchKey(event)"
                class="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none w-56 sm:w-64"
              />
              <svg class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            <div class="flex items-center gap-2">
              <label for="sort-select" class="text-xs font-semibold text-gray-600 uppercase">Sort by:</label>
              <select 
                id="sort-select" 
                onchange="handleSortChange(this.value)"
                class="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="new-old" ${catalogueSort === 'new-old' ? 'selected' : ''}>New - Old (Terbaru)</option>
                <option value="az" ${catalogueSort === 'az' ? 'selected' : ''}>A - Z (Alfabetis)</option>
                <option value="za" ${catalogueSort === 'za' ? 'selected' : ''}>Z - A</option>
                <option value="most-viewed" ${catalogueSort === 'most-viewed' ? 'selected' : ''}>Most Viewed (Populer)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      ${paginatedBooks.length === 0 ? `
        <div class="py-16 text-center bg-white rounded-xl border border-gray-200">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          <p class="text-gray-500 text-lg">Tidak ada judul buku yang cocok dengan pencarian.</p>
          <button onclick="resetCatalogueFilter()" class="mt-4 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700">Tampilkan Semua Katalog</button>
        </div>
      ` : `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          ${paginatedBooks.map(book => `
            <div class="book-card bg-white rounded-xl p-4 border border-gray-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <a href="#/book/${book.id}" class="block relative mb-3 overflow-hidden rounded bg-gray-100 aspect-[3/4]">
                  <img src="${book.frontCover}" alt="${escapeHtml(book.title)}" class="w-full h-full object-cover book-cover-wrap hover:scale-105 transition duration-300" loading="lazy">
                  ${store.isAdminLoggedIn() ? `
                    <span class="absolute bottom-2 right-2 bg-slate-900/80 text-amber-300 text-[10px] px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 font-mono">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      ${book.views || 0}
                    </span>
                  ` : ''}
                  ${book.isNewRelease ? `<span class="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded badge-new">New</span>` : ''}
                </a>
                <span class="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">${escapeHtml(book.category || 'Katalog')}</span>
                <h3 class="font-serif font-bold text-sm text-slate-900 mt-1 line-clamp-2 leading-tight">
                  <a href="#/book/${book.id}" class="hover:text-amber-700 transition">
                    ${escapeHtml(book.title)}
                  </a>
                </h3>
                <p class="text-xs text-gray-600 mt-1 line-clamp-1">${escapeHtml(book.author)}</p>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span class="text-gray-400 text-[11px]">${escapeHtml(book.releaseDate || '')}</span>
                <a href="#/book/${book.id}" class="font-medium text-amber-700 hover:text-amber-900">Lihat Post &rarr;</a>
              </div>
            </div>
          `).join('')}
        </div>
      `}

      ${totalPages > 1 ? `
        <div class="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
          <div class="text-xs text-gray-500">
            Menampilkan <span class="font-semibold text-gray-800">${startIndex + 1}</span> - <span class="font-semibold text-gray-800">${Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</span> dari <span class="font-semibold text-gray-800">${totalItems}</span> judul
          </div>
          <div class="flex items-center gap-1.5">
            <button 
              onclick="changeCataloguePage(${cataloguePage - 1})"
              ${cataloguePage === 1 ? 'disabled class="px-3 py-1.5 text-xs rounded border border-gray-200 text-gray-300 cursor-not-allowed"' : 'class="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100"'}
            >
              &larr; Prev
            </button>
            
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
              <button 
                onclick="changeCataloguePage(${page})"
                class="px-3 py-1.5 text-xs rounded font-medium ${page === cataloguePage ? 'bg-amber-700 text-white shadow-xs' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}"
              >
                ${page}
              </button>
            `).join('')}

            <button 
              onclick="changeCataloguePage(${cataloguePage + 1})"
              ${cataloguePage === totalPages ? 'disabled class="px-3 py-1.5 text-xs rounded border border-gray-200 text-gray-300 cursor-not-allowed"' : 'class="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100"'}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function handleSortChange(val) {
  catalogueSort = val;
  cataloguePage = 1;
  renderCataloguePage();
}

function handleSearchKey(e) {
  if (e.key === 'Enter') {
    cataloguePage = 1;
    renderCataloguePage();
  }
}

function changeCataloguePage(newPage) {
  cataloguePage = newPage;
  renderCataloguePage();
  window.scrollTo({ top: 120, behavior: 'smooth' });
}

function resetCatalogueFilter() {
  catalogueSort = 'new-old';
  cataloguePage = 1;
  const input = document.getElementById('cat-search');
  if (input) input.value = '';
  renderCataloguePage();
}

// -------------------------------------------------------------
// 3. AUTHORS PAGE (DENGAN CRUD TAMBAH/EDIT/HAPUS AUTHOR & ILUSTRATOR)
// -------------------------------------------------------------
function renderAuthorsPage() {
  const app = document.getElementById('app');
  const authorData = store.getAuthorsStats();
  const top3Authors = authorData.top3;
  const allAuthors = authorData.all;
  const illustrators = store.getIllustrators();
  const isAdmin = store.isAdminLoggedIn();

  app.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      ${isAdmin ? `
        <div class="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-8 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span class="text-xs font-bold text-amber-900 block">Mode Manajemen Creator Kandel</span>
            <span class="text-xs text-amber-700">Sebagai Admin, Anda dapat menambah, mengedit, atau menghapus profil Author dan Ilustrator secara langsung.</span>
          </div>
          <button onclick="openAddCreatorModal()" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5">
            <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            + Tambah Author / Ilustrator Baru
          </button>
        </div>
      ` : ''}

      <div class="mb-10 text-center max-w-2xl mx-auto">
        <span class="text-xs font-bold text-amber-700 uppercase tracking-widest">Kreator & Intelektual Kandel</span>
        <h1 class="text-3xl sm:text-4xl font-serif text-slate-900 mt-1">Authors & Ilustrator</h1>
        <p class="text-sm text-gray-600 mt-2">
          Para ilmuwan, pendidik, dan perupa grafis di balik setiap karya literatur dan alat peraga edukasi Kandel.
        </p>
      </div>

      <!-- 3 AUTHOR TERATAS -->
      <section class="mb-16">
        <div class="flex items-center gap-3 pb-3 border-b border-gray-200 mb-6">
          <div class="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow">
            ★
          </div>
          <div>
            <h2 class="text-2xl font-serif text-slate-900">3 Author Teratas</h2>
            <p class="text-xs text-gray-500">Berdasarkan total kunjungan (views) buku tertinggi</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${top3Authors.map((author, idx) => `
            <div class="bg-white rounded-xl p-6 border-2 ${idx === 0 ? 'border-amber-400 shadow-lg relative' : 'border-gray-200 shadow-sm'} flex flex-col justify-between">
              ${idx === 0 ? `<div class="absolute -top-3 right-6 bg-amber-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow">#1 Most Popular</div>` : ''}
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-14 h-14 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-serif font-bold text-xl shadow-inner">
                      ${author.name.charAt(0)}
                    </div>
                    <div>
                      <h3 class="font-serif font-bold text-lg text-slate-900 leading-tight">${escapeHtml(author.name)}</h3>
                      ${isAdmin ? `
                        <div class="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mt-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          ${author.totalViews.toLocaleString('id-ID')} Total Views (Admin)
                        </div>
                      ` : `
                        <div class="flex items-center gap-1.5 text-xs text-amber-800 font-medium mt-1">
                          <span>📚 ${author.books.length} Judul Buku Katalog</span>
                        </div>
                      `}
                    </div>
                  </div>
                  
                  ${isAdmin ? `
                    <div class="flex flex-col gap-1 items-end">
                      <button onclick="openEditCreatorByName('${escapeHtml(author.name)}', 'author')" class="text-xs text-amber-700 hover:underline">Edit</button>
                      <button onclick="confirmDeleteCreatorByName('${escapeHtml(author.name)}')" class="text-xs text-rose-600 hover:underline">Hapus</button>
                    </div>
                  ` : ''}
                </div>
                <p class="text-xs text-gray-600 leading-relaxed mb-4">
                  ${escapeHtml(author.bio)}
                </p>
              </div>

              <div class="pt-4 border-t border-gray-100">
                <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Katalog Buku Ditulis:</span>
                <div class="flex flex-wrap gap-2">
                  ${author.books.map(b => `
                    <a href="#/book/${b.id}" class="text-xs bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 px-2.5 py-1 rounded transition border border-gray-200">
                      ${escapeHtml(b.title)}
                    </a>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- ILUSTRATOR KATALOG KANDEL -->
      <section class="mb-16">
        <div class="pb-3 border-b border-gray-200 mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-serif text-slate-900">Ilustrator Katalog Kandel</h2>
            <p class="text-xs text-gray-500">Seniman visual dan perancang grafis yang menghidupkan buku cetakan & alat peraga</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${illustrators.map(ill => `
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </div>
                    <div>
                      <h3 class="font-serif font-bold text-base text-slate-900">${escapeHtml(ill.name)}</h3>
                      <span class="text-xs text-gray-500">Ilustrator & Desainer Visual</span>
                    </div>
                  </div>
                  
                  ${isAdmin ? `
                    <div class="flex gap-2">
                      <button onclick="openEditCreatorByName('${escapeHtml(ill.name)}', 'illustrator')" class="text-xs text-amber-700 hover:underline">Edit</button>
                      <button onclick="confirmDeleteCreatorByName('${escapeHtml(ill.name)}')" class="text-xs text-rose-600 hover:underline">Hapus</button>
                    </div>
                  ` : ''}
                </div>
                <p class="text-xs text-gray-600 mb-4 leading-relaxed">${escapeHtml(ill.bio)}</p>
              </div>

              <div class="pt-3 border-t border-gray-100">
                <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Karya yang Diilustrasikan:</span>
                <div class="space-y-1.5">
                  ${ill.books.length > 0 ? ill.books.map(b => `
                    <a href="#/book/${b.id}" class="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 group">
                      <img src="${b.cover}" alt="${escapeHtml(b.title)}" class="w-8 h-10 object-cover rounded shadow-xs">
                      <span class="text-xs font-medium text-slate-800 group-hover:text-amber-700 line-clamp-1">${escapeHtml(b.title)}</span>
                    </a>
                  `).join('') : `<span class="text-xs text-gray-400 italic">Belum ada karya katalog terhubung</span>`}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- SEMUA PENULIS KANDEL -->
      <section>
        <div class="pb-3 border-b border-gray-200 mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-serif text-slate-900">Daftar Lengkap Penulis Kandel</h2>
            <p class="text-xs text-gray-500">Seluruh penulis yang mempercayakan naskahnya diterbitkan di Penerbit Kandel</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          ${allAuthors.map(author => `
            <div class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition">
              <div class="max-w-xl">
                <h4 class="font-serif font-bold text-slate-900 text-base">${escapeHtml(author.name)}</h4>
                <p class="text-xs text-gray-600 mt-1 line-clamp-2">${escapeHtml(author.bio)}</p>
              </div>
              <div class="flex items-center gap-4 flex-shrink-0">
                <span class="text-xs text-gray-500">${author.books.length} Buku</span>
                ${isAdmin ? `<span class="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">${author.totalViews} views (Admin)</span>` : ''}
                ${isAdmin ? `
                  <button onclick="openEditCreatorByName('${escapeHtml(author.name)}', 'author')" class="text-xs font-medium text-amber-700 hover:underline">Edit</button>
                  <button onclick="confirmDeleteCreatorByName('${escapeHtml(author.name)}')" class="text-xs font-medium text-rose-600 hover:underline">Hapus</button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

function openAddCreatorModal() {
  openCreatorModal(null);
}

function openEditCreatorByName(name, defaultRole) {
  const allCreators = store.getCreators();
  let found = allCreators.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (!found) {
    found = {
      name: name,
      role: defaultRole || 'author',
      bio: '',
      views: 100
    };
  }
  openCreatorModal(found);
}

function openCreatorModal(creator) {
  const isEdit = !!(creator && creator.id);
  let modal = document.getElementById('creator-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'creator-modal';
    document.body.appendChild(modal);
  }

  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop';
  modal.innerHTML = `
    <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 sm:p-8 animate-fadeIn relative">
      <div class="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
        <h3 class="text-lg font-serif font-bold text-slate-900">
          ${isEdit ? 'Edit Profil Creator' : 'Tambah Author / Ilustrator Baru'}
        </h3>
        <button onclick="closeCreatorModal()" class="text-gray-400 hover:text-gray-700">&times;</button>
      </div>

      <form onsubmit="handleCreatorFormSubmit(event, '${isEdit ? creator.id : ''}')" class="space-y-4 text-xs sm:text-sm">
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
          <input type="text" id="cr-name" required value="${creator ? escapeHtml(creator.name) : ''}" placeholder="Contoh: Dr. Rian Pratama, M.Sc" class="w-full border rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Peran / Role *</label>
          <select id="cr-role" class="w-full border rounded-lg px-3 py-2 bg-white">
            <option value="author" ${creator && creator.role === 'author' ? 'selected' : ''}>Author (Penulis Naskah)</option>
            <option value="illustrator" ${creator && creator.role === 'illustrator' ? 'selected' : ''}>Ilustrator (Desainer Grafis)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Biografi Singkat</label>
          <textarea id="cr-bio" rows="3" placeholder="Ceritakan latar belakang kepakaran atau karya..." class="w-full border rounded-lg px-3 py-2">${creator ? escapeHtml(creator.bio) : ''}</textarea>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Total Kunjungan / Views (Opsional)</label>
          <input type="number" id="cr-views" value="${creator ? (creator.views || 0) : 0}" class="w-full border rounded-lg px-3 py-2">
        </div>
        <div class="pt-3 border-t flex justify-end gap-3">
          <button type="button" onclick="closeCreatorModal()" class="px-4 py-2 border rounded-lg">Batal</button>
          <button type="submit" class="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg">Simpan Creator</button>
        </div>
      </form>
    </div>
  `;
}

function closeCreatorModal() {
  const modal = document.getElementById('creator-modal');
  if (modal) modal.remove();
}

function handleCreatorFormSubmit(e, creatorId) {
  e.preventDefault();
  const name = document.getElementById('cr-name').value.trim();
  const role = document.getElementById('cr-role').value;
  const bio = document.getElementById('cr-bio').value.trim();
  const views = Number(document.getElementById('cr-views').value) || 0;

  const data = { name, role, bio, views };
  if (creatorId) data.id = creatorId;

  store.saveCreator(data);
  closeCreatorModal();
  alert('Data Author/Ilustrator berhasil disimpan!');
  renderAuthorsPage();
}

function confirmDeleteCreatorByName(name) {
  if (confirm(`Apakah Anda yakin ingin menghapus data creator "${name}"?`)) {
    const all = store.getCreators();
    const item = all.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (item) {
      store.deleteCreator(item.id);
    }
    alert(`Data creator ${name} telah dihapus.`);
    renderAuthorsPage();
  }
}

// -------------------------------------------------------------
// 4. JOIN US PAGE (LIVE REDAKSI & EMAIL DISPATCH TO REDAKSI CC FINANCE)
// -------------------------------------------------------------
function renderJoinUsPage() {
  const app = document.getElementById('app');
  const content = store.getSiteContent('joinUs');
  const isAdmin = store.isAdminLoggedIn();

  app.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      ${isAdmin ? `
        <div class="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-8 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-2 text-xs text-amber-900 font-medium">
            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            <span>Mode Admin: Anda dapat mengedit redaksi halaman Join Us secara live.</span>
          </div>
          <button onclick="openEditJoinUsContentModal()" class="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5">
            ✏️ Edit Redaksi Join Us
          </button>
        </div>
      ` : ''}

      <div class="text-center max-w-2xl mx-auto mb-12">
        <span class="text-xs font-bold text-amber-700 uppercase tracking-widest">${escapeHtml(content.badge)}</span>
        <h1 class="text-3xl sm:text-4xl font-serif text-slate-900 mt-1">${escapeHtml(content.title)}</h1>
        <p class="text-sm text-gray-600 mt-3 leading-relaxed">
          ${escapeHtml(content.subtitle)}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:border-amber-400 transition">
          <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5 font-bold">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h2 class="text-xl font-serif font-bold text-slate-900 mb-3">${escapeHtml(content.authorTitle)}</h2>
          <p class="text-xs text-gray-600 leading-relaxed mb-4">
            ${escapeHtml(content.authorDesc)}
          </p>
          <ul class="text-xs text-gray-700 space-y-2 mb-6">
            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> Naskah orisinal & belum pernah diterbitkan</li>
            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> Dilengkapi sinopsis dan outline bab</li>
            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> Sistem royalti kompetitif & sertifikasi ISBN resmi</li>
          </ul>
        </div>

        <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:border-amber-400 transition">
          <div class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-5 font-bold">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <h2 class="text-xl font-serif font-bold text-slate-900 mb-3">${escapeHtml(content.illustratorTitle)}</h2>
          <p class="text-xs text-gray-600 leading-relaxed mb-4">
            ${escapeHtml(content.illustratorDesc)}
          </p>
          <ul class="text-xs text-gray-700 space-y-2 mb-6">
            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> Portofolio gambar / sketsa edukasi</li>
            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> Pemahaman komposisi visual buku anak & sains</li>
            <li class="flex items-center gap-2"><svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> Kredit nama tercantum di sampul katalog buku</li>
          </ul>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative">
        <div class="mb-6">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold mb-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Terkoneksi Otomatis ke redaksi@kandel.co.id (CC: finance@kandel.co.id)
          </div>
          <h2 class="text-2xl font-serif text-slate-900">${escapeHtml(content.formTitle)}</h2>
          <p class="text-xs text-gray-500 mt-1">${escapeHtml(content.formDesc)}</p>
        </div>
        
        <form id="join-form" onsubmit="handleJoinSubmitWithEmail(event)" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
              <input type="text" id="prop-name" required placeholder="Contoh: Rian Pratama, S.Si" class="w-full text-sm border border-gray-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Email Pengirim *</label>
              <input type="email" id="prop-email" required placeholder="nama@email.com" class="w-full text-sm border border-gray-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Nomor WhatsApp *</label>
              <input type="tel" id="prop-wa" required placeholder="0812xxxxxxxx" class="w-full text-sm border border-gray-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Peran yang Diajukan *</label>
              <select id="prop-role" class="w-full text-sm border border-gray-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white">
                <option value="Penulis Naskah Buku">Penulis Naskah Buku</option>
                <option value="Ilustrator / Desainer Visual">Ilustrator / Desainer Visual</option>
                <option value="Pengembang Alat Peraga Edukasi">Pengembang Alat Peraga Edukasi</option>
                <option value="Reviewer Ahli / Kurator Materi">Reviewer Ahli / Kurator Materi</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Link Portofolio / Draft Naskah (Google Drive / Behance / Web) *</label>
            <input type="url" id="prop-link" required placeholder="https://drive.google.com/... atau https://behance.net/..." class="w-full text-sm border border-gray-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Sinopsis Singkat Ide Buku / Pengantar *</label>
            <textarea id="prop-synopsis" rows="4" required placeholder="Ceritakan ide naskah buku atau konsep karya visual yang ingin Anda terbitkan bersama Kandel..." class="w-full text-sm border border-gray-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"></textarea>
          </div>

          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
            <strong>Tujuan Pengiriman:</strong> redaksi@kandel.co.id &bull; <strong>CC:</strong> finance@kandel.co.id
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full sm:w-auto px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-medium text-sm rounded-lg shadow transition flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Kirim Proposal ke Redaksi Kandel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function openEditJoinUsContentModal() {
  const content = store.getSiteContent('joinUs');
  let modal = document.getElementById('edit-join-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-join-modal';
    document.body.appendChild(modal);
  }

  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop overflow-y-auto';
  modal.innerHTML = `
    <div class="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden my-4">
      <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <h3 class="font-serif font-bold text-base">Edit Redaksi Halaman Join Us</h3>
        <button onclick="closeEditJoinModal()" class="text-gray-400 hover:text-white">&times;</button>
      </div>
      <form onsubmit="handleSaveJoinUsContent(event)" class="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Badge Tagline</label>
          <input type="text" id="ej-badge" value="${escapeHtml(content.badge)}" required class="w-full border rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Judul Halaman</label>
          <input type="text" id="ej-title" value="${escapeHtml(content.title)}" required class="w-full border rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Subtitel / Ajakan Utama</label>
          <textarea id="ej-sub" rows="3" required class="w-full border rounded-lg px-3 py-2">${escapeHtml(content.subtitle)}</textarea>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Judul Kotak Penulis</label>
          <input type="text" id="ej-auth-title" value="${escapeHtml(content.authorTitle)}" required class="w-full border rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Deskripsi Kotak Penulis</label>
          <textarea id="ej-auth-desc" rows="2" class="w-full border rounded-lg px-3 py-2">${escapeHtml(content.authorDesc)}</textarea>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Judul Kotak Ilustrator</label>
          <input type="text" id="ej-ill-title" value="${escapeHtml(content.illustratorTitle)}" required class="w-full border rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Deskripsi Kotak Ilustrator</label>
          <textarea id="ej-ill-desc" rows="2" class="w-full border rounded-lg px-3 py-2">${escapeHtml(content.illustratorDesc)}</textarea>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Judul Formulir</label>
          <input type="text" id="ej-form-title" value="${escapeHtml(content.formTitle)}" required class="w-full border rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Deskripsi Formulir</label>
          <input type="text" id="ej-form-desc" value="${escapeHtml(content.formDesc)}" required class="w-full border rounded-lg px-3 py-2">
        </div>
        <div class="pt-3 border-t flex justify-end gap-3">
          <button type="button" onclick="closeEditJoinModal()" class="px-4 py-2 border rounded-lg">Batal</button>
          <button type="submit" class="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg">Simpan Redaksi Join Us</button>
        </div>
      </form>
    </div>
  `;
}

function handleSaveJoinUsContent(e) {
  e.preventDefault();
  store.updateSiteContent('joinUs', {
    badge: document.getElementById('ej-badge').value.trim(),
    title: document.getElementById('ej-title').value.trim(),
    subtitle: document.getElementById('ej-sub').value.trim(),
    authorTitle: document.getElementById('ej-auth-title').value.trim(),
    authorDesc: document.getElementById('ej-auth-desc').value.trim(),
    illustratorTitle: document.getElementById('ej-ill-title').value.trim(),
    illustratorDesc: document.getElementById('ej-ill-desc').value.trim(),
    formTitle: document.getElementById('ej-form-title').value.trim(),
    formDesc: document.getElementById('ej-form-desc').value.trim()
  });
  closeEditJoinModal();
  alert('Redaksi halaman Join Us berhasil diperbarui!');
  renderJoinUsPage();
}

function closeEditJoinModal() {
  const modal = document.getElementById('edit-join-modal');
  if (modal) modal.remove();
}

function handleJoinSubmitWithEmail(e) {
  e.preventDefault();

  const name = document.getElementById('prop-name').value.trim();
  const email = document.getElementById('prop-email').value.trim();
  const wa = document.getElementById('prop-wa').value.trim();
  const role = document.getElementById('prop-role').value;
  const link = document.getElementById('prop-link').value.trim();
  const synopsis = document.getElementById('prop-synopsis').value.trim();

  const toEmail = "redaksi@kandel.co.id";
  const ccEmail = "finance@kandel.co.id";
  const subject = encodeURIComponent(`[Proposal Kontributor Kandel] - ${name} (${role})`);
  const bodyText = encodeURIComponent(
    `Kepada Yth. Tim Redaksi & Manajemen Penerbit Kandel,\n\n` +
    `Berikut pengajuan proposal / portofolio karya untuk Penerbit Kandel:\n\n` +
    `Nama Lengkap   : ${name}\n` +
    `Email Pengirim : ${email}\n` +
    `No. WhatsApp   : ${wa}\n` +
    `Peran          : ${role}\n` +
    `Link Portofolio/Draft Naskah:\n${link}\n\n` +
    `Sinopsis / Gagasan Karya:\n${synopsis}\n\n` +
    `---\n` +
    `Dikirim via Formulir Kontributor Resmi kandel.co.id`
  );

  const mailtoLink = `mailto:${toEmail}?cc=${ccEmail}&subject=${subject}&body=${bodyText}`;

  window.location.href = mailtoLink;

  alert(
    `✅ PROPOSAL BERHASIL DISIAPKAN & DIKIRIM!\n\n` +
    `Penerima Utama: redaksi@kandel.co.id\n` +
    `Tembusan (CC)  : finance@kandel.co.id\n\n` +
    `Aplikasi email Anda telah terbuka otomatis dengan data proposal lengkap. Tim Redaksi Kandel di OnePM Building Serpong akan meninjau proposal Anda dalam 7 hari kerja.`
  );

  e.target.reset();
}

// -------------------------------------------------------------
// 5. ABOUT US PAGE (LIVE REDAKSI UNTUK ADMIN)
// -------------------------------------------------------------
function renderAboutUsPage() {
  const app = document.getElementById('app');
  const content = store.getSiteContent('aboutUs');
  const isAdmin = store.isAdminLoggedIn();

  app.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      ${isAdmin ? `
        <div class="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-2 text-xs text-amber-900 font-medium">
            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            <span>Mode Admin: Anda dapat mengedit profil dan redaksi halaman About Us secara live.</span>
          </div>
          <button onclick="openEditAboutContentModal()" class="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5">
            ✏️ Edit Redaksi About Us
          </button>
        </div>
      ` : ''}

      <div class="text-xs text-gray-500 mb-4">
        <a href="#/home" class="hover:text-amber-700">Home</a> / <span class="text-slate-800 font-medium">About Us</span>
      </div>

      <div class="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs mb-12">
        <div class="relative bg-slate-900 text-white py-14 px-6 sm:px-12">
          <div class="max-w-3xl">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">${escapeHtml(content.badge)}</span>
            <h1 class="text-3xl sm:text-5xl font-serif mt-2 mb-4">${escapeHtml(content.heroTitle)}</h1>
            <p class="text-slate-300 text-base sm:text-lg leading-relaxed">
              ${escapeHtml(content.heroSubtitle)}
            </p>
          </div>
        </div>

        <div class="p-6 sm:p-12 space-y-8 text-gray-700 leading-relaxed">
          <div>
            <h2 class="text-2xl font-serif text-slate-900 mb-3">${escapeHtml(content.mainTitle)}</h2>
            <p class="text-base text-gray-600 mb-4 whitespace-pre-line">
              ${escapeHtml(content.paragraph1)}
            </p>
            <p class="text-base text-gray-600 whitespace-pre-line">
              ${escapeHtml(content.paragraph2)}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-200/70">
              <div class="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold mb-3">1</div>
              <h3 class="font-serif font-bold text-slate-900 text-base mb-1">${escapeHtml(content.pillar1Title)}</h3>
              <p class="text-xs text-gray-600">${escapeHtml(content.pillar1Desc)}</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-200/70">
              <div class="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold mb-3">2</div>
              <h3 class="font-serif font-bold text-slate-900 text-base mb-1">${escapeHtml(content.pillar2Title)}</h3>
              <p class="text-xs text-gray-600">${escapeHtml(content.pillar2Desc)}</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-200/70">
              <div class="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold mb-3">3</div>
              <h3 class="font-serif font-bold text-slate-900 text-base mb-1">${escapeHtml(content.pillar3Title)}</h3>
              <p class="text-xs text-gray-600">${escapeHtml(content.pillar3Desc)}</p>
            </div>
          </div>

          <div class="bg-slate-50 rounded-2xl p-6 border border-slate-200 mt-8">
            <h3 class="font-serif font-bold text-slate-900 text-lg mb-2">${escapeHtml(content.officeTitle)}</h3>
            <p class="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              ${escapeHtml(content.officeAddress)}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openEditAboutContentModal() {
  const content = store.getSiteContent('aboutUs');
  let modal = document.getElementById('edit-about-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-about-modal';
    document.body.appendChild(modal);
  }

  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop overflow-y-auto';
  modal.innerHTML = `
    <div class="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden my-4">
      <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <h3 class="font-serif font-bold text-base">Edit Redaksi About Us</h3>
        <button onclick="closeEditAboutModal()" class="text-gray-400 hover:text-white">&times;</button>
      </div>
      <form onsubmit="handleSaveAboutUsContent(event)" class="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Badge Atas</label>
          <input type="text" id="ea-badge" value="${escapeHtml(content.badge)}" required class="w-full border rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Judul Hero Banner</label>
          <input type="text" id="ea-hero-title" value="${escapeHtml(content.heroTitle)}" required class="w-full border rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Subtitel Hero</label>
          <textarea id="ea-hero-sub" rows="2" required class="w-full border rounded-lg px-3 py-2">${escapeHtml(content.heroSubtitle)}</textarea>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Judul Profil Utama</label>
          <input type="text" id="ea-main-title" value="${escapeHtml(content.mainTitle)}" required class="w-full border rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Paragraf 1</label>
          <textarea id="ea-p1" rows="3" required class="w-full border rounded-lg px-3 py-2">${escapeHtml(content.paragraph1)}</textarea>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Paragraf 2</label>
          <textarea id="ea-p2" rows="3" required class="w-full border rounded-lg px-3 py-2">${escapeHtml(content.paragraph2)}</textarea>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Pilar 1</label>
            <input type="text" id="ea-p1-title" value="${escapeHtml(content.pillar1Title)}" class="w-full border rounded px-2 py-1 mb-1 font-bold">
            <textarea id="ea-p1-desc" rows="2" class="w-full border rounded px-2 py-1">${escapeHtml(content.pillar1Desc)}</textarea>
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Pilar 2</label>
            <input type="text" id="ea-p2-title" value="${escapeHtml(content.pillar2Title)}" class="w-full border rounded px-2 py-1 mb-1 font-bold">
            <textarea id="ea-p2-desc" rows="2" class="w-full border rounded px-2 py-1">${escapeHtml(content.pillar2Desc)}</textarea>
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Pilar 3</label>
            <input type="text" id="ea-p3-title" value="${escapeHtml(content.pillar3Title)}" class="w-full border rounded px-2 py-1 mb-1 font-bold">
            <textarea id="ea-p3-desc" rows="2" class="w-full border rounded px-2 py-1">${escapeHtml(content.pillar3Desc)}</textarea>
          </div>
        </div>
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Alamat Kantor & Kontak</label>
          <textarea id="ea-office" rows="3" class="w-full border rounded-lg px-3 py-2">${escapeHtml(content.officeAddress)}</textarea>
        </div>
        <div class="pt-3 border-t flex justify-end gap-3">
          <button type="button" onclick="closeEditAboutModal()" class="px-4 py-2 border rounded-lg">Batal</button>
          <button type="submit" class="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg">Simpan Redaksi About Us</button>
        </div>
      </form>
    </div>
  `;
}

function handleSaveAboutUsContent(e) {
  e.preventDefault();
  store.updateSiteContent('aboutUs', {
    badge: document.getElementById('ea-badge').value.trim(),
    heroTitle: document.getElementById('ea-hero-title').value.trim(),
    heroSubtitle: document.getElementById('ea-hero-sub').value.trim(),
    mainTitle: document.getElementById('ea-main-title').value.trim(),
    paragraph1: document.getElementById('ea-p1').value.trim(),
    paragraph2: document.getElementById('ea-p2').value.trim(),
    pillar1Title: document.getElementById('ea-p1-title').value.trim(),
    pillar1Desc: document.getElementById('ea-p1-desc').value.trim(),
    pillar2Title: document.getElementById('ea-p2-title').value.trim(),
    pillar2Desc: document.getElementById('ea-p2-desc').value.trim(),
    pillar3Title: document.getElementById('ea-p3-title').value.trim(),
    pillar3Desc: document.getElementById('ea-p3-desc').value.trim(),
    officeAddress: document.getElementById('ea-office').value.trim()
  });
  closeEditAboutModal();
  alert('Redaksi halaman About Us berhasil diperbarui!');
  renderAboutUsPage();
}

function closeEditAboutModal() {
  const modal = document.getElementById('edit-about-modal');
  if (modal) modal.remove();
}

// -------------------------------------------------------------
// 6. SINGLE POST / BOOK DETAIL PAGE
// -------------------------------------------------------------
function renderBookDetailPage(bookId) {
  const app = document.getElementById('app');
  const book = store.getBookById(bookId);

  if (!book) {
    app.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 class="text-2xl font-serif text-slate-900">Katalog Tidak Ditemukan</h2>
        <p class="text-sm text-gray-500 mt-2">Judul buku atau barang yang Anda cari tidak tersedia.</p>
        <a href="#/catalogue" class="mt-4 inline-block px-5 py-2.5 bg-amber-700 text-white text-xs font-semibold rounded-lg">Kembali ke Katalog</a>
      </div>
    `;
    return;
  }

  store.incrementViews(book.id);

  app.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-gray-200">
        <div class="text-xs text-gray-500">
          <a href="#/home" class="hover:text-amber-700">Home</a> / 
          <a href="#/catalogue" class="hover:text-amber-700">Catalogue</a> / 
          <span class="text-slate-800 font-medium">${escapeHtml(book.title)}</span>
        </div>
        <div class="flex items-center gap-2">
          ${store.isAdminLoggedIn() ? `
            <span class="text-xs text-amber-800 flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded font-mono font-medium">
              <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              ${book.views || 1} Views (Admin)
            </span>
          ` : ''}
          ${store.isAdminLoggedIn() ? `
            <button onclick="openEditBookModal('${book.id}')" class="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded shadow-xs inline-flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Edit Post
            </button>
            <button onclick="confirmDeleteBook('${book.id}')" class="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded shadow-xs inline-flex items-center gap-1">
              Hapus
            </button>
          ` : ''}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
        <div class="md:col-span-5 flex flex-col items-center">
          <div class="w-full max-w-sm">
            <div class="relative bg-white p-3 rounded-2xl shadow-lg border border-gray-200">
              <div class="relative overflow-hidden rounded-xl aspect-[3/4] bg-slate-100 flex items-center justify-center">
                <img 
                  id="book-main-cover" 
                  src="${book.frontCover}" 
                  alt="${escapeHtml(book.title)}" 
                  class="w-full h-full object-cover book-cover-wrap transition-opacity duration-300"
                />
                <div id="cover-view-badge" class="absolute top-3 left-3 bg-slate-900/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs">
                  Cover Depan
                </div>
              </div>

              <div class="mt-4 flex items-center justify-between px-2">
                <button 
                  type="button"
                  onclick="switchBookCover('${book.frontCover}', '${book.backCover || book.frontCover}', 'front')"
                  id="btn-cover-front"
                  class="flex-1 mr-2 py-2 px-3 text-xs font-bold rounded-lg border-2 border-amber-600 bg-amber-50 text-amber-800 transition flex items-center justify-center gap-1.5"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                  Cover Depan
                </button>
                <button 
                  type="button"
                  onclick="switchBookCover('${book.frontCover}', '${book.backCover || book.frontCover}', 'back')"
                  id="btn-cover-back"
                  class="flex-1 ml-2 py-2 px-3 text-xs font-bold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-1.5"
                >
                  Cover Belakang
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
            <p class="text-center text-xs text-gray-400 mt-2">Klik tombol di atas untuk melihat sampul depan & belakang buku</p>
          </div>
        </div>

        <div class="md:col-span-7 flex flex-col justify-between">
          <div>
            <div class="inline-block text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">
              ${escapeHtml(book.category || 'Penerbit Kandel')}
            </div>
            
            <h1 class="text-3xl sm:text-4xl font-serif text-slate-900 font-bold leading-tight mb-2">
              ${escapeHtml(book.title)}
            </h1>

            <p class="text-base text-gray-600 italic font-serif mb-6 leading-relaxed">
              ${escapeHtml(book.subtitle || '-')}
            </p>

            <div class="bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs mb-6">
              <div class="spec-row">
                <span class="spec-label">Subtitle</span>
                <span class="spec-value">${escapeHtml(book.subtitle || '-')}</span>
              </div>

              <div class="spec-row">
                <span class="spec-label">Author</span>
                <span class="spec-value">${escapeHtml(book.author || '-')}</span>
              </div>

              <div class="spec-row">
                <span class="spec-label">Release Date</span>
                <span class="spec-value">${escapeHtml(book.releaseDate || '-')}</span>
              </div>

              <div class="spec-row">
                <span class="spec-label">ISBN</span>
                <span class="spec-value">${escapeHtml(book.isbn || '-')}</span>
              </div>

              <div class="spec-row">
                <span class="spec-label">Cover</span>
                <span class="spec-value">${escapeHtml(book.coverType || 'Soft cover')}</span>
              </div>

              <div class="spec-row">
                <span class="spec-label">Weight</span>
                <span class="spec-value">${book.weight ? `${book.weight} gram` : '-'}</span>
              </div>

              <div class="spec-row">
                <span class="spec-label">Dimension</span>
                <span class="spec-value">${escapeHtml(book.dimension || '-')}</span>
              </div>

              <div class="spec-row">
                <span class="spec-label">Pages</span>
                <span class="spec-value">${book.pages ? `${book.pages} halaman` : '-'}</span>
              </div>

              <div class="spec-row !border-b-0 pt-3">
                <span class="spec-label">Sample</span>
                <div class="spec-value flex items-center gap-3">
                  <a 
                    href="${book.samplePdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}" 
                    target="_blank"
                    class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-2 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Download Sample Buku (PDF)
                  </a>
                  <button 
                    onclick="openPdfPreviewModal('${escapeHtml(book.title)}', '${book.samplePdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}')"
                    class="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition"
                  >
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Baca Pratinjau
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 border-t border-gray-200">
        <div class="md:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-2xs">
          <div class="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
            <svg class="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <h2 class="text-xl font-serif font-bold text-slate-900">Description</h2>
          </div>
          <div class="prose prose-slate text-sm sm:text-base text-gray-700 leading-relaxed space-y-4">
            <p>${escapeHtml(book.description || 'Belum ada deskripsi untuk judul ini.')}</p>
          </div>
        </div>

        <div class="md:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-2xs">
          <div class="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
            <svg class="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <h2 class="text-xl font-serif font-bold text-slate-900">About the Author</h2>
          </div>
          
          <div class="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-600"></span>
                ${escapeHtml(book.author)}
              </h3>
              <p class="text-gray-600 mt-1 pl-3.5">
                ${escapeHtml(book.authorBio || 'Penulis buku di Penerbit Kandel.')}
              </p>
            </div>

            ${book.illustrator ? `
              <div class="pt-4 border-t border-gray-100">
                <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
                  Ilustrator: ${escapeHtml(book.illustrator)}
                </h3>
                <p class="text-gray-600 mt-1 pl-3.5">
                  ${escapeHtml(book.illustratorBio || 'Ilustrator visual dan perancang grafis.')}
                </p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchBookCover(frontUrl, backUrl, view) {
  const img = document.getElementById('book-main-cover');
  const badge = document.getElementById('cover-view-badge');
  const btnFront = document.getElementById('btn-cover-front');
  const btnBack = document.getElementById('btn-cover-back');

  if (!img) return;

  if (view === 'front') {
    img.src = frontUrl;
    if (badge) badge.textContent = 'Cover Depan';
    if (btnFront) {
      btnFront.className = 'flex-1 mr-2 py-2 px-3 text-xs font-bold rounded-lg border-2 border-amber-600 bg-amber-50 text-amber-800 transition flex items-center justify-center gap-1.5';
    }
    if (btnBack) {
      btnBack.className = 'flex-1 ml-2 py-2 px-3 text-xs font-bold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-1.5';
    }
  } else {
    img.src = backUrl;
    if (badge) badge.textContent = 'Cover Belakang';
    if (btnBack) {
      btnBack.className = 'flex-1 ml-2 py-2 px-3 text-xs font-bold rounded-lg border-2 border-amber-600 bg-amber-50 text-amber-800 transition flex items-center justify-center gap-1.5';
    }
    if (btnFront) {
      btnFront.className = 'flex-1 mr-2 py-2 px-3 text-xs font-bold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-1.5';
    }
  }
}

function openPdfPreviewModal(title, url) {
  let modal = document.getElementById('pdf-preview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'pdf-preview-modal';
    document.body.appendChild(modal);
  }

  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop';
  modal.innerHTML = `
    <div class="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
      <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <span class="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Sample Preview</span>
          <h3 class="text-base font-serif font-bold">${escapeHtml(title)}</h3>
        </div>
        <div class="flex items-center gap-2">
          <a href="${url}" download class="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-xs rounded text-white font-medium flex items-center gap-1">
            Download PDF
          </a>
          <button onclick="closePdfPreviewModal()" class="text-gray-400 hover:text-white p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>
      <div class="flex-grow bg-slate-100 flex items-center justify-center relative">
        <iframe src="${url}#toolbar=0" class="w-full h-full border-none" title="PDF Sample Preview">
          <div class="p-8 text-center text-gray-500">
            Browser Anda tidak mendukung preview PDF langsung. 
            <a href="${url}" target="_blank" class="text-amber-700 underline font-semibold">Klik di sini untuk mengunduh sample.</a>
          </div>
        </iframe>
      </div>
    </div>
  `;
}

function closePdfPreviewModal() {
  const modal = document.getElementById('pdf-preview-modal');
  if (modal) modal.remove();
}

// -------------------------------------------------------------
// 7. ADMIN AUTH & BOOK CRUD
// -------------------------------------------------------------
function updateAdminStatusBar() {
  const adminBar = document.getElementById('admin-status-bar');
  const loginNavBtn = document.getElementById('nav-login-btn');
  const isLoggedIn = store.isAdminLoggedIn();

  if (adminBar) {
    if (isLoggedIn) {
      adminBar.classList.remove('hidden');
    } else {
      adminBar.classList.add('hidden');
    }
  }

  if (loginNavBtn) {
    if (isLoggedIn) {
      loginNavBtn.innerHTML = `
        <span class="inline-flex items-center gap-1.5 text-amber-700 font-semibold">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          Admin
        </span>
      `;
    } else {
      loginNavBtn.textContent = 'Login';
    }
  }
}

function openLoginModal() {
  if (store.isAdminLoggedIn()) {
    if (confirm('Anda sedang login sebagai Admin Kandel. Apakah ingin logout?')) {
      store.logout();
      updateAdminStatusBar();
      alert('Anda telah logout dari mode admin.');
      window.location.hash = '#/home';
    } else {
      window.location.hash = '#/home';
    }
    return;
  }

  let modal = document.getElementById('login-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'login-modal';
    document.body.appendChild(modal);
  }

  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop';
  modal.innerHTML = `
    <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 animate-fadeIn relative">
      <button onclick="closeLoginModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div class="text-center mb-6">
        <img src="assets/kandel-logo.png" alt="Penerbit Kandel" class="h-10 mx-auto mb-3 object-contain" />
        <h3 class="text-xl font-serif font-bold text-slate-900">Login</h3>
      </div>

      <form id="login-form" onsubmit="handleAdminLogin(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Username</label>
          <input type="text" id="login-user" required placeholder="Username" class="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Password</label>
          <input type="password" id="login-pass" required placeholder="Password" class="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
        </div>
        <div class="pt-2">
          <button type="submit" class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow transition">
            Login
          </button>
        </div>
      </form>
    </div>
  `;
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.remove();
  if (window.location.hash === '#/login') {
    window.location.hash = '#/home';
  }
}

function handleAdminLogin(e) {
  e.preventDefault();
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();

  if (store.login(user, pass)) {
    closeLoginModal();
    updateAdminStatusBar();
    alert('Selamat datang Admin Kandel! Anda kini dapat mengedit redaksi halaman, mengelola Author & Ilustrator, serta postingan buku.');
    handleRoute();
  } else {
    alert('Username atau password admin salah!');
  }
}

function handleAdminLogout() {
  store.logout();
  updateAdminStatusBar();
  alert('Anda telah logout dari mode admin.');
  handleRoute();
}

function openAddBookModal() {
  openBookFormModal(null);
}

function openEditBookModal(bookId) {
  const book = store.getBookById(bookId);
  if (!book) return;
  openBookFormModal(book);
}

function openBookFormModal(book) {
  const isEdit = !!book;
  const masterAuthors = store.getAuthorsStats().all;
  const masterIllustrators = store.getIllustrators();

  let modal = document.getElementById('book-form-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'book-form-modal';
    document.body.appendChild(modal);
  }

  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop overflow-y-auto';
  modal.innerHTML = `
    <!-- Datalist Master Authors & Illustrators untuk Autocomplete & Dropdown -->
    <datalist id="registered-authors-list">
      ${masterAuthors.map(a => `<option value="${escapeHtml(a.name)}">${escapeHtml(a.name)}</option>`).join('')}
    </datalist>
    <datalist id="registered-illustrators-list">
      ${masterIllustrators.map(i => `<option value="${escapeHtml(i.name)}">${escapeHtml(i.name)}</option>`).join('')}
    </datalist>

    <div class="bg-white w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden my-4">
      <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
        <div>
          <h3 class="text-base font-serif font-bold">${isEdit ? 'Edit Postingan Buku' : 'Tambah Postingan Katalog Baru'}</h3>
          <p class="text-xs text-slate-300">Penerbit Kandel (kandel.co.id)</p>
        </div>
        <button onclick="closeBookFormModal()" class="text-gray-400 hover:text-white p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <form id="book-edit-form" onsubmit="handleBookFormSubmit(event, '${isEdit ? book.id : ''}')" class="p-6 space-y-5 overflow-y-auto flex-grow text-xs sm:text-sm">
        <div class="space-y-3">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Judul Utama Barang / Buku *</label>
            <input type="text" id="form-title" required value="${isEdit ? escapeHtml(book.title) : ''}" placeholder="Contoh: Menjelajah Rahasia Semesta" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Subtitel *</label>
            <input type="text" id="form-subtitle" required value="${isEdit ? escapeHtml(book.subtitle || '') : ''}" placeholder="Contoh: Panduan Komprehensif Kosmologi dan Fisika Modern" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
          </div>
        </div>

        <!-- Penulis & Ilustrator dengan Autocomplete & Dropdown Master Data -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-gray-700 mb-1 flex items-center justify-between">
              <span>Author (Penulis) *</span>
              <span class="text-[10px] text-amber-700 font-normal">Pilih dropdown atau tulis manual</span>
            </label>
            <input 
              type="text" 
              id="form-author" 
              list="registered-authors-list" 
              autocomplete="off" 
              required 
              value="${isEdit ? escapeHtml(book.author) : ''}" 
              oninput="handleAuthorNameInput(this.value)"
              placeholder="Ketik atau pilih nama penulis..." 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
            <div id="author-status-badge" class="mt-1 text-[11px]">
              ${isEdit ? '<span class="text-emerald-700 font-medium">✓ Menggunakan data author terdaftar</span>' : ''}
            </div>
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1 flex items-center justify-between">
              <span>Ilustrator (Opsional)</span>
              <span class="text-[10px] text-indigo-700 font-normal">Pilih dropdown atau tulis manual</span>
            </label>
            <input 
              type="text" 
              id="form-illustrator" 
              list="registered-illustrators-list" 
              autocomplete="off" 
              value="${isEdit ? escapeHtml(book.illustrator || '') : ''}" 
              oninput="handleIllustratorNameInput(this.value)"
              placeholder="Ketik atau pilih nama ilustrator..." 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
            <div id="illustrator-status-badge" class="mt-1 text-[11px]">
              ${isEdit && book.illustrator ? '<span class="text-emerald-700 font-medium">✓ Menggunakan data ilustrator terdaftar</span>' : ''}
            </div>
          </div>
        </div>

        <!-- Bio Singkat Author & Illustrator (Otomatis dari Master / Wajib jika baru) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-gray-700 mb-1 flex items-center justify-between">
              <span>About the Author (Bio Singkat)</span>
              <span id="label-author-bio-req" class="text-[10px] text-gray-500">Auto-fill jika ada di master</span>
            </label>
            <textarea id="form-author-bio" rows="2" placeholder="Biografi singkat penulis (otomatis terisi jika penulis sudah ada di master)..." class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">${isEdit ? escapeHtml(book.authorBio || '') : ''}</textarea>
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1 flex items-center justify-between">
              <span>About the Illustrator (Bio Singkat)</span>
              <span id="label-illustrator-bio-req" class="text-[10px] text-gray-500">Auto-fill jika ada di master</span>
            </label>
            <textarea id="form-illustrator-bio" rows="2" placeholder="Biografi singkat ilustrator (otomatis terisi jika ilustrator sudah ada di master)..." class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">${isEdit ? escapeHtml(book.illustratorBio || '') : ''}</textarea>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Release Date (dd mmm yyyy) *</label>
            <input type="text" id="form-release-date" required value="${isEdit ? escapeHtml(book.releaseDate || '') : '01 Mar 2026'}" placeholder="15 Jan 2026" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1">ISBN *</label>
            <input type="text" id="form-isbn" required value="${isEdit ? escapeHtml(book.isbn || '') : ''}" placeholder="978-602-5432-xx-x" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Cover (Jilid) *</label>
            <input type="text" id="form-cover-type" required value="${isEdit ? escapeHtml(book.coverType || 'Soft cover') : 'Soft cover'}" placeholder="Hardback / Soft cover" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Weight (gram)</label>
            <input type="number" id="form-weight" value="${isEdit ? book.weight || 450 : 450}" placeholder="450" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Dimension (PxLxT)</label>
            <input type="text" id="form-dimension" value="${isEdit ? escapeHtml(book.dimension || '') : '17 x 24 x 1.8 cm'}" placeholder="17 x 24 x 1.8 cm" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Pages (Halaman)</label>
            <input type="number" id="form-pages" value="${isEdit ? book.pages || 200 : 200}" placeholder="200" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Kategori</label>
            <select id="form-category" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white">
              <option value="Sains & Pendidikan" ${isEdit && book.category === 'Sains & Pendidikan' ? 'selected' : ''}>Sains & Pendidikan</option>
              <option value="Alat Peraga Edukasi" ${isEdit && book.category === 'Alat Peraga Edukasi' ? 'selected' : ''}>Alat Peraga Edukasi</option>
              <option value="Buku Cerita Anak" ${isEdit && book.category === 'Buku Cerita Anak' ? 'selected' : ''}>Buku Cerita Anak</option>
              <option value="Sains & Referensi" ${isEdit && book.category === 'Sains & Referensi' ? 'selected' : ''}>Sains & Referensi</option>
              <option value="Sejarah & Humaniora" ${isEdit && book.category === 'Sejarah & Humaniora' ? 'selected' : ''}>Sejarah & Humaniora</option>
            </select>
          </div>
        </div>

        <div class="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <span class="font-bold text-gray-700 block">Gambar Sampul & Berkas PDF:</span>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Cover Depan (URL atau pilih file) *</label>
              <input type="text" id="form-front-cover" required value="${isEdit ? book.frontCover : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80'}" placeholder="https://..." class="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs mb-1 focus:ring-2 focus:ring-amber-500 focus:outline-none">
              <input type="file" accept="image/*" onchange="handleFileToUrl(event, 'form-front-cover')" class="text-xs text-gray-500">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Cover Belakang (URL atau pilih file)</label>
              <input type="text" id="form-back-cover" value="${isEdit ? (book.backCover || '') : 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80'}" placeholder="https://..." class="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs mb-1 focus:ring-2 focus:ring-amber-500 focus:outline-none">
              <input type="file" accept="image/*" onchange="handleFileToUrl(event, 'form-back-cover')" class="text-xs text-gray-500">
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Sample PDF URL (contoh beberapa halaman)</label>
            <input type="text" id="form-sample-pdf" value="${isEdit ? (book.samplePdfUrl || '') : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}" placeholder="https://... atau berkas .pdf" class="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-semibold text-gray-700 mb-1">Description (Sinopsis / Tentang Judul) *</label>
          <textarea id="form-description" rows="4" required placeholder="Ceritakan isi naskah atau fungsi alat peraga secara menyeluruh..." class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">${isEdit ? escapeHtml(book.description || '') : ''}</textarea>
        </div>

        <div class="flex items-center gap-6 pt-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="form-is-new" ${isEdit ? (book.isNewRelease ? 'checked' : '') : 'checked'} class="w-4 h-4 text-amber-600 rounded">
            <span class="font-medium text-gray-700">Tampilkan di New Release (Home)</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="form-is-best" ${isEdit ? (book.isBestSeller ? 'checked' : '') : ''} class="w-4 h-4 text-amber-600 rounded">
            <span class="font-medium text-gray-700">Tampilkan di Best Seller (Home)</span>
          </label>
        </div>

        <div class="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button type="button" onclick="closeBookFormModal()" class="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition">
            Batal
          </button>
          <button type="submit" class="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg shadow transition">
            ${isEdit ? 'Simpan Perubahan' : 'Terbitkan Katalog'}
          </button>
        </div>
      </form>
    </div>
  `;
}

function closeBookFormModal() {
  const modal = document.getElementById('book-form-modal');
  if (modal) modal.remove();
}

function handleFileToUrl(event, targetInputId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const input = document.getElementById(targetInputId);
    if (input) {
      input.value = e.target.result;
    }
  };
  reader.readAsDataURL(file);
}

// Autocomplete & Auto-Fill Bio Master Author
function handleAuthorNameInput(nameVal) {
  const trimmed = nameVal.trim().toLowerCase();
  const bioField = document.getElementById('form-author-bio');
  const badge = document.getElementById('author-status-badge');
  const reqLabel = document.getElementById('label-author-bio-req');

  if (!trimmed) {
    if (badge) badge.innerHTML = '';
    if (reqLabel) reqLabel.innerHTML = 'Auto-fill jika ada di master';
    if (bioField) bioField.removeAttribute('required');
    return;
  }

  const masterAuthors = store.getAuthorsStats().all;
  const found = masterAuthors.find(a => a.name.trim().toLowerCase() === trimmed);

  if (found && found.bio) {
    if (bioField) {
      bioField.value = found.bio;
      bioField.removeAttribute('required');
    }
    if (badge) {
      badge.innerHTML = `<span class="text-emerald-700 font-semibold flex items-center gap-1">✓ Penulis terdaftar di Master Author. Bio singkat otomatis dimuat.</span>`;
    }
    if (reqLabel) {
      reqLabel.innerHTML = `<span class="text-emerald-700">Tersinkron Master</span>`;
    }
  } else {
    if (badge) {
      badge.innerHTML = `<span class="text-amber-800 font-semibold flex items-center gap-1">✦ Penulis Baru (Belum Terdaftar). Wajib lengkapi Bio Singkat untuk ditambahkan ke Master Author.</span>`;
    }
    if (reqLabel) {
      reqLabel.innerHTML = `<span class="text-rose-600 font-bold">* Wajib Diisi (Penulis Baru)</span>`;
    }
    if (bioField) {
      bioField.setAttribute('required', 'required');
    }
  }
}

// Autocomplete & Auto-Fill Bio Master Illustrator
function handleIllustratorNameInput(nameVal) {
  const trimmed = nameVal.trim().toLowerCase();
  const bioField = document.getElementById('form-illustrator-bio');
  const badge = document.getElementById('illustrator-status-badge');
  const reqLabel = document.getElementById('label-illustrator-bio-req');

  if (!trimmed) {
    if (badge) badge.innerHTML = '';
    if (reqLabel) reqLabel.innerHTML = 'Auto-fill jika ada di master';
    if (bioField) {
      bioField.value = '';
      bioField.removeAttribute('required');
    }
    return;
  }

  const masterIllustrators = store.getIllustrators();
  const found = masterIllustrators.find(i => i.name.trim().toLowerCase() === trimmed);

  if (found && found.bio) {
    if (bioField) {
      bioField.value = found.bio;
      bioField.removeAttribute('required');
    }
    if (badge) {
      badge.innerHTML = `<span class="text-emerald-700 font-semibold flex items-center gap-1">✓ Ilustrator terdaftar di Master. Bio singkat otomatis dimuat.</span>`;
    }
    if (reqLabel) {
      reqLabel.innerHTML = `<span class="text-emerald-700">Tersinkron Master</span>`;
    }
  } else {
    if (badge) {
      badge.innerHTML = `<span class="text-amber-800 font-semibold flex items-center gap-1">✦ Ilustrator Baru (Belum Terdaftar). Wajib lengkapi Bio Singkat untuk master.</span>`;
    }
    if (reqLabel) {
      reqLabel.innerHTML = `<span class="text-rose-600 font-bold">* Wajib Diisi (Ilustrator Baru)</span>`;
    }
    if (bioField) {
      bioField.setAttribute('required', 'required');
    }
  }
}

function handleBookFormSubmit(e, bookId) {
  e.preventDefault();

  const authorName = document.getElementById('form-author').value.trim();
  const authorBio = document.getElementById('form-author-bio').value.trim();
  const illustratorName = document.getElementById('form-illustrator').value.trim();
  const illustratorBio = document.getElementById('form-illustrator-bio').value.trim();

  // 1. Validasi: Jika Penulis belum ada di master, bio wajib diisi!
  const masterAuthors = store.getAuthorsStats().all;
  const isExistingAuthor = masterAuthors.some(a => a.name.trim().toLowerCase() === authorName.toLowerCase());
  if (!isExistingAuthor && !authorBio) {
    alert(`Penulis "${authorName}" belum pernah ditambahkan sebelumnya. Anda wajib mengisi "About the Author (Bio Singkat)"!`);
    document.getElementById('form-author-bio').focus();
    return;
  }

  // 2. Validasi: Jika Ilustrator diisi dan belum ada di master, bio wajib diisi!
  if (illustratorName) {
    const masterIllustrators = store.getIllustrators();
    const isExistingIllustrator = masterIllustrators.some(i => i.name.trim().toLowerCase() === illustratorName.toLowerCase());
    if (!isExistingIllustrator && !illustratorBio) {
      alert(`Ilustrator "${illustratorName}" belum pernah ditambahkan sebelumnya. Anda wajib mengisi "About the Illustrator (Bio Singkat)"!`);
      document.getElementById('form-illustrator-bio').focus();
      return;
    }
  }

  // 3. Simpan atau daftarkan otomatis ke Master Creators jika baru
  const creators = store.getCreators();
  if (!creators.some(c => c.name.trim().toLowerCase() === authorName.toLowerCase() && c.role === 'author')) {
    store.saveCreator({
      name: authorName,
      role: 'author',
      bio: authorBio,
      views: 0
    });
  }

  if (illustratorName && !creators.some(c => c.name.trim().toLowerCase() === illustratorName.toLowerCase() && c.role === 'illustrator')) {
    store.saveCreator({
      name: illustratorName,
      role: 'illustrator',
      bio: illustratorBio,
      views: 0
    });
  }

  // 4. Susun Data Buku
  const bookData = {
    title: document.getElementById('form-title').value.trim(),
    subtitle: document.getElementById('form-subtitle').value.trim(),
    author: authorName,
    illustrator: illustratorName,
    authorBio: authorBio,
    illustratorBio: illustratorBio,
    releaseDate: document.getElementById('form-release-date').value.trim(),
    isbn: document.getElementById('form-isbn').value.trim(),
    coverType: document.getElementById('form-cover-type').value.trim(),
    weight: Number(document.getElementById('form-weight').value) || 0,
    dimension: document.getElementById('form-dimension').value.trim(),
    pages: Number(document.getElementById('form-pages').value) || 0,
    category: document.getElementById('form-category').value,
    frontCover: document.getElementById('form-front-cover').value.trim(),
    backCover: document.getElementById('form-back-cover').value.trim() || document.getElementById('form-front-cover').value.trim(),
    samplePdfUrl: document.getElementById('form-sample-pdf').value.trim(),
    description: document.getElementById('form-description').value.trim(),
    isNewRelease: document.getElementById('form-is-new').checked,
    isBestSeller: document.getElementById('form-is-best').checked
  };

  if (bookId) {
    bookData.id = bookId;
  }

  store.saveBook(bookData);
  closeBookFormModal();

  alert(bookId ? 'Postingan berhasil diperbarui!' : 'Postingan buku baru berhasil ditambahkan dan data Author tersinkron ke Master!');

  if (bookId && currentPage === 'book') {
    renderBookDetailPage(bookId);
  } else if (currentPage === 'catalogue') {
    renderCataloguePage();
  } else {
    renderHomePage();
  }
}

function confirmDeleteBook(bookId) {
  const book = store.getBookById(bookId);
  if (!book) return;

  if (confirm(`Apakah Anda yakin ingin menghapus katalog "${book.title}"? Tindakan ini tidak dapat dibatalkan.`)) {
    store.deleteBook(bookId);
    alert('Katalog buku telah dihapus.');
    window.location.hash = '#/catalogue';
  }
}

function resetDataToDefault() {
  if (confirm('Kembalikan semua data katalog dan redaksi ke pengaturan awal standar?')) {
    store.resetToDefault();
    alert('Data katalog dan redaksi telah direset ke bawaan awal.');
    handleRoute();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// -------------------------------------------------------------
// DATABASE BACKUP & RESTORE ACTIONS
// -------------------------------------------------------------
function triggerBrowserDownload(filename, textContent, mimeType = 'application/json') {
  const blob = new Blob([textContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadDatabaseJSON() {
  const db = store.exportFullDatabase();
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `kandel-database-backup-${dateStr}.json`;
  triggerBrowserDownload(filename, JSON.stringify(db, null, 2), 'application/json');
}

function triggerRestoreDatabase() {
  const input = document.getElementById('db-restore-file-input');
  if (input) {
    input.value = '';
    input.click();
  }
}

function handleRestoreDatabaseFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (confirm(`Pulihkan database dari file "${file.name}"?\nIni akan memperbarui daftar buku, author, dan konten dengan data di file backup.`)) {
        store.importFullDatabase(data);
        alert('Database berhasil dipulihkan! Tampilan katalog akan diperbarui.');
        handleRoute();
      }
    } catch (err) {
      alert('Gagal memulihkan database: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function downloadUpdatedDataJs() {
  const content = store.generateDataJsContent();
  triggerBrowserDownload('data.js', content, 'application/javascript');
  alert('File "data.js" terbaru telah diunduh!\n\nUntuk menjadikannya permanen di GitHub:\n1. Pindahkan file "data.js" ini ke dalam folder "js/"\n2. Upload / commit ke GitHub agar seluruh pengunjung melihat update buku terbaru!');
}
