const socket = io();

// elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
	"#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const options = location.search.split("=");
const username = options[1].split("&")[0];
const room = options[2];

const autoScroll = () => {
	const $newMessage = $messages.lastElementChild
	
	// height of new message
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	// Visible height
	const visibleHeight = $messages.offsetHeight

	// Height of messages container
	const containerHeight = $messages.scrollHeight

	// How far have I scrolled
	const scrollOffset = $messages.scrollTop + visibleHeight

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight		
	}


	console.log(newMessageHeight);
}
// const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true} );

socket.on("message", (message) => {
	console.log("message: ", message);
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format("H:mm"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoScroll();
});

socket.on("locationMessage", (message) => {
	console.log(message);
	const html = Mustache.render(locationMessageTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format("H:mm"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoScroll();
});

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	})
	document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener("submit", (e) => {
	e.preventDefault();

	//disable
	$messageFormButton.setAttribute("disabled", "disabled");

	const message = e.target.elements.message.value;

	socket.emit("sendMessage", message, (error) => {
		// enable
		$messageFormButton.removeAttribute("disabled");
		$messageFormInput.value = "";
		$messageFormInput.focus();

		if (error) {
			return console.log(error);
		}

		console.log("Message delivered.");
	});
});

$sendLocationButton.addEventListener("click", () => {
	if (!navigator.geolocation) {
		return alert(
			"Geolocation is not supported by your browser, just as God intended"
		);
	}

	$sendLocationButton.setAttribute("disabled", "disabled");

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			"sendLocation",
			{
				lat: position.coords.latitude,
				lon: position.coords.longitude,
			},
			() => {
				console.log("Location shared");
				$sendLocationButton.removeAttribute("disabled");
			}
		);
	});
});

socket.emit("join", { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = "/";
	}
});
