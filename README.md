# HER CYCLE

> An elegant, private, non-commercial, offline-first women's health and menopause tracking Progressive Web Application (PWA).

Built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**. Styled with an elegant burgundy `#8F1538`, cherry red `#C62845`, rose pink `#F4C2CC`, blush `#FFF0F2`, and warm cream `#FFF9F5` aesthetic.

---

## 100% Free & Private by Architecture

- **Zero mandatory accounts, logins, or tracking pixels**: All records remain exclusively on your device.
- **Client-Side Storage**: Powered by typed, versioned browser **IndexedDB** (`hercycle_db` v2).
- **Works completely offline**: Includes a custom Service Worker (`/sw.js`) and Web App Manifest (`/manifest.webmanifest`).
- **Zero backend required**: Static bundle can be deployed on Vercel, Cloudflare Pages, Netlify, or GitHub Pages at **$0.00 cost**.
- **No paid AI APIs or external servers**: "Ask HER" assistant and cycle/phase calculations run entirely in the browser.

---

## Official Brand & Logo

- Official artwork: Peony and crescent moon motif in burgundy.
- Logo assets:
  - `/public/hercycle-logo.png` — Official high-resolution logo image
  - `/public/icon-192.png` and `/public/icon-512.png` — PWA and iOS home screen icons
  - `/public/favicon.svg` — Vector browser tab favicon

---

## Features

### 1. Phone Number & Six-Digit PIN Authentication
- Account creation with international phone number validation (India +91 supported) and a personal 6-digit numeric PIN.
- Password/PIN protection using client-side Web Crypto API SHA-256 with unique 16-byte random salt.
- In-memory session authentication with show/hide PIN controls.
- Automatic rate-limiting and temporary 30-second lockout after 5 consecutive failed attempts.
- In-app PIN change and safe account reset flow.
- Full security transparency: clear disclosure that phone number identifies the local account and data is stored locally in IndexedDB without external server transmission.

### 2. Menopause Onboarding & Stage Selection
- Multi-stage selection:
  - Menstrual cycle tracking
  - Perimenopause (transition, hot flashes, irregular cycles)
  - Menopause (12+ consecutive months without period)
  - Postmenopause (long-term vitality, bone & cardiovascular health)
  - Combined women's health tracking
  - Not sure yet (self-observation)
- Tailored baseline collection: optional last period date, recent cycle changes, primary health concerns, and custom reminders.
- Skip optional questions anytime; stage is never diagnosed from age or symptoms alone.

### 3. Daily Symptom, Mood, and Sleep Tracking
- Comprehensive daily check-ins for:
  - Vasomotor: Hot flash frequency (count), severity (1–5), night sweats (1–5)
  - Sleep: Hours slept, sleep quality (1–5), night awakenings
  - Cognitive & Mood: Brain fog, concentration difficulty, anxiety, irritability, mood rating (1–5)
  - Physical: Fatigue, headaches/migraines, joint pain, muscle tension (1–5)
  - Urogenital: Vaginal dryness, urinary frequency/urgency, libido shifts (1–5)
  - Other: Heart palpitations, skin and hair changes (1–5)
  - Custom symptoms: Add custom named symptoms with 1–5 severity sliders
  - Context: Stress level, energy level, possible user-reported triggers, and freeform notes
- Multiple entries per day supported with timestamps, inline editing, and deletion.

### 4. Menstrual & Postmenopausal Bleeding History
- Calendar and timeline tracking for:
  - Menstrual periods
  - Perimenopausal irregular bleeding
  - Spotting
  - Postmenopausal bleeding
  - Unclassified bleeding
- Duration, flow intensity (spotting, light, medium, heavy), and notes.
- Prominent safety alerts: any bleeding after menopause prompts advice for timely clinical assessment; very heavy bleeding with weakness, dizziness, fainting, or severe pain directs users to urgent care.

### 5. Symptom Trend Charts & Personalized Insights
- Interactive time-range filtering: 7 Days, 30 Days, 90 Days, and All Time.
- Interactive SVG charts:
  - Cycle length history with clinical baseline range (21–35 days)
  - Bleeding duration history
  - Daily hot flash counts and frequency bar chart
  - Sleep duration and quality metrics
  - Prevalent symptoms ranking with average severity
  - Emotional wellness, stress, and energy averages
- Sample size and missing data transparency; observational associations are clearly identified without claiming clinical causation.

### 6. Medical Log & Doctor-Ready PDF Report
- Medical log for prescriptions, Menopausal Hormone Therapy (MHT / HRT), dosages, reported side effects, clinical appointments, and laboratory results.
- Printable/PDF summary generator:
  - HER CYCLE official branding and report date
  - User-selected reporting timeframe
  - User-selected menopause stage
  - Statistical cycle summaries and consecutive cycle intervals
  - Menopause symptom frequency and vasomotor summaries
  - Active medications and hormone therapy details
  - Relevant laboratory results and clinical notes
  - User-customizable questions list to bring to the appointment
  - Checkboxes to preview and include/exclude sensitive sections before printing
  - Clinician examination notes box

### 7. Health Education Library & Safety Alerts
- Searchable medical literacy guides categorized by topic:
  - Urgent Red Flags & Emergency Care
  - Menopause & Perimenopause (hormones, stages, cycle changes)
  - Vasomotor Symptom Management (science, triggers, MHT)
  - Postmenopausal Bleeding Safety Alert
  - Genitourinary Syndrome of Menopause (GSM)
  - Menopausal Hormone Therapy (MHT / HRT) Evidence & Decision-Making
  - Menstrual Phases & Hormones
  - Cramps, Dysmenorrhea & PMS / PMDD
  - Discharge & Cervical Mucus Literacy
  - PCOS & Endometriosis Awareness
  - Preparing for an OB/GYN Appointment

### 8. "Ask HER" Educational Assistant
- Private, client-side assistant running locally without paid AI APIs or external data transmission.
- Answers questions about perimenopause, menopause stages, vasomotor symptoms, sleep, mood, hormone therapy, and doctor appointment preparation.
- Summarizes user's self-reported data upon request.
- Prioritizes urgent safety guidance for red-flag symptoms (chest pain, fainting, shortness of breath, massive bleeding).
- Transparently disclaims that it is an educational tool, not a diagnostic service.

### 9. iPhone / iOS PWA Installation
- Validated Web App Manifest with `scope: "/"`, `start_url: "/"`, `display: "standalone"`, and split `any` and `maskable` icon definitions.
- iOS Apple mobile web app metadata: `apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, and `viewport-fit=cover`.
- Custom Service Worker with navigation fallback to `/index.html` for offline SPA routing.
- Contextual, dismissible `IOSInstallBanner` component that appears only in Safari on iOS when not installed, with step-by-step instructions (Share -> Add to Home Screen -> Add).

### 10. Data Governance, Portability & Privacy
- One-click JSON backup export and validated JSON import.
- Preserves all existing data during versioned upgrades.
- Reset demo data and full data wipe functionality.

---

## iPhone Installation Guide

1. Open the deployed HTTPS URL in **Safari** on your iPhone or iPad.
2. Tap the **Share** button (box with an upward arrow) in Safari's bottom toolbar.
3. Scroll down and tap **Add to Home Screen**.
4. (Optional) Edit the display title to **HER CYCLE**.
5. Tap **Add** in the top-right corner. The app icon will appear on your Home Screen and launch in full-screen standalone mode.

*Note: PWA installation on iOS requires Safari and an HTTPS connection. Web browsers such as Chrome or Firefox on iOS do not have system permission to install home screen web apps.*

---

## Running Locally

```bash
# Clone or navigate to the project
cd C:\Users\WELCOME\.gemini\antigravity\scratch\bloom-cycle

# Install dependencies
npm install

# Start development server
npm run dev

# Run type checks
npx tsc --noEmit

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Deploying to Vercel (Free)

1. Push your repository to GitHub:
   ```bash
   git add -A
   git commit -m "feat: complete HER CYCLE upgrade"
   git push origin master
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Connect your GitHub account and import the `hercycle` repository.
4. Vercel automatically detects the Vite framework preset:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. The included `vercel.json` automatically configures SPA URL rewriting, service worker headers, and asset caching.
