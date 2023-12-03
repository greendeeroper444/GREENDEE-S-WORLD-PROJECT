const app = require("./app");
const connectDatabase = require("./db/Database");

//Handling uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("shutting down the server for handling uncaught exception");
});

//Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "backend/config/.env",
  });
}

//connect Db
connectDatabase();

//Create server
const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT}`
  );
});

//Unhandled promise rejection
process.on("UnhandledRejection", () => {
  console.log(`Shutting down the server for ${err.message}`);
  console.log(`shutting down the server for unhandle promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
