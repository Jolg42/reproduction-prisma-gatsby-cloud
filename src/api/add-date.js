// const { PrismaClient } = require('@prisma/client');
const requestIp = require('request-ip');
const geoip = require('fast-geoip');

const FS = require('fs');
const PATH = require('path');
const constants = {
  DIRECTORY: 'directory',
  FILE: 'file'
}

function safeReadDirSync(path) {
  let dirData = {};
  try {
    dirData = FS.readdirSync(path);
  } catch (ex) {
    if (ex.code == "EACCES" || ex.code == "EPERM") {
      //User does not have permissions, ignore directory
      return null;
    }
    else throw ex;
  }
  return dirData;
}

/**
 * Normalizes windows style paths by replacing double backslahes with single forward slahes (unix style).
 * @param  {string} path
 * @return {string}
 */
function normalizePath(path) {
  return path.replace(/\\/g, '/');
}

/**
 * Tests if the supplied parameter is of type RegExp
 * @param  {any}  regExp
 * @return {Boolean}
 */
function isRegExp(regExp) {
  return typeof regExp === "object" && regExp.constructor == RegExp;
}

/**
 * Collects the files and folders for a directory path into an Object, subject
 * to the options supplied, and invoking optional
 * @param  {String} path
 * @param  {Object} options
 * @param  {function} onEachFile
 * @param  {function} onEachDirectory
 * @return {Object}
 */
function directoryTree(path, options, onEachFile, onEachDirectory, currentDepth = 0) {
  options = options || {};

  if (options.depth !== undefined && options.attributes.indexOf('size') !== -1) {
    throw new Error('usage of size attribute with depth option is prohibited');
  }

  const name = PATH.basename(path);
  path = options.normalizePath ? normalizePath(path) : path;
  const item = { path, name };
  let stats;
  let lstat;

  try {
    stats = FS.statSync(path);
    lstat = FS.lstatSync(path);
  }
  catch (e) { return null }

  // Skip if it matches the exclude regex
  if (options.exclude) {
    const excludes = isRegExp(options.exclude) ? [options.exclude] : options.exclude;
    if (excludes.some((exclusion) => exclusion.test(path))) {
      return null;
    }
  }

  if (lstat.isSymbolicLink()) {
    item.isSymbolicLink = true;
    // Skip if symbolic links should not be followed
    if (options.followSymlinks === false)
      return null;
    // Initialize the symbolic links array to avoid infinite loops
    if (!options.symlinks)
      options = { ...options, symlinks: [] };
    // Skip if a cyclic symbolic link has been found
    if (options.symlinks.find(ino => ino === lstat.ino)) {
      return null;
    } else {
      options.symlinks.push(lstat.ino);
    }
  }

  if (stats.isFile()) {

    const ext = PATH.extname(path).toLowerCase();

    // Skip if it does not match the extension regex
    if (options.extensions && !options.extensions.test(ext))
      return null;


    if (options.attributes) {
      options.attributes.forEach((attribute) => {
        switch (attribute) {
          case 'extension':
            item.extension = ext;
            break;
          case 'type':
            item.type = constants.FILE;
            break;
          default:
            item[attribute] = stats[attribute];
            break;
        }
      });
    }

    if (onEachFile) {
      onEachFile(item, path, stats);
    }
  }
  else if (stats.isDirectory()) {
    let dirData = safeReadDirSync(path);
    if (dirData === null) return null;

    if (options.depth === undefined || options.depth > currentDepth) {
      item.children = dirData
        .map(child => directoryTree(PATH.join(path, child), options, onEachFile, onEachDirectory, currentDepth + 1))
        .filter(e => !!e);
    }

    if (options.attributes) {
      options.attributes.forEach((attribute) => {
        switch (attribute) {
          case 'size':
            item.size = item.children.reduce((prev, cur) => prev + cur.size, 0);
            break;
          case 'type':
            item.type = constants.DIRECTORY;
            break;
          case 'extension':
            break;
          default:
            item[attribute] = stats[attribute];
            break;
        }

      });
    }

    if (onEachDirectory) {
      onEachDirectory(item, path, stats);
    }
  } else {
    return null; // Or set item.size = 0 for devices, FIFO and sockets ?
  }
  return item;
}

export default async function handler(req, res) {
  const tree = directoryTree(__dirname, { exclude: /node_modules/ })
  console.log(JSON.stringify(tree, null, 2))

  const schema = FS.readFileSync(PATH.resolve(__dirname, 'prisma/schema.prisma'), 'utf8')
  console.log({ schema })

  const { date } = JSON.parse(req.body);

  res.status(200).json({
    message: 'A ok!',
    data: {
      key: "value"
    }
  });

  // const prisma = new PrismaClient({
  //   datasources: {
  //     db: {
  //       url: "postgresql://paul:VfvEWgJPpECemk0PFC7LhA@free-tier7.aws-eu-west-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Dmellow-stork-3081"
  //     }
  //   }
  // });

  // try {
  //   const ip = await requestIp.getClientIp(req);
  //   const geo = await geoip.lookup(ip);

  //   const response = await prisma.dates.create({
  //     data: {
  //       date: new Date(date),
  //       location: geo ? geo : 'localhost'
  //     }
  //   });

  //   res.status(200).json({
  //     message: 'A ok!',
  //     data: {
  //       date: new Date(response.date).toLocaleString(),
  //       location: response.location
  //     }
  //   });
  // } catch (error) {
  //   res.status(500).json({ message: "Blast! There's been an error.", error: error });
  // } finally {
  //   prisma.$disconnect();
  // }
}
