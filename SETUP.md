# Fuel & Funds — set up your own app (Android + laptop, synced)

About 20 minutes, one time. Everything here is free and needs no card.
You'll make:

1. **A Firebase project**: stores your expenses and syncs them between devices.
2. **A GitHub Pages site**: gives the app a web address your phone can install from.

After that the app runs by itself. Claude isn't involved.

---

## Part A: Firebase (sync)

1. Go to **console.firebase.google.com** and sign in with your Google account.
2. **Create a project** → name it `fuel-and-funds` → turn **Google Analytics off** → Create.
3. **Turn on sign-in:** left menu **Security → Authentication → Get started → Sign-in method** tab
   (direct link: https://console.firebase.google.com/project/_/authentication/providers, then pick your project)
   - **Google** → Enable → pick your email as support email → Save.
   - **Email/Password** → Enable → Save.
4. **Create the database:** left menu **Databases & Storage → Firestore → Create database** (pick **Standard edition** if asked)
   - Location: **asia-south1 (Mumbai)** → Next → **Start in production mode** → Create.
   - Open the **Rules** tab, delete what's there, paste everything from `firestore.rules`, and click **Publish**.
5. **Get your config:** click the gear ⚙ → **Project settings** → scroll to **Your apps** → click the **</>** (Web) icon
   - Nickname `fuel-and-funds` → **Register app** (leave "Firebase Hosting" unticked).
   - You'll see `const firebaseConfig = { apiKey: "...", ... }`.
   - Open **`firebase-config.js`** in a text editor (TextEdit: Format → Make Plain Text) and replace each `PASTE_...` value with yours. Save.

> These config values aren't passwords. Your data is protected by the rules from step 4: only you, signed in, can read or write your expenses.

## Part B: GitHub Pages (web address)

1. Sign up at **github.com** (free).
2. Click **+ → New repository** → name `fuel-and-funds` → **Public** → Create repository.
3. Click **"uploading an existing file"**. Drag in **all files from this folder, including the `icons` folder** → **Commit changes**.
   - Don't upload `my-data.json`. It holds your expenses and the repository is public. Keep it on your laptop.
4. **Settings → Pages** → Source: **Deploy from a branch** → Branch **main**, folder **/ (root)** → Save.
5. Wait 1–2 minutes. Your app is at **`https://YOUR-USERNAME.github.io/fuel-and-funds/`**
6. **Allow that address to sign in:** back in Firebase → **Authentication → Settings → Authorized domains → Add domain** → `YOUR-USERNAME.github.io` → Add.

## Part C: Install it

**Android phone**
1. Open your app address in **Chrome**.
2. Sign in with Google (or email).
3. Tap **⋮ → Install app** (or **Add to Home screen**). It now opens full-screen from your app drawer and works offline.

**Laptop**
- **Chrome or Edge:** open the address → click the **install icon** at the right of the address bar (or the **Install app** button in the app header).
- **Safari on Mac (macOS Sonoma or later):** File → **Add to Dock**.

Sign in with the **same account** on both devices, and they stay in sync.

## Part D: Bring in your existing expenses

On one device: **Budget → Import JSON** → choose `my-data.json`.
If you also used the local laptop version, import its `data.json` the same way.
Importing merges by entry, so nothing gets duplicated.

---

## How sync behaves

- **Offline:** you can add expenses with no internet. The badge says *Offline · will sync later* and they upload by themselves when you're back online.
- **Two devices:** a new entry shows up on the other device within a few seconds once both are online.
- **Same month edited offline on both:** if you add entries for the same month on both devices while *both* are offline, the device that syncs last wins for that month. Avoid that, or export a backup first.

## Updating the app later

Change a file, open `sw.js`, change `const VERSION = "ff-v1"` to `"ff-v2"`, and upload the changed files to GitHub.
Phones pick up the update after the app has been opened and closed once.

## Troubleshooting

| You see | Fix |
|---|---|
| "This web address isn't allowed yet" | Part B step 6: add `YOUR-USERNAME.github.io` to Authorized domains. |
| "This sign-in method is off" | Part A step 3: enable Google and Email/Password. |
| "Sync failed (permission-denied)" | Part A step 4: paste `firestore.rules` into the Rules tab and Publish. |
| Badge says "Saved on this device" and there's no sign-in screen | `firebase-config.js` still has `PASTE_...` values, or the old version is cached. Fix the file, upload it, then reload twice. |
| No "Install app" option | Use Chrome, and open the `https://…github.io` address, not a downloaded file. |
| 404 on the GitHub address | Wait 2 minutes, and check that `index.html` is at the top level of the repository, not inside a subfolder. |

## Costs

Firebase's free **Spark** plan allows 50,000 reads and 20,000 writes per day. A person logging expenses uses a few dozen, so it stays free.
