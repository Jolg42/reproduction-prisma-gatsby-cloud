const FS = require('fs');
const PATH = require('path');

export default async function handler(req, res) {

  console.log("FS.readdirSync(__dirname)", FS.readdirSync(__dirname))
  console.log("FS.readdirSync('/')", FS.readdirSync('/'))

  // const tree = directoryTree(__dirname, { exclude: /node_modules/ })
  // console.log(JSON.stringify(tree, null, 2))

  const schema = FS.readFileSync(PATH.resolve(__dirname, 'prisma/schema.prisma'), 'utf8')
  console.log({ schema })

  const { date } = JSON.parse(req.body);

  res.status(200).json({
    message: 'A ok!',
    data: {
      key: "value"
    }
  });
}
