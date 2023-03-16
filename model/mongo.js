// use mongoose api for using cloud MongoDB
const mongoose = require("mongoose");

const url = process.env.MONGODB_URL;

mongoose.set("strictQuery", false);

mongoose
  .connect(url)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error happened:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [2, "Must be at least 2 charachters long"],
    required: [true, "Must input a name"],
  },
  number: String,
});

personSchema.set("toJSON", {
  transform: (document, returnOBJ) => {
    returnOBJ.id = returnOBJ._id.toString();
    delete returnOBJ._id;
    delete returnOBJ.__v;
  },
});
module.exports = mongoose.model("Person", personSchema);
