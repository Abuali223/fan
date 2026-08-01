# Bilimdon — Onlayn ta'lim platformasi

**IT, Kimyo, Matematika va Ona tili** fanlari uchun full-stack ta'lim
platformasi. Darslar (matn + video), avtomatik baholanadigan testlar, o'quvchi
progressi va alohida **admin / boshqaruvchi** paneli.

> ⚙️ **Zero-dependency:** backend faqat Node.js ichki modullaridan foydalanadi
> (`node:http`, `node:sqlite`, `node:crypto`). `npm install` **shart emas** —
> hech qanday tashqi kutubxona yo'q.

---

## ✨ Imkoniyatlar

- **3 ta rol:** Administrator, Boshqaruvchi (menejer), O'quvchi
- **Ikki bo'lim:** o'quv bo'limi (o'quvchilar) va boshqaruv bo'limi (admin/menejer)
- **Darslar:** matn (HTML) + YouTube video
- **Testlar:** har bir dars uchun savollar, avtomatik baholash, 60% o'tish chegarasi
- **Progress:** tugatilgan darslar, ballar, natijalar tarixi, fanlar bo'yicha progress-bar
- **Admin panel:** fan / dars / test / foydalanuvchilarni to'liq boshqarish (CRUD)
- **Xavfsizlik:** parollar `scrypt` bilan hashlanadi, JWT tokenlar, rol asosidagi ruxsatlar
- **UI/UX:** tungi/kunduzgi rejim, responsive dizayn, toast bildirishnomalar

## 👥 Rollar va ruxsatlar

| Amal | O'quvchi | Boshqaruvchi | Administrator |
|------|:---:|:---:|:---:|
| Darslarni ko'rish, test yechish, progress | ✅ | ✅ | ✅ |
| Fan / dars / test qo'shish, tahrirlash, o'chirish | — | ✅ | ✅ |
| Foydalanuvchilar va rollarni boshqarish | — | — | ✅ |

## 🧰 Texnologiyalar

- **Backend:** Node.js (built-in `node:http` + `node:sqlite` + `node:crypto`)
- **Ma'lumotlar bazasi:** SQLite (fayl asosida)
- **Frontend:** Vanilla JavaScript (ES modullar), CSS3 — freymvorksiz
- **Autentifikatsiya:** JWT (HMAC-SHA256) + scrypt parol hashlash

## 📁 Loyiha tuzilmasi

```
.
├── server/                     # Backend (zero-dependency)
│   ├── server.js               # HTTP kirish nuqtasi (statik + API)
│   ├── router.js               # Minimal yo'naltirgich
│   ├── db.js                   # SQLite ulanish + sxema
│   ├── seed.js                 # Boshlang'ich ma'lumotlar (o'zbekcha)
│   ├── config.js               # Sozlamalar (.env)
│   ├── lib/                    # security, auth, http, validate
│   └── routes/                 # auth, subjects, lessons, quizzes, progress, users, stats
│
├── public/                     # Frontend
│   ├── index.html · subject.html · lesson.html · dashboard.html
│   ├── login.html · register.html · 404.html
│   ├── admin/                  # Boshqaruv paneli sahifalari
│   ├── css/style.css           # Dizayn tizimi
│   └── js/                     # api, auth, ui + pages/ + admin/
│
├── package.json
└── .env.example
```

## 🚀 Ishga tushirish

**Talab:** Node.js **v22.5+** (ichki SQLite uchun).

```bash
# 1. (ixtiyoriy) Muhit sozlamalari
cp .env.example .env      # va JWT_SECRET ni o'zgartiring

# 2. Serverni ishga tushiring — o'rnatish kerak emas!
npm start
```

So'ng brauzerda oching:

- O'quv bo'limi: **http://localhost:3000**
- Boshqaruv paneli: **http://localhost:3000/admin/**

Birinchi ishga tushirishda ma'lumotlar bazasi avtomatik yaratiladi va
o'zbekcha darslar/testlar bilan to'ldiriladi.

### Standart hisoblar

| Rol | Email | Parol |
|-----|-------|-------|
| Administrator | `admin@bilimdon.uz` | `admin123` |
| Boshqaruvchi | `manager@bilimdon.uz` | `manager123` |
| O'quvchi | `student@bilimdon.uz` | `student123` |

> ⚠️ Ishlab chiqarishda bu parollarni albatta o'zgartiring!

### Ma'lumotlarni qayta tiklash

```bash
npm run seed -- --reset   # hamma narsani o'chirib, qaytadan to'ldiradi
```

## 🔌 API (qisqacha)

| Metod | Yo'l | Ruxsat |
|-------|------|--------|
| POST | `/api/auth/register` · `/api/auth/login` | Ochiq |
| GET | `/api/subjects` · `/api/lessons/:id` · `/api/lessons/:id/quiz` | Ochiq |
| POST | `/api/lessons/:id/quiz/submit` · `/api/lessons/:id/complete` | O'quvchi |
| GET | `/api/me/dashboard` | Kirgan foydalanuvchi |
| POST/PUT/DELETE | `/api/subjects` · `/api/lessons` · `/api/questions` | Menejer/Admin |
| GET/POST/PUT/DELETE | `/api/users` · `/api/stats` | Admin (stats: menejer ham) |

Token `Authorization: Bearer <token>` sarlavhasida yuboriladi.

## 🌍 Deploy (joylashtirish)

Bu **to'liq ilova** (server bor), shuning uchun GitHub Pages'da ishlamaydi.
Node.js qo'llab-quvvatlaydigan hostlardan foydalaning:

- **Render**, **Railway**, **Fly.io**, **VPS** va h.k.
- Ishga tushirish buyrug'i: `npm start`
- Muhit o'zgaruvchilari: `JWT_SECRET`, `PORT` ni sozlang.

## 🔒 Xavfsizlik eslatmalari

- Ishlab chiqarishda kuchli `JWT_SECRET` o'rnating.
- Dars matni (`content`) HTML sifatida ko'rsatiladi — uni faqat ishonchli
  xodimlar (admin/menejer) tahrirlaydi. Ochiq foydalanuvchi kontenti yo'q.
- HTTPS orqasida ishlating (reverse proxy: Nginx/Caddy).

## 📄 Litsenziya

MIT — bemalol foydalaning va moslashtiring.
