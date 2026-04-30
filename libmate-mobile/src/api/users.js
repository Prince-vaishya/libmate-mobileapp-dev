import client from './client';

// Profile
export const updateProfile = (data) => client.put('/users/me', data);

export const uploadProfilePhoto = (uri) => {
  const ext = uri.split('.').pop().toLowerCase();
  const formData = new FormData();
  formData.append('profile_photo', { uri, name: `photo.${ext}`, type: `image/${ext}` });
  return client.post('/users/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const removeProfilePhoto = () => client.delete('/users/remove-photo');

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
export const cancelReservation  = (reservationId) => client.delete(`/users/me/reservations/${reservationId}`);

// Recommendations (via user endpoint)
export const getMyRecommendations = () => client.get('/users/me/recommendations');

// Membership
export const getMembershipStatus = () => client.get('/membership/status');
export const applyForMembership  = (duration_months, receiptUri) => {
  const formData = new FormData();
  formData.append('duration_months', String(duration_months));
  if (receiptUri) {
    const ext = receiptUri.split('.').pop().toLowerCase();
    formData.append('payment_receipt', {
      uri: receiptUri,
      name: `receipt.${ext}`,
      type: ext === 'pdf' ? 'application/pdf' : `image/${ext}`,
    });
  }
  return client.post('/membership/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
