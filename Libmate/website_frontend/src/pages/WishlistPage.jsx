import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaHeart, FaTrash } from 'react-icons/fa';

const WishlistPage = () => {
  const wishlist = [
    { id: 1, title: 'Clean Code', author: 'Robert C. Martin', rating: 4.8, available: true, coverColor: 'from-teal-600 to-teal-800' },
    { id: 2, title: 'Design Patterns', author: 'Erich Gamma', rating: 4.7, available: false, coverColor: 'from-orange-600 to-orange-800' },
    { id: 3, title: 'You Don\'t Know JS', author: 'Kyle Simpson', rating: 4.6, available: true, coverColor: 'from-cyan-600 to-cyan-800' },
    { id: 4, title: 'The Art of War', author: 'Sun Tzu', rating: 4.3, available: true, coverColor: 'from-stone-600 to-stone-800' },
    { id: 5, title: 'Thinking Fast & Slow', author: 'Daniel Kahneman', rating: 4.4, available: true, coverColor: 'from-rose-600 to-rose-800' },
  ];

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-40">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <FaHeart className="text-[#C4895A] text-2xl" />
            <h1 className="font-serif text-3xl font-bold text-[#2C1F14]">My Wishlist</h1>
          </div>
          <p className="text-[#9A8478] mt-1">Books you plan to read — {wishlist.length} books saved</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {wishlist.map((book) => (
            <div key={book.id} className="group relative">
              <div className={`bg-gradient-to-br ${book.coverColor} rounded-xl h-56 flex flex-col justify-end p-3 mb-3 group-hover:-translate-y-2 transition-all duration-300 shadow-md relative`}>
                <button className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                  <FaTrash size={12} />
                </button>
                <span className="absolute top-2 left-2 text-xs bg-white/20 px-2 py-0.5 rounded-full text-white">
                  {book.available ? 'Available' : 'Unavailable'}
                </span>
                <span className="text-white text-sm font-serif font-semibold">{book.title}</span>
                <span className="text-white/70 text-xs mt-1">{book.author.split(' ')[0]}</span>
              </div>
              <div className="text-sm font-semibold truncate text-[#2C1F14]">{book.title}</div>
              <div className="text-xs text-[#9A8478]">{book.author}</div>
              <div className="flex items-center gap-1 mt-1">
                <FaStar className="text-[#C4895A] text-xs" />
                <span className="text-xs">{book.rating}</span>
              </div>
            </div>
          ))}
        </div>

        {wishlist.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❤️</div>
            <p className="text-[#9A8478] mb-4">Your wishlist is empty</p>
            <Link to="/catalogue" className="inline-block px-6 py-2 bg-[#2C1F14] text-white rounded-full hover:bg-[#4A3728] transition">
              Browse Books
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;