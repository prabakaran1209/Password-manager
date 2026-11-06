
# 🔐 Vaultly – Password Manager

Vaultly is a modern and responsive password manager web application built using HTML, CSS, and JavaScript. It helps users securely store, organize, and manage their passwords in one place.

The application features a clean dashboard, password generator, encrypted local storage, and light and dark themes for a better user experience.

LIVE URL : https://prabakaran1209.github.io/Password-manager/

## ✨ Features

- **Master Password Authentication** – Create and unlock your personal password vault.
- **Secure Password Storage** – Encrypt saved credentials using AES-GCM.
- **Add Passwords** – Store website names, usernames, emails, and passwords.
- **Edit & Delete** – Easily manage saved credentials.
- **Password Generator** – Generate strong and random passwords.
- **Password Strength Checker** – Check password strength.
- **Show / Hide Password** – Control password visibility.
- **Copy to Clipboard** – Quickly copy saved passwords.
- **Search Functionality** – Find saved accounts easily.
- **Light & Dark Mode** – Switch between themes.
- **Responsive Design** – Works on desktop, tablet, and mobile devices.

## 🛠️ Technologies Used

- HTML5 – Application structure
- CSS3 – Styling and responsive design
- JavaScript – Application functionality
- Web Crypto API – Password encryption and key derivation
- Local Storage – Store encrypted vault data

## 📸 Application Preview

The application includes:

- Modern dashboard interface
- Password management section
- Secure master password screen
- Password generator
- Light and dark themes

## 📂 Project Structure

```text
password-manager/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/password-manager.git
```

### 2. Open the Project

```bash
cd password-manager
```

### 3. Run the Application

Open `index.html` in your browser.

Alternatively, use the **Live Server** extension in Visual Studio Code.

> Note: Web Crypto API requires a secure context. Use localhost for local development or HTTPS for deployment.

## 🌐 Deployment on GitHub Pages

Follow these steps to deploy the project:

1. Create a new repository on GitHub.
2. Upload `index.html`, `style.css`, and `script.js`.
3. Open your repository settings.
4. Navigate to **Pages**.
5. Select **Deploy from a branch**.
6. Choose the `main` branch.
7. Select the `/root` folder.
8. Click **Save**.

Your application will be published at:

```text
https://your-username.github.io/password-manager/
```

## 🔒 Security Information

Vaultly uses browser-based encryption to protect stored credentials.

- AES-GCM 256-bit encryption.
- PBKDF2 with SHA-256 key derivation.
- Random salt and initialization vector.
- Master password is not stored.
- Credentials are stored as encrypted data in browser Local Storage.

**Important:** This is an educational project and has not undergone an independent security audit. It does not provide cloud synchronization or automatic backups. Losing browser data or forgetting the master password can result in permanent data loss. Avoid storing critical credentials in this project.

## 🎯 Project Objective

The main objective of Vaultly is to develop a simple, user-friendly password management application that demonstrates frontend development, browser-based encryption, and responsive UI design.

## 🔮 Future Enhancements

- Password import and export
- Password strength analytics
- Automatic password expiry reminders
- Secure backup and restore
- Cloud synchronization
- Two-factor authentication

## 👨‍💻 Author

**Prabakaran S**

GitHub: [@prabakaran1209](https://github.com/prabakaran1209)

---

⭐ If you find this project useful, consider giving it a star on GitHub!

**Built with HTML, CSS & JavaScript.**
