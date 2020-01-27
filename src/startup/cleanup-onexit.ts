import nodeCleanup from "node-cleanup";
import winston from "winston";
import { pool } from "../db";

export default function() {
  nodeCleanup((exitCode, signal) => {
    if (signal) {
      winston.info("disposing postgres pool...");
      pool.end(() => {
        winston.info("cleanup ended, terminating process");
        process.kill(process.pid, signal);
      });
      nodeCleanup.uninstall();
      return false;
    }
  });
}
