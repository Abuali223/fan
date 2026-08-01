/**
 * seed.js — Starter data (Uzbek) + default accounts.
 *
 *   • seedIfEmpty() runs automatically on first server start.
 *   • `npm run seed -- --reset` wipes everything and re-seeds.
 *
 * Default accounts (CHANGE THE PASSWORDS in production!):
 *   admin@bilimdon.uz   / admin123     (admin)
 *   manager@bilimdon.uz / manager123   (boshqaruvchi)
 *   student@bilimdon.uz / student123   (o'quvchi)
 */
import { db } from "./db.js";
import { hashPassword } from "./lib/security.js";

const USERS = [
  { name: "Bosh Admin", email: "admin@bilimdon.uz", password: "admin123", role: "admin" },
  { name: "Menejer Aka", email: "manager@bilimdon.uz", password: "manager123", role: "manager" },
  { name: "Ali Valiyev", email: "student@bilimdon.uz", password: "student123", role: "student" },
];

const SUBJECTS = [
  {
    slug: "it",
    title: "Axborot texnologiyalari",
    description: "Kompyuter savodxonligi, internet va dasturlash asoslari.",
    icon: "code",
    color: "#2563eb",
    lessons: [
      {
        title: "Kompyuter asoslari",
        summary: "Kompyuter nima, uning tuzilishi va asosiy qismlari.",
        content:
          "<p>Kompyuter — bu ma'lumotlarni qabul qiluvchi, saqlovchi, qayta ishlovchi va natijani chiqaruvchi elektron qurilma.</p><h3>Asosiy qismlari</h3><ul><li><strong>Protsessor (CPU)</strong> — kompyuterning \"miyasi\", barcha hisob-kitoblarni bajaradi.</li><li><strong>Operativ xotira (RAM)</strong> — vaqtinchalik xotira, dastur ishlayotganda ma'lumot saqlaydi.</li><li><strong>Doimiy xotira (HDD/SSD)</strong> — fayllar doimiy saqlanadigan joy.</li></ul><p>Kompyuter <em>apparat (hardware)</em> va <em>dasturiy (software)</em> qismlardan iborat.</p>",
        questions: [
          { text: "CPU nimaning qisqartmasi?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Control Panel Unit"], correct_index: 0 },
          { text: "Quyidagilardan qaysi biri kirish qurilmasi?", options: ["Monitor", "Printer", "Klaviatura", "Kolonka"], correct_index: 2 },
          { text: "RAM qanday xotira?", options: ["Doimiy", "Operativ (vaqtinchalik)", "Tashqi", "Optik"], correct_index: 1 },
        ],
      },
      {
        title: "Internet va veb",
        summary: "Internet qanday ishlaydi, brauzer va veb-sahifalar.",
        content:
          "<p>Internet — bu butun dunyo bo'ylab kompyuterlarni bog'laydigan global tarmoq.</p><h3>Muhim tushunchalar</h3><ul><li><strong>Brauzer</strong> — veb-sahifalarni ochib beruvchi dastur (Chrome, Firefox).</li><li><strong>URL</strong> — veb-sahifaning manzili, masalan <code>https://bilimdon.uz</code>.</li><li><strong>HTML</strong> — veb-sahifa tuzilishini yaratadigan til.</li></ul><p>Har bir sayt serverda saqlanadi va brauzer orqali sizga yetkaziladi.</p>",
        questions: [
          { text: "HTML nima uchun ishlatiladi?", options: ["Ma'lumotlar bazasi", "Veb-sahifa tuzilishi", "Rasm tahrirlash", "Antivirus"], correct_index: 1 },
          { text: "Brauzer nima?", options: ["Veb-sahifalarni ko'rish dasturi", "Printer turi", "Xotira", "Parol"], correct_index: 0 },
          { text: "URL nima?", options: ["Fayl turi", "Veb-manzil", "Parol", "Protsessor"], correct_index: 1 },
        ],
      },
      {
        title: "Dasturlash asoslari",
        summary: "Algoritm, o'zgaruvchi va dasturlash tillari haqida.",
        content:
          "<p>Dasturlash — bu kompyuterga bajarish uchun buyruqlar (kod) yozish jarayoni.</p><h3>Asosiy tushunchalar</h3><ul><li><strong>Algoritm</strong> — masalani yechish uchun aniq ketma-ket qadamlar.</li><li><strong>O'zgaruvchi</strong> — ma'lumotni saqlaydigan \"quti\".</li><li><strong>Dasturlash tili</strong> — Python, JavaScript, C++ va boshqalar.</li></ul><p>Yaxshi dastur — bu to'g'ri, tushunarli va tez ishlaydigan kod.</p>",
        questions: [
          { text: "Algoritm nima?", options: ["Aniq ketma-ket amallar", "Kompyuter qismi", "Fayl turi", "Parol"], correct_index: 0 },
          { text: "Quyidagilardan qaysi biri dasturlash tili?", options: ["Python", "HTTP", "USB", "PDF"], correct_index: 0 },
          { text: "O'zgaruvchi nima uchun kerak?", options: ["Ma'lumot saqlash", "Rasm chizish", "Sovutish", "O'chirish"], correct_index: 0 },
        ],
      },
    ],
  },
  {
    slug: "kimyo",
    title: "Kimyo",
    description: "Atom, elementlar va kimyoviy reaksiyalar asoslari.",
    icon: "flask",
    color: "#16a34a",
    lessons: [
      {
        title: "Atom va molekula",
        summary: "Moddaning eng kichik zarralari bilan tanishuv.",
        content:
          "<p>Atom — moddaning kimyoviy xossalarini saqlaydigan eng kichik zarra.</p><h3>Atom tuzilishi</h3><ul><li><strong>Yadro</strong> — markazda, protonlar (musbat) va neytronlardan iborat.</li><li><strong>Elektronlar</strong> — yadro atrofida aylanadi, manfiy zaryadli.</li></ul><p>Atomlar birlashib <strong>molekula</strong> hosil qiladi. Masalan, suv molekulasi — H₂O.</p>",
        questions: [
          { text: "Atom markazida nima joylashgan?", options: ["Yadro", "Elektron", "Molekula", "Ion"], correct_index: 0 },
          { text: "Suv molekulasining formulasi?", options: ["CO₂", "H₂O", "O₂", "NaCl"], correct_index: 1 },
          { text: "Elektronning zaryadi qanday?", options: ["Musbat", "Manfiy", "Neytral", "Yo'q"], correct_index: 1 },
        ],
      },
      {
        title: "Kimyoviy elementlar",
        summary: "Davriy jadval va elementlar belgilari.",
        content:
          "<p>Kimyoviy element — bir xil atomlardan tashkil topgan modda.</p><h3>Davriy jadval</h3><p>D.I.Mendeleyev tomonidan yaratilgan davriy jadval barcha elementlarni tartib bilan joylashtiradi.</p><ul><li>Vodorod — <strong>H</strong> (1-element)</li><li>Kislorod — <strong>O</strong></li><li>Uglerod — <strong>C</strong></li></ul>",
        questions: [
          { text: "Kislorodning belgisi?", options: ["O", "K", "Ka", "Os"], correct_index: 0 },
          { text: "Davriy jadvalni kim yaratgan?", options: ["Mendeleyev", "Nyuton", "Eynshteyn", "Darvin"], correct_index: 0 },
          { text: "Vodorod davriy jadvalda nechanchi element?", options: ["1", "8", "11", "20"], correct_index: 0 },
        ],
      },
      {
        title: "Kimyoviy reaksiyalar",
        summary: "Moddalar o'zaro qanday ta'sirlashadi.",
        content:
          "<p>Kimyoviy reaksiya — moddalar o'zaro ta'sirlashib, yangi moddalarga aylanishi.</p><h3>Misollar</h3><ul><li><strong>Yonish</strong> — issiqlik va yorug'lik ajralib chiqadi.</li><li><strong>Katalizator</strong> — reaksiyani tezlashtiradigan modda.</li></ul><p>Reaksiya davomida atomlar yo'qolmaydi, faqat qayta joylashadi (massa saqlanish qonuni).</p>",
        questions: [
          { text: "Yonish reaksiyasida nima ajraladi?", options: ["Issiqlik va yorug'lik", "Faqat suv", "Metall", "Hech nima"], correct_index: 0 },
          { text: "Katalizator nima qiladi?", options: ["Reaksiyani tezlashtiradi", "To'xtatadi", "Rang beradi", "Sovutadi"], correct_index: 0 },
          { text: "Reaksiyada moddalar nima bo'ladi?", options: ["Yangi moddaga aylanadi", "Yo'qoladi", "O'zgarmaydi", "Muzlaydi"], correct_index: 0 },
        ],
      },
    ],
  },
  {
    slug: "matematika",
    title: "Matematika",
    description: "Sonlar, geometriya va algebra asoslari.",
    icon: "sigma",
    color: "#7c3aed",
    lessons: [
      {
        title: "Sonlar va amallar",
        summary: "Arifmetik amallar va amallar tartibi.",
        content:
          "<p>Matematikada to'rtta asosiy amal bor: qo'shish (+), ayirish (−), ko'paytirish (×) va bo'lish (÷).</p><h3>Amallar tartibi</h3><p>Avval ko'paytirish va bo'lish, keyin qo'shish va ayirish bajariladi.</p><p>Masalan: <code>2 + 2 × 2 = 2 + 4 = 6</code>.</p>",
        questions: [
          { text: "2 + 2 × 2 = ?", options: ["6", "8", "4", "16"], correct_index: 0 },
          { text: "Qaysi son juft?", options: ["7", "10", "3", "5"], correct_index: 1 },
          { text: "10 ning yarmi qancha?", options: ["5", "2", "20", "15"], correct_index: 0 },
        ],
      },
      {
        title: "Geometriya asoslari",
        summary: "Asosiy geometrik shakllar va ularning xossalari.",
        content:
          "<p>Geometriya — shakllar, o'lchamlar va fazoni o'rganadigan matematika bo'limi.</p><h3>Asosiy shakllar</h3><ul><li><strong>Uchburchak</strong> — 3 ta tomon va 3 ta burchak.</li><li><strong>Kvadrat</strong> — 4 ta teng tomon.</li><li><strong>Aylana</strong> — markazdan bir xil masofadagi nuqtalar (radius).</li></ul>",
        questions: [
          { text: "Uchburchak nechta burchakka ega?", options: ["3", "4", "5", "2"], correct_index: 0 },
          { text: "Kvadratning tomonlari qanday?", options: ["Barchasi teng", "Har xil", "Ikkitasi teng", "Yo'q"], correct_index: 0 },
          { text: "Aylana markazidan chetigacha masofa nima deyiladi?", options: ["Radius", "Diametr", "Perimetr", "Yuza"], correct_index: 0 },
        ],
      },
      {
        title: "Algebraga kirish",
        summary: "O'zgaruvchilar va oddiy tenglamalar.",
        content:
          "<p>Algebra — sonlar o'rniga harflardan (o'zgaruvchilardan) foydalanadigan matematika bo'limi.</p><h3>Tenglama</h3><p>Tenglama — ikki ifodaning tengligi. Masalan: <code>x + 5 = 10</code>. Bu yerda <code>x = 5</code>.</p><p>Noma'lumni topish uchun amallarni teskari bajaramiz.</p>",
        questions: [
          { text: "x + 5 = 10 bo'lsa, x = ?", options: ["5", "10", "15", "2"], correct_index: 0 },
          { text: "2x = 8 bo'lsa, x = ?", options: ["4", "2", "8", "16"], correct_index: 0 },
          { text: "Tenglama nima?", options: ["Ikki ifoda tengligi", "Rasm", "Son", "Grafik"], correct_index: 0 },
        ],
      },
    ],
  },
  {
    slug: "ona-tili",
    title: "Ona tili",
    description: "O'zbek tili tovushlari, so'z turkumlari va grammatika.",
    icon: "book",
    color: "#ea580c",
    lessons: [
      {
        title: "Tovushlar va harflar",
        summary: "O'zbek alifbosi, unli va undosh tovushlar.",
        content:
          "<p>Til tovushlardan tashkil topadi. Tovushning yozuvdagi belgisi — <strong>harf</strong>.</p><h3>O'zbek alifbosi</h3><p>Hozirgi o'zbek lotin alifbosida 29 ta harf mavjud. Ular unli va undosh tovushlarni ifodalaydi.</p><ul><li><strong>Unli tovushlar:</strong> a, o, u, e, i, o'</li><li><strong>Undosh tovushlar:</strong> b, d, f, g va boshqalar</li></ul>",
        questions: [
          { text: "Hozirgi o'zbek lotin alifbosida nechta harf bor?", options: ["29", "33", "26", "40"], correct_index: 0 },
          { text: "O'zbek tilida nechta unli tovush bor?", options: ["6", "10", "3", "8"], correct_index: 0 },
          { text: "Harf nima?", options: ["Tovushning yozuvdagi belgisi", "So'z", "Gap", "Bo'g'in"], correct_index: 0 },
        ],
      },
      {
        title: "So'z turkumlari",
        summary: "Ot, fe'l, sifat va boshqa so'z turkumlari.",
        content:
          "<p>So'zlar ma'nosi va vazifasiga ko'ra <strong>so'z turkumlariga</strong> bo'linadi.</p><h3>Asosiy turkumlar</h3><ul><li><strong>Ot</strong> — predmet nomini bildiradi (kitob, uy).</li><li><strong>Fe'l</strong> — harakat yoki holatni bildiradi (yozmoq, kelmoq).</li><li><strong>Sifat</strong> — predmet belgisini bildiradi (katta, chiroyli).</li></ul>",
        questions: [
          { text: "Ot nimani bildiradi?", options: ["Predmet nomini", "Harakatni", "Belgini", "Sanoqni"], correct_index: 0 },
          { text: "Fe'l nimani bildiradi?", options: ["Harakat yoki holatni", "Predmetni", "Rangni", "Sonni"], correct_index: 0 },
          { text: "'Kitob' so'zi qaysi turkumga kiradi?", options: ["Ot", "Fe'l", "Sifat", "Son"], correct_index: 0 },
        ],
      },
      {
        title: "Gap va tinish belgilari",
        summary: "Gap tuzilishi va asosiy tinish belgilari.",
        content:
          "<p><strong>Gap</strong> — tugallangan fikrni ifodalovchi so'z yoki so'zlar birikmasi.</p><h3>Tinish belgilari</h3><ul><li><strong>Nuqta (.)</strong> — darak gap oxirida.</li><li><strong>So'roq belgisi (?)</strong> — so'roq gap oxirida.</li><li><strong>Undov belgisi (!)</strong> — his-hayajonni bildiradi.</li></ul>",
        questions: [
          { text: "Darak gap oxirida qanday belgi qo'yiladi?", options: ["Nuqta", "Vergul", "Tire", "Qavs"], correct_index: 0 },
          { text: "So'roq gap oxirida qanday belgi qo'yiladi?", options: ["So'roq belgisi", "Nuqta", "Vergul", "Ikki nuqta"], correct_index: 0 },
          { text: "Gap nima?", options: ["Tugallangan fikr", "Bitta harf", "Bo'g'in", "Tovush"], correct_index: 0 },
        ],
      },
    ],
  },
];

function seed() {
  const insUser = db.prepare(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
  );
  for (const u of USERS) {
    insUser.run(u.name, u.email, hashPassword(u.password), u.role);
  }

  const insSub = db.prepare(
    "INSERT INTO subjects (slug, title, description, icon, color, position) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insLes = db.prepare(
    "INSERT INTO lessons (subject_id, title, summary, content, video_url, position) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insQ = db.prepare(
    "INSERT INTO questions (lesson_id, text, options, correct_index, position) VALUES (?, ?, ?, ?, ?)"
  );

  SUBJECTS.forEach((s, si) => {
    const subId = Number(
      insSub.run(s.slug, s.title, s.description, s.icon, s.color, si).lastInsertRowid
    );
    s.lessons.forEach((l, li) => {
      const lesId = Number(
        insLes.run(subId, l.title, l.summary, l.content, l.video_url || "", li).lastInsertRowid
      );
      (l.questions || []).forEach((q, qi) =>
        insQ.run(lesId, q.text, JSON.stringify(q.options), q.correct_index, qi)
      );
    });
  });
}

export function seedIfEmpty() {
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM users").get();
  if (n === 0) {
    seed();
    console.log("[seed] Boshlang'ich ma'lumotlar qo'shildi (fanlar, darslar, testlar, foydalanuvchilar).");
  }
}

// Standalone: `node --experimental-sqlite server/seed.js [--reset]`
if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes("--reset")) {
    db.exec(
      "DELETE FROM quiz_attempts; DELETE FROM progress; DELETE FROM questions; DELETE FROM lessons; DELETE FROM subjects; DELETE FROM users;"
    );
    console.log("[seed] Eski ma'lumotlar o'chirildi.");
  }
  seedIfEmpty();
  console.log("[seed] Tayyor.");
}
