/**
 * notfound.js — 404 page.
 */
import { renderChrome } from "/js/ui.js";

renderChrome();
document.getElementById("app").innerHTML = `
  <section class="section container">
    <div class="empty" style="padding:5rem 1rem">
      <div class="text-gradient" style="font-size:4.5rem;font-weight:800;line-height:1">404</div>
      <h1 style="margin:.5rem 0;color:var(--color-heading)">Sahifa topilmadi</h1>
      <p class="muted">Siz qidirgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.</p>
      <a class="btn btn--primary" href="/" style="margin-top:1.5rem">Bosh sahifaga qaytish</a>
    </div>
  </section>`;
