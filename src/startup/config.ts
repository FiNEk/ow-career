import config from "config";

export default function() {
  if (!config.get("jwtPrivateKey")) {
    throw new Error(
      "FATAL ERROR - ENVIRONMENT VARIABLE owcareer_jwtPrivateKey IS NOT DEFINED"
    );
  }
  if (!config.get("postgresPswd")) {
    throw new Error(
      "FATAL ERROR - ENVIRONMENT VARIABLE owcareer_pgPassword IS NOT DEFINED"
    );
  }
  const port = config.get("defaultPort");
  return port;
}
