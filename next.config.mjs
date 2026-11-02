import fs from 'node:fs';

// Node 22/24 on Windows compatibility fix for webpack/enhanced-resolve:
// When readlink is called on a normal file, Node 24 on Windows returns EISDIR instead of EINVAL.
// Webpack expects EINVAL or UNKNOWN to recognize it is not a symlink.
if (process.platform === 'win32') {
  const origReadlink = fs.readlink;
  fs.readlink = function (...args) {
    const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
    if (cb) {
      const rest = args.slice(0, -1);
      return origReadlink.apply(fs, [
        ...rest,
        (err, linkString) => {
          if (err && err.code === 'EISDIR') {
            err.code = 'EINVAL';
          }
          cb(err, linkString);
        },
      ]);
    }
    return origReadlink.apply(fs, args);
  };

  const origReadlinkSync = fs.readlinkSync;
  fs.readlinkSync = function (...args) {
    try {
      return origReadlinkSync.apply(fs, args);
    } catch (err) {
      if (err && err.code === 'EISDIR') {
        err.code = 'EINVAL';
      }
      throw err;
    }
  };

  if (fs.promises && fs.promises.readlink) {
    const origPromisesReadlink = fs.promises.readlink;
    fs.promises.readlink = async function (...args) {
      try {
        return await origPromisesReadlink.apply(fs.promises, args);
      } catch (err) {
        if (err && err.code === 'EISDIR') {
          err.code = 'EINVAL';
        }
        throw err;
      }
    };
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
