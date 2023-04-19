import path from "path";
import * as url from "url";
import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import Filter from "bad-words";
import { generateMessage, generateLocation } from "./utils/messages.js";
import { addUser, removeUser, getUser, getUsersInRoom } from "./utils/users.js";

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
	console.log("new WebSocket connection");

	socket.on("join", ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });

		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		socket.emit("message", generateMessage("System", "welcome.."));
		socket.broadcast
			.to(user.room)
			.emit(
				"message",
				generateMessage("System", "the following has joined: " + user.username)
		);
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		})

		callback();
	});

	socket.on("sendMessage", (message, callback) => {
		const user = getUser(socket.id);
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return callback("Profanity is not allowed");
		}

		io.to(user.room).emit("message", generateMessage(user.username, message));
		callback();
	});

	socket.on("sendLocation", (coords, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit(
			"locationMessage",
			generateLocation(
				user.username,
				"https://www.google.com/maps/@${" +
					coords.lat +
					"},${" +
					coords.lon +
					"}"
			)
		);
		callback();
	});

	socket.on("disconnect", () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit(
				"message",
				generateMessage("System", user.username + " has left")
			);
			io.to(user.room).emit("roomData", {
				room: user.room,
				users: getUsersInRoom(user.room)
			})
		}
	});
});

server.listen(port, () => {
	console.log("Server is on port " + port);
});
