const CopyPlugin = require("copy-webpack-plugin");
const path = require("path")
const fs = require("fs")

// exports.onPreBuild = ({
//     constants,
//     netlifyConfig,
// }) => {
//     console.log({ constants })
//     const {
//         PUBLISH_DIR,
//         FUNCTIONS_SRC = DEFAULT_FUNCTIONS_SRC,
//         INTERNAL_FUNCTIONS_SRC,
//     } = constants
//     const cacheDir = normalizedCacheDir(PUBLISH_DIR)
//     console.log({ PUBLISH_DIR })
//     console.log({ FUNCTIONS_SRC })
//     console.log({ INTERNAL_FUNCTIONS_SRC })
//     console.log({ cacheDir })

// }

exports.onPostBuild = ({ }, { functionsSrc, functionsOutput }) => {
    console.log({ functionsSrc })
    console.log({ functionsOutput })
    // const modules = glob.sync(`*.{${extensions.map(s => s.slice(1)).join()}}`, { cwd: functionsSrc });
    // modules.forEach(src => {
    //   const moduleSrc = path.join(functionsSrc, src);
    //   const moduleOut = path.join(functionsOutput, path.basename(src, path.extname(src)) + '.js');
    //   transpile(functionsSrc, moduleSrc, moduleOut);
    // });
};
// exports.onPostBuild = () => {
//     const srcLocation = path.join(__dirname, `./prisma/schema.prisma`)
//     console.log({ srcLocation })
//     const outputLocation = path.join(__dirname, `./public/functions/prisma/schema.prisma`)
//     if (!fs.existsSync(outputLocation)) {
//         fs.mkdirSync(outputLocation)
//     }
//     return fs.copyFileSync(srcLocation, outputLocation)
// }


// exports.onCreateWebpackConfig = ({
//     stage,
//     rules,
//     loaders,
//     plugins,
//     actions,
//     constants,
// }) => {
//     const { PUBLISH_DIR } = constants

//     console.log({ PUBLISH_DIR })
//     const cacheDir = normalizedCacheDir(PUBLISH_DIR)
//     const compiledFunctionsDir = path.join(cacheDir, '/functions')


//     actions.setWebpackConfig({
//         plugins: [
//             new CopyPlugin({
//                 patterns: [
//                     // The Prisma schema file is needed at runtime by Prisma Client
//                     {
//                         from: 'prisma/schema.prisma',
//                         to: path.join(compiledFunctionsDir, `prisma/schema.prisma`),
//                     },
//                 ],
//             }),
//         ],
//     })
// }
