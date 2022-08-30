const CopyPlugin = require("copy-webpack-plugin");

exports.onCreateWebpackConfig = ({
    stage,
    rules,
    loaders,
    plugins,
    actions,
}) => {
    actions.setWebpackConfig({
        plugins: [
            new CopyPlugin({
                patterns: [
                    // The Prisma schema file is needed at runtime by Prisma Client
                    {
                        from: 'prisma/schema.prisma',
                        to: `prisma/schema.prisma`,
                    },
                ],
            }),
        ],
    })
}
