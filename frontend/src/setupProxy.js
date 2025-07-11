const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/results',
        createProxyMiddleware({
            target: 'http://localhost:8000',
            changeOrigin: true,
        })
    );
    app.use(
    '/scrape',
    createProxyMiddleware({
      target: 'http://localhost:8000', // Adjust if backend runs elsewhere
      changeOrigin: true,
    })
  );
};
