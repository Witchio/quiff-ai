import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.QUIFF_PROGRESS_PORT || 4173);
const clients = new Set();
let latest = { status: 'starting', step: 0, message: 'Preparing your pipeline…' };

const server = createServer(async (request, response) => {
  if (request.url === '/events') {
    response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    response.write(`data: ${JSON.stringify(latest)}\n\n`);
    clients.add(response);
    request.on('close', () => clients.delete(response));
    return;
  }
  if (request.method === 'POST' && request.url === '/update') {
    let body = '';
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 1024 * 1024) {
        response.writeHead(413).end('Update too large');
        return;
      }
    }
    try {
      latest = { ...latest, ...JSON.parse(body) };
      for (const client of clients) client.write(`data: ${JSON.stringify(latest)}\n\n`);
      response.writeHead(204).end();
    } catch {
      response.writeHead(400).end('Invalid update');
    }
    return;
  }
  if (request.url === '/' || request.url === '/index.html') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(await readFile(join(directory, 'progress.html')));
    return;
  }
  response.writeHead(404).end('Not found');
});

server.listen(port, '127.0.0.1');
