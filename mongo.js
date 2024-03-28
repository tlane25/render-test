const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}
// ichQxpdlugPcrXQK
const password = process.argv[2];

const url = "mongodb+srv://lanetlane1:ichQxpdlugPcrXQK@mongobongo.ooumyos.mongodb.net/nodeApp?retryWrites=true&w=majority&appName=mongoBongo"

mongoose.set('strictQuery', false);

mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

const Note = mongoose.model('Note', noteSchema);

// const note = new Note({
//   content: 'HTML is Easy',
//   important: true,
// });

// note.save().then(result => {
//   console.log('note saved!');
//   mongoose.connection.close();
// });

Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note);
  });
  mongoose.connection.close();
});
