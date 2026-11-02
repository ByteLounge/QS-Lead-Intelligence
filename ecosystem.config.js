module.exports = {
  apps: [
    {
      name: 'queenstown-lead-intelligence',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      node_args: '--require ./patch-readlink.cjs',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
