import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir, readFile, stat, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const feedText = (await readFile('public/feed.txt', 'utf8')).trim();
const tracks = { account: feedText };
const audioDir = resolve('public/audio');
await mkdir(audioDir, { recursive: true });

function run(command, args) {
  return new Promise((done, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? done() : reject(new Error(`${command} exited with ${code}`)));
  });
}

const manifest = {};
for (const [name, text] of Object.entries(tracks)) {
  const hash = createHash('sha256').update('offline-voice-v1\n').update(text).digest('hex').slice(0, 16);
  const filename = `${name}-${hash}.wav`;
  const output = resolve(audioDir, filename);
  manifest[name] = { src: `/audio/${filename}`, version: hash };
  if ((await stat(output).catch(() => null))?.size > 44) continue;

  const input = resolve(audioDir, `${name}-${hash}.txt`);
  await writeFile(input, text, 'utf8');
  try {
    if (process.platform === 'win32') {
      await run('cscript.exe', ['//nologo', resolve('scripts/speak-windows.js'), input, output]);
    } else {
      await run('espeak-ng', ['-v', 'en-us', '-s', '155', '-w', output, '-f', input]);
    }
    const header = (await readFile(output)).subarray(0, 12);
    if (header.toString('ascii', 0, 4) !== 'RIFF' || header.toString('ascii', 8, 12) !== 'WAVE')
      throw new Error(`Invalid audio output: ${output}`);
  } finally {
    await rm(input, { force: true });
  }
  console.log(`Rendered ${name} narration: ${filename}`);
}
await writeFile('public/audio-manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
