const API_URL = "https://notes-for-friends.uira609.chatgpt.site/api/letter";
const app = document.querySelector("#app");
const initialMarkup = app.innerHTML;

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[char]);
}

function bindLogin() {
  const form = document.querySelector("#letter-form");
  const button = document.querySelector("#open-button");
  const error = document.querySelector("#error");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.querySelector("#friend-name").value.trim();
    const code = document.querySelector("#friend-code").value;
    if (!name || !code) return;
    button.disabled = true;
    button.textContent = "OPENING…";
    error.textContent = "";
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      });
      if (!response.ok) throw new Error("invalid");
      renderLetter(await response.json());
    } catch {
      error.textContent = "名字或專屬密碼不正確，請再試一次。";
    } finally {
      button.disabled = false;
      button.textContent = "OPEN MY LETTER →";
    }
  });
}

function renderLetter(letter) {
  const native = letter.native;
  const english = letter.english;
  app.className = "letter-stage";
  app.innerHTML = `
    <header class="canada-bar"><span>🍁</span><b>FRIENDS ACROSS THE WORLD</b><span>🍁</span></header>
    <article class="letter" aria-labelledby="letter-title">
      <div class="letter-heading"><div><p class="route">${escapeHtml(letter.accent)}</p><h1 id="letter-title"></h1></div><span class="country-stamp">${escapeHtml(letter.flag)}<small>${escapeHtml(letter.country)}</small></span></div>
      <div class="photo-strip"><div class="photo-slot left">OUR PHOTO<small>01</small></div><div class="photo-slot right">OUR PHOTO<small>02</small></div></div>
      <div class="language-switch"><button data-language="native" class="active">${escapeHtml(letter.nativeLabel)}</button><button data-language="english">English</button></div>
      <div id="letter-copy" class="letter-copy"></div>
      <p id="letter-signoff" class="letter-signoff"></p>
      <button id="back" class="letter-back">← 登出</button>
    </article>`;

  function show(copy, language) {
    document.querySelector("#letter-title").textContent = copy.greeting;
    document.querySelector("#letter-copy").innerHTML = copy.paragraphs.length
      ? copy.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")
      : `<p class="draft-note">${language === "native" ? "편지를 준비하고 있어요. 조금만 기다려 주세요 🍁" : "Your letter is being written. Please check back soon 🍁"}</p>`;
    document.querySelector("#letter-signoff").textContent = copy.signoff;
    document.querySelectorAll("[data-language]").forEach((item) => item.classList.toggle("active", item.dataset.language === language));
  }

  document.querySelector("[data-language=native]").addEventListener("click", () => show(native, "native"));
  document.querySelector("[data-language=english]").addEventListener("click", () => show(english, "english"));
  document.querySelector("#back").addEventListener("click", () => {
    app.className = "welcome-stage";
    app.innerHTML = initialMarkup;
    bindLogin();
  });
  show(native, "native");
}

bindLogin();
