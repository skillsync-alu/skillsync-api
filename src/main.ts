import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { config } from "./config";
import { json, urlencoded } from "express";

// These are the allowed origins for CORS depending on the environment
const origins = {
  production: ["https://skillsync-alu.web.app"],
  development: ["https://skillsync-alu.web.app", "http://localhost:5173"]
};

/**
 * This is the entry point for the app. It sets up the server and starts listening.
 */
async function bootstrap() {
  // Create the NestJS app using the main module
  const app = await NestFactory.create(AppModule);

  // Allow large JSON payloads
  app.use(json({ limit: "50mb" }));

  // Allow large URL-encoded payloads
  app.use(urlencoded({ extended: false, limit: "50mb" }));

  // Enable CORS for the allowed origins
  app.enableCors({
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    origin: origins[config.environment.state]
  });

  // Start the server on the configured port
  return await app.listen(config.port);
}

// Actually run the bootstrap function to start the app
bootstrap();
