const net = require('net');
const SUPABASE_HOST = 'db.mheccpmivgvvjzwjcwhf.supabase.co';
const SUPABASE_PORT = 5432;
const LISTEN_PORT = 5444;

const server = net.createServer((clientSocket) => {
  console.log(`[Proxy] New connection from ${clientSocket.remoteAddress}`);
  const serverSocket = new net.Socket();
  serverSocket.connect(SUPABASE_PORT, SUPABASE_HOST, () => {
    console.log(`[Proxy] Connected to Supabase`);
    clientSocket.pipe(serverSocket);
    serverSocket.pipe(clientSocket);
  });
  serverSocket.on('error', (err) => {
    console.error(`[Proxy] Supabase error: ${err.message}`);
    clientSocket.destroy();
  });
  clientSocket.on('error', (err) => {
    console.error(`[Proxy] Client error: ${err.message}`);
    serverSocket.destroy();
  });
});

server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`[Proxy] Listening on 0.0.0.0:${LISTEN_PORT} -> ${SUPABASE_HOST}:${SUPABASE_PORT}`);
});
