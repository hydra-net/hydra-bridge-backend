import express from "express";
import routes from "./api/routes";
import winston, { format } from "winston";
import expressWinston from "express-winston";
import swaggerUI from "swagger-ui-express";
import swaggerDocJson from "./swagger.json";
import cors from "cors";
import "dotenv/config";

const { URL, PORT, VERSION, NODE_ENV } = process.env;

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

app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDocJson));

app.listen(PORT, () => {
  if (NODE_ENV === "dev") {
    console.log("\x1b[34m", `Host: ${URL}:${PORT}/api/v${VERSION}`);
    console.log("\x1b[34m", `Docs: ${URL}:${PORT}/swagger`);
  }
});
