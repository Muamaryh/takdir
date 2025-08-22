// 🔧 Ganti config ini dengan punyamu dari Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDECGtdP8MIAViYS5k1CCR781w80wGzhJ4",
  authDomain: "apaaja-9c982.firebaseapp.com",
  databaseURL: "https://apaaja-9c982-default-rtdb.firebaseio.com",
  projectId: "apaaja-9c982",
  storageBucket: "apaaja-9c982.appspot.com",
  messagingSenderId: "976797182264",
  appId: "1:976797182264:web:2a9d080b3cd289f4ad39cd",
  measurementId: "G-X6RMQ5W21Y"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Hitung karakter
const input = document.getElementById("inputText");
const charCount = document.getElementById("charCount");

input.addEventListener("input", () => {
  charCount.textContent = `${input.value.length}/200`;
});

// Fungsi kirim kekesalan
function shout() {
  if (!input.value.trim()) return;

  db.ref("posts").push({
    message: input.value,
    time: Date.now(),
    reactions: { fire: 0, laugh: 0, angry: 0 }
  });

  input.value = "";
  charCount.textContent = "0/200";
}

// Fungsi update reaksi
function reactToPost(id, type) {
  const postRef = db.ref("posts/" + id + "/reactions/" + type);
  postRef.transaction((current) => (current || 0) + 1);
}

// Fungsi ambil realtime
const wall = document.getElementById("wall");
db.ref("posts").on("value", (snapshot) => {
  wall.innerHTML = "";
  const data = snapshot.val();
  if (data) {
    const entries = Object.entries(data).sort((a, b) => b[1].time - a[1].time);
    entries.forEach(([id, p]) => {
      const post = document.createElement("div");
      post.className = "post";
      post.innerHTML = `
        <div class="message">${p.message.toUpperCase()}</div>
        <div class="meta">${new Date(p.time).toLocaleString()}</div>
        <div class="reactions">
          <button onclick="reactToPost('${id}', 'fire')">🔥 ${p.reactions?.fire || 0}</button>
          <button onclick="reactToPost('${id}', 'laugh')">😂 ${p.reactions?.laugh || 0}</button>
          <button onclick="reactToPost('${id}', 'angry')">😡 ${p.reactions?.angry || 0}</button>
        </div>
      `;
      wall.appendChild(post);
    });
  }
});
