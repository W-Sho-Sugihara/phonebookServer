require("dotenv").config();
const express = require("express");
const app = express();
// using express.json allows us to read json format requests
app.use(express.json());
// using cors to allow cross origin requests
const cors = require("cors");
app.use(cors());
// use static & built to meld frontend and backend into one folder
app.use(express.static("build"));

// logger middleware (morgan)
const morgan = require("morgan");
morgan.token("body", (req) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// mongoose module import
const Person = require("./model/mongo");
// const { request, query } = require("express");

// RETRIEVING COLLECTIONS
const getAllPersons = async () => {
  return await Person.find({});
  // mongoose.connection.close();
};

// saving to DB
// const savePerson = async (person) => {
//   return await person.save().then(() => {
//     console.log(`${person.name} saved!`);
//     mongoose.connection.close();
//   });
// };

app.get("/api/persons", async (request, response) => {
  const persons = await getAllPersons();
  response.json(persons);
});

app.get("/api/info", async (request, response) => {
  const persons = await getAllPersons();
  const message = `Phonebook has info for ${persons.length} people.`;
  const date = new Date();
  response.send(message + "<br>" + date);
});

app.get("/api/persons/:id", async (request, response, next) => {
  const id = request.params.id;
  try {
    const person = await Person.findById(id);
    if (person) {
      response.json(person);
    } else {
      response.statusMessage = "Requested person not found";
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

app.post("/api/persons", async (request, response, next) => {
  const body = request.body;
  const name = body.name;
  const number = body.number;

  const found = await Person.find({ name });
  if (found.name === name) {
    response.statusMessage = "Contact already exists";
    return response.status(404).json({
      error: "Contact already exists.",
    });
  } else {
    try {
      const person = new Person({
        name,
        number,
      });
      await person.save();
      response.json(person);
      console.log("successfully saved to DB");
    } catch (error) {
      next(error);
    }
  }
});

app.put("/api/persons/:id", async (request, response, next) => {
  const id = request.params.id;
  const { name, number } = request.body;

  const updatePerson = { name, number };

  try {
    const result = await Person.findByIdAndUpdate(id, updatePerson, {
      new: true,
      runValidators: true,
      context: "query",
    });
    if (result) {
      response.json(result).end();
    } else {
      response.status(404).send({ error: "Not a valid ID" });
    }
  } catch (error) {
    next(error);
  }
});

app.delete("/api/persons/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await Person.findByIdAndDelete(id);

    if (result) {
      res.statusMessage = `${result.name} successfully deleted.`;
      res.status(204).end();
    } else {
      res.statusMessage = "Not a valid ID";
      res.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

// error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "unaccepted ID format" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT);

// Hard data
// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];
