import dotenvFlow from "dotenv-flow";
import path from "path";
import { defineConfig } from "prisma/config";

dotenvFlow.config({
  node_env: process.env.NODE_ENV || "development",
  debug: process.env.NODE_ENV === "development",
});

export default defineConfig({
  schema: path.join(__dirname, "src", "prisma", "schema.prisma"),
});
