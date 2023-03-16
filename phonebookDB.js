const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}
const argLength = process.argv.length;
const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://shosmail31:${password}@cluster0.ttwvi8l.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set("toJSON", {
  transform: (document, returnedOBJ) => {
    returnedOBJ.id = returnedOBJ._id.toString();
    delete returnedOBJ._id;
    delete returnedOBJ.__v;
  },
});

const Person = mongoose.model("Person", personSchema);
const newPerson = new Person({
  name,
  number,
});

// RETRIEVING COLLECTIONS
const getAllPerson = () => {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(JSON.stringify(person));
    });
    mongoose.connection.close();
  });
};

const savePerson = async (person) => {
  return await person.save().then(() => {
    console.log(`${person.name} saved!`);
    mongoose.connection.close();
  });
};

if (argLength === 3) {
  // get all persons from db
  getAllPerson();
} else if (newPerson.name && newPerson.number) {
  // add new person to db
  savePerson(newPerson);
}
