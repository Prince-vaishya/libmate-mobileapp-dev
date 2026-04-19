import client from './client';

// Profile
export const updateProfile = (data) => client.put('/users/me', data);

// Borrowings
export const getMyBorrowings = () => client.get('/users/me/borrowings');
export const getMyHistory    = () => client.get('/users/me/history');

// Wishlist
export const getMyWishlist      = ()         => client.get('/users/me/wishlist');
export const addToWishlist      = (bookId)   => client.post(`/users/me/wishlist/${bookId}`);
export const removeFromWishlist = (bookId)   => client.delete(`/users/me/wishlist/${bookId}`);

// Notifications
export const getNotifications          = ()    => client.get('/users/me/notifications');
export const markAllNotificationsRead  = ()    => client.put('/users/me/notifications/read-all');
export const markNotificationRead      = (id)  => client.put(`/users/me/notifications/${id}/read`);

// Reservations
export const getMyReservations  = ()       => client.get('/users/me/reservations');
export const createReservation  = (bookId) => client.post('/users/me/reservations', { book_id: bookId });

// Recommendations (via user endpoint)
export const getMyRecommendations = () => client.get('/users/me/recommendations');
