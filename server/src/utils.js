const {
  lstatSync,
  readdirSync,
  statSync,
  createReadStream,
} = require('fs');
const { join, extname } = require('path');
const mime = require('mime-types');
const { extensions } = require('./server.config.json');

exports.getDataBySource = (src) => readdirSync(src).map((name) => {
  const isDir = lstatSync(join(src, name)).isDirectory();
  const [drive, ...path] = src.split(/[\\/]/);

  return {
    src: `${src}/${name}`,
    name,
    ...(!isDir && { ext: extname(name) }),
    ...(isDir && { isDir }),
    hyperlink: {
      href: ['', ...path, name].join('/'),
      root: drive.replace(':', ''),
    },
  };
}).filter((_) => _.isDir || extensions.includes(_.ext.toLowerCase()));

exports.stream = (req, res, src) => {
  if (!req.range) return;

  const [partialStart, partialEnd] = req.headers.range.replace(/bytes=/, '').split('-');
  const stats = statSync(src);
  const totalSize = stats.size;
  const mimeType = mime.contentType(extname(src));
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

  const stream = createReadStream(src, { start: byteStart, end: byteEnd })
    .on('open', () => stream.pipe(res))
    .on('error', (err) => res.end(err));
};
