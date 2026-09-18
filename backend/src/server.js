require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const registerSocketHandlers = require("./sockets/socketHandler");

const PORT = Number(process.env.PORT || 5000);

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

async function start() {
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  app.set("io", io);
  registerSocketHandlers(io);

  server.listen(PORT, () => {
    console.log(`LocalFix API running at http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
  });
}

start().catch((error) => {
  console.error("Failed to start LocalFix", error);
  process.exit(1);
});
