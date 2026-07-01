module.exports = {
  apps: [
    {
      name: "kolo-backend",
      script: "dist/server.js",
      instances: process.env.PM2_INSTANCES || 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "500M",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_file: "logs/combined.log",
      time: true,
      kill_timeout: 10000,
      listen_timeout: 15000,
      wait_ready: true,
      shutdown_with_message: true,
    },
  ],
};
