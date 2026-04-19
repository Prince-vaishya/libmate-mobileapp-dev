import client from './client';

export const getTrending = (limit = 10) =>
  client.get('/trending', { params: { limit } });

export const getNewArrivals = (limit = 6) =>
  client.get('/new-arrivals/latest', { params: { limit } });

export const getStats = () => client.get('/trending/stats');
