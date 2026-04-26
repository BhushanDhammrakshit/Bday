# 💖 Birthday Countdown Website

A romantic, pink-themed countdown to **May 2, 2026** with an unlockable memory timeline and a birthday surprise reveal.

## 📁 Project Structure

```
bday/
├── index.html        # Main page (countdown + timeline + reveal)
├── styles.css        # Pink/romantic theme, animations, responsive
├── script.js         # Countdown logic, timeline builder, confetti
├── memories.js       # ✏️ EDIT THIS — your memory entries
├── images/           # Add your photos here (memory1.jpg ... memory10.jpg)
└── README.md
```

## ✏️ Personalize It

1. **Open `memories.js`** and edit each entry:
   - `date` — when the memory unlocks (`YYYY-MM-DD`)
   - `title` — short heading
   - `text` — your message
   - `image` — path to a photo in `images/`
2. **Change the target date** at the top of `memories.js`:
   ```js
   const TARGET_BIRTHDAY = '2026-05-02T00:00:00';
   ```
3. **Drop your photos** into the `images/` folder using the names referenced in `memories.js` (or change the paths). If an image is missing, a pretty pink placeholder shows automatically.

## 👀 Preview Locally

Just open `index.html` in your browser, or run a tiny local server:

```powershell
# from the project folder
python -m http.server 5500
# then open http://localhost:5500
```

To **preview the birthday reveal** without waiting, append `?reveal=1` to the URL.

## 🚀 Deploy to GitHub Pages

1. Create a new **public** repo on GitHub (e.g. `birthday-countdown`).
2. From this folder:
   ```powershell
   git init
   git add .
   git commit -m "Birthday countdown 💖"
   git branch -M main
   git remote add origin https://github.com/<your-username>/birthday-countdown.git
   git push -u origin main
   ```
3. On GitHub → **Settings → Pages** → Source: `Deploy from branch` → Branch: `main` / `(root)` → **Save**.
4. Your site goes live at: `https://<your-username>.github.io/birthday-countdown/`

## 💡 Tips

- Compress photos (under ~300 KB each) so the page loads fast.
- Locked future memories show a 🔒 placeholder until their unlock date.
- The countdown auto-reveals the birthday message at midnight on May 2nd.
- Click **Make a Wish** on reveal day for extra confetti 🎉.

Made with 💗
