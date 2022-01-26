import express from "express";
import routes from "./api/routes";
import winston, { format } from "winston";
import expressWinston from "express-winston";
import swaggerUI from "swagger-ui-express";
/* eslint-disable @typescript-eslint/no-var-requires */
const swaggerDoc = require("./swagger.json");
import cors from "cors";
import "dotenv/config";

const { VERSION } = process.env;
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      format.timestamp(),
      format.colorize(),
      format.json()
    ),
    meta: false,
    msg: "HTTP  ",
    expressFormat: true,
    colorize: false,
    ignoreRoute: () => false,
  })
);

app.use(`/api/v${VERSION}`, routes);

app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDoc));

app.listen(PORT);
