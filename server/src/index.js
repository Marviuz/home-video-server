const express = require('express');
const {
  lstatSync,
  readdirSync,
  createReadStream,
  statSync,
} = require('fs');
const { join, extname } = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const ip = require('ip');
const mime = require('mime-types');

const { dirs, extensions } = require('./config.json');

const app = express();

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/dist`));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const PORT = process.env.PORT || 8081;
const HOST = process.env.HOST || '0.0.0.0';

const getDirsOrVids = (src) => readdirSync(src).map((name) => {
  const isDir = lstatSync(join(src, name)).isDirectory();

  return {
    src,
    name,
    ext: extname(name),
    isDir,
  };
}).filter((_) => _.isDir || extensions.includes(_.ext.toLowerCase()));

app.get('/api/animes', (req, res) => {
  const folders = dirs.map((dir) => getDirsOrVids(dir)).flat().sort();
  res.send(folders);
});

app.get('/api/anime', (req, res) => {
  res.send(getDirsOrVids(join(req.query.root, req.query.dir)));
});

app.get('/api/video', (req, res) => {
  const [partialStart, partialEnd] = req.headers.range.replace(/bytes=/, '').split('-');

  const stats = statSync(req.query.src);
  const totalSize = stats.size;
  const mimeType = mime.contentType(extname(req.query.src));

  const byteStart = parseInt(partialStart, 10);
  const byteEnd = partialEnd ? parseInt(partialEnd, 10) : totalSize - 1;
  const chunkSize = byteEnd - byteStart + 1;

  if (chunkSize === totalSize) {
    res.writeHead(200, {
      'Accept-Ranges': 'bytes',
      'Content-Type': mimeType,
      'Content-Length': totalSize,
    });
  } else {
    res.writeHead(206, {
      'Content-Range': `bytes ${byteStart}-${byteEnd}/${totalSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Type': mimeType,
      'Content-Length': byteEnd - byteStart + 1,
    });
  }

  const stream = createReadStream(req.query.src, { start: byteStart, end: byteEnd })
    .on('open', () => stream.pipe(res))
    .on('error', (err) => res.end(err));
});

app.listen(PORT, HOST, () => console.log(`Ready on http://${ip.address()}:${PORT}`));
