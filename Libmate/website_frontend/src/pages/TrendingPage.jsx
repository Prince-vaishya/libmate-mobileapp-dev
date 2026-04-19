// src/pages/TrendingPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFire, FaStar, FaBook, FaTrophy, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { trendingAPI } from '../services/api';

// Top 10 List Component (Sidebar) - No separate scroll
const Top10List = ({ books, period, onPeriodChange, loading }) => {
  const getMedalColor = (rank) => {
    switch(rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-[#C4895A]';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#EAE0D0] overflow-hidden">
      <div className="bg-gradient-to-r from-[#2C1F14] to-[#4A3728] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaTrophy className="text-[#C4895A] text-lg" />
            <h3 className="font-serif font-semibold text-white">Top 10</h3>
          </div>
          <div className="flex bg-white/10 rounded-full p-0.5">
            <button
              onClick={() => onPeriodChange('this_month')}
              className={`px-3 py-1 text-xs rounded-full transition ${
                period === 'this_month' ? 'bg-[#C4895A] text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => onPeriodChange('last_month')}
              className={`px-3 py-1 text-xs rounded-full transition ${
                period === 'last_month' ? 'bg-[#C4895A] text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              Last Month
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-[#EAE0D0]">
        {loading ? (
          <div className="p-4 text-center text-[#9A8478] text-sm">Loading...</div>
        ) : books.length === 0 ? (
          <div className="p-4 text-center text-[#9A8478] text-sm">No data available</div>
        ) : (
          books.map((book, index) => (
            <div 
              key={book.book_id}
              className="px-4 py-3 hover:bg-[#F3EDE3] cursor-pointer transition"
              onClick={() => window.location.href = `/book/${book.book_id}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${getMedalColor(index + 1)}`}>
                  {index + 1}
                </div>
                <div className="w-14 h-20 rounded-md bg-gradient-to-br from-[#2C1F14] to-[#4A3728] flex-shrink-0 overflow-hidden shadow-sm">
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaBook size={20} className="text-white/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#2C1F14] truncate text-sm">
                    {book.title}
                  </div>
                  <div className="text-xs text-[#9A8478] truncate mt-0.5">
                    {book.author}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <FaStar size={10} className="text-[#C4895A]" />
                      <span className="text-xs text-[#C4895A]">{book.avg_rating || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs text-[#9A8478]">
                      <FaFire size={10} />
                      <span>{book.borrow_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Book Card Component
const BookCard = ({ book }) => {
  const getStatusDisplay = () => {
    if (book.available_copies > 0) {
      return { label: 'Available', color: 'bg-[#4A7C59]/90' };
    }
    switch (book.status) {
      case 'reserved':
        return { label: 'Reserved', color: 'bg-[#D4A574]/90' };
      case 'checked_out':
        return { label: 'Checked Out', color: 'bg-[#B85450]/85' };
      default:
        return { label: 'Unavailable', color: 'bg-[#9A8478]/85' };
    }
  };
  
  const status = getStatusDisplay();
  
  return (
    <div 
      className="book-card cursor-pointer transition-all duration-300 hover:-translate-y-2"
      onClick={() => window.location.href = `/book/${book.book_id}`}
    >
      <div className="relative">
        <div className="book-cover w-full h-[280px] rounded-xl flex items-end p-4 relative overflow-hidden shadow-lg bg-gradient-to-br from-[#2C1F14] to-[#4A3728]">
          <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/15 to-transparent rounded-t-xl"></div>
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold z-10 ${status.color} text-white`}>
            {status.label}
          </span>
          {book.available_copies > 1 && (
            <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium z-10">
              {book.available_copies} copies
            </span>
          )}
        </div>
      </div>
      <div className="book-info pt-3 px-1">
        <div className="book-title-card font-serif text-sm font-semibold text-[#2C1F14] leading-tight line-clamp-2 mb-1">
          {book.title}
        </div>
        <div className="book-author-card text-xs text-[#9A8478] mb-2">
          by {book.author}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <FaStar size={12} className="text-[#C4895A]" />
            <span className="text-xs text-[#C4895A] font-medium">{book.avg_rating || 'N/A'}</span>
            <span className="text-xs text-[#9A8478]">({book.total_reviews || 0})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#9A8478]">
            <FaFire size={10} />
            <span>{book.total_borrow_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-[#EAE0D0] hover:bg-[#F3EDE3] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <FaArrowLeft size={14} />
      </button>
      
      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1 rounded-lg hover:bg-[#F3EDE3] transition">1</button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-lg transition ${
            page === currentPage ? 'bg-[#C4895A] text-white' : 'hover:bg-[#F3EDE3]'
          }`}
        >
          {page}
        </button>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-1 rounded-lg hover:bg-[#F3EDE3] transition">
            {totalPages}
          </button>
        </>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-[#EAE0D0] hover:bg-[#F3EDE3] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <FaArrowRight size={14} />
      </button>
    </div>
  );
};

const TrendingPage = () => {
  const [topPeriod, setTopPeriod] = useState('this_month');
  const [allBooks, setAllBooks] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  // Fetch books that have ever appeared in trending_books
  useEffect(() => {
    const fetchTrendingBooks = async () => {
      try {
        setLoadingAll(true);
        setError(null);
        // FIXED: Use getAllTrendingBooks instead of getTrendingBooks
        const data = await trendingAPI.getAllTrendingBooks(currentPage, 12);
        setAllBooks(data.books);
        setTotalPages(data.total_pages);
        setTotalBooks(data.total);
      } catch (error) {
        console.error('Error fetching books:', error);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoadingAll(false);
      }
    };
    
    fetchTrendingBooks();
  }, [currentPage]);

  // Fetch Top 10 based on selected period
  useEffect(() => {
    const fetchTop10 = async () => {
      try {
        setLoadingTop(true);
        // FIXED: Use getTopTrending instead of getTrending
        const data = await trendingAPI.getTopTrending(topPeriod);
        setTopBooks(data);
      } catch (error) {
        console.error('Error fetching top 10:', error);
        setTopBooks([]);
      } finally {
        setLoadingTop(false);
      }
    };
    
    fetchTop10();
  }, [topPeriod]);

  if (loadingAll && allBooks.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-[#EAE0D0] rounded w-64 mx-auto mb-4"></div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-[400px] bg-[#EAE0D0] rounded-xl"></div>
                  ))}
                </div>
              </div>
              <div className="w-85 h-[500px] bg-[#EAE0D0] rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <FaFire className="text-6xl text-[#C4895A]/30 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-[#2C1F14] mb-2">Oops! Something went wrong</h2>
            <p className="text-[#9A8478] mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#C4895A] text-white rounded-full hover:bg-[#D4A574] transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2C1F14] mb-3">
            Trending Books
          </h1>
          <p className="text-[#9A8478] max-w-2xl">
            Books that have made it to our trending lists
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Books Catalogue with Pagination */}
          <div className="flex-1">
            {allBooks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-[#EAE0D0]">
                <FaBook className="text-6xl text-[#C4895A]/30 mx-auto mb-4" />
                <p className="text-[#9A8478]">No trending books found.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 pt-4 text-sm text-[#9A8478]">
                  Showing {allBooks.length} of {totalBooks} trending books
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {allBooks.map((book) => (
                    <BookCard key={book.book_id} book={book} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>

          {/* Right Side - Top 10 Sidebar */}
          <div className="w-85 flex-shrink-0">
            <Top10List 
              books={topBooks} 
              period={topPeriod}
              onPeriodChange={setTopPeriod}
              loading={loadingTop}
            /> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;