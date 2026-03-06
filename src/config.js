const config = {
  // Storage configuration
  storage: {
    // Enable/disable storage encryption
    isEncryptStorage: false,
    // Enable/disable storage item expiration
    enableExpiry: false,
    // Default expiration time in minutes (only used if enableExpiry is true)
    defaultExpiry: 480 // 8 hours
  }
};

export default config;
