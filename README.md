# 🌸 BLOOM CYCLE

> An elegant, private, non-commercial, offline-first women's period and holistic cycle health tracking Progressive Web Application (PWA).

Built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**. Designed in a burgundy `#8F1538`, cherry red `#C62845`, rose pink `#F4C2CC`, blush `#FFF0F2`, and warm cream `#FFF9F5` aesthetic.

---

## 🔒 100% Free & Private by Architecture

- **Zero mandatory accounts, logins, or tracking pixels**: All records remain exclusively on your device.
- **Client-Side Storage**: Powered by typed, versioned browser **IndexedDB**.
- **Works completely offline**: Includes a custom Service Worker (`/sw.js`) and Web App Manifest (`/manifest.webmanifest`).
- **Free hosting**: Static bundle can be hosted on GitHub Pages, Cloudflare Pages, Vercel, or Netlify at **\$0.00 cost**.
- **No paid AI APIs or external servers**: Cycle calculations and phase modeling run on device.

---

## ✨ Feature Modules

### 1. Guided Onboarding
- Guided setup for last period start date, average cycle length (20–45 days), period bleeding duration (2–10 days), and regularity variance.
- Privacy transparency notice and medical prediction disclaimer.
- Optional nickname and customizable reminder toggles.

### 2. Home Dashboard
- Today's date with a personalized greeting and cycle status badge.
- Interactive SVG **Cycle Ring**: phase arcs, cycle day counter, and countdown to next period.
- Current phase deep-dive (Menstrual, Follicular, Ovulatory, Luteal) with tailored nutrition, movement, and self-care recommendations.
- Interactive 8-glass daily water hydration tracker.
- Today's logged summary snapshot with single-tap quick entry.

### 3. Interactive Period Calendar
- Real monthly calendar with previous/next month navigation and "Today" quick-jump.
- Color-coded indicators:
  - Logged periods (Cherry/burgundy fill with flow indicators)
  - Predicted periods (Soft dashed blush borders)
  - Fertile window & Ovulation day (Amber star / rose highlight)
  - Dots for logged symptoms, moods, and private notes
- Tap any date to view, log, edit, or delete period flow, symptoms, and diary entries.

### 4. Cycle & Phase Engine
- Dynamically estimates phases from verified consecutive period start dates without inventing historical data.
- **Never assumes day 14 ovulation for all cycles**: dynamically calculates ovulation using customizable luteal phase length ($CycleLength - LutealLength$).
- Evaluates statistical regularity and flags small sample sizes ($<3$ cycles).

### 5. Comprehensive Symptom Tracker
- Pre-configured bodily symptoms: Pelvic Cramps, Headache, Back Pain, Breast Tenderness, Bloating, Fatigue, Nausea, Acne, Food Cravings, Sleep Changes, and Digestive Symptoms.
- Severity rating from 1 to 5 with real-time feedback.
- Cervical mucus observations: Dry, Sticky, Creamy, Watery, Egg-white (fertile), Spotting.
- Custom symptom builder: add any personalized symptom tag.

### 6. Mood & Reflection Journal
- Multi-mood tag selector (Happy, Calm, Energetic, Grateful, Sensitive, Anxious, Sad, Irritable, Overwhelmed, Low).
- Sliders for mood intensity, stress level, energy, sleep quality, and hours slept.
- Private diary text area with timestamped entries and filterable timeline.

### 7. Medical & Clinical Log
- Medications & supplements tracking with user-entered dosage, date, time, and medical reason.
- Doctor / clinician appointment tracker with location and questions checklist.
- Lab test results and allergy records.
- Prominent non-prescriptive medical disclaimer.

### 8. Hygiene & Product Timer
- Live countdown timer for Tampons (with TSS awareness warning), Pads, Menstrual Cups, Discs, and Period Underwear.
- Intimate care guide: gentle external vulva washing vs. why to avoid vaginal douching.
- Reusable product sanitization and cleaning instructions.
- Interactive period emergency kit checklist.

### 9. Health Education Library
- Searchable medical literacy library with category filters.
- Guides on:
  - The 4 Menstrual Phases
  - Understanding PMS & PMDD
  - Cramps: Primary vs. Secondary Dysmenorrhea
  - Cervical Mucus Literacy
  - PCOS (Rotterdam criteria) & Endometriosis Awareness
  - Preparing for Your OB/GYN Appointment
  - ⚠️ **Urgent Red Flags Guide**: Severe sudden unilateral pelvic pain, fainting, soaking $\ge 2$ pads/hr for 2+ consecutive hours with dizziness, and TSS symptoms.

### 10. Insights & Trend Analytics
- Statistical KPI cards: Average cycle length, average bleeding duration, regularity score, and total verified cycles.
- Cycle length history bar chart with normal reference baseline (21–35 days).
- Top symptom frequency and average severity ranking.
- Emotional wellness and energy level averages across cycles.

### 11. Profile & Data Governance
- Adjust cycle parameters (baseline length, luteal length, bleeding days).
- Notification preferences and in-app sound chime tester.
- One-click **JSON Backup Export** and validated **JSON Backup Import**.
- **Load Realistic Demo Data**: Instantly populates 3 months of realistic cycles for testing.
- **Danger Zone**: Wipe all IndexedDB data with strict confirmation.

---

## 🚀 Running Locally

```bash
# Navigate to the project directory
cd C:\Users\WELCOME\.gemini\antigravity\scratch\bloom-cycle

# Start development server
npm run dev

# Or build and run production preview
npm run build
npm run preview
```

Open `http://localhost:5173` in your browser.

---

## 🌐 100% Free Hosting & Deployment

Because Bloom Cycle is completely client-side and requires no paid databases or backend servers, you can host it for free on any static host:

### Option A: Cloudflare Pages (Free)
1. Push this directory to a GitHub repository.
2. In Cloudflare Dashboard, go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select your repo and use:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**. (Custom domains and SSL are 100% free).

### Option B: Vercel (Free Hobby Tier)
```bash
npx vercel
```
Accept default settings (`dist` output directory).

### Option C: Netlify (Free Tier)
```bash
npx netlify deploy --prod --dir=dist
```

### Option D: GitHub Pages (Free)
Add `base: '/<repo-name>/'` to `vite.config.ts`, build, and push `dist` to `gh-pages` branch.
