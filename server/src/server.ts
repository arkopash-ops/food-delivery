import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT;

connectDB();

const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server running on  http://localhost:${PORT}/`);
});
