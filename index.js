require('dotenv').config();
const express = require('express');
const app = express();
const Note = require('./models/note.js');

app.use(express.static('dist'));
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const cors = require('cors');

app.use(cors());

app.use(express.json());
app.use(requestLogger);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes);
  });
});

app.post('/api/notes', (request, response, next) => {
  const body = request.body;

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });
  
  note.save()
    .then(savedNote => {
    response.json(savedNote);
    })
    .catch(error => next(error));
});


/* Note:
  I had some confusion stemming from this code. The question I wrestled
  with is how do we update the information in the database. I found the
  findByIdAndUpdate method but then began to wonder where the data is 
  getting updated. Well, the answer is that the frontend application 
  handles this change. It sends the note to change, with the changes
  already implemented in the request body. It really is as simple as that

  Then we use the request body to create an object that contains the
  values we wish to update to the database. The change is made in the
  database and, the response for this method is the updatedNote data
  from the database. 

  The frontend takes this response (a single value) maps through the
  existing notes and  
*/
app.put('/api/notes/:id', (request, response) => {
  const { content, important } = request.body;

  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    {new: true, runValidators: true, context: 'query'}
    )
    .then(updatedNote => {
      response.json(updatedNote);
    })
    .catch(error => next(error));
});

app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id)
    .then(note => { 
      if (note) {
        response.json(note)
      } else {
        response.status(404).end();
      } 
    })
    .catch(error => next(error));
});

app.delete('/api/notes/:id', (request, response) => {
  Note.findByIdAndDelete(request.params.id)
    .then( result => {
      if (result) {
        response.status(204).end()
      } else {
        response.status(201).send({error: "note not found"});
      }
    })
    .catch(error => next(error));

  // const id = Number(request.params.id);
  // notes = notes.filter(note => note.id !== id);
  
  // response.status(204).end();
});

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: 'malformed id'});
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }

  next(error);
}

app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});