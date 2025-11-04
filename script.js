// script.js — MC RSVP (sin frameworks)
// Usa API_BASE de config.js
(() => {
  const $ = (s, p=document) => p.querySelector(s);
  const form = $('#rsvpForm');
  const btnCheck = $('#btn-check'), btnConfirm = $('#btn-confirm');
  const guestBlock = $('#guestBlock'), guestInfo = $('#guestInfo'), slotsBox = $('#slots');
  const msgEl = $('#msg'), qrEl = $('#qr');
  const uidEl = $('#uid'), codeEl = $('#code'), telEl = $('#tel'), slotHidden = $('#slot');

  function setMsg(t, ok=false){ msgEl.textContent=t||''; msgEl.className='msg ' + (ok?'ok':'err'); }
  function clearMsg(){ msgEl.textContent=''; msgEl.className='msg'; }
  function resetUI(){
    clearMsg(); qrEl.hidden=true; qrEl.textContent='';
    slotsBox.innerHTML=''; slotHidden.value='';
    codeEl.value=''; telEl.value='';
    codeEl.disabled=true; telEl.disabled=true;
    btnConfirm.disabled=true; guestBlock.hidden=true; guestInfo.textContent='';
  }
  function renderSlots(slots=[]){
    slotsBox.innerHTML=''; slotHidden.value=''; btnConfirm.disabled=true;
    slots.forEach((s,i)=>{
      const wrap=document.createElement('label'); wrap.className='slot'; wrap.setAttribute('aria-disabled', s.open?'false':'true');
      const input=document.createElement('input'); input.type='radio'; input.name='slot_radio'; input.value=s.slot; input.id='slot_'+i; input.disabled=!s.open;
      const title=document.createElement('div'); title.style.fontWeight='700'; title.textContent=s.slot;
      const sub=document.createElement('div'); sub.className='helper'; sub.textContent=`${s.remaining}/${s.cap} disponibles`;
      wrap.append(input,title,sub); slotsBox.appendChild(wrap);
      input.addEventListener('change',()=>{[...slotsBox.querySelectorAll('.slot')].forEach(el=>el.classList.remove('selected')); wrap.classList.add('selected'); slotHidden.value=input.value; btnConfirm.disabled=false; clearMsg();});
    });
  }

  form.addEventListener('submit', e=>e.preventDefault());
  uidEl.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); btnCheck.click(); }});

  // CHECK
  btnCheck.addEventListener('click', async ()=>{
    resetUI();
    const uid=(uidEl.value||'').trim(); if(!uid){ setMsg('Ingresá tu MemberID.'); return; }
    btnCheck.disabled=true;
    try{
      const res=await fetch(`${API_BASE}?action=check&uid=${encodeURIComponent(uid)}`);
      if(!res.ok) throw new Error('net');
      const data=await res.json();
      if(!data.ok){ setMsg(data.msg||'No encontrado.'); return; }

      guestInfo.textContent=`${data.nombre} — Estado: ${data.estado || 'Invitado'}`;
      renderSlots(data.slots || []);
      codeEl.disabled=false; telEl.disabled=false; guestBlock.hidden=false; codeEl.focus();
    }catch{ setMsg('Error de red. Intentá otra vez.'); }
    finally{ btnCheck.disabled=false; }
  });

  // CONFIRM
  btnConfirm.addEventListener('click', async ()=>{
    clearMsg();
    const uid=uidEl.value.trim(), code=codeEl.value.trim(), tel=telEl.value.trim(), slot=slotHidden.value.trim();
    if(!uid||!code||!tel||!slot){ setMsg('Completá MemberID, Código, Tel y la franja.'); return; }
    btnConfirm.disabled=true;
    try{
      const body=new URLSearchParams({action:'confirm', uid, code, tel, slot});
      const res=await fetch(API_BASE,{method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}, body});
      if(!res.ok) throw new Error('net');
      const data=await res.json();
      if(!data.ok){ setMsg(data.msg||'No se pudo confirmar.'); btnConfirm.disabled=false; return; }

      setMsg(data.msg||'Confirmado.', true);
      qrEl.textContent=data.qr||'QR generado'; qrEl.hidden=false;
      uidEl.readOnly=codeEl.readOnly=telEl.readOnly=true;
      slotsBox.querySelectorAll('input[type="radio"]').forEach(r=>r.disabled=true);
    }catch{ setMsg('Error de red. Intentá de nuevo.'); btnConfirm.disabled=false; }
  });
})();
