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
