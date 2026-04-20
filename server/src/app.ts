import express from "express";
import cors from "cors";

import type { Request, Response } from "express";

import { logger } from "./middleware/logger.middleware.js";
import { errorLogger } from "./middleware/error.middleware.js";

const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// routes
app.get("/", async (req: Request, res: Response) => { 
    console.log("Root Route.")
});

app.use(errorLogger);

export default app;
