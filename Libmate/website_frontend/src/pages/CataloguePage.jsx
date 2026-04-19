import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaStar, FaThLarge, FaList, FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import { mockBooks, searchBooks } from '../data/mockData';

// ============================================================
// FILTER CONFIGURATION
// ============================================================
const filterConfig = {
  genres: [
    { id: 'selfHelp', name: 'Self-Help', displayName: 'Self-Help', count: 14 },
    { id: 'psychology', name: 'Psychology', displayName: 'Psychology', count: 9 },
    { id: 'productivity', name: 'Productivity', displayName: 'Productivity', count: 7 },
    { id: 'computing', name: 'Computing', displayName: 'Computing', count: 5 },
  ],
  languages: [
    { code: 'English', name: 'English', count: 58 },
    { code: 'Nepali', name: 'Nepali', count: 4 },
  ],
  availability: { id: 'available', name: 'Available only' }
};

const getInitialActivePills = () => {
  const initial = { all: true };
  filterConfig.genres.forEach(genre => {
    initial[genre.id] = false;
  });
  initial.available = false;
  return initial;
};

const CataloguePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [sortedBooks, setSortedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('relevance');
  const booksPerPage = 12;
  
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    language: 'English',
    yearFrom: '',
    yearTo: ''
  });
  
  const [activePills, setActivePills] = useState(getInitialActivePills());

  // Load books from mockData
  useEffect(() => {
    setBooks(mockBooks);
    setLoading(false);
  }, []);

  // Apply filters
  useEffect(() => {
    let results = [...books];
    
    if (filters.search) {
      results = searchBooks(filters.search);
    }
    
    if (!activePills.all) {
      const selectedGenres = filterConfig.genres
        .filter(genre => activePills[genre.id])
        .map(genre => genre.name);
      
      if (selectedGenres.length > 0) {
        results = results.filter(b => selectedGenres.includes(b.genre));
      }
    }
    
    if (activePills.available) {
      results = results.filter(b => b.available_copies > 0);
    }
    
    if (filters.language) {
      results = results.filter(b => b.language === filters.language);
    }
    
    if (filters.yearFrom) {
      results = results.filter(b => b.published_year >= parseInt(filters.yearFrom));
    }
    if (filters.yearTo) {
      results = results.filter(b => b.published_year <= parseInt(filters.yearTo));
    }
    
    setFilteredBooks(results);
    setCurrentPage(1);
  }, [books, filters, activePills]);

  // Apply sorting
  useEffect(() => {
    let sorted = [...filteredBooks];
    
    switch (sortOption) {
      case 'rating':
        sorted.sort((a, b) => b.avg_rating - a.avg_rating);
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        sorted.sort((a, b) => b.published_year - a.published_year);
        break;
      case 'popular':
        sorted.sort((a, b) => b.total_borrow_count - a.total_borrow_count);
        break;
      default:
        break;
    }
    
    setSortedBooks(sorted);
  }, [filteredBooks, sortOption]);

  // Handle URL params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setFilters(prev => ({ ...prev, search: q }));
    }
    
    const genre = searchParams.get('genre');
    if (genre) {
      const newActivePills = { all: false, available: false };
      filterConfig.genres.forEach(g => {
        newActivePills[g.id] = g.name === genre;
      });
      setActivePills(newActivePills);
    }
  }, [searchParams]);

  const handlePillClick = (pillId) => {
    if (pillId === 'all') {
      const newActivePills = { all: true };
      filterConfig.genres.forEach(genre => {
        newActivePills[genre.id] = false;
      });
      newActivePills.available = false;
      setActivePills(newActivePills);
    } else if (pillId === 'available') {
      setActivePills(prev => ({ ...prev, available: !prev.available, all: false }));
    } else {
      setActivePills(prev => ({
        ...prev,
        all: false,
        [pillId]: !prev[pillId]
      }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      language: 'English',
      yearFrom: '',
      yearTo: ''
    });
    const newActivePills = { all: true };
    filterConfig.genres.forEach(genre => {
      newActivePills[genre.id] = false;
    });
    newActivePills.available = false;
    setActivePills(newActivePills);
    setSearchParams({});
    setSortOption('relevance');
  };

  // Pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);

  // Grid Card - Taller & Slimmer
  const BookGridCard = ({ book }) => (
    <div className="book-card cursor-pointer transition-transform duration-250 hover:-translate-y-1.5" onClick={() => window.location.href = `/book/${book.book_id}`}>
      <div className="book-cover w-full h-[280px] rounded-[12px] flex items-end p-3 relative overflow-hidden shadow-md transition-shadow duration-250 hover:shadow-xl" style={{ background: book.cover_color }}>
        <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/15 to-transparent rounded-t-[12px]"></div>
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold z-10 ${book.available_copies > 0 ? 'bg-[#4A7C59]/90 text-white' : 'bg-[#B85450]/85 text-white'}`}>
          {book.available_copies > 0 ? 'Available' : 'Unavailable'}
        </span>
        <div className="book-cover-title font-serif text-xs text-white/95 font-semibold leading-tight drop-shadow-md z-10">
          {book.title}
        </div>
      </div>
      <div className="book-info pt-2.5 px-0.5">
        <div className="book-title-card font-serif text-[13px] font-semibold text-[#2C1F14] leading-tight line-clamp-2 mb-0.5">
          {book.title}
        </div>
        <div className="book-author-card text-[11.5px] text-[#9A8478] mb-1">
          {book.author}
        </div>
        <div className="book-meta flex items-center gap-1.5 flex-wrap">
          <div className="book-rating flex items-center gap-0.5 text-[11.5px] text-[#C4895A] font-medium">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {book.avg_rating}
          </div>
          <span className="book-genre-tag text-[10.5px] px-1.5 py-0.5 bg-[#EAE0D0] rounded-full text-[#6B4F40]">
            {book.genre}
          </span>
        </div>
      </div>
    </div>
  );

  // List Card - Minimal padding, consistent buttons, clean availability
  const BookListCard = ({ book }) => (
    <div className="book-list-item flex gap-4 p-2.5 bg-[#F3EDE3] border border-[#EAE0D0] rounded-[12px] cursor-pointer hover:shadow-md hover:border-[#C4895A] transition-all" onClick={() => window.location.href = `/book/${book.book_id}`}>
      {/* Cover Image */}
      <div className="list-cover w-[100px] h-[150px] rounded-lg flex items-end p-2 overflow-hidden relative shadow-md flex-shrink-0" style={{ background: book.cover_color }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg"></div>
        <span className="list-cover-title font-serif text-[10px] text-white/90 font-semibold leading-tight z-10">{book.title}</span>
      </div>
      
      <div className="list-info flex-1 min-w-0">
        <div className="list-title font-serif text-lg font-bold text-[#2C1F14] mb-1 truncate">{book.title}</div>
        <div className="list-author text-sm text-[#9A8478] mb-2">{book.author} · {book.published_year}</div>
        <div className="list-desc text-sm text-[#4A3728] leading-relaxed line-clamp-2 mb-3">{book.description}</div>
        <div className="list-meta flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="book-rating flex items-center gap-0.5 text-xs text-[#C4895A]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {book.avg_rating}
            </div>
            <span className="text-xs text-[#9A8478]">({book.total_reviews || 0})</span>
          </div>
          <span className="book-genre-tag text-[10.5px] px-1.5 py-0.5 bg-[#EAE0D0] rounded-full text-[#6B4F40]">{book.genre}</span>
          <span className="text-xs text-[#9A8478]">{book.total_borrow_count} borrows</span>
          {/* Simple availability text - just "Available" or "Unavailable" */}
          <span className={`text-xs font-medium ${book.available_copies > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {book.available_copies > 0 ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
      
      {/* Two Buttons - Consistent rounded corners */}
      <div className="list-action flex flex-col gap-2 justify-center flex-shrink-0">
        <button 
          className="px-5 py-2 text-sm font-medium rounded-lg border border-[#2C1F14] bg-[#2C1F14] text-white hover:bg-[#4A3728] hover:border-[#4A3728] transition whitespace-nowrap"
          onClick={(e) => {
            e.stopPropagation();
            // Handle borrow/reserve action
          }}
        >
          {book.available_copies > 0 ? 'Borrow' : 'Reserve'}
        </button>
        <button 
          className="px-5 py-2 text-sm font-medium rounded-lg border border-[#EAE0D0] bg-white text-[#4A3728] hover:border-[#C4895A] hover:text-[#C4895A] transition whitespace-nowrap"
          onClick={(e) => {
            e.stopPropagation();
            // Handle wishlist action
          }}
        >
          Add to Wishlist
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-40">
        <div className="results-layout grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Filter Sidebar */}
          <aside className="filter-sidebar sticky top-24">
            <div className="filter-block bg-[#F3EDE3] border border-[#EAE0D0] rounded-[12px] p-4 mb-3">
              <div className="filter-block-title text-xs font-bold text-[#2C1F14] uppercase tracking-wide mb-3">
                Availability
              </div>
              <label className="check-row flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={activePills.available} onChange={() => handlePillClick('available')} className="accent-[#C4895A]" />
                <label className="text-[13px] text-[#4A3728] cursor-pointer flex-1">Available only</label>
              </label>
            </div>

            <div className="filter-block bg-[#F3EDE3] border border-[#EAE0D0] rounded-[12px] p-4 mb-3">
              <div className="filter-block-title text-xs font-bold text-[#2C1F14] uppercase tracking-wide mb-3">Genre</div>
              {filterConfig.genres.map((genre) => (
                <label key={genre.id} className="check-row flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={activePills[genre.id]} onChange={() => handlePillClick(genre.id)} className="accent-[#C4895A]" />
                  <label className="text-[13px] text-[#4A3728] cursor-pointer flex-1">{genre.displayName}</label>
                  <span className="text-[11.5px] text-[#9A8478]">{genre.count}</span>
                </label>
              ))}
            </div>

            <div className="filter-block bg-[#F3EDE3] border border-[#EAE0D0] rounded-[12px] p-4 mb-3">
              <div className="filter-block-title text-xs font-bold text-[#2C1F14] uppercase tracking-wide mb-3">Language</div>
              {filterConfig.languages.map((lang) => (
                <label key={lang.code} className="check-row flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={filters.language === lang.code} onChange={() => setFilters(prev => ({ ...prev, language: prev.language === lang.code ? '' : lang.code }))} className="accent-[#C4895A]" />
                  <label className="text-[13px] text-[#4A3728] cursor-pointer flex-1">{lang.name}</label>
                  <span className="text-[11.5px] text-[#9A8478]">{lang.count}</span>
                </label>
              ))}
            </div>

            <div className="filter-block bg-[#F3EDE3] border border-[#EAE0D0] rounded-[12px] p-4 mb-3">
              <div className="filter-block-title text-xs font-bold text-[#2C1F14] uppercase tracking-wide mb-3">Published Year</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-[#9A8478] mb-1">From</div>
                  <input type="number" placeholder="2000" value={filters.yearFrom} onChange={(e) => setFilters(prev => ({ ...prev, yearFrom: e.target.value }))} className="w-full px-2 py-1.5 text-xs border border-[#EAE0D0] rounded-lg bg-white" />
                </div>
                <div>
                  <div className="text-[10px] text-[#9A8478] mb-1">To</div>
                  <input type="number" placeholder="2026" value={filters.yearTo} onChange={(e) => setFilters(prev => ({ ...prev, yearTo: e.target.value }))} className="w-full px-2 py-1.5 text-xs border border-[#EAE0D0] rounded-lg bg-white" />
                </div>
              </div>
            </div>

            <button onClick={clearAllFilters} className="btn btn-ghost w-full py-2 text-sm border border-[#EAE0D0] rounded-full hover:border-[#C4895A] hover:text-[#C4895A] transition">
              Clear all filters
            </button>
          </aside>

          {/* Results Main */}
          <div>
            <div className="results-header flex justify-between items-center mb-5 flex-wrap gap-3">
              <div className="results-count text-sm text-[#9A8478]">{sortedBooks.length} results</div>
              <div className="results-controls flex items-center gap-3">
                <div className="view-toggle flex gap-1 p-1 bg-[#F3EDE3] rounded-lg border border-[#EAE0D0]">
                  <button onClick={() => setViewMode('grid')} className={`view-btn w-7 h-7 rounded-md flex items-center justify-center transition ${viewMode === 'grid' ? 'bg-[#2C1F14] text-white' : 'text-[#9A8478] hover:bg-[#EAE0D0]'}`}>
                    <FaThLarge size={12} />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`view-btn w-7 h-7 rounded-md flex items-center justify-center transition ${viewMode === 'list' ? 'bg-[#2C1F14] text-white' : 'text-[#9A8478] hover:bg-[#EAE0D0]'}`}>
                    <FaList size={12} />
                  </button>
                </div>
                <select 
                  className="sort-sel px-3 py-1.5 text-xs border border-[#EAE0D0] rounded-lg bg-[#F3EDE3] text-[#2C1F14] outline-none cursor-pointer"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="rating">Highest Rated</option>
                  <option value="title">Title A–Z</option>
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Borrowed</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#C4895A] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : sortedBooks.length === 0 ? (
              <div className="empty-state text-center py-20">
                <div className="empty-icon text-6xl mb-4">🔍</div>
                <div className="empty-title font-serif text-2xl font-bold text-[#2C1F14] mb-2">No books found</div>
                <div className="empty-sub text-sm text-[#9A8478] max-w-md mx-auto mb-6">We couldn't find any books matching your search. Try different keywords or request this book.</div>
                <div className="flex gap-3 justify-center">
                  <button onClick={clearAllFilters} className="btn btn-ghost px-5 py-2 border border-[#EAE0D0] rounded-full hover:border-[#C4895A] transition">Clear search</button>
                  <button className="btn btn-accent px-5 py-2 bg-[#C4895A] text-white rounded-full hover:bg-[#D4A574] transition">Request this book</button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="books-grid-result grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {currentBooks.map(book => <BookGridCard key={book.book_id} book={book} />)}
              </div>
            ) : (
              <div className="books-list-result flex flex-col gap-3">
                {currentBooks.map(book => <BookListCard key={book.book_id} book={book} />)}
              </div>
            )}

            {sortedBooks.length > 0 && (
              <div className="pagination flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="page-btn w-9 h-9 rounded-lg border border-[#EAE0D0] flex items-center justify-center hover:border-[#C4895A] disabled:opacity-50 disabled:cursor-not-allowed">
                  <FaArrowLeft size={12} />
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button key={i} onClick={() => setCurrentPage(pageNum)} className={`page-btn w-9 h-9 rounded-lg border transition ${currentPage === pageNum ? 'bg-[#2C1F14] border-[#2C1F14] text-white' : 'border-[#EAE0D0] hover:border-[#C4895A]'}`}>
                      {pageNum}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="page-btn w-9 h-9 rounded-lg border border-[#EAE0D0] flex items-center justify-center hover:border-[#C4895A] disabled:opacity-50 disabled:cursor-not-allowed">
                  <FaArrowRight size={12} />
                </button>
              </div>
            )}

            <div className="request-prompt mt-8 p-5 bg-[#F3EDE3] border border-[#EAE0D0] rounded-[12px] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <div className="text-sm font-medium text-[#2C1F14] mb-1">Can't find what you're looking for?</div>
                <div className="text-xs text-[#9A8478]">Request a book and we'll try to add it to the library.</div>
              </div>
              <button className="btn btn-ghost btn-sm px-4 py-2 text-sm border border-[#EAE0D0] rounded-full hover:border-[#C4895A] hover:text-[#C4895A] transition">
                Request a Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CataloguePage;