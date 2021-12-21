import express from "express";
import routes from "./api/routes";
import winston, { createLogger, format, transports } from 'winston';
import expressWinston from 'express-winston';
import swaggerUI from "swagger-ui-express";
const swaggerDoc = require("./swagger.json") 
import cors from "cors"
require('dotenv').config();

const { URL, VERSION, PORT } = process.env;

const app = express();
app.use(cors())

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console(),
  ],
  format: winston.format.combine(
    format.timestamp(),
    format.colorize(),
    format.json()
  ),
  meta: false,
  msg: "HTTP  ",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) { return false; }
}));


app.use("/api", routes);

app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDoc));

app.listen(PORT, () => {
  console.log("\x1b[34m", `Host: ${URL}:${PORT}/api/v${VERSION}`);
  console.log("\x1b[34m", `Docs: ${URL}:${PORT}/swagger`);
});