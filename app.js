// mispari — Hebrew tool for personal-data deletion requests · MIT · 2026

const STORAGE_KEY = 'mispari.v1';

const Store = {
  load() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : { profile:{}, tickets:[], draft:{} }; }
    catch(e) { return { profile:{}, tickets:[], draft:{} }; }
  },
  save(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch(e) { alert('לא ניתן לשמור'); } },
  wipe() { if (confirm('למחוק את כל הנתונים המקומיים?')) { localStorage.removeItem(STORAGE_KEY); location.reload(); } },
  export() {
    const data = this.load();
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    downloadBlob(blob, `mispari-backup-${new Date().toISOString().slice(0,10)}.json`);
  }
};

let state = Store.load();
let route = { name:'home', params:{} };

const $ = s => document.querySelector(s);
const esc = s => String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2,9);
const daysSince = iso => iso ? Math.floor((Date.now()-new Date(iso).getTime())/86400000) : 0;
const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('he-IL') : '';
const fmtDateShort = iso => iso ? new Date(iso).toLocaleDateString('he-IL', {day:'2-digit', month:'2-digit'}) : '';

function go(name, params={}) { route = {name, params}; render(); window.scrollTo(0,0); }
function persist() { Store.save(state); render(); }

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

const STATUS = {
  draft:    { label:'טיוטה',           pill:'pill-draft'  },
  ready:    { label:'מוכן',            pill:'pill-ready'  },
  sent:     { label:'נשלח',            pill:'pill-sent'   },
  replied:  { label:'התקבלה תשובה',    pill:'pill-replied'},
  action:   { label:'נדרשת פעולה',     pill:'pill-action' },
  confirmed:{ label:'אושרה מחיקה',     pill:'pill-confirmed'},
  closed:   { label:'נסגר',            pill:'pill-closed' }
};

const greetings = () => {
  const h = new Date().getHours();
  if (h < 12) return 'בוקר טוב';
  if (h < 18) return 'צהריים טובים';
  return 'ערב טוב';
};

// =========== VIEWS ===========

function view_home() {
  const tickets = state.tickets || [];
  const draft = tickets.filter(t => t.status === 'draft' || t.status === 'ready');
  const sent = tickets.filter(t => t.status === 'sent');
  const replied = tickets.filter(t => t.status === 'replied' || t.status === 'action');
  const confirmed = tickets.filter(t => t.status === 'confirmed');
  const needsFollowup = sent.filter(t => daysSince(t.events?.find(e=>e.type==='sent')?.at) >= 30);
  const today = new Date().toLocaleDateString('he-IL', { weekday:'long', day:'numeric', month:'long' });
  const name = state.profile?.name?.split(' ')[0];

  return `
    <div class="greeting">
      <h1>${greetings()}${name ? ', ' + esc(name) : ''}</h1>
      <div class="meta">${today}</div>
    </div>

    <div class="tiles">
      <div class="tile">
        <div class="label">בקשות נשלחו</div>
        <div class="value">${sent.length + replied.length + confirmed.length}</div>
        <div class="caption">מתחילת השימוש</div>
      </div>
      <div class="tile ${needsFollowup.length ? 'warning' : ''}">
        <div class="label">ממתינות ל־30 יום</div>
        <div class="value">${needsFollowup.length}</div>
        <div class="caption ${needsFollowup.length ? 'warning' : ''}">${needsFollowup.length ? 'ניתן להגיש תלונה' : 'הכל בזמן'}</div>
      </div>
      <div class="tile">
        <div class="label">התקבלו תשובות</div>
        <div class="value">${replied.length}</div>
        <div class="caption">מתוך ${sent.length + replied.length + confirmed.length}</div>
      </div>
      <div class="tile signal">
        <div class="label">אושרו מחיקות</div>
        <div class="value">${confirmed.length}</div>
        <div class="caption">${confirmed.length ? 'הצלחות' : 'עדיין אין'}</div>
      </div>
    </div>

    ${needsFollowup.length ? `
      <div class="signal-bar">
        <div class="sb-text"><strong>${needsFollowup.length} בקשות חצו 30 יום.</strong> לפי החוק, הגוף מחויב להגיב בפרק זמן זה — אפשר להגיש תלונה לרשות להגנת הפרטיות.</div>
      </div>` : ''}

    <div class="panel">
      <div class="panel-head">
        <div class="panel-title">
          פעולה דחופה
          <span class="count-chip">${needsFollowup.length + replied.length}</span>
        </div>
      </div>
      ${(needsFollowup.concat(replied)).length === 0 ?
        '<div class="empty">אין בקשות שממתינות לפעולה.</div>' :
        `<div class="rows">${needsFollowup.concat(replied).slice(0,5).map(renderRow).join('')}</div>`
      }
    </div>

    <div class="panel">
      <div class="panel-head">
        <div class="panel-title">
          נשלחו, ממתינות לתשובה
          <span class="count-chip">${sent.length - needsFollowup.length}</span>
        </div>
      </div>
      ${(sent.length - needsFollowup.length) === 0 ?
        '<div class="empty">אין בקשות פתוחות.</div>' :
        `<div class="rows">${sent.filter(t=>!needsFollowup.includes(t)).slice(0,5).map(renderRow).join('')}</div>`
      }
    </div>

    ${draft.length ? `
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">
            טיוטות
            <span class="count-chip">${draft.length}</span>
          </div>
        </div>
        <div class="rows">${draft.map(renderRow).join('')}</div>
      </div>` : ''}

    ${tickets.length === 0 ? `
      <div class="panel">
        <div class="panel-head"><div class="panel-title">התחלה</div></div>
        <div style="font-size:14px; color:var(--muted); margin-bottom:16px;">
          התחילו בלתעד פנייה שקיבלתם. הכלי יזהו את הגוף, יכין בקשת מחיקה חוקית, ויעקוב אחרי התשובות.
        </div>
        <button class="btn btn-primary btn-lg" onclick="go('new-call')">תעוד פנייה חדשה</button>
      </div>` : ''
    }

    ${!state.profile.name ? `
      <div class="panel">
        <div class="panel-head"><div class="panel-title">הפרטים שלכם</div></div>
        <div style="font-size:14px; color:var(--muted); margin-bottom:16px;">
          הפרטים משמשים להכנת הבקשות בשמכם. נשמרום רק במכשיר הזה, לא נשלחים לשום שרת.
        </div>
        <button class="btn btn-secondary" onclick="go('profile')">הגדירו פרטים</button>
      </div>` : ''
    }

    <footer class="app-footer">
      קוד פתוח · MIT · <a href="https://github.com/" target="_blank">GitHub</a> · כל הנתונים נשמרום במכשיר שלכם
    </footer>
  `;
}

function renderRow(t) {
  const entity = window.ENTITIES.find(e => e.id === t.entityId) || { name: t.entityName };
  const status = STATUS[t.status] || STATUS.draft;
  const sentEvt = (t.events||[]).find(e => e.type==='sent');
  const days = sentEvt ? daysSince(sentEvt.at) : null;
  const warnDays = days !== null && days >= 30;
  return `
    <div class="row" onclick="go('ticket', { id: '${t.id}' })">
      <div class="r-primary">
        <div class="r-name">${esc(entity.name)}</div>
        <div class="r-sub">${esc(t.goalLabel || 'בקשה')}</div>
      </div>
      <div class="r-meta">
        ${days !== null ? `<span class="days ${warnDays ? 'warn' : ''}">${days} ימים</span>` : ''}
        <span class="pill ${status.pill}">${status.label}</span>
      </div>
    </div>
  `;
}

// === Step indicator ===
function steps(active) {
  const list = ['תיעוד','זיהוי','מטרה','שליחה'];
  return `<div class="steps">${list.map((s,i) => `
    <span class="step ${i === active ? 'active' : ''}"><span class="n">${i+1}</span>${s}</span>
  `).join('')}</div>`;
}

// === New call ===
function view_newCall() {
  const d = state.draft || {};
  return `
    <div class="section-head">
      <div class="back" onclick="go('home')">← חזרה</div>
      <h2>תיעוד פנייה שקיבלתםם</h2>
      <div class="lede">כמה פרטים כדי להבין מי פנה, מתי, ומה היה ברשותם.</div>
    </div>
    ${steps(0)}

    <div class="panel">
      <div class="fieldset">
        <div class="field">
          <label>מתי פנו אליכם</label>
          <input type="date" id="f-date" value="${d.callDate || new Date().toISOString().slice(0,10)}" />
        </div>
        <div class="field">
          <label>איך פנו</label>
          <div class="chips" id="chips-channel">
            ${['שיחה','SMS','וואטסאפ','אימייל','אחר'].map(c => `
              <div class="chip ${d.callChannel===c?'active':''}" data-chip="channel" data-val="${c}">${c}</div>
            `).join('')}
          </div>
        </div>
        <div class="field">
          <label>מספר השולח</label>
          <input type="text" id="f-number" value="${esc(d.number||'')}" placeholder="072-1234567" class="mono" />
          <div class="hint">אם זה מספר VoIP עסקי (072, 073, 077), ציינו זאת</div>
        </div>
        <div class="field">
          <label>מה הפונה ידע עליך</label>
          <div class="chips" id="chips-known">
            ${['שם מלא','כתובת','גיל','פרטי משפחה','תחום עניין','היסטוריית שימוש','נתוני אשראו','אחר'].map(c => `
              <div class="chip ${(d.known||[]).includes(c)?'active':''}" data-chip="known-multi" data-val="${c}">${c}</div>
            `).join('')}
          </div>
          <div class="hint">סמנו רק מה היה בידיהם — אין צורך להזין את הפרט עצמו</div>
        </div>
        <div class="field">
          <label>תוכן הפנייה <span style="color:var(--muted);font-weight:400;">· לא חובה</span></label>
          <textarea id="f-content" placeholder="הצעה לביטוח, קמפיין בחירות, הצעת הלוואה...">${esc(d.content||'')}</textarea>
        </div>
      </div>
    </div>

    <div class="actions-row" style="margin-top:20px;">
      <button class="btn btn-primary" onclick="saveDraftAndNext()">המשך לזיהוי הגוף</button>
      <button class="btn btn-ghost" onclick="go('home')">ביטול</button>
    </div>
  `;
}

// === Identify ===
function view_identify() {
  const d = state.draft || {};
  const suggestions = suggestEntities(d);
  const byCat = groupBy(window.ENTITIES, 'category');

  return `
    <div class="section-head">
      <div class="back" onclick="go('new-call')">← חזרה לתיעוד</div>
      <h2>מי פנה אליכם?</h2>
      <div class="lede">בחרו את הגוף מהרשימה. אם לא ברור — בחרו "לא מזוהה".</div>
    </div>
    ${steps(1)}

    ${suggestions.length ? `
      <div class="panel">
        <div class="panel-head"><div class="panel-title">הצעות לפי התוכן</div></div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          ${suggestions.map(e => `
            <div class="entity-item ${d.entityId===e.id?'selected':''}" onclick="pickEntity('${e.id}')">
              <div><div class="ei-name">${esc(e.name)}</div></div>
              <div class="ei-email">${esc(e.email || '—')}</div>
            </div>
          `).join('')}
        </div>
      </div>` : ''
    }

    <div class="panel">
      <div class="panel-head">
        <div class="panel-title">כל הגופים <span class="count-chip">${window.ENTITIES.length}</span></div>
      </div>
      <input type="text" id="entity-search" placeholder="חיפוש..." oninput="filterEntities(this.value)" style="margin-bottom:8px;" />
      <div id="entity-list">
        ${Object.entries(byCat).map(([cat, items]) => `
          <div class="entity-group" data-cat="${cat}">
            <div class="entity-group-label">${window.CATEGORIES[cat]?.label || cat}</div>
            ${items.map(e => `
              <div class="entity-item ${d.entityId===e.id?'selected':''}" data-entity-name="${esc(e.name)}" onclick="pickEntity('${e.id}')">
                <div>
                  <div class="ei-name">${esc(e.name)} ${e.leaked ? '<span class="pill pill-action" style="margin-right:6px;">דלף</span>' : ''}</div>
                </div>
                <div class="ei-email">${esc(e.email || '—')}</div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>

    <div class="actions-row" style="margin-top:20px;">
      <button class="btn btn-primary" onclick="${d.entityId ? "go('goals')" : 'alert(\\\"בחרו גוף קודם\\\")'}">המשך</button>
      <button class="btn btn-ghost" onclick="go('new-call')">חזרה</button>
    </div>
  `;
}

// === Goals ===
function view_goals() {
  const d = state.draft || {};
  const entity = window.ENTITIES.find(e => e.id === d.entityId);
  const isIntl = entity?.country && entity.country !== 'IL';
  const goals = [
    { key:'source', ...window.TEMPLATES.source },
    { key:'stop',   ...window.TEMPLATES.stop   },
    { key:'delete', ...window.TEMPLATES.delete },
    ...(isIntl ? [{ key:'gdpr', ...window.TEMPLATES.gdpr }] : [])
  ];

  return `
    <div class="section-head">
      <div class="back" onclick="go('identify')">← חזרה</div>
      <h2>מה אתם רוצים מ־${esc(entity.name)}?</h2>
      <div class="lede">כל מטרה היא מכתב נפרד. אפשר לבחור יותר מאחת.</div>
    </div>
    ${steps(2)}

    <div class="panel">
      <div class="choice-list">
        ${goals.map(g => `
          <div class="choice ${(d.goals||[]).includes(g.key)?'active':''}" onclick="toggleGoal('${g.key}')">
            <div class="ci-check"></div>
            <div class="ci-body">
              <div class="ci-title">${g.title}</div>
              <div class="ci-sub">${g.desc} · ${g.legal_basis}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="padding: 12px 16px; background: var(--warning-bg); border-radius: 6px; font-size: 12px; color: var(--warning); margin-top: 16px;">
      הנוסחים מבוססים על חוק הגנת הפרטיות התשמ"א־1981 ועל GDPR. אינם ייעוץ משפטי.
    </div>

    <div class="actions-row" style="margin-top:20px;">
      <button class="btn btn-primary" onclick="${(d.goals||[]).length ? "go('review')" : 'alert(\\\"בחרו לפחות מטרה אחת\\\")'}">הכנת המכתב</button>
      <button class="btn btn-ghost" onclick="go('identify')">חזרה</button>
    </div>
  `;
}

// === Review (the letter) ===
function view_review() {
  const d = state.draft || {};
  const entity = window.ENTITIES.find(e => e.id === d.entityId);
  const p = state.profile || {};

  if (!p.name) {
    return `
      <div class="section-head">
        <div class="back" onclick="go('goals')">← חזרה</div>
        <h2>נדרש להוסיף את השם שלכם</h2>
        <div class="lede">הבקשה צריכה לכלול את שמכם, אחרת הגוף לא יזהה את הרשומה.</div>
      </div>
      <div class="actions-row">
        <button class="btn btn-primary" onclick="go('profile', { returnTo: 'review' })">הוסיפו פרטים</button>
      </div>
    `;
  }

  const goalKey = (d.goals||[])[0];
  const tpl = window.TEMPLATES[goalKey];
  const payload = {
    userName: p.name, userId: p.id,
    entityName: entity?.name || '',
    callDate: d.callDate ? fmtDate(d.callDate) : '',
    callChannel: d.callChannel || '',
    knownDetails: (d.known||[]).join(', ') || 'שם ומספר טלפון',
    isLeak: entity?.leaked
  };

  return `
    <div class="section-head">
      <div class="back" onclick="go('goals')">← חזרה</div>
      <h2>${esc(tpl.title)}</h2>
      <div class="lede">זה המכתב שיישלח. ניתן לערוך לפני שליחה.</div>
    </div>
    ${steps(3)}

    <div class="letter-meta">
      <div class="letter-meta-row">
        <div class="k">אל</div>
        <div class="v">${esc(entity?.name)} <span class="mono" style="color:var(--muted);">${esc(entity?.email || 'אין אימייל ציבורי')}</span></div>
      </div>
      <div class="letter-meta-row">
        <div class="k">נושא</div>
        <div class="v">${esc(tpl.subject(payload))}</div>
      </div>
      <div class="letter-meta-row">
        <div class="k">הבסיס</div>
        <div class="v" style="font-weight:400; color:var(--muted);">${esc(tpl.legal_basis)}</div>
      </div>
    </div>

    <div class="letter-sheet" contenteditable="true" id="letter-body">${esc(tpl.body(payload))}</div>

    <div class="actions-row" style="margin-top:24px;">
      ${entity?.email ? `<button class="btn btn-primary" onclick="sendLetter()">פתח בתוכנת הדואר</button>` : ''}
      <button class="btn btn-secondary" onclick="copyLetter()">העתק טקסט</button>
      <button class="btn btn-secondary" onclick="downloadLetter()">הורד קובץ</button>
      <button class="btn btn-ghost" onclick="markAsSent()">סימון כנשלח ידנית</button>
    </div>
  `;
}

// === Profile ===
function view_profile() {
  const p = state.profile || {};
  const returnTo = route.params.returnTo || 'home';
  return `
    <div class="section-head">
      <div class="back" onclick="go('${returnTo}')">← חזרה</div>
      <h2>הפרטים שלכם</h2>
      <div class="lede">נשמרום רק במכשיר הזה. משמשים להכנת הבקשות בשמכם.</div>
    </div>

    <div class="panel">
      <div class="fieldset">
        <div class="field">
          <label>שם מלא</label>
          <input id="p-name" value="${esc(p.name||'')}" placeholder="שם ושם משפחה" />
        </div>
        <div class="field">
          <label>תעודת זהות <span style="color:var(--muted);font-weight:400;">· לא חובה</span></label>
          <input id="p-id" value="${esc(p.id||'')}" placeholder="9 ספרות" class="mono" />
          <div class="hint">חלק מהגופים דורשים ת.ז. לאימות הזהות לפני מחיקה</div>
        </div>
        <div class="field">
          <label>אימייל</label>
          <input id="p-email" type="email" value="${esc(p.email||'')}" placeholder="name@example.com" class="mono" />
        </div>
        <div class="field">
          <label>טלפון</label>
          <input id="p-phone" value="${esc(p.phone||'')}" placeholder="050-0000000" class="mono" />
        </div>
      </div>
      <div class="actions-row" style="margin-top:20px;">
        <button class="btn btn-primary" onclick="saveProfile('${returnTo}')">שמור</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><div class="panel-title">נתונים שמורים</div></div>
      <div style="font-size:14px; color:var(--muted); margin-bottom:16px;">
        ${state.tickets?.length || 0} תיקים שמורים בדפדפן.
      </div>
      <div class="actions-row">
        <button class="btn btn-secondary" onclick="Store.export()">הורד גיבוי</button>
        <button class="btn btn-danger" onclick="Store.wipe()">מחק הכל</button>
      </div>
    </div>
  `;
}

// === Ticket ===
function view_ticket() {
  const t = state.tickets.find(x => x.id === route.params.id);
  if (!t) return `<div class="panel">תיק לא נמצא. <button class="btn btn-ghost" onclick="go('home')">חזרה</button></div>`;
  const entity = window.ENTITIES.find(e => e.id === t.entityId);
  const status = STATUS[t.status] || STATUS.draft;
  const sentEvt = (t.events||[]).find(e => e.type==='sent');
  const days = sentEvt ? daysSince(sentEvt.at) : 0;
  const canComplain = t.status === 'sent' && days >= 30;

  return `
    <div class="section-head">
      <div class="back" onclick="go('home')">← כל התיקים</div>
      <h2>${esc(entity?.name || t.entityName)}</h2>
      <div class="lede">
        <span class="pill ${status.pill}">${status.label}</span>
        ${sentEvt ? ` · נשלח לפני <span class="mono">${days}</span> ימים` : ''}
      </div>
    </div>

    ${canComplain ? `
      <div class="signal-bar">
        <div class="sb-text"><strong>עברו ${days} ימים ללא תשובה.</strong> החוק קבע ${30} יום — אפשר להגיש תלונה לרשות להגנת הפרטיות.</div>
        <button class="btn btn-primary" onclick="fileComplaint('${t.id}')">הגשת תלונה</button>
      </div>` : ''
    }

    <div class="panel">
      <div class="panel-head"><div class="panel-title">פעולות</div></div>
      <div class="actions-row">
        <button class="btn btn-secondary" onclick="addReply('${t.id}')">הוסיפו תשובה</button>
        <button class="btn btn-secondary" onclick="markConfirmed('${t.id}')">סמנו: אושרה מחיקה</button>
        <button class="btn btn-ghost" onclick="closeTicket('${t.id}')">סגירת תיק</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><div class="panel-title">המכתב שנשלח</div></div>
      <div class="letter-meta-row">
        <div class="k">נושא</div>
        <div class="v">${esc(t.subject)}</div>
      </div>
      <div class="letter-sheet" style="margin-top:12px;">${esc(t.body)}</div>
    </div>

    <div class="panel">
      <div class="panel-head"><div class="panel-title">היסטוריה</div></div>
      <div class="timeline">
        ${(t.events||[]).map(e => `
          <div class="tl-item">
            <div class="tl-when">${fmtDate(e.at)}</div>
            <div class="tl-what">${esc(e.label)}</div>
            ${e.note ? `<div class="tl-note">${esc(e.note)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// === Bulk ===
function view_bulk() {
  const byCat = groupBy(window.ENTITIES, 'category');
  return `
    <div class="section-head">
      <div class="back" onclick="go('home')">← חזרה</div>
      <h2>שליחה לכמה גופים בבת אחת</h2>
      <div class="lede">סמנו את הגופים — הכלי יכין מכתב לכל אחד.</div>
    </div>

    <div class="panel">
      <div class="panel-head"><div class="panel-title">קטגוריות שלמות</div></div>
      <div class="chips">
        ${Object.entries(window.CATEGORIES).map(([cat, meta]) => `
          <div class="chip" onclick="bulkSelectCat('${cat}')">
            ${meta.label} · ${byCat[cat]?.length || 0}
          </div>
        `).join('')}
      </div>
      <div class="actions-row" style="margin-top:14px;">
        <button class="btn btn-secondary" onclick="bulkSelectAll()">בחרו הכל</button>
        <button class="btn btn-ghost" onclick="bulkClear()">נקי</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div class="panel-title">בחירה ידנית</div>
      </div>
      <div id="bulk-list" style="display:flex;flex-direction:column;gap:2px;">
        ${window.ENTITIES.map(e => `
          <div class="entity-item" data-bulk-id="${e.id}" onclick="bulkToggle('${e.id}')">
            <div><div class="ei-name">${esc(e.name)}</div></div>
            <div class="ei-email">${esc(e.email || '—')}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="actions-row" style="margin-top:20px;">
      <button class="btn btn-primary" onclick="bulkProceed()">
        הכינו מכתבים <span class="mono">(<span id="bulk-count">0</span>)</span>
      </button>
      <button class="btn btn-ghost" onclick="go('home')">ביטול</button>
    </div>
  `;
}

// === Scan ===
function view_scan() {
  return `
    <div class="section-head">
      <div class="back" onclick="go('home')">← חזרה</div>
      <h2>סריקת מספרים שהתקשרו</h2>
      <div class="lede">הדביקו מספרים — אחד בשורה. נסמן את הספאמרים הידועים.</div>
    </div>

    <div class="panel">
      <div class="field">
        <textarea id="scan-input" rows="8" class="mono" placeholder="072-1234567&#10;077-9876543&#10;+972-3-1234567"></textarea>
      </div>
      <div class="actions-row" style="margin-top:14px;">
        <button class="btn btn-primary" onclick="runScan()">סרוק</button>
      </div>
    </div>

    <div id="scan-results"></div>
  `;
}

// =========== ACTIONS ===========

function saveDraftAndNext() {
  const draft = state.draft || {};
  draft.callDate = $('#f-date').value;
  draft.number = $('#f-number').value.trim();
  draft.content = $('#f-content').value.trim();
  state.draft = draft;
  Store.save(state);
  go('identify');
}

function pickEntity(id) {
  state.draft = state.draft || {};
  state.draft.entityId = id;
  persist();
}

function toggleGoal(key) {
  const d = state.draft = state.draft || {};
  d.goals = d.goals || [];
  if (d.goals.includes(key)) d.goals = d.goals.filter(g => g !== key);
  else d.goals.push(key);
  persist();
}

function saveProfile(returnTo) {
  state.profile = {
    name: $('#p-name').value.trim(),
    id: $('#p-id').value.trim(),
    email: $('#p-email').value.trim(),
    phone: $('#p-phone').value.trim()
  };
  Store.save(state);
  toast('נשמר');
  go(returnTo || 'home');
}

function copyLetter() {
  const t = $('#letter-body').innerText;
  navigator.clipboard.writeText(t).then(() => toast('הועתק'));
}

function downloadLetter() {
  const d = state.draft;
  const entity = window.ENTITIES.find(e => e.id === d.entityId);
  const body = $('#letter-body').innerText;
  downloadBlob(new Blob([body], {type:'text/plain;charset=utf-8'}), `בקשה-${entity?.name||'ללא-שם'}.txt`);
}

function buildTicket(status) {
  const d = state.draft;
  const entity = window.ENTITIES.find(e => e.id === d.entityId);
  const goalKey = (d.goals||[])[0];
  const tpl = window.TEMPLATES[goalKey];
  const p = state.profile;
  const payload = {
    userName: p.name, userId: p.id,
    entityName: entity.name,
    callDate: d.callDate ? fmtDate(d.callDate) : '',
    callChannel: d.callChannel,
    knownDetails: (d.known||[]).join(', ') || 'שם ומספר טלפון',
    isLeak: entity.leaked
  };
  const body = $('#letter-body')?.innerText || tpl.body(payload);
  const subject = tpl.subject(payload);
  const events = [{ type:'drafted', at: new Date().toISOString(), label:'הבקשה הוכנה' }];
  if (status === 'sent') events.push({ type:'sent', at: new Date().toISOString(), label:'סומן כנשלח' });
  return {
    id: uid(), entityId: entity.id, entityName: entity.name,
    goal: goalKey, goalLabel: tpl.title,
    subject, body, status, events
  };
}

function sendLetter() {
  const d = state.draft;
  const entity = window.ENTITIES.find(e => e.id === d.entityId);
  const body = $('#letter-body').innerText;
  const goalKey = (d.goals||[])[0];
  const tpl = window.TEMPLATES[goalKey];
  const p = state.profile;
  const payload = {
    userName: p.name, userId: p.id, entityName: entity.name,
    callDate: d.callDate ? fmtDate(d.callDate) : '',
    callChannel: d.callChannel,
    knownDetails: (d.known||[]).join(', ') || 'שם ומספר טלפון',
    isLeak: entity.leaked
  };
  const subject = tpl.subject(payload);
  const mailto = `mailto:${entity.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const ticket = buildTicket('ready');
  ticket.events.push({ type:'mail-opened', at: new Date().toISOString(), label:'תוכנת הדואר נפתחה' });
  state.tickets = state.tickets || [];
  state.tickets.unshift(ticket);
  state.draft = {};
  Store.save(state);
  window.location.href = mailto;
  setTimeout(() => {
    if (confirm('שלחת את ההודעה? נסמן את התיק כנשלח?')) {
      const t = state.tickets.find(x => x.id === ticket.id);
      t.status = 'sent';
      t.events.push({ type:'sent', at: new Date().toISOString(), label:'נשלח' });
      Store.save(state);
    }
    go('ticket', { id: ticket.id });
  }, 1200);
}

function markAsSent() {
  const ticket = buildTicket('sent');
  state.tickets = state.tickets || [];
  state.tickets.unshift(ticket);
  state.draft = {};
  Store.save(state);
  go('ticket', { id: ticket.id });
}

function addReply(ticketId) {
  const text = prompt('הדביקו את תוכן התשובה:');
  if (!text) return;
  const t = state.tickets.find(x => x.id === ticketId);
  t.events.push({ type:'reply', at: new Date().toISOString(), label:'התקבלה תשובה', note: text });
  t.status = 'replied';
  persist();
}

function markConfirmed(ticketId) {
  const t = state.tickets.find(x => x.id === ticketId);
  t.events.push({ type:'confirmed', at: new Date().toISOString(), label:'הגוף אישר מחיקה' });
  t.status = 'confirmed';
  persist();
}

function closeTicket(ticketId) {
  if (!confirm('לסגור את התיק?')) return;
  const t = state.tickets.find(x => x.id === ticketId);
  t.events.push({ type:'closed', at: new Date().toISOString(), label:'התיק נסגר' });
  t.status = 'closed';
  persist();
  go('home');
}

function fileComplaint(ticketId) {
  const t = state.tickets.find(x => x.id === ticketId);
  const entity = window.ENTITIES.find(e => e.id === t.entityId);
  const p = state.profile;
  const payload = {
    userName: p.name, userId: p.id,
    entityName: entity.name,
    callDate: '', callChannel: '', knownDetails: ''
  };
  const tpl = window.TEMPLATES.complaint;
  const body = tpl.body(payload);
  const subject = tpl.subject(payload);
  const mailto = `mailto:ppa@justice.gov.il?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  t.events.push({ type:'complaint', at: new Date().toISOString(), label:'תלונה לרשות להגנת הפרטיות' });
  persist();
  window.location.href = mailto;
}

// === Bulk ===
let bulkSet = new Set();
function bulkToggle(id) { if (bulkSet.has(id)) bulkSet.delete(id); else bulkSet.add(id); updateBulkUI(); }
function bulkSelectCat(cat) { window.ENTITIES.filter(e => e.category === cat).forEach(e => bulkSet.add(e.id)); updateBulkUI(); }
function bulkSelectAll() { window.ENTITIES.forEach(e => bulkSet.add(e.id)); updateBulkUI(); }
function bulkClear() { bulkSet.clear(); updateBulkUI(); }
function updateBulkUI() {
  document.querySelectorAll('[data-bulk-id]').forEach(el => {
    el.classList.toggle('selected', bulkSet.has(el.dataset.bulkId));
  });
  const c = $('#bulk-count'); if (c) c.textContent = bulkSet.size;
}
function bulkProceed() {
  if (!bulkSet.size) { alert('לא בחרת גופים'); return; }
  if (!state.profile.name) { alert('קודם הוסיפו את השם שלכם'); go('profile', { returnTo:'bulk' }); return; }
  const chosen = [...bulkSet];
  const now = new Date().toISOString();
  const p = state.profile;
  chosen.forEach(id => {
    const e = window.ENTITIES.find(x => x.id === id);
    const isIntl = e.country !== 'IL';
    const theTpl = isIntl ? window.TEMPLATES.gdpr : window.TEMPLATES.delete;
    const payload = { userName:p.name, userId:p.id, entityName:e.name, callDate:'', callChannel:'', knownDetails:'שם, ת.ז.', isLeak:e.leaked };
    state.tickets.unshift({
      id: uid(), entityId:e.id, entityName:e.name,
      goal: isIntl?'gdpr':'delete', goalLabel: theTpl.title,
      subject: theTpl.subject(payload), body: theTpl.body(payload),
      status:'draft',
      events:[{ type:'drafted', at:now, label:'בקשה נוצרה (שליחה המונית)' }]
    });
  });
  Store.save(state);
  bulkSet.clear();
  toast(`נוצרו ${chosen.length} תיקים`);
  go('home');
}

// === Scan ===
function runScan() {
  const raw = $('#scan-input').value;
  const nums = raw.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
  const results = nums.map(n => {
    const clean = n.replace(/[^\d+]/g,'');
    const match = window.SPAM_PATTERNS.find(p => p.pattern.test(n) || p.pattern.test(clean));
    return { num:n, match };
  });
  const flagged = results.filter(r => r.match);
  $('#scan-results').innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <div class="panel-title">תוצאות <span class="count-chip">${flagged.length}/${results.length}</span></div>
      </div>
      <div class="scan-list">
        ${results.map(r => `
          <div class="scan-row">
            <div class="num">${esc(r.num)}</div>
            ${r.match ? `<span class="pill pill-action">${r.match.note}</span>` : `<span class="pill pill-closed">לא זוהה</span>`}
          </div>
        `).join('')}
      </div>
      ${flagged.length ? `
        <div class="actions-row" style="margin-top:16px;">
          <button class="btn btn-secondary" onclick='exportBlocklist(${JSON.stringify(flagged.map(r=>r.num))})'>ייצוא לרשימת חסימה (CSV)</button>
        </div>
      ` : ''}
    </div>
  `;
}

function exportBlocklist(nums) {
  const csv = 'number\n' + nums.join('\n');
  downloadBlob(new Blob([csv], {type:'text/csv'}), 'mispari-blocklist.csv');
}

function suggestEntities(d) {
  const txt = ((d.content||'') + ' ' + (d.number||'')).toLowerCase();
  const scored = window.ENTITIES.map(e => {
    let score = 0;
    const name = e.name.toLowerCase();
    if (txt.includes(name)) score += 10;
    if (/ביטוח|פוליסה|פנסיה/.test(txt) && e.category==='insurance') score += 3;
    if (/בנק|אשראו|הלוואה/.test(txt) && e.category==='bank') score += 3;
    if (/סלולר|חבילה|מכשיר/.test(txt) && e.category==='telco') score += 3;
    if (/קמפיין|מפלגה|בחירות|מצביע/.test(txt) && e.category==='party') score += 3;
    return { e, score };
  }).filter(x => x.score > 0).sort((a,b) => b.score-a.score).slice(0,4);
  return scored.map(x => x.e);
}

function filterEntities(q) {
  q = q.toLowerCase();
  document.querySelectorAll('#entity-list [data-entity-name]').forEach(el => {
    const n = el.dataset.entityName.toLowerCase();
    el.style.display = n.includes(q) ? '' : 'none';
  });
}

document.addEventListener('click', (ev) => {
  const chip = ev.target.closest('[data-chip]');
  if (!chip) return;
  const type = chip.dataset.chip;
  const val = chip.dataset.val;
  state.draft = state.draft || {};
  if (type === 'channel') {
    state.draft.callChannel = val;
    document.querySelectorAll('[data-chip="channel"]').forEach(c => c.classList.toggle('active', c.dataset.val === val));
  } else if (type === 'known-multi') {
    state.draft.known = state.draft.known || [];
    const idx = state.draft.known.indexOf(val);
    if (idx >= 0) state.draft.known.splice(idx, 1); else state.draft.known.push(val);
    chip.classList.toggle('active');
  }
  Store.save(state);
});

function groupBy(arr, key) {
  return arr.reduce((acc, item) => { (acc[item[key]] = acc[item[key]] || []).push(item); return acc; }, {});
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}

const views = {
  'home':     view_home,
  'new-call': view_newCall,
  'identify': view_identify,
  'goals':    view_goals,
  'review':   view_review,
  'profile':  view_profile,
  'ticket':   view_ticket,
  'bulk':     view_bulk,
  'scan':     view_scan
};

function render() {
  $('#main').innerHTML = (views[route.name] || views.home)();
  document.querySelectorAll('.rail-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.nav === route.name);
  });
}

document.addEventListener('DOMContentLoaded', render);
