
const STORAGE_KEY = "vaultly_encrypted_vault_v1";
const THEME_KEY = "vaultly_theme";
const ITERATIONS = 310000;

let vaultKey = null;
let entries = [];

const $ = id => document.getElementById(id);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Convert bytes to Base64
function toBase64(bytes) {
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join(""));
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}

function randomBytes(length) {
  return crypto.getRandomValues(new Uint8Array(length));
}

// Derive encryption key from master password
async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256"
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt vault
async function encryptVault(data, key, salt) {
  const iv = randomBytes(12);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(JSON.stringify(data))
  );

  return {
    version: 1,
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(encrypted))
  };
}

// Decrypt vault
async function decryptVault(record, key) {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: fromBase64(record.iv)
    },
    key,
    fromBase64(record.data)
  );

  return JSON.parse(decoder.decode(decrypted));
}

// Read saved vault
function getStoredVault() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

// Save encrypted vault
async function saveVault() {
  if (!vaultKey) throw new Error("Vault is locked.");

  const existing = getStoredVault();
  const salt = fromBase64(existing.salt);

  const encrypted = await encryptVault(
    entries,
    vaultKey,
    salt
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(encrypted)
  );

  renderPasswords();
}

// Toast notification
function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Theme settings
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;

  localStorage.setItem(THEME_KEY, theme);

  $("themeBtn").textContent =
    theme === "dark" ? "☾" : "☼";
}

function initializeTheme() {
  const theme =
    localStorage.getItem(THEME_KEY) || "light";

  setTheme(theme);
}

// Authentication screen
function setAuthMode(isNew) {
  $("authTitle").textContent =
    isNew ? "Create Your Vault" : "Welcome Back";

  $("authDescription").textContent = isNew
    ? "Choose a master password to protect your vault."
    : "Enter your master password to unlock your vault.";

  $("confirmWrap").classList.toggle("hidden", !isNew);

  $("confirmPassword").required = isNew;

  $("authSubmit").textContent =
    isNew ? "Create Secure Vault" : "Unlock My Vault";

  $("authError").textContent = "";
}

// Create or unlock vault
async function authenticate(event) {
  event.preventDefault();

  const password = $("masterPassword").value;
  const record = getStoredVault();
  const isNew = !record;

  if (password.length < 10) {
    $("authError").textContent =
      "Master password must contain at least 10 characters.";
    return;
  }

  if (
    isNew &&
    password !== $("confirmPassword").value
  ) {
    $("authError").textContent =
      "Passwords do not match.";
    return;
  }

  $("authSubmit").disabled = true;
  $("authSubmit").textContent = "Please wait...";

  try {
    if (isNew) {
      const salt = randomBytes(16);

      vaultKey = await deriveKey(password, salt);
      entries = [];

      const encrypted = await encryptVault(
        entries,
        vaultKey,
        salt
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(encrypted)
      );

    } else {
      vaultKey = await deriveKey(
        password,
        fromBase64(record.salt)
      );

      entries = await decryptVault(record, vaultKey);

      if (!Array.isArray(entries)) {
        throw new Error("Invalid vault");
      }
    }

    $("authOverlay").classList.add("hidden");

    renderPasswords();

    showToast(
      isNew
        ? "Your secure vault has been created!"
        : "Vault unlocked successfully!"
    );

  } catch (error) {
    vaultKey = null;

    $("authError").textContent =
      "Incorrect master password or damaged vault data.";

  } finally {
    $("authSubmit").disabled = false;

    $("authSubmit").textContent =
      isNew ? "Create Secure Vault" : "Unlock My Vault";
  }
}

// Lock vault
function lockVault() {
  vaultKey = null;
  entries = [];

  $("searchInput").value = "";

  $("authOverlay").classList.remove("hidden");

  $("masterPassword").value = "";
  $("confirmPassword").value = "";

  setAuthMode(!getStoredVault());
}

// Password strength
function getStrength(password) {
  let score = 0;

  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  if (/[a-z]/.test(password) &&
      /[A-Z]/.test(password)) score++;

  if (/[0-9]/.test(password)) score++;

  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score >= 4) return "Strong";
  if (score >= 2) return "Medium";

  return "Weak";
}

// Generate random password
function generatePassword() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-+=";

  const random = randomBytes(20);

  return Array.from(
    random,
    value => characters[value % characters.length]
  ).join("");
}

// Escape user data before inserting HTML
function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]
  );
}

// Update password list and statistics
function renderPasswords() {
  const search = $("searchInput").value
    .trim()
    .toLowerCase();

  const filtered = entries.filter(item => {
    return [
      item.site,
      item.username,
      item.email
    ].some(value =>
      String(value || "").toLowerCase().includes(search)
    );
  }).sort((a, b) => b.updatedAt - a.updatedAt);

  $("totalStat").textContent = entries.length;

  $("strongStat").textContent =
    entries.filter(item =>
      getStrength(item.password) === "Strong"
    ).length;

  $("emptyState").classList.toggle(
    "hidden",
    entries.length > 0
  );

  $("passwordList").innerHTML = filtered.map(item => `
    <div class="password-row" data-id="${escapeHTML(item.id)}">

      <div class="site-avatar">
        ${escapeHTML(item.site.charAt(0))}
      </div>

      <div class="entry-info">
        <div class="entry-name">
          ${escapeHTML(item.site)}
        </div>

        <div class="entry-user">
          ${escapeHTML(item.username || item.email || "No username")}
        </div>
      </div>

      <div class="entry-password">
        ••••••••••
      </div>

      <div class="entry-actions">
        <button class="small-action"
          data-action="copy"
          title="Copy password">▣</button>

        <button class="small-action"
          data-action="edit"
          title="Edit password">✎</button>

        <button class="small-action"
          data-action="delete"
          title="Delete password">×</button>
      </div>

    </div>
  `).join("");

  const noResults = search && filtered.length === 0;

  if (noResults) {
    $("passwordList").innerHTML =
      '<p style="padding:25px;text-align:center;color:var(--muted)">No matching passwords found.</p>';
  }
}

// Open add/edit modal
function openModal(item = null) {
  $("entryForm").reset();

  $("entryError").textContent = "";

  $("entryId").value = item?.id || "";

  $("modalTitle").textContent =
    item ? "Edit Password" : "Add Password";

  $("siteInput").value = item?.site || "";
  $("usernameInput").value = item?.username || "";
  $("emailInput").value = item?.email || "";
  $("passwordInput").value = item?.password || "";
  $("notesInput").value = item?.notes || "";

  $("passwordInput").type = "password";
  document.querySelector('[data-reveal="passwordInput"]').textContent = "Show";

  updateStrength();

  $("entryOverlay").classList.remove("hidden");
}

// Close modal
function closeModal() {
  $("entryOverlay").classList.add("hidden");
}

// Add or update password
async function saveEntry(event) {
  event.preventDefault();

  const id = $("entryId").value;

  const existing = entries.find(item => item.id === id);

  const item = {
    id: id || crypto.randomUUID(),
    site: $("siteInput").value.trim(),
    username: $("usernameInput").value.trim(),
    email: $("emailInput").value.trim(),
    password: $("passwordInput").value,
    notes: $("notesInput").value.trim(),
    updatedAt: Date.now()
  };

  if (!item.site || !item.password) {
    $("entryError").textContent =
      "Website name and password are required.";
    return;
  }

  if (existing) {
    entries = entries.map(entry =>
      entry.id === id ? item : entry
    );
  } else {
    entries.push(item);
  }

  try {
    await saveVault();

    closeModal();

    showToast(
      existing
        ? "Password updated successfully!"
        : "Password saved securely!"
    );

  } catch (error) {
    $("entryError").textContent =
      "Unable to save password. Check browser storage.";
  }
}

// Copy password
async function copyPassword(password) {
  try {
    await navigator.clipboard.writeText(password);
    showToast("Password copied to clipboard!");
  } catch {
    showToast("Clipboard access is unavailable.");
  }
}

// Handle list actions
async function handleListClick(event) {
  const button = event.target.closest("[data-action]");

  if (!button) return;

  const row = button.closest(".password-row");

  const item = entries.find(
    entry => entry.id === row.dataset.id
  );

  if (!item) return;

  const action = button.dataset.action;

  if (action === "copy") {
    await copyPassword(item.password);
  }

  if (action === "edit") {
    openModal(item);
  }

  if (action === "delete") {
    if (confirm(`Delete ${item.site} password?`)) {
      entries = entries.filter(
        entry => entry.id !== item.id
      );

      await saveVault();

      showToast("Password deleted successfully!");
    }
  }
}

// Password strength display
function updateStrength() {
  const password = $("passwordInput").value;

  $("strengthLabel").textContent =
    "Password strength: " +
    (password ? getStrength(password) : "—");
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {

  initializeTheme();

  setAuthMode(!getStoredVault());

  $("authForm").addEventListener(
    "submit",
    authenticate
  );

  $("entryForm").addEventListener(
    "submit",
    saveEntry
  );

  $("addBtn").addEventListener(
    "click",
    () => openModal()
  );

  $("emptyAddBtn").addEventListener(
    "click",
    () => openModal()
  );

  $("closeModal").addEventListener(
    "click",
    closeModal
  );

  $("cancelModal").addEventListener(
    "click",
    closeModal
  );

  $("entryOverlay").addEventListener("click", event => {
    if (event.target === $("entryOverlay")) {
      closeModal();
    }
  });

  $("themeBtn").addEventListener("click", () => {
    const current =
      document.documentElement.dataset.theme;

    setTheme(current === "dark" ? "light" : "dark");
  });

  $("lockBtn").addEventListener(
    "click",
    lockVault
  );

  $("searchInput").addEventListener(
    "input",
    renderPasswords
  );

  $("passwordList").addEventListener(
    "click",
    handleListClick
  );

  $("generateBtn").addEventListener("click", () => {
    $("passwordInput").value = generatePassword();

    $("passwordInput").type = "text";

    document.querySelector(
      '[data-reveal="passwordInput"]'
    ).textContent = "Hide";

    updateStrength();
  });

  $("passwordInput").addEventListener(
    "input",
    updateStrength
  );

  document.querySelectorAll("[data-reveal]").forEach(button => {
    button.addEventListener("click", () => {
      const input = $(button.dataset.reveal);

      input.type =
        input.type === "password" ? "text" : "password";

      button.textContent =
        input.type === "password" ? "Show" : "Hide";
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });

  if (!window.crypto?.subtle) {
    $("authError").textContent =
      "Secure encryption requires HTTPS or localhost and a modern browser.";
  }
});
