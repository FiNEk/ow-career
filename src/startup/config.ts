import config from "config";

export default function() {
  if (!config.get("jwtPrivateKey")) {
    throw new Error(
      "FATAL ERROR - ENVIROMENT VARIABLE wnm_jwtPrivateKey IS NOT DEFINED"
    );
  }
  const port = config.get("defaultPort");
  return port;
}
