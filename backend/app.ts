import express from "express";
import routes from "./api/routes";
import swaggerUI from "swagger-ui-express";
const swaggerDoc = require("./swagger.json") 
require('dotenv').config();

const { URL, VERSION, PORT } = process.env;

const app = express();
app.use("/api", routes);

app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDoc));

app.listen(PORT, () => {
  console.log("\x1b[34m", `Host: ${URL}:${PORT}/api/v${VERSION}`);
  console.log("\x1b[34m", `Docs: ${URL}:${PORT}/swagger`);
});