module.exports = {
  apps: [{
    name: "sgi-autorreporte-mailer",
    script: "./index.js",
    watch: false,
    env: {
      NODE_ENV: "production",
    },
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    time: true,
    max_memory_restart: "200M"
  }]
}
