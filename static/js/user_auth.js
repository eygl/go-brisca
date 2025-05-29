function getOrCreatePlayerID() {
  let id = localStorage.getItem("uuid");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("uuid", id);
  }
 return id;
}

document.addEventListener("DOMContentLoaded", () => {
 const uuid = getOrCreatePlayerID();
 document.getElementById("uuid").value = uuid;
 const savedUsername = localStorage.getItem("username");
 if (savedUsername) {
  document.getElementById("username").value = savedUsername;
 }

 document.getElementById("username").addEventListener("input", (e) => {
  localStorage.setItem("username", e.target.value);
 });
}); 

//document.getElementById("login").addEventListener("click", () => {
//  const socket = new WebSocket("ws://" + location.host + "/ws/lobbies");
//
//  socket.onopen = () => {
//    console.log("WebSocket connection opened.");
//    socket.send("lobbies")
//  };
//
//  socket.onmessage = (event) => {
//    console.log("Message from server: " + event.data);
//  };
//
//  socket.onerror = (error) => {
//    console.log("WebSocket error: " + error.message);
//  };
//
//  socket.onclose = () => {
//    console.log("WebSocket connection closed.");
//  };
//
//  function log(message) {
//    const logDiv = document.getElementById("lobbies");
//    logDiv.innerHTML += `<p>${message}</p>`;
//  }
//});
