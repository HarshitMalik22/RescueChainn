const mongoose = require("mongoose");
const mongooseURI =
  "mongodb://mongo1:27017,mongo2:27017,mongo3:27017/myDatabase?replicaSet=rs0";

mongoose
  .connect(mongooseURI, {
    useNewURLParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Replica Set"))
  .catch((err) => console.log("MongoDB Connection Error", err));
 