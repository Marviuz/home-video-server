const express = require('express');
const ip = require('ip');
const { getDataBySource, stream } = require('./utils');

const { dirs } = require('./server.config.json');

const app = express();
require('./plugins')(app);

const PORT = process.env.PORT || 8081;
const HOST = process.env.HOST || '0.0.0.0';

app.get('/api/all', (req, res) => { // /api/all
  const folders = dirs.map((dir) => getDataBySource(dir)).flat().sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  res.send(folders);
});

app.get(/\/api\/(.*)/, (req, res) => { // /api/Anime/A%20Certain Scientific Accelerator?root=D
  const drive = req.query.root;
  const [, , ...path] = req.path.split(/[\\/]/).map((_) => decodeURI(_));
  const src = `${drive}:/${path.join('/')}`;

  res.send(getDataBySource(src).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })));
});

app.get(/\/api-stream\/(.*)/, (req, res) => { // /api-stream/Anime/A%20Certain Scientific Accelerator?root=D
  const drive = req.query.root;
  const [, , ...path] = req.path.split(/[\\/]/).map((_) => decodeURI(_));
  const streamSrc = `${drive}:/${path.join('/')}`;

  stream(req, res, streamSrc);
});

app.listen(PORT, HOST, () => console.log(`Ready on http://${ip.address()}:${PORT}`));
