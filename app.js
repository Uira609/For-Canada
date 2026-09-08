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
      error.textContent = "The name or private code is incorrect. Please try again.";
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
      <div class="language-switch" role="group" aria-label="Letter language"><button data-language="english" class="active">English</button><button data-language="native">${escapeHtml(letter.nativeLabel)}</button>${letter.taiwanese ? '<button data-language="taiwanese">台灣語</button>' : ""}</div>
      <div id="letter-copy" class="letter-copy"></div>
      <p id="letter-signoff" class="letter-signoff"></p>
      <button id="back" class="letter-back">← Sign out</button>
    </article>`;

  function show(copy, language) {
    document.querySelector("#letter-title").textContent = copy.greeting;
    document.querySelector("#letter-copy").innerHTML = copy.paragraphs.length
      ? copy.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")
      : `<p class="draft-note">${language === "taiwanese" ? "信件準備中，請再稍等一下 🍁" : language === "native" ? (letter.nativeLabel === "日本語" ? "手紙を準備しています。もう少し待っていてね 🍁" : "편지를 준비하고 있어요. 조금만 기다려 주세요 🍁") : "Your letter is being written. Please check back soon 🍁"}</p>`;
    document.querySelector("#letter-signoff").textContent = copy.signoff;
    document.querySelectorAll("[data-language]").forEach((item) => {
      const selected = item.dataset.language === language;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
  }

  document.querySelector("[data-language=native]").addEventListener("click", () => show(native, "native"));
  document.querySelector("[data-language=english]").addEventListener("click", () => show(english, "english"));
  if (letter.taiwanese) document.querySelector("[data-language=taiwanese]").addEventListener("click", () => show(letter.taiwanese, "taiwanese"));
  document.querySelector("#back").addEventListener("click", () => {
    app.className = "welcome-stage";
    app.innerHTML = initialMarkup;
    bindLogin();
  });
  show(english, "english");
}

bindLogin();
