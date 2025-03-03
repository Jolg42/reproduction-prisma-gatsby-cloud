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

function buildPrefixer(prefix, ...paths) {
    return (...subpaths) => path.join(prefix, ...paths, ...subpaths)
}

const functionsFolder = buildPrefixer(
    // program.directory,
    `.cache`,
    `functions`
)

// exports.onPreBuild = () => {
/** @type {import("gatsby").GatsbyNode["onPostBuild"]} */
exports.onPostBuild = async ({ store, pathPrefix, reporter }) => {
    console.log({ store })
    console.log({ pathPrefix })
    // console.log({ reporter })
    const { functions = [], program } = store.getState()
    console.log({ functions })
    console.log({ program })
    console.log("program.directory", program.directory)

    console.log({ __dirname })
    // const tree = directoryTree(__dirname, { exclude: /node_modules/ })
    // console.log(JSON.stringify(tree, null, 2))
    console.log("FS.readdirSync(__dirname)", FS.readdirSync(__dirname))
    console.log("FS.readdirSync('/')", FS.readdirSync('/'))

    const functionsOutput = `${__dirname}/functions`
    console.log({ functionsOutput })

    const srcLocation = PATH.join(__dirname, `./prisma/schema.prisma`)
    console.log({ srcLocation })
    // const outputLocation = PATH.join(functionsOutput, `./prisma/`)
    // const outputLocation = PATH.join(`.cache/functions`, `./prisma/`)
    const outputLocation = PATH.join(program.directory, `.cache/functions/prisma/`)
    console.log({ outputLocation })

    if (!FS.existsSync(functionsOutput)) {
        console.log("functionsOutput")
        FS.mkdirSync(functionsOutput)
    }
    if (!FS.existsSync(outputLocation)) {
        console.log("outputLocation")
        FS.mkdirSync(outputLocation)
    }
    FS.copyFileSync(srcLocation, PATH.join(outputLocation, 'schema.prisma'))

    return
};
