import express from "express";
import winston from "winston";
import initConfig from "./startup/config";
import initLogger from "./startup/logging";
import initCleanup from "./startup/cleanup-onexit";
import initExpress from "./startup/express";

initLogger();
const PORT = initConfig();
initCleanup();
const app = express();
initExpress(app);

app.listen(PORT, () => winston.info(`App running on port ${PORT}`));
