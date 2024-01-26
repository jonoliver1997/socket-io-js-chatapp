const socket = io("ws://localhost:4000");

const msgInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoomInput = document.querySelector("#room");
const activity = document.querySelector(".activity");
const userList = document.querySelector(".user-list");
const roomList = document.querySelector(".room-list");
const chatDisplay = document.querySelector(".chat-display");

let currentRoom = "";

function sendMessage(e) {
  e.preventDefault();
  if (nameInput.value && msgInput.value && currentRoom) {
    socket.emit("message", {
      name: nameInput.value,
      text: msgInput.value,
    });
    msgInput.value = "";
  }
  msgInput.focus();
  console.log("sendMessage clicked");
}

function enterRoom(e) {
  e.preventDefault();
  if (nameInput.value && chatRoomInput.value) {
    socket.emit("enterRoom", {
      name: nameInput.value,
      room: chatRoomInput.value,
    });
    currentRoom = chatRoomInput.value;
    chatRoomInput.value = "";
  }
}

document.getElementById("message-form").addEventListener("submit", sendMessage);
document.getElementById("form-join").addEventListener("submit", enterRoom);
msgInput.addEventListener("keypress", () => {
  socket.emit("activity", nameInput.value);
});

//Listen for messages
socket.on("message", (data) => {
  activity.textContent = "";
  const { name, text, time } = data;
  const newMessage = document.createElement("li");
  newMessage.className = "post";
  if (name === nameInput.value) {
    newMessage.className = "post post--left";
  }
  if (name !== nameInput.value && name !== "Admin") {
    newMessage.className = "post post--right";
  }
  if (name !== "Admin") {
    newMessage.innerHTML = `<div class="post__header ${
      name === nameInput.value ? "post__header--user" : "post__header--reply"
    }">
    <span class="post__header--name">${name}</span>
    <span class="post__header--time">${time}</span>
    </div>
    <div class="post__text">${text}</div>
    `;
  } else {
    newMessage.innerHTML = `<div class="post__text">${text}</div>`;
  }
  chatDisplay.appendChild(newMessage);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

//Listen for Activity
socket.on("activity", (name) => {
  activity.textContent = `${name} is typing...`;
  setTimeout(() => {
    activity.textContent = "";
  }, 5000);
});

socket.on("userList", ({ users }) => {
  showUsers(users);
});

socket.on("roomList", ({ rooms }) => {
  showRooms(rooms);
});

function showUsers(users) {
  userList.textContent = "";
  if (users) {
    userList.innerHTML = `<em>Users in ${currentRoom}:</em>`;
    users.forEach((user, i) => {
      userList.textContent += ` ${user.name}`;
      if (i < users.length - 1) {
        userList.textContent += ", ";
      }
    });
  }
}

function showRooms(rooms) {
  roomList.textContent = "";
  if (rooms) {
    roomList.innerHTML = `<em>Active Rooms:</em>`;
    rooms.forEach((room, i) => {
      roomList.textContent += ` ${room}`;
      if (i < rooms.length - 1) {
        roomList.textContent += ", ";
      }
    });
  }
}
