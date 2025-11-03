// script.js — MC RSVP (sin frameworks)
// Usa API_BASE de config.js

(function () {
  const $ = (s, p = document) => p.querySelector(s);
  const form = $('#rsvpForm');
  const btnCheck = $('#btn-check');
  const btnConfirm = $('#btn-confirm');
  const guestBlock = $('#guestBlock');
  const guestInfo = $('#guestInfo');
  const slotsBox = $('#slots');
  const msgEl = $('#msg');
  const qrEl = $('#qr');

  const uidEl = $('#uid');
  const codeEl = $('#code');
  const telEl = $('#tel');
  const slotHidden = $('#slot');

  function setMsg(text, ok = false) {
    msgEl.textContent = text || '';
    msgEl.className = 'msg ' + (ok ? 'ok' : 'err');
  }
  function clearMsg() {
    msgEl.textContent = '';
    msgEl.className = 'msg';
  }

  // Render de slots (botoncitos tipo radio)
  function renderSlots(slots = []) {
    slotsBox.innerHTML = '';
    slotHidden.value = '';
    btnConfirm.disabled = true;

    slots.forEach((s, i) => {
      const id = `slot_${i}`;
      const wrap = document.createElement('label');
      wrap.className = 'slot';
      wrap.setAttribute('aria-disabled', s.open ? 'false' : 'true');

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'slot_radio';
      input.value = s.slot;
      input.id = id;
      input.disabled = !s.open;

      const title = document.createElement('div');
      title.style.fontWeight = '700';
      title.textContent = s.slot;

      const sub = document.createElement('div');
      sub.className = 'helper';
      sub.textContent = `${s.remaining}/${s.cap} disponibles`;

      wrap.appendChild(input);
      wrap.appendChild(title);
      wrap.appendChild(sub);
      slotsBox.appendChild(wrap);

      input.addEventListener('change', () => {
        // marcar seleccionado
        [...slotsBox.querySelectorAll('.slot')].forEach(el => el.classList.remove('selected'));
        wrap.classList.add('selected');
        slotHidden.value = input.value;
        btnConfirm.disabled = false;
        clearMsg();
      });
    });
  }

  // Buscar invitación (CHECK)
  btnCheck.addEventListener('click', async () => {
    clearMsg();
    qrEl.hidden = true;
    qrEl.textContent = '';
    btnConfirm.disabled = true;

    const uid = (uidEl.value || '').trim();
    if (!uid) { setMsg('Ingresá tu MemberID.'); return; }

    btnCheck.disabled = true;
    try {
      const url = `${API_BASE}?action=check&uid=${encodeURIComponent(uid)}`;
      const res = await fetch(url);
      const data = await res.json();

    if (!data.ok) {
      setMsg(data.msg || 'No encontrado.');
      guestInfo.textContent = `${data.nombre} — Estado: ${data.estado || 'Invitado'}`;
      renderSlots(data.slots || []);
      codeEl.disabled = false;
      telEl.disabled = false;
      guestBlock.hidden = false;
      codeEl.focus();
      btnConfirm.disabled = true;
      guestBlock.hidden = false; // mostramos el mensaje
      return;
    }


    

  

      guestInfo.textContent = `${data.nombre} — Estado: ${data.estado || 'Invitado'}`;
      renderSlots(data.slots || []);
      guestBlock.hidden = false;
      codeEl.focus();
    } catch (e) {
      setMsg('Error de red. Intentá otra vez.');
      guestBlock.hidden = true;
    } finally {
      btnCheck.disabled = false;
    }
  });

  // Confirmar asistencia (CONFIRM)
  btnConfirm.addEventListener('click', async () => {
    clearMsg();

    const uid = (uidEl.value || '').trim();
    const code = (codeEl.value || '').trim();
    const tel = (telEl.value || '').trim();
    const slot = (slotHidden.value || '').trim();

    if (!uid || !code || !tel || !slot) {
      setMsg('Completá MemberID, Código, Tel y la franja.');
      return;
    }

    btnConfirm.disabled = true;
    try {
      const body = new URLSearchParams({
        action: 'confirm', uid, code, tel, slot
      });

      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body
      });
      const data = await res.json();

      if (!data.ok) {
        setMsg(data.msg || 'No se pudo confirmar.');
        btnConfirm.disabled = false;
        return;
      }

      setMsg(data.msg || 'Confirmado.', true);
      qrEl.textContent = data.qr || 'QR generado';
      qrEl.hidden = false;

      // bloquear inputs mínimos para evitar dobles envíos
      uidEl.readOnly = true;
      codeEl.readOnly = true;
      telEl.readOnly = true;
    } catch (e) {
      setMsg('Error de red. Intentá de nuevo.');
      btnConfirm.disabled = false;
    }
  });
})();
