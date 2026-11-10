(() => {
  const $ = (id) => document.getElementById(id);
  const rupiah = (n) => 'Rp ' + n.toLocaleString('id-ID');
  const VENUE_WA = '6281234567890';

  // Mobile menu
  const toggle = document.querySelector('.nav__toggle');
  const menu = $('menu');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', false); }
  });

  $('year').textContent = new Date().getFullYear();

  // ---- Demo booking ----
  const courtEl = $('court'), dateEl = $('date'), slotsEl = $('slots');
  const OPEN = 8, CLOSE = 22;
  let selected = null;

  const today = new Date();
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateEl.min = dateEl.value = iso(today);

  const duration = () => +document.querySelector('input[name=dur]:checked').value;
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

  // Deterministic fake "already booked" slots based on court + date
  function isBooked(startMin) {
    const seed = [...(courtEl.selectedIndex + dateEl.value)].reduce((a, c) => a + c.charCodeAt(0), 0);
    return ((startMin / 30 + seed) * 7) % 5 === 0;
  }

  function renderSlots() {
    const dur = duration();
    selected = null;
    slotsEl.innerHTML = '';
    const now = new Date();
    const isToday = dateEl.value === iso(now);
    for (let m = OPEN * 60; m + dur <= CLOSE * 60; m += dur) {
      const past = isToday && m <= now.getHours() * 60 + now.getMinutes();
      const label = document.createElement('label');
      label.className = 'slot';
      const input = document.createElement('input');
      input.type = 'radio'; input.name = 'slot'; input.value = m;
      input.disabled = past || isBooked(m);
      input.addEventListener('change', () => { selected = m; update(); });
      label.append(input, fmt(m));
      slotsEl.append(label);
    }
    update();
  }

  function update() {
    const dur = duration();
    const price = +courtEl.value;
    $('sCourt').textContent = courtEl.options[courtEl.selectedIndex].text.split(' (')[0];
    $('sDate').textContent = dateEl.value
      ? new Date(dateEl.value + 'T00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
      : '-';
    $('sTime').textContent = selected !== null ? `${fmt(selected)} – ${fmt(selected + dur)}` : 'Belum dipilih';
    $('sDur').textContent = dur + ' menit';
    $('sTotal').textContent = selected !== null ? rupiah(Math.round(price * dur / 60)) : 'Rp 0';
    $('result').hidden = true;
    $('demoError').hidden = true;
  }

  [courtEl, dateEl].forEach((el) => el.addEventListener('change', renderSlots));
  document.querySelectorAll('input[name=dur]').forEach((el) => el.addEventListener('change', renderSlots));

  $('confirmBtn').addEventListener('click', () => {
    const err = $('demoError');
    const name = $('name').value.trim(), wa = $('wa').value.replace(/\s|-/g, '');
    err.hidden = false;
    if (selected === null) return (err.textContent = 'Pilih jam terlebih dahulu.');
    if (name.length < 2) return (err.textContent = 'Isi nama Anda.');
    if (!/^(\+62|62|0)8\d{7,12}$/.test(wa)) return (err.textContent = 'Nomor WhatsApp tidak valid (contoh: 08123456789).');
    err.hidden = true;

    const dur = duration();
    const msg = `Halo, saya ${name}. Saya sudah booking ${$('sCourt').textContent}, ${$('sDate').textContent} pukul ${$('sTime').textContent}. Total ${$('sTotal').textContent}. Berikut bukti pembayaran saya.`;
    $('waLink').href = `https://wa.me/${VENUE_WA}?text=${encodeURIComponent(msg)}`;
    $('result').hidden = false;
  });

  renderSlots();

  // ---- Signup (front-end only) ----
  $('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('suName').value.trim(), email = $('suEmail').value.trim();
    const msg = $('suMsg');
    if (!name) return (msg.textContent = 'Isi nama venue Anda.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return (msg.textContent = 'Email tidak valid.');
    msg.textContent = `Terima kasih, ${name}! Kami akan menghubungi ${email} segera.`;
    e.target.reset();
  });
})();

