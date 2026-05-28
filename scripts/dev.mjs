import { spawnSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, '..');

function runOneOff(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: workspaceRoot,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    const code = result.status ?? 1;
    throw new Error(`${label} failed with exit code ${code}`);
  }
}

function startProcess(command, args, label) {
  const child = spawn(command, args, {
    cwd: workspaceRoot,
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.exitCode = 1;
      return;
    }

    if (code === 0) {
      if (label === 'node' || label === 'auth' || label === 'log') {
        console.error(`[${label}] stopped unexpectedly`);
        process.exitCode = 1;
        shutdown();
      }
      return;
    }

    console.error(`[${label}] exited with code ${code}`);
    process.exitCode = code ?? 1;
    shutdown();
  });

  return child;
}

const children = new Set();
let shuttingDown = false;

function shutdown() {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    child.kill('SIGINT');
  }

  setTimeout(() => process.exit(process.exitCode ?? 0), 500);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

runOneOff('docker', ['compose', '-f', 'pg/docker-compose.yml', 'up', '-d', '--build'], 'docker compose');

children.add(startProcess('pnpm', ['-r', '--parallel', '--stream', 'run', 'dev'], 'node'));
children.add(startProcess('dotnet', ['run', '--project', 'authentication-service/auth-service/src/AuthService.Api/AuthService.Api.csproj', '--launch-profile', 'http'], 'auth'));
children.add(startProcess('dotnet', ['run', '--project', 'login-service/log-service/src/LogService.Api/LogService.Api.csproj', '--launch-profile', 'http'], 'log'));