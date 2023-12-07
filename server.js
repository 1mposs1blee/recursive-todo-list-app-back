const mongoose = require("mongoose");
const app = require("./app");

const { DB_HOST, PORT = 3001 } = process.env;

mongoose.set("strictQuery", true);

mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");

    app.listen(PORT);
  })
  .catch(() => {
    console.log("Database connection unsuccessful");

    process.exit(1);
  });
