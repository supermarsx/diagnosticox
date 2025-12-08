#!/usr/bin/env node
/**
 * Lightweight developer launcher for 'light' local mode using sqlite.
 * - Runs backend (DB_TYPE=sqlite) and frontend concurrently in the current terminal.
 * - This script is intentionally simple: it spawns the two dev processes and pipes output.
 */
const spawn = require('child_process').spawn;

function spawnProcess(command, args, envOverrides) {
  const env = Object.assign({}, process.env, envOverrides || {});
  const proc = spawn(command, args, { env, shell: true, stdio: 'inherit' });
  proc.on('exit', (code) => {
    console.log(`${command} ${args.join(' ')} exited with code ${code}`);
    process.exit(code || 0);
  });
  return proc;
}

// Start backend with sqlite (default), disable OTLP tracing by default for local light mode
console.log('Starting backend (sqlite, light mode)');
spawnProcess('pnpm', ['--filter', 'diagnosticox-backend', 'dev'], { DB_TYPE: 'sqlite', TRACING_ENABLED: 'false' });

// Start frontend
console.log('Starting frontend (Vite)');
spawnProcess('pnpm', ['--filter', 'diagnosticox-frontend', 'dev'], {});
