var express = require('express');
const main = require('./mongo'); // Importe o arquivo de configuração do MongoDB

var bodyParser = require('body-parser');
var app = express();


//Allow all requests from all domains & localhost
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/signup', async function(req, res) {
  const { email, nome, password } = req.body;

  try {
    const { db, client } = await main();
    const collection = db.collection('Utilizadores');

    // Verificar se o email já existe
    const user = await collection.findOne({ email });
    if (user) {
      res.status(409).send("Email já está em uso");
    } else {
      // Inserir novo utilizador
      await collection.insertOne({ email, nome, password });
      res.status(201).send("Registro bem-sucedido");
    }

    client.close();
  } catch (err) {
    console.error('Erro ao acessar o banco de dados:', err);
    res.status(500).send("Erro ao acessar o banco de dados");
  }
});
    


app.listen(6069);
