const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use(express.static("build"));

const morgan = require("morgan");
morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// const requestLogger = (request, response, next) => {
//   console.log("Method:", request.method);
//   console.log("Path:  ", request.path);
//   console.log("Body:  ", request.body);
//   console.log("---");
//   next();
// };

// app.use(requestLogger);

const generateID = () => {
  return Math.trunc(Math.random() * 100000);
};

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/info", (request, response) => {
  const message = `Phonebook has info for ${persons.length} people.`;
  const date = new Date();
  response.send(message + "<br>" + date);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.statusMessage = "Requested person not found";
    res.status(404).end();
  }
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const id = generateID();
  const name = body.name;
  const number = body.number;

  const person = {
    id,
    name,
    number,
  };
  if (!name || name.length === 0) {
    return response.status(404).json({
      error: "missing name",
    });
  } else if (
    persons.find((person) => person.name.toLowerCase() === name.toLowerCase())
  ) {
    response.statusMessage = "Contact already exists";
    return response.status(404).json({
      error: "Contact already exists.",
    });
  } else {
    persons.push(person);
    console.log(persons);
  }
  response.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    persons = persons.filter((person) => person.id !== id);
    res.statusMessage = `${person.name} successfully deleted.`;
    res.status(204).end();
  } else {
    res.statusMessage = "Not a valid ID";
    res.status(404).end();
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT);
