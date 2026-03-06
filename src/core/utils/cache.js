const Cache = {};

export const CacheStorage = {
  setItem: (key, value) => (Cache[key] = value),
  getItem: (key) => Cache[key],
  clear: () => {
    for (var key in Cache) {
      delete Cache[key];
    }
  },
  saga: {},
};
