import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';

const NewArrivalsPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const newBooks = [
        { id: 1, title: 'The Creative Act', author: 'Rick Rubin', rating: 4.6, available: true, addedDate: 'Mar 25, 2025', coverColor: 'from-orange-600 to-orange-800' },
        { id: 2, title: 'Building a Second Brain', author: 'Tiago Forte', rating: 4.5, available: true, addedDate: 'Mar 22, 2025', coverColor: 'from-cyan-600 to-cyan-800' },
        { id: 3, title: 'The Future of AI', author: 'Geoffrey Hinton', rating: 4.8, available: false, addedDate: 'Mar 20, 2025', coverColor: 'from-indigo-600 to-indigo-800' },
        { id: 4, title: 'Ultralearning', author: 'Scott Young', rating: 4.4, available: true, addedDate: 'Mar 18, 2025', coverColor: 'from-pink-600 to-pink-800' },
        { id: 5, title: 'The Code Breaker', author: 'Walter Isaacson', rating: 4.7, available: true, addedDate: 'Mar 15, 2025', coverColor: 'from-lime-600 to-lime-800' },
        { id: 6, title: 'Four Thousand Weeks', author: 'Oliver Burkeman', rating: 4.5, available: true, addedDate: 'Mar 12, 2025', coverColor: 'from-fuchsia-600 to-fuchsia-800' },
        { id: 7, title: 'The Power of Regret', author: 'Daniel Pink', rating: 4.3, available: true, addedDate: 'Mar 10, 2025', coverColor: 'from-amber-600 to-amber-800' },
        { id: 8, title: 'Noise', author: 'Daniel Kahneman', rating: 4.4, available: true, addedDate: 'Mar 8, 2025', coverColor: 'from-slate-600 to-slate-800' },
      ];
      setBooks(newBooks);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-40">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-[#F3EDE3] rounded-full transition">
            <FaArrowLeft className="text-[#4A3728]" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#2C1F14]">New Arrivals</h1>
            <p className="text-[#9A8478] mt-1">Recently added to the collection</p>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-5">
          <p className="text-sm text-[#9A8478]">Showing {books.length} new books</p>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#C4895A] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {books.map((book) => (
              <Link key={book.id} to={`/book/${book.id}`} className="group">
                <div className={`bg-gradient-to-br ${book.coverColor} rounded-xl h-52 flex flex-col justify-end p-3 mb-2 group-hover:-translate-y-1 transition-all shadow-md relative`}>
                  <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full bg-white/20 text-white flex items-center gap-1">
                    <FaCalendarAlt size={8} />
                    New
                  </span>
                  <span className={`absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded-full ${book.available ? 'bg-green-600/80 text-white' : 'bg-gray-600/80 text-white'}`}>
                    {book.available ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="text-white text-sm font-serif font-semibold">{book.title}</span>
                  <span className="text-white/70 text-xs mt-1">{book.author}</span>
                </div>
                <div className="text-sm font-semibold truncate text-[#2C1F14]">{book.title}</div>
                <div className="text-xs text-[#9A8478]">{book.author}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-[#C4895A] text-xs" />
                    <span className="text-xs">{book.rating}</span>
                  </div>
                  <span className="text-xs text-[#9A8478]">Added {book.addedDate}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewArrivalsPage;