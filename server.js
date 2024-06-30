var express = require('express');
const main = require('./mongo'); // Importe o arquivo de configuração do MongoDB
const { MongoClient, ObjectId } = require('mongodb'); // Certifique-se de importar ObjectId

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
      res.status(201).send("Registo bem-sucedido");
    }

    client.close();
  } catch (err) {
    console.error('Erro ao aceder à base de dados:', err);
    res.status(500).send("Erro ao aceder à base de dados");
  }
});
    
app.post('/createLocation', async function(req, res) {
  const { morada, google_maps_id, email_utilizador } = req.body;

  try {
    const { db, client } = await main();
    const utilizadores = db.collection('Utilizadores');
    const locais = db.collection('Locais');

    // Verificar se o utilizador existe
    const user = await utilizadores.findOne({ email: email_utilizador });
    if (!user) {
      res.status(404).send("Utilizador não encontrado");
    } else {
      // Inserir novo local
      await locais.insertOne({ morada, google_maps_id, email_utilizador, reviews: [], fotos: [] });
      res.status(201).send("Local criado com sucesso");
    }

    client.close();
  } catch (err) {
    console.error('Erro ao aceder à base de dados:', err);
    res.status(500).send("Erro ao aceder à base de dados");
  }
});

app.post('/addReview', async function(req, res) {
  const { texto, classificacao, email_utilizador, idlocal } = req.body;

  try {
    const { db, client } = await main();
    const locais = db.collection('Locais');

    // Verificar se o local existe
    const local = await locais.findOne({ _id: new ObjectId(idlocal) });
    if (!local) {
      res.status(404).send("Local não encontrado");
    } else {
      // Adicionar nova review ao local
      await locais.updateOne(
        { _id: new ObjectId(idlocal) },
        { $push: { reviews: { id: new ObjectId(), texto, classificacao, email_utilizador } } }
      );
      res.status(201).send("Review adicionada com sucesso");
    }

    client.close();
  } catch (err) {
    console.error('Erro ao aceder à base de dados:', err);
    res.status(500).send("Erro ao aceder à base de dados");
  }
});

app.post('/addPhoto', async function(req, res) {
  const { foto_info, idlocal } = req.body;

  try {
    const { db, client } = await main();
    const locais = db.collection('Locais');

    // Verificar se o local existe
    const local = await locais.findOne({ _id: new ObjectId(idlocal) });
    if (!local) {
      res.status(404).send("Local não encontrado");
    } else {
      // Adicionar nova foto ao local
      await locais.updateOne(
        { _id: new ObjectId(idlocal) },
        { $push: { fotos: { idfoto: new ObjectId(), foto_info } } }
      );
      res.status(201).send("Foto adicionada com sucesso");
    }

    client.close();
  } catch (err) {
    console.error('Erro ao aceder à base de dados:', err);
    res.status(500).send("Erro ao aceder à base de dados");
  }
});


app.get('/reviews', async function(req, res) {
  try {
    const { db, client } = await main();
    const locais = db.collection('Locais');

    // Agrupar todas as reviews de todos os locais
    const result = await locais.aggregate([
      { $unwind: "$reviews" },
      { $replaceRoot: { newRoot: "$reviews" } }
    ]).toArray();

    res.status(200).json(result);

    client.close();
  } catch (err) {
    console.error('Erro ao aceder à base de dados:', err);
    res.status(500).send("Erro ao aceder à base de dados");
  }
});


app.get('/locais', async function(req, res) {
  try {
    const { db, client } = await main();
    const locais = db.collection('Locais');

    // Obter todos os locais
    const result = await locais.find({}).toArray();
    
    res.status(200).json(result);

    client.close();
  } catch (err) {
    console.error('Erro ao aceder à base de dados:', err);
    res.status(500).send("Erro ao aceder à base de dados");
  }
});


app.listen(6069);
