import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, '..');
const servicePorts = [3002, 3003, 3004, 3006, 3007, 3008, 3009, 5062, 5173, 5174, 5222, 8081];

function run(command, args, { allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: workspaceRoot,
    stdio: 'inherit',
    shell: true,
  });

  if (!allowFailure && result.status !== 0) {
    const code = result.status ?? 1;
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${code}`);
  }

  return result;
}

function stopDockerCompose() {
  run('docker', ['compose', '-f', 'pg/docker-compose.yml', 'down'], { allowFailure: true });
}

function getPidsOnPorts(ports) {
  if (process.platform !== 'win32') {
    return [];
  }

  const result = spawnSync('netstat', ['-ano'], {
    cwd: workspaceRoot,
    encoding: 'utf8',
    shell: true,
  });

  if (result.status !== 0 || !result.stdout) {
    return [];
  }

  const pids = new Set();

  for (const line of result.stdout.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine.startsWith('TCP')) {
      continue;
    }

    const columns = trimmedLine.split(/\s+/);
    const localEndpoint = columns[1] ?? '';

    if (!ports.some((port) => localEndpoint.endsWith(`:${port}`))) {
      continue;
    }

    const pid = Number(columns.at(-1));

    if (Number.isInteger(pid) && pid > 0) {
      pids.add(pid);
    }
  }

  return [...pids];
}

function stopWorkspaceProcesses() {
  const pids = [...new Set(getPidsOnPorts(servicePorts))];

  for (const pid of pids) {
    run('taskkill', ['/PID', String(pid), '/T', '/F'], { allowFailure: true });
  }
}

stopDockerCompose();
stopWorkspaceProcesses();