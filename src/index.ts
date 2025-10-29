import dotenvFlow from "dotenv-flow";

dotenvFlow.config({
  node_env: process.env.NODE_ENV || "development",
  debug: process.env.NODE_ENV === "development",
});

import app from "./server";

console.log("NODE_ENV", process.env.NODE_ENV);
console.log("DATABASE_URL", process.env.DATABASE_URL);
console.log("JWT_SECRET", process.env.JWT_SECRET);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
