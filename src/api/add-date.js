const { PrismaClient } = require('@prisma/client');
const requestIp = require('request-ip');
const geoip = require('fast-geoip');
const fs = require('fs')
const path = require('path')



export default async function handler(req, res) {
  const schema = fs.readFileSync(path.resolve(__dirname, 'prisma/schema.prisma'), 'utf8')
  console.log({ schema })

  const { date } = JSON.parse(req.body);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://paul:VfvEWgJPpECemk0PFC7LhA@free-tier7.aws-eu-west-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Dmellow-stork-3081"
      }
    }
  });

  try {
    const ip = await requestIp.getClientIp(req);
    const geo = await geoip.lookup(ip);

    const response = await prisma.dates.create({
      data: {
        date: new Date(date),
        location: geo ? geo : 'localhost'
      }
    });

    res.status(200).json({
      message: 'A ok!',
      data: {
        date: new Date(response.date).toLocaleString(),
        location: response.location
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Blast! There's been an error.", error: error });
  } finally {
    prisma.$disconnect();
  }
}
