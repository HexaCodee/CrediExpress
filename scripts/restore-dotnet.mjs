import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, '..');

const dotnetCheck = spawnSync('dotnet', ['--version'], { cwd: workspaceRoot, shell: true });

if (dotnetCheck.status !== 0) {
  console.log('dotnet no esta disponible en este entorno, se omite la restauracion de los proyectos .NET.');
  process.exit(0);
}

const result = spawnSync(
  'dotnet',
  ['restore', 'authentication-service/auth-service/AuthService.sln'],
  { cwd: workspaceRoot, stdio: 'inherit', shell: true },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const result2 = spawnSync(
  'dotnet',
  ['restore', 'login-service/log-service/LogService.sln'],
  { cwd: workspaceRoot, stdio: 'inherit', shell: true },
);

process.exit(result2.status ?? 0);
