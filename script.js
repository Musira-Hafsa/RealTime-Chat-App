import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBTUhflqfhRcxkdqmrgdJP1PfTTglCr4YM",
  authDomain: "realtime-database-d0bb9.firebaseapp.com",
  databaseURL: "https://realtime-database-d0bb9-default-rtdb.firebaseio.com",
  projectId: "realtime-database-d0bb9",
  storageBucket: "realtime-database-d0bb9.firebasestorage.app",
  messagingSenderId: "700108311074",
  appId: "1:700108311074:web:7ef6f78fc15899850f987b",
  measurementId: "G-16W7F8VNRB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

//  SIGNUP
document.getElementById("signup-Btn")?.addEventListener("click", () => {
  const email = document.getElementById("user-email").value;
  const password = document.getElementById("user-password").value;
  const username = prompt("Enter your name:");

  if (!username) return alert("Please enter your name.");

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      localStorage.setItem("username", username);
      alert("Sign Up successfully!");
      window.location.href = "chat.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});

// LOGIN
document.getElementById("login-Btn")?.addEventListener("click", () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
const username = prompt("Enter your name:");

  if (!username) return alert("Please enter your name.");
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      localStorage.setItem("username", username);
      alert("Login Successfully!");
      window.location.href = "chat.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});

// GOOGLE LOGIN
document.getElementById("google-Btn")?.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      localStorage.setItem("username", result.user.displayName);
      alert("Login Successfully!");
      window.location.href = "chat.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});


//  LOGOUT
document.getElementById("logout-Btn")?.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("Log Out Successfully!");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});

// RESET PASSWORD
document.getElementById("reset-password")?.addEventListener("click", (e) => {
  e.preventDefault();
  const email = prompt("Please enter your email address:");
  if (email) {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset email sent!");
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  } else {
    alert("Please enter a valid email address.");
  }
});

//  USER STATE
onAuthStateChanged(auth, (user) => {
  if (user && window.location.pathname.includes("chat.html")) {
    const username =
      localStorage.getItem("username") ||
      user.displayName ||
      user.email.split("@")[0];
    document.getElementById("user-email").textContent = user.email;
  } else if (!user && window.location.pathname.includes("chat.html")) {
    window.location.href = "index.html";
  }
});


//  SEND MESSAGE
window.sendMessage = function () {
  const username =
    localStorage.getItem("username") ||
    auth.currentUser.displayName ||
    auth.currentUser.email.split("@")[0];
  const message = document.getElementById("message").value;
  if (message.trim() === "") return;

  const msgRef = push(ref(db, "messages"));
  set(msgRef, {
    id: msgRef.key,
    name: username,
    text: message,
    time: new Date().toLocaleTimeString(),
    reactions: { heart: 0, laugh: 0, like: 0, wow: 0 },
  });

  document.getElementById("message").value = "";
};

// DISPLAY MESSAGES
onChildAdded(ref(db, "messages"), function (snapshot) {
  const data = snapshot.val();
  const msgBox = document.getElementById("messages");
  if (!msgBox) return; 
  const msgElement = document.createElement("div");
  msgElement.classList.add("message-item");
  msgElement.setAttribute("data-id", data.id);

msgElement.innerHTML = `
  <p>
    <strong>${data.name}</strong>:
    <span class="text">${data.text}</span>
    ${data.edited ? '<span class="edited-label">(edited)</span>' : ''}
  </p>
  <small>${data.time}</small>
`;

// 🔍 SEARCH FEATURE
document.getElementById("searchBar")?.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const messages = document.querySelectorAll(".message-item");

  messages.forEach((msg) => {
    const text = msg.querySelector(".text")?.textContent.toLowerCase() || "";
    const name = msg.querySelector("strong")?.textContent.toLowerCase() || "";
    if (text.includes(searchTerm) || name.includes(searchTerm)) {
      msg.style.display = "block";
      msg.classList.add("highlighted");
    } else {
      msg.style.display = "none";
      msg.classList.remove("highlighted");
    }
  });
});


  // Reaction Buttons
  const reactionsDiv = document.createElement("div");
  reactionsDiv.className = "reactions";
  const emojis = [
    { key: "heart", icon: "❤️" },
    { key: "laugh", icon: "😂" },
    { key: "like", icon: "👍" },
    { key: "wow", icon: "😮" },
  ];
  emojis.forEach(({ key, icon }) => {
    const btn = document.createElement("button");
    btn.textContent = `${icon} ${data.reactions?.[key] || 0}`;
    btn.className = "reaction-btn";
    btn.addEventListener("click", () => {
      const msgRef = ref(db, "messages/" + data.id + "/reactions");
      const newCount = (data.reactions?.[key] || 0) + 1;
      update(msgRef, { [key]: newCount });
      btn.textContent = `${icon} ${newCount}`;
    });
    reactionsDiv.appendChild(btn);
  });
  msgElement.appendChild(reactionsDiv);

  // ✅ Show Edit/Delete for Own Messages
  const currentName =
    localStorage.getItem("username") ||
    auth.currentUser.displayName ||
    auth.currentUser.email.split("@")[0];

  if (data.name === currentName) {
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️ Edit";
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️ Delete";

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("message-actions");
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    msgElement.appendChild(actionsDiv);


editBtn.addEventListener("click", () => {
  let newText = prompt("Edit your message:", data.text);
  if (newText && newText.trim() !== "") {
    const msgRef = ref(db, "messages/" + data.id);
    update(msgRef, { text: newText, edited: true }); // mark as edited
    msgElement.querySelector(".text").textContent = newText;
    
    // Add "(edited)" label visually
    const editedLabel = msgElement.querySelector(".edited-label");
    if (!editedLabel) {
      const label = document.createElement("span");
      label.className = "edited-label";
      label.textContent = " (edited)";
      msgElement.querySelector("p").appendChild(label);
    }
  }
});

    deleteBtn.addEventListener("click", () => {
      if (confirm("Delete this message?")) {
        const msgRef = ref(db, "messages/" + data.id);
        remove(msgRef);
        msgElement.remove();
      }
    });
  }

  msgBox.appendChild(msgElement);
  msgBox.scrollTop = msgBox.scrollHeight;
});

window.toggleTheme = function () {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
};

// Load saved theme when page opens
window.addEventListener("load", () => {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") document.body.classList.add("dark");
});