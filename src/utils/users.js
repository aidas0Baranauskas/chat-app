const users = [];

// add, remove, get users, getUsersInRoom

const addUser = ({ id, username, room }) => {
	if (!username || !room) {
		console.log("critical failure: could not find inputs");
		return {
			error: "Username and room are required",
		};
	}
	// Clean the data
	// console.log("username: " + username, " room: " + room);
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	// Check for existing user
	const existingUser = users.find((user) => {
		return user.room === room && user.username === username;
	});

	// Validate username
	if (existingUser) {
		return {
			error: "Username is in use",
		};
	}

	// Store user
	const user = { id, username, room };
	users.push(user);
	return { user };
};

const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);

	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
};

const getUser = (id) => {
	const index = users.findIndex((user) => user.id === id);

	if (index !== -1) {
		return users[index];
	}
};

const getUsersInRoom = (room) => {
	return users.filter((user) => user.room === room);
};

export { addUser, removeUser, getUser, getUsersInRoom };
