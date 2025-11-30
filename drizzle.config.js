import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
config({ path: ".env.local" }); // loads your .env


export default defineConfig({
  dialect: "postgresql",
  schema: "./configs/schema.js",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DB_CONNECTION_STRING, // <-- add this
  },
});
