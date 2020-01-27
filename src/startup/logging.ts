import winston from "winston";

export default function() {
  winston.add(
    new winston.transports.Console({
      handleExceptions: true,
      format: winston.format.cli()
    })
  );

  winston.add(
    new winston.transports.File({
      filename: "errors.log",
      handleExceptions: true,
      level: "error",
      format: winston.format.simple()
    })
  );

  winston.add(
    new winston.transports.File({
      filename: "combined.log",
      format: winston.format.simple()
    })
  );

  process.on("unhandledRejection", reason => {
    throw reason;
  });
}
