// PM2 ecosystem config for theFool backend
module.exports = {
  apps: [
    {
      name: 'thefool-backend',
      cwd: '/opt/theFool/the-fool-backend',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: '8080',
        CORS_ORIGINS: 'http://localhost:3000', // updated by deploy script
        PUBLIC_BASE_URL: 'https://YOUR_DOMAIN', // updated by deploy script
        DB_PATH: '/opt/theFool/the-fool-backend/data/db.sqlite',
      },
      // Restart on crash
      autorestart: true,
      max_restarts: 10,
      restart_delay: 1000,
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/opt/theFool/logs/backend-error.log',
      out_file: '/opt/theFool/logs/backend-out.log',
      merge_logs: true,
    },
  ],
}
