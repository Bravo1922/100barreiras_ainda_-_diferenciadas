const { MongoClient, ObjectId } = require('mongodb');

const url = 'mongodb+srv://100barreirasweb:Iees2024@cluster100barreiras.jfowqyw.mongodb.net/';
const dbName = '100Barreiras';

async function main() {
  const client = new MongoClient(url, { useUnifiedTopology: true });
  await client.connect();
  console.log('Conectado ao MongoDB');
  const db = client.db(dbName);
  return { client, db };
}

module.exports = main;
