const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// what environment are you running in?
const environment = process.env.NODE_ENV || 'development';
// fetch configuration for that env from ./knexfile
const configuration = require('./knexfile')[environment];
// connect to it!
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'Publications';

// routes?
app.get('/', (request, response) => {
  response.send('Hello, Publications');
});

app.get('/api/v1/papers', (request, response) => {
  database('papers').select()
  .then((papers) => {
    response.status(200).json(papers);
  })
  .catch((error) => {
    response.status(500).json({ error });
  });
});

app.post('/api/v1/papers', (request, response) => {
  const paper = request.body;

  for (let requiredParameter of ['title', 'author']) {
    if (!paper[requiredParameter]) {
      return response
      .status(422)
      .send({ error: `Expected format: {title: <String>, author: <String> }. You're missing a "${requiredParameter}" property.`});
    }
  }

  database('papers').insert(paper, 'id')
    .then(paper => {
      response.status(201).json({id: paper[0]})
    })
    .catch(error => {
      response.status(500).json({error});
    });
});

app.get('/api/v1/papers/:id', (request, response) => {
  database('papers').where('id', request.params.id).select()
  .then(papers => {
    if (papers.length) {
      response.status(200).json(papers);
    } else {
      response.status(400).json({
        error: `Could not find paper with id ${request.params.id}`
      });
    }
  })
  .catch(error => {
    response.status(500).json({error});
  });
});

app.get('/api/v1/papers/:id/footnotes', (request, response) => {
  database('footnotes').where('paper_id', request.params.id).select()
  .then(footnotes => {
    if (footnotes.length) {
      response.status(200).json(footnotes);
    } else {
      response.status(400).json({
        error: `Could not find footnotes for paper with id ${request.params.id}`
      });
    }
  })
  .catch(error => {
    response.status(500).json({error});
  });
});

// message in terminal for connection...
app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});
