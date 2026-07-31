# Nexora — Premium Raqamli Studiya Sayti

**Vanilla HTML5, CSS3 va JavaScript (ES2023)** da yozilgan, ishlab chiqarish
(production) darajasidagi ko'p sahifali marketing sayti — freymvorksiz,
Bootstrap va jQuery ishlatilmagan. Minimalistik, premium, to'liq moslashuvchan
va qulay (accessible).

## ✨ Asosiy xususiyatlar

- **Zamonaviy UI/UX** — toza dizayn tizimi ustiga qurilgan minimalistik, premium ko'rinish
- **To'liq responsive** — telefon, planshet va kompyuter (CSS Grid + Flexbox)
- **Tungi / Kunduzgi rejim** — tizim sozlamasini hisobga oladi, tanlovingizni eslab qoladi
- **Qulay (WCAG 2.1 AA)** — semantik HTML, klaviatura qo'llab-quvvatlashi, ARIA, skip-link, focus holatlari, reduced-motion
- **SEO uchun tayyor** — meta teglar, Open Graph/Twitter, JSON-LD, `sitemap.xml`, `robots.txt`
- **Tez** — lazy-loading rasmlar, `IntersectionObserver`, minimal va modulli kod
- **Bog'liqliksiz** — hamma narsa qo'lda yozilgan vanilla kod

### Interaktiv funksiyalar

Yuklanish ekrani · Sticky navbar · Mobil menyu · Skroll progress paneli ·
Skroll reveal animatsiyalari · Animatsiyali statistika hisoblagichlari ·
Sharhlar slayderi · FAQ akkordeoni · Galereya filtrlash · Rasm lightbox ·
Forma validatsiyasi · Toast bildirishnomalari · Yuqoriga qaytish tugmasi ·
Tugma ripple effekti.

## 📁 Loyiha tuzilmasi

```
.
├── index.html              # Bosh sahifa (barcha 10 bo'lim)
├── about.html              # Tarix, qadriyatlar, jamoa
├── gallery.html            # Filtrlanadigan portfolio + lightbox
├── contact.html            # Aloqa formasi + ma'lumotlar
│
├── css/
│   ├── style.css           # Dizayn tizimi + komponentlar/bo'limlar
│   ├── responsive.css      # Breakpointlar (desktop-first)
│   └── animations.css      # Keyframelar + scroll-reveal + reduced-motion
│
├── js/
│   ├── app.js              # Asosiy: loader, progress, back-to-top, FAQ, slayder, toast
│   ├── navbar.js           # Sticky header, mobil menyu, scroll-spy
│   ├── darkmode.js         # Mavzu almashtirish + saqlash
│   ├── gallery.js          # Filtrlash + qulay lightbox
│   ├── animation.js        # Reveal, hisoblagichlar, ripple, lazy-load
│   └── validation.js       # Forma validatsiyasi + qoralama saqlash + yangiliklar
│
├── assets/
│   ├── images/             # SVG hero/about vizuallar + galereya + OG rasm
│   ├── icons/              # favicon.svg
│   └── fonts/              # Shrift strategiyasi (fonts/README.md ga qarang)
│
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages'ga avtomatik deploy
│
├── robots.txt
├── sitemap.xml
└── site.webmanifest
```

## 🚀 Lokal ishga tushirish

Bu statik sayt — build bosqichi kerak emas. `index.html` ni to'g'ridan-to'g'ri
oching yoki server orqali uzating (tavsiya etiladi):

```bash
# Python 3
python3 -m http.server 8000

# yoki Node
npx serve .
```

So'ng <http://localhost:8000> manziliga o'ting.

## 🌍 GitHub Pages'da deploy qilish

Repozitoriyada `.github/workflows/deploy.yml` mavjud. U branchga har push
qilinganda saytni avtomatik GitHub Pages'ga chiqaradi.

Bir martalik sozlash (agar avtomatik yoqilmasa): **Settings → Pages →
Build and deployment → Source: GitHub Actions** ni tanlang.

Jonli havola: `https://<foydalanuvchi>.github.io/<repo>/`.

## 🎨 Moslashtirish

- **Ranglar / masofa / radiuslar** — `css/style.css` dagi `:root` (va tungi
  rejim uchun `[data-theme="dark"]`) CSS o'zgaruvchilarini tahrirlang.
- **Brend palitrasi**: `#0F172A` · `#2563EB` · `#38BDF8` · `#FFFFFF`.
- **Shrift** — Poppins, Google Fonts orqali yuklanadi. Self-host uchun
  `assets/fonts/README.md` ga qarang.
- **Kontent** — barcha matn o'zbek tilida va to'g'ridan-to'g'ri HTML ichida.

## 🔌 Aloqa formasini ulash

Forma klient tomonida tekshiriladi va hozircha yuborishni simulyatsiya qiladi.
Uni ishga tushirish uchun `js/validation.js` dagi `Simulated send` izohiga o'z
endpoint'ingizni qo'shing — masalan `fetch("/api/contact", …)`.

## 🌐 Deploy'dan oldin

1. Har bir sahifadagi `https://www.nexora.example/` ni haqiqiy domeningizga
   almashtiring (`canonical` / Open Graph teglar, `sitemap.xml`, `robots.txt`).
2. (Ixtiyoriy) Kengroq ijtimoiy ko'rinish uchun `assets/images/og-image.svg`
   ning PNG versiyasini yarating.

## 📄 Litsenziya

O'z loyihalaringiz uchun bemalol foydalanish va moslashtirish mumkin.
