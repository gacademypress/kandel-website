/**
 * Store & Data Persistence Layer for Penerbit Kandel
 */
const STORAGE_KEY = 'kandel_books_catalog_v1';
const CONTENT_KEY = 'kandel_site_content_v1';
const CREATORS_KEY = 'kandel_creators_v1';
const AUTH_KEY = 'kandel_admin_logged_in';

class KandelStore {
  constructor() {
    this.books = [];
    this.siteContent = {};
    this.creators = [];
    this.init();
  }

  init() {
    try {
      // 1. Books
      const storedBooks = localStorage.getItem(STORAGE_KEY);
      if (storedBooks) {
        this.books = JSON.parse(storedBooks);
      } else {
        this.books = [...INITIAL_BOOKS];
        this.persistBooks();
      }

      // 2. Site Editorial Content (Home, Join Us, About Us)
      const storedContent = localStorage.getItem(CONTENT_KEY);
      if (storedContent) {
        // Auto-migration: replace any old 'kandel.id' references to 'kandel.co.id'
        const updatedContentStr = storedContent.replace(/kandel\.id/g, 'kandel.co.id');
        this.siteContent = JSON.parse(updatedContentStr);
        if (updatedContentStr !== storedContent) {
          this.persistContent();
        }
      } else {
        this.siteContent = JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT));
        this.persistContent();
      }

      // 3. Creators (Authors & Illustrators)
      const storedCreators = localStorage.getItem(CREATORS_KEY);
      if (storedCreators) {
        this.creators = JSON.parse(storedCreators);
      } else {
        this.creators = [...INITIAL_CUSTOM_CREATORS];
        this.persistCreators();
      }
    } catch (e) {
      console.warn("Storage access issue, fallback to memory:", e);
      this.books = [...INITIAL_BOOKS];
      this.siteContent = JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT));
      this.creators = [...INITIAL_CUSTOM_CREATORS];
    }
  }

  persistBooks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.books));
    } catch (e) {
      console.error("Failed to persist books:", e);
    }
  }

  persistContent() {
    try {
      localStorage.setItem(CONTENT_KEY, JSON.stringify(this.siteContent));
    } catch (e) {
      console.error("Failed to persist site content:", e);
    }
  }

  persistCreators() {
    try {
      localStorage.setItem(CREATORS_KEY, JSON.stringify(this.creators));
    } catch (e) {
      console.error("Failed to persist creators:", e);
    }
  }

  // -------------------------------------------------------------
  // EDITORIAL SITE CONTENT (Home, Join Us, About Us)
  // -------------------------------------------------------------
  getSiteContent(page) {
    if (!this.siteContent[page]) {
      this.siteContent[page] = DEFAULT_SITE_CONTENT[page] || {};
    }
    return this.siteContent[page];
  }

  updateSiteContent(page, newContent) {
    this.siteContent[page] = {
      ...this.getSiteContent(page),
      ...newContent
    };
    this.persistContent();
    return true;
  }

  // -------------------------------------------------------------
  // CREATORS CRUD (Authors & Illustrators)
  // -------------------------------------------------------------
  getCreators(role = 'all') {
    if (role === 'all') return [...this.creators];
    return this.creators.filter(c => c.role === role);
  }

  getCreatorById(id) {
    return this.creators.find(c => String(c.id) === String(id));
  }

  saveCreator(creatorData) {
    if (creatorData.id) {
      // Edit
      const index = this.creators.findIndex(c => String(c.id) === String(creatorData.id));
      if (index !== -1) {
        this.creators[index] = {
          ...this.creators[index],
          ...creatorData
        };
      } else {
        this.creators.unshift(creatorData);
      }
    } else {
      // Add new
      const newCreator = {
        ...creatorData,
        id: 'creator-' + Date.now().toString(36),
        views: Number(creatorData.views) || 0
      };
      this.creators.unshift(newCreator);
    }
    this.persistCreators();
    return true;
  }

  deleteCreator(id) {
    this.creators = this.creators.filter(c => String(c.id) !== String(id));
    this.persistCreators();
    return true;
  }

  // -------------------------------------------------------------
  // BOOKS CRUD & VIEWS
  // -------------------------------------------------------------
  getBooks() {
    return [...this.books];
  }

  getBookById(id) {
    return this.books.find(b => String(b.id) === String(id));
  }

  saveBook(bookData) {
    if (bookData.id) {
      const index = this.books.findIndex(b => String(b.id) === String(bookData.id));
      if (index !== -1) {
        this.books[index] = {
          ...this.books[index],
          ...bookData,
          views: Number(this.books[index].views || 0)
        };
      } else {
        this.books.unshift(bookData);
      }
    } else {
      const newBook = {
        ...bookData,
        id: 'kdl-' + Date.now().toString(36),
        views: 0
      };
      this.books.unshift(newBook);
    }
    this.persistBooks();
    return true;
  }

  deleteBook(id) {
    this.books = this.books.filter(b => String(b.id) !== String(id));
    this.persistBooks();
    return true;
  }

  incrementViews(id) {
    const book = this.books.find(b => String(b.id) === String(id));
    if (book) {
      book.views = (Number(book.views) || 0) + 1;
      this.persistBooks();

      // Update creator views if author exists in creators
      const creator = this.creators.find(c => c.name.toLowerCase() === book.author.toLowerCase());
      if (creator) {
        creator.views = (Number(creator.views) || 0) + 1;
        this.persistCreators();
      }
      return book.views;
    }
    return 0;
  }

  resetToDefault() {
    this.books = [...INITIAL_BOOKS];
    this.siteContent = JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT));
    this.creators = [...INITIAL_CUSTOM_CREATORS];
    this.persistBooks();
    this.persistContent();
    this.persistCreators();
  }

  // Get New Releases (up to 10 books)
  getNewReleases() {
    return this.books.filter(b => b.isNewRelease).slice(0, 10);
  }

  // Get Best Sellers (up to 10 books)
  getBestSellers() {
    return this.books
      .filter(b => b.isBestSeller)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);
  }

  // Sorting
  sortBooks(items, criteria = 'new-old') {
    const sorted = [...items];
    switch (criteria) {
      case 'az':
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'id', { sensitivity: 'base' }));
      case 'za':
        return sorted.sort((a, b) => b.title.localeCompare(a.title, 'id', { sensitivity: 'base' }));
      case 'most-viewed':
        return sorted.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
      case 'new-old':
      default:
        return sorted.sort((a, b) => {
          const dateA = new Date(a.releaseDate).getTime() || 0;
          const dateB = new Date(b.releaseDate).getTime() || 0;
          if (dateA !== dateB) return dateB - dateA;
          return b.id.localeCompare(a.id);
        });
    }
  }

  // -------------------------------------------------------------
  // AUTHORS & ILLUSTRATORS STATS (COMBINED DYNAMIC)
  // -------------------------------------------------------------
  getAuthorsStats() {
    const authorMap = {};

    // 1. Inisialisasi dari daftar creators dengan role 'author'
    this.creators.filter(c => c.role === 'author').forEach(c => {
      authorMap[c.name] = {
        id: c.id,
        name: c.name,
        bio: c.bio,
        totalViews: Number(c.views || 0),
        books: [],
        isCustom: true
      };
    });

    // 2. Agregasi dari buku
    this.books.forEach(book => {
      const author = book.author || 'Anonim';
      if (!authorMap[author]) {
        authorMap[author] = {
          id: 'author-' + author.replace(/\s+/g, '-').toLowerCase(),
          name: author,
          bio: book.authorBio || 'Penulis buku terbitan Penerbit Kandel.',
          totalViews: 0,
          books: [],
          isCustom: false
        };
      }
      authorMap[author].totalViews += Number(book.views || 0);
      authorMap[author].books.push({
        id: book.id,
        title: book.title,
        cover: book.frontCover,
        category: book.category
      });
      if (book.authorBio && book.authorBio.length > authorMap[author].bio.length) {
        authorMap[author].bio = book.authorBio;
      }
    });

    const authorsList = Object.values(authorMap);
    authorsList.sort((a, b) => b.totalViews - a.totalViews);

    return {
      top3: authorsList.slice(0, 3),
      all: authorsList
    };
  }

  getIllustrators() {
    const illustratorMap = {};

    // 1. Inisialisasi dari daftar creators dengan role 'illustrator'
    this.creators.filter(c => c.role === 'illustrator').forEach(c => {
      illustratorMap[c.name] = {
        id: c.id,
        name: c.name,
        bio: c.bio,
        totalViews: Number(c.views || 0),
        books: [],
        isCustom: true
      };
    });

    // 2. Agregasi dari buku
    this.books.forEach(book => {
      if (book.illustrator && book.illustrator.trim() !== '') {
        const ill = book.illustrator.trim();
        if (!illustratorMap[ill]) {
          illustratorMap[ill] = {
            id: 'ill-' + ill.replace(/\s+/g, '-').toLowerCase(),
            name: ill,
            bio: book.illustratorBio || 'Ilustrator visual buku dan media peraga Penerbit Kandel.',
            totalViews: 0,
            books: [],
            isCustom: false
          };
        }
        illustratorMap[ill].books.push({
          id: book.id,
          title: book.title,
          cover: book.frontCover,
          author: book.author
        });
        illustratorMap[ill].totalViews += Number(book.views || 0);
        if (book.illustratorBio && book.illustratorBio.length > illustratorMap[ill].bio.length) {
          illustratorMap[ill].bio = book.illustratorBio;
        }
      }
    });

    return Object.values(illustratorMap);
  }

  // -------------------------------------------------------------
  // ADMIN AUTH
  // -------------------------------------------------------------
  isAdminLoggedIn() {
    return localStorage.getItem(AUTH_KEY) === 'true';
  }

  login(user, pass) {
    if (user === 'admin' && pass === 'adminkandel123!') {
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem(AUTH_KEY);
  }

  // -------------------------------------------------------------
  // BACKUP & DATABASE EXPORT / IMPORT
  // -------------------------------------------------------------
  exportFullDatabase() {
    return {
      exportedAt: new Date().toISOString(),
      generator: 'Penerbit Kandel Website Database Backup',
      domain: 'kandel.co.id',
      books: this.books,
      creators: this.creators,
      siteContent: this.siteContent
    };
  }

  importFullDatabase(data) {
    if (!data || !Array.isArray(data.books)) {
      throw new Error("Format file database tidak valid! File harus berisi array daftar buku.");
    }
    this.books = data.books;
    this.persistBooks();

    if (data.creators && Array.isArray(data.creators)) {
      this.creators = data.creators;
      this.persistCreators();
    }

    if (data.siteContent && typeof data.siteContent === 'object') {
      this.siteContent = data.siteContent;
      this.persistContent();
    }
    return true;
  }

  generateDataJsContent() {
    return `/**
 * Seed Data for Penerbit Kandel (kandel.co.id)
 * Generated on: ${new Date().toLocaleString('id-ID')}
 * File ini berfungsi sebagai master database bawaan website.
 */

const INITIAL_BOOKS = ${JSON.stringify(this.books, null, 2)};

const KANDEL_INFO = ${JSON.stringify(KANDEL_INFO, null, 2)};

const DEFAULT_SITE_CONTENT = ${JSON.stringify(this.siteContent, null, 2)};

const INITIAL_CUSTOM_CREATORS = ${JSON.stringify(this.creators, null, 2)};
`;
  }
}

window.store = new KandelStore();
