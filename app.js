// mispari — open-source Hebrew tool for personal-data deletion requests
// Copyright (c) 2026 — MIT License

const STORAGE_KEY = 'mispari.v1';

// --- Data store ---
const Store = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { profile:{}, tickets:[], reports:[] };
    } catch (e) { return { profile:{}, tickets:[], reports:[] }; }
  },
  save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { alert('לא ניתן לשמור. ייתכן שאחסון הדפדפן מלא.'); }
  },
  wipe() {
    if (confirm('למחוק את כל הנתונים המקומיים? זה לא ניתן לביטול.')) {
      localStorage.removeItem(STORAGE_KEY); location.reload();
    }
  },
  export() {
    const data = this.load();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `mispari-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  }
};

// --- State ---
let state = Store.load();
let route = { name:'home', params:{} };

// --- Helpers ---
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('he-IL') : '';
const daysSince = (iso) => iso ? Math.floor((Date.now() - new Date(iso).getTime())/86400000) : 0;
const uid = () => Math.random().toString(36).slice(2,9);

function go(name, params={}) { route = { name, params }; render(); window.scrollTo(0,0); }
function persist() { Store.save(state); render(); }

// --- Status labels ---
const STATUS = {
  draft:    { label:'טיוטה',           pill:'pill-draft'  },
  ready:    { label:'מוכן לשליחה',      pill:'pill-ready'  },
  sent:     { label:'נשלח',             pill:'pill-sent'   },
  replied:  { label:'התקבלה תשובה',     pill:'pill-reply'  },
  action:   { label:'נדרשת פעולה',      pill:'pill-action' },
  confirmed:{ label:'אושרה מחיקה',      pill:'pill-done'   },
  closed:   { label:'נסגר',             pill:'pill-closed' }
};

// --- Views ---
function view_home() {
  const tickets = state.tickets || [];
  const active = tickets.filter(t => t.status !== 'closed');
  const needsFollowup = active.filter(t =>
    t.status === 'sent' && daysSince(t.events?.find(e=>e.type==='sent')?.at) >= 30);

  return `
    <div class="hero-card">
      <h1>מאיפה יש לכם את המספר שלי?</h1>
      <p>מתעד פנייה שקיבלת, מזהה מי אחראי, ומכין בקשה חוקית למחיקת המידע עליך.</p>
      <button class="btn btn-primary btn-big" onclick="go('new-call')">
        קיבלתי פנייה · תעד עכשיו
      </button>
      <div class="actions-row">
        <button class="btn btn-secondary" onclick="go('bulk')">שלח בקשה ליותר מגוף אחד</button>
        <button class="btn btn-secondary" onclick="go('scan')">סרוק רשימת מספרים</button>
      </div>
    </div>

    ${needsFollowup.length ? `
      <div class="warn-note">
        <strong>${needsFollowup.length} תיקים ממתינים ל־30 יום.</strong> החוק קובע 30 יום למענה — אפשר לשלוח תזכורת או להגיש תלונה לרשות.
      </div>` : ''}

    <div class="tickets-head">
      <h2>התיקים שלי</h2>
      <span class="count">${active.length} פעילים · ${tickets.length - active.length} סגורים</span>
    </div>

    ${active.length === 0 ? `
      <div class="ticket-empty">
        עדיין אין תיקים. התחילי בלתעד פנייה שקיבלת, או בסריקה של המספרים שהתקשרו אלייך.
      </div>` :
      active.map(t => renderTicketRow(t)).join('')
    }

    ${!state.profile.name ? `
      <div class="card" style="margin-top:28px;">
        <h3>הוסיפי את פרטייך פעם אחת</h3>
        <p style="color:var(--ink-soft); font-size:14px; margin-bottom:12px;">
          פרטייך נשמרים רק במכשיר שלך, לצורך הכנת הבקשות. לא נשלחים לשום שרת.
        </p>
        <button class="btn btn-secondary" onclick="go('profile')">הגדרת פרטים</button>
      </div>` : ''
    }
  `;
}

function renderTicketRow(t) {
  const entity = window.ENTITIES.find(e => e.id === t.entityId) || { name:t.entityName };
  const status = STATUS[t.status] || STATUS.draft;
  const lastEvent = (t.events||[])[t.events?.length-1];
  const since = lastEvent ? daysSince(lastEvent.at) : null;
  return `
    <div class="card card-row" onclick="go('ticket', { id: '${t.id}' })">
      <div style="flex:1;">
        <div style="font-weight:600;">${esc(entity.name)}</div>
        <div class="ticket-meta">
          <span>${esc(t.goalLabel || 'בקשה')}</span>
          ${since !== null ? `<span>· לפני ${since} ימים</span>` : ''}
        </div>
      </div>
      <span class="pill ${status.pill}">${status.label}</span>
    </div>
  `;
}

// --- New call flow ---
function view_newCall() {
  const d = state.draft || {};
  return `
    <div class="breadcrumb" onclick="go('home')">← חזרה</div>
    <div class="steps"><div class="step active"></div><div class="step"></div><div class="step"></div><div class="step"></div></div>
    <h2>תיעוד הפנייה</h2>
    <p class="lede">כמה פרטים כדי להבין מה קרה.</p>

    <div class="card">
      <div class="field">
        <label>מתי פנו אליך?</label>
        <input type="date" id="f-date" value="${d.callDate || new Date().toISOString().slice(0,10)}" />
      </div>
      <div class="field">
        <label>איך פנו?</label>
        <div class="chips" id="chips-channel">
          ${['שיחה','SMS','וואטסאפ','אימייל','אחר'].map(c => `
            <div class="chip ${d.callChannel===c?'active':''}" data-chip="channel" data-val="${c}">${c}</div>
          `).join('')}
        </div>
      </div>
      <div class="field">
        <label>מספר הטלפון / מזהה השולח (אם ידוע)</label>
        <input type="text" id="f-number" value="${esc(d.number||'')}" placeholder="למשל 072-1234567" />
      </div>
      <div class="field">
        <label>מה הם ידעו עלייך? <span style="font-weight:400;color:var(--ink-mute);">(סמני; אין צורך להזין את הפרט עצמו)</span></label>
        <div class="chips" id="chips-known">
          ${['שם מלא','כתובת','גיל','פרטי משפחה','תחום עניין','היסטוריית שימוש','נתוני אשראי','אחר'].map(c => `
            <div class="chip ${(d.known||[]).includes(c)?'active':''}" data-chip="known-multi" data-val="${c}">${c}</div>
          `).join('')}
        </div>
      </div>
      <div class="field">
        <label>תוכן הפנייה / מה אמרו (לא חובה)</label>
        <textarea id="f-content" placeholder="הצעה לביטוח, קמפיין בחירות, הצעת הלוואה...">${esc(d.content||'')}</textarea>
      </div>
    </div>

    <div class="actions-row">
      <button class="btn btn-ghost" onclick="go('home')">ביטול</button>
      <button class="btn btn-primary" onclick="saveDraftAndNext()">המשך לזיהוי הגוף ←</button>
    </div>
  `;
}

// --- Identify entity ---
function view_identify() {
  const d = state.draft || {};
  // Suggest matches from content/number
  const suggestions = suggestEntities(d);
  const byCat = groupBy(window.ENTITIES, 'category');

  return `
    <div class="breadcrumb" onclick="go('new-call')">← חזרה לתיעוד</div>
    <div class="steps"><div class="step active"></div><div class="step active"></div><div class="step"></div><div class="step"></div></div>
    <h2>מי פנה אלייך?</h2>
    <p class="lede">בחרי את הגוף. אם לא ברור — דלגי לרשימה המלאה בהמשך.</p>

    ${suggestions.length ? `
      <div class="card">
        <h3>הצעות לפי התוכן</h3>
        <div class="check-list" style="margin-top:10px;">
          ${suggestions.map(e => `
            <div class="check-item ${d.entityId===e.id?'active':''}" onclick="pickEntity('${e.id}')">
              <div style="flex:1;">
                <div class="ci-title">${esc(e.name)}</div>
                <div class="ci-sub">${window.CATEGORIES[e.category]?.label || ''} · ${e.email || 'ללא אימייל'}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>` : ''
    }

    <div class="card">
      <h3>כל הגופים (${window.ENTITIES.length})</h3>
      <input type="text" id="entity-search" placeholder="חיפוש לפי שם..." oninput="filterEntities(this.value)" style="margin:10px 0;" />
      <div id="entity-list">
        ${Object.entries(byCat).map(([cat, items]) => `
          <div style="margin-top:14px;">
            <div style="font-size:12px; color:var(--ink-mute); font-weight:500; margin-bottom:6px;">
              ${window.CATEGORIES[cat]?.label || cat}
            </div>
            ${items.map(e => `
              <div class="check-item ${d.entityId===e.id?'active':''}" data-entity-name="${esc(e.name)}" onclick="pickEntity('${e.id}')">
                <div style="flex:1;">
                  <div class="ci-title">${esc(e.name)} ${e.leaked ? '<span class="pill pill-action" style="margin-right:6px;">דלף</span>' : ''}</div>
                  <div class="ci-sub">${e.email || 'ללא אימייל ציבורי'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>

    <div class="actions-row">
      <button class="btn btn-ghost" onclick="go('new-call')">חזרה</button>
      <button class="btn btn-primary" onclick="${d.entityId ? "go('goals')" : 'alert(\\\"בחרי גוף קודם\\\")'}">המשך ←</button>
    </div>
  `;
}

// --- Goals ---
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
    <div class="breadcrumb" onclick="go('identify')">← חזרה</div>
    <div class="steps"><div class="step active"></div><div class="step active"></div><div class="step active"></div><div class="step"></div></div>
    <h2>מה את רוצה שיקרה?</h2>
    <p class="lede">אפשר לבחור יותר מאחד — כל בקשה תישלח בנפרד.</p>

    <div class="check-list">
      ${goals.map(g => `
        <div class="check-item ${(d.goals||[]).includes(g.key)?'active':''}" onclick="toggleGoal('${g.key}')">
          <div style="flex:1;">
            <div class="ci-title">${g.title}</div>
            <div class="ci-sub">${g.desc} · ${g.legal_basis}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="legal-note">
      <strong>הבהרה משפטית:</strong> הנוסחים מבוססים על חוק הגנת הפרטיות (ישראל) ועל GDPR (האיחוד האירופי), אך אינם ייעוץ משפטי. למקרים מורכבים התייעצי עם עו"ד.
    </div>

    <div class="actions-row">
      <button class="btn btn-ghost" onclick="go('identify')">חזרה</button>
      <button class="btn btn-primary" onclick="${(d.goals||[]).length ? "go('review')" : 'alert(\\\"בחרי לפחות מטרה אחת\\\")'}">הכנת המכתב ←</button>
    </div>
  `;
}

// --- Review & send ---
function view_review() {
  const d = state.draft || {};
  const entity = window.ENTITIES.find(e => e.id === d.entityId);
  const p = state.profile || {};

  if (!p.name) {
    return `
      <div class="breadcrumb" onclick="go('goals')">← חזרה</div>
      <div class="card">
        <h2>רק רגע — נדרשים הפרטים שלך</h2>
        <p style="color:var(--ink-soft);">הבקשה צריכה לכלול את השם שלך, כי בלעדיו הגוף לא יזהה את הרשומה.</p>
        <button class="btn btn-primary" style="margin-top:14px;" onclick="go('profile', { returnTo: 'review' })">הוסיפי פרטים</button>
      </div>
    `;
  }

  const goalKey = (d.goals||[])[0];
  const tpl = window.TEMPLATES[goalKey];
  const payload = {
    userName: p.name,
    userId: p.id,
    entityName: entity?.name || '',
    callDate: d.callDate ? fmtDate(d.callDate) : '',
    callChannel: d.callChannel || '',
    knownDetails: (d.known||[]).join(', ') || 'שם ומספר טלפון',
    isLeak: entity?.leaked
  };

  return `
    <div class="breadcrumb" onclick="go('goals')">← חזרה</div>
    <div class="steps"><div class="step active"></div><div class="step active"></div><div class="step active"></div><div class="step active"></div></div>
    <h2>בדיקה לפני שליחה</h2>
    <p class="lede">כך יראה המכתב. אפשר לערוך לפני שליחה.</p>

    <div class="card">
      <div style="font-size:13px; color:var(--ink-mute); margin-bottom:6px;">נמען</div>
      <div style="font-weight:500;">${esc(entity?.name)} · ${esc(entity?.email || 'ללא אימייל — פתחי טופס באתר')}</div>
    </div>

    <div class="card">
      <div style="font-size:13px; color:var(--ink-mute); margin-bottom:6px;">נושא</div>
      <div style="font-weight:500; margin-bottom:14px;">${esc(tpl.subject(payload))}</div>
      <div style="font-size:13px; color:var(--ink-mute); margin-bottom:6px;">תוכן</div>
      <div class="letter" contenteditable="true" id="letter-body">${esc(tpl.body(payload))}</div>
    </div>

    <div class="legal-note">
      <strong>${tpl.title}</strong> — ${tpl.legal_basis}
    </div>

    <div class="actions-row">
      <button class="btn btn-secondary" onclick="copyLetter()">העתק טקסט</button>
      ${entity?.email ? `<button class="btn btn-primary" onclick="sendLetter()">פתח במייל ✉</button>` : ''}
      <button class="btn btn-secondary" onclick="markAsSent()">סימון כנשלח ידנית</button>
    </div>
    <div class="actions-row" style="margin-top:8px;">
      <button class="btn btn-ghost" onclick="downloadLetter()">הורד כקובץ טקסט</button>
    </div>
  `;
}

// --- Bulk mode ---
function view_bulk() {
  const byCat = groupBy(window.ENTITIES, 'category');
  return `
    <div class="breadcrumb" onclick="go('home')">← חזרה</div>
    <h2>שליחה לכמה גופים בבת אחת</h2>
    <p class="lede">סמני את הגופים שתרצי לשלוח להם בקשת מחיקה. הכלי יכין מכתב לכל אחד.</p>

    <div class="card">
      <h3>בחרי קטגוריות</h3>
      <div class="chips" style="margin-top:10px;">
        ${Object.entries(window.CATEGORIES).map(([cat, meta]) => `
          <div class="chip" data-chip="bulk-cat" data-val="${cat}" onclick="bulkSelectCat('${cat}')">
            ${meta.label} <span style="opacity:0.7;">(${byCat[cat]?.length || 0})</span>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:14px; display:flex; gap:10px;">
        <button class="btn btn-secondary" onclick="bulkSelectAll()">בחרי הכל</button>
        <button class="btn btn-ghost" onclick="bulkClear()">נקי</button>
      </div>
    </div>

    <div class="card">
      <h3>או סמני ידנית</h3>
      <div id="bulk-list" class="check-list" style="margin-top:12px;">
        ${window.ENTITIES.map(e => `
          <div class="check-item" data-bulk-id="${e.id}" onclick="bulkToggle('${e.id}')">
            <div style="flex:1;">
              <div class="ci-title">${esc(e.name)}</div>
              <div class="ci-sub">${window.CATEGORIES[e.category]?.label} · ${e.email || 'ללא אימייל'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="actions-row">
      <button class="btn btn-ghost" onclick="go('home')">ביטול</button>
      <button class="btn btn-primary" onclick="bulkProceed()">
        <span id="bulk-count">0</span> גופים · הכנת מכתבים ←
      </button>
    </div>
  `;
}

// --- Scan numbers ---
function view_scan() {
  return `
    <div class="breadcrumb" onclick="go('home')">← חזרה</div>
    <h2>סריקת מספרים שהתקשרו</h2>
    <p class="lede">הדביקי כאן מספרים (אחד בשורה) ונזהה ספאמרים ידועים ודפוסים חשודים.</p>

    <div class="card">
      <div class="field">
        <textarea id="scan-input" rows="8" placeholder="072-1234567&#10;077-9876543&#10;+972-3-1234567"></textarea>
      </div>
      <button class="btn btn-primary" onclick="runScan()">סרוק →</button>
    </div>

    <div id="scan-results"></div>
  `;
}

// --- Profile ---
function view_profile() {
  const p = state.profile || {};
  const returnTo = route.params.returnTo || 'home';
  return `
    <div class="breadcrumb" onclick="go('${returnTo}')">← חזרה</div>
    <h2>הפרטים שלך</h2>
    <p class="lede">נשמרים רק במכשיר שלך. משמשים להכנת הבקשות בשמך.</p>

    <div class="card">
      <div class="field">
        <label>שם מלא</label>
        <input id="p-name" value="${esc(p.name||'')}" placeholder="שם ושם משפחה" />
      </div>
      <div class="field">
        <label>תעודת זהות (לא חובה)</label>
        <input id="p-id" value="${esc(p.id||'')}" placeholder="9 ספרות" />
        <div class="hint">כמה גופים דורשים ת.ז. לאימות הזהות לפני מחיקה. אם לא תמלאי, ייתכן שתידרשי להשלים בהמשך.</div>
      </div>
      <div class="field">
        <label>אימייל ליצירת קשר (לא חובה)</label>
        <input id="p-email" type="email" value="${esc(p.email||'')}" placeholder="name@example.com" />
      </div>
      <div class="field">
        <label>מספר טלפון (לא חובה)</label>
        <input id="p-phone" value="${esc(p.phone||'')}" placeholder="050-0000000" />
      </div>
      <button class="btn btn-primary" onclick="saveProfile('${returnTo}')">שמירה</button>
    </div>

    <div class="card" style="margin-top:20px;">
      <h3>נתונים שמורים</h3>
      <p style="color:var(--ink-soft); font-size:14px; margin-bottom:12px;">
        ${state.tickets?.length || 0} תיקים נשמרים אצלך בדפדפן.
      </p>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="Store.export()">הורד גיבוי (JSON)</button>
        <button class="btn btn-danger" onclick="Store.wipe()">מחק הכל</button>
      </div>
    </div>
  `;
}

// --- Ticket view ---
function view_ticket() {
  const t = state.tickets.find(x => x.id === route.params.id);
  if (!t) return `<div class="card">תיק לא נמצא. <button class="btn btn-ghost" onclick="go('home')">חזרה</button></div>`;
  const entity = window.ENTITIES.find(e => e.id === t.entityId);
  const status = STATUS[t.status] || STATUS.draft;
  const sentEvt = (t.events||[]).find(e => e.type==='sent');
  const since = sentEvt ? daysSince(sentEvt.at) : 0;
  const canComplain = t.status === 'sent' && since >= 30;

  return `
    <div class="breadcrumb" onclick="go('home')">← כל התיקים</div>
    <h2>${esc(entity?.name || t.entityName)}</h2>
    <p class="lede">
      <span class="pill ${status.pill}">${status.label}</span>
      ${sentEvt ? ` · נשלח לפני ${since} ימים` : ''}
    </p>

    <div class="card">
      <h3>פעולות</h3>
      <div class="actions-row">
        <button class="btn btn-secondary" onclick="addReply('${t.id}')">הוסיפי תשובה שהתקבלה</button>
        <button class="btn btn-secondary" onclick="markConfirmed('${t.id}')">סמני: אושרה מחיקה</button>
        ${canComplain ? `<button class="btn btn-primary" onclick="fileComplaint('${t.id}')">📢 הגשת תלונה לרשות</button>` : ''}
        <button class="btn btn-ghost" onclick="closeTicket('${t.id}')">סגירת תיק</button>
      </div>
    </div>

    <div class="card">
      <h3>הבקשה שנשלחה</h3>
      <div style="font-size:14px; margin: 8px 0;"><strong>נושא:</strong> ${esc(t.subject)}</div>
      <div class="letter">${esc(t.body)}</div>
    </div>

    <div class="card">
      <h3>היסטוריה</h3>
      <div style="margin-top:12px;">
        ${(t.events||[]).map(e => `
          <div class="timeline-item">
            <div class="when">${fmtDate(e.at)}</div>
            <div class="what">${esc(e.label)}</div>
            ${e.note ? `<div style="font-size:13px; color:var(--ink-soft); margin-top:4px;">${esc(e.note)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// --- Actions ---
function saveDraftAndNext() {
  const draft = state.draft || {};
  draft.callDate = $('#f-date').value;
  draft.number = $('#f-number').value.trim();
  draft.content = $('#f-content').value.trim();
  // channel + known are already set via chip handlers
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
    name:  $('#p-name').value.trim(),
    id:    $('#p-id').value.trim(),
    email: $('#p-email').value.trim(),
    phone: $('#p-phone').value.trim()
  };
  Store.save(state);
  go(returnTo || 'home');
}

function copyLetter() {
  const t = $('#letter-body').innerText;
  navigator.clipboard.writeText(t).then(() => {
    toast('הועתק ✓');
  });
}

function downloadLetter() {
  const d = state.draft;
  const entity = window.ENTITIES.find(e => e.id === d.entityId);
  const body = $('#letter-body').innerText;
  const blob = new Blob([body], { type:'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `בקשה-${entity?.name || 'ללא-שם'}.txt`; a.click();
  URL.revokeObjectURL(url);
}

function sendLetter() {
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
  const body = $('#letter-body').innerText;
  const subject = tpl.subject(payload);
  const mailto = `mailto:${entity.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Save ticket
  const ticket = {
    id: uid(),
    entityId: entity.id, entityName: entity.name,
    goal: goalKey, goalLabel: tpl.title,
    subject, body,
    status: 'ready',
    events: [
      { type:'drafted', at: new Date().toISOString(), label:'הבקשה הוכנה' },
      { type:'mail-opened', at: new Date().toISOString(), label:'תוכנת הדואר נפתחה' }
    ]
  };
  state.tickets = state.tickets || [];
  state.tickets.unshift(ticket);
  state.draft = {};
  Store.save(state);

  window.location.href = mailto;
  setTimeout(() => {
    if (confirm('שלחת את ההודעה? אסמן את התיק כנשלח?')) {
      const t = state.tickets.find(x => x.id === ticket.id);
      t.status = 'sent';
      t.events.push({ type:'sent', at: new Date().toISOString(), label:'נשלח (אישור המשתמשת)' });
      Store.save(state);
      go('ticket', { id: ticket.id });
    } else {
      go('ticket', { id: ticket.id });
    }
  }, 1200);
}

function markAsSent() {
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
  const subject = tpl.subject(payload);
  const body = $('#letter-body').innerText;
  const ticket = {
    id: uid(),
    entityId: entity.id, entityName: entity.name,
    goal: goalKey, goalLabel: tpl.title,
    subject, body,
    status: 'sent',
    events: [
      { type:'drafted', at: new Date().toISOString(), label:'הבקשה הוכנה' },
      { type:'sent', at: new Date().toISOString(), label:'סומן כנשלח (ידני)' }
    ]
  };
  state.tickets = state.tickets || [];
  state.tickets.unshift(ticket);
  state.draft = {};
  Store.save(state);
  go('ticket', { id: ticket.id });
}

function addReply(ticketId) {
  const text = prompt('הדביקי את תוכן התשובה שהתקבלה:');
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
    callDate: '',
    callChannel: '',
    knownDetails: ''
  };
  const tpl = window.TEMPLATES.complaint;
  const body = tpl.body(payload);
  const subject = tpl.subject(payload);
  const mailto = `mailto:ppa@justice.gov.il?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  t.events.push({ type:'complaint', at: new Date().toISOString(), label:'תלונה לרשות להגנת הפרטיות (טיוטה נוצרה)' });
  persist();
  window.location.href = mailto;
}

// --- Bulk ---
let bulkSet = new Set();
function bulkToggle(id) {
  if (bulkSet.has(id)) bulkSet.delete(id); else bulkSet.add(id);
  updateBulkUI();
}
function bulkSelectCat(cat) {
  window.ENTITIES.filter(e => e.category === cat).forEach(e => bulkSet.add(e.id));
  updateBulkUI();
}
function bulkSelectAll() {
  window.ENTITIES.forEach(e => bulkSet.add(e.id));
  updateBulkUI();
}
function bulkClear() {
  bulkSet.clear();
  updateBulkUI();
}
function updateBulkUI() {
  document.querySelectorAll('[data-bulk-id]').forEach(el => {
    el.classList.toggle('active', bulkSet.has(el.dataset.bulkId));
  });
  const c = $('#bulk-count');
  if (c) c.textContent = bulkSet.size;
}
function bulkProceed() {
  if (!bulkSet.size) { alert('לא בחרת גופים'); return; }
  if (!state.profile.name) { alert('קודם הוסיפי את השם שלך'); go('profile', { returnTo:'bulk' }); return; }
  const chosen = [...bulkSet];
  const now = new Date().toISOString();
  const tpl = window.TEMPLATES.delete;
  const p = state.profile;
  chosen.forEach(id => {
    const e = window.ENTITIES.find(x => x.id === id);
    const isIntl = e.country !== 'IL';
    const theTpl = isIntl ? window.TEMPLATES.gdpr : tpl;
    const payload = { userName:p.name, userId:p.id, entityName:e.name, callDate:'', callChannel:'', knownDetails:'שם, ת.ז.', isLeak:e.leaked };
    state.tickets.unshift({
      id: uid(), entityId:e.id, entityName:e.name,
      goal: isIntl?'gdpr':'delete', goalLabel: theTpl.title,
      subject: theTpl.subject(payload),
      body: theTpl.body(payload),
      status:'draft',
      events:[{ type:'drafted', at:now, label:'בקשה נוצרה (שליחה המונית)' }]
    });
  });
  Store.save(state);
  bulkSet.clear();
  alert(`נוצרו ${chosen.length} תיקים. עכשיו עברי על כל אחד ושלחי.`);
  go('home');
}

// --- Scan ---
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
    <div class="card">
      <h3>תוצאות הסריקה</h3>
      <p style="color:var(--ink-soft); font-size:14px;">${flagged.length} מתוך ${results.length} זוהו כספאם מוכר.</p>
      <div style="margin-top:14px;">
        ${results.map(r => `
          <div class="card-row" style="padding:10px 0; border-bottom:1px solid var(--border);">
            <div>${esc(r.num)}</div>
            ${r.match ? `<span class="pill pill-action">${r.match.note}</span>` : `<span class="pill">לא זוהה</span>`}
          </div>
        `).join('')}
      </div>
      ${flagged.length ? `
        <div style="margin-top:16px;">
          <button class="btn btn-primary" onclick="exportBlocklist(${JSON.stringify(flagged.map(r=>r.num)).replace(/"/g,'&quot;')})">ייצוא לרשימת חסימה</button>
        </div>
      ` : ''}
    </div>
  `;
}

function exportBlocklist(nums) {
  const csv = 'number\n' + nums.join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'mispari-blocklist.csv'; a.click();
  URL.revokeObjectURL(url);
}

// --- Suggestion engine ---
function suggestEntities(d) {
  const txt = ((d.content||'') + ' ' + (d.number||'')).toLowerCase();
  const scored = window.ENTITIES.map(e => {
    let score = 0;
    const name = e.name.toLowerCase();
    if (txt.includes(name)) score += 10;
    // category hints
    if (/ביטוח|פוליסה|פנסיה/.test(txt) && e.category==='insurance') score += 3;
    if (/בנק|אשראי|הלוואה/.test(txt) && e.category==='bank') score += 3;
    if (/סלולר|חבילה|מכשיר|תוכנית/.test(txt) && e.category==='telco') score += 3;
    if (/קמפיין|מפלגה|בחירות|מצביע/.test(txt) && e.category==='party') score += 3;
    return { e, score };
  }).filter(x => x.score > 0).sort((a,b) => b.score-a.score).slice(0,4);
  return scored.map(x => x.e);
}

// --- Chip handlers (event delegation) ---
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

// --- Filter entities ---
function filterEntities(q) {
  const items = document.querySelectorAll('#entity-list [data-entity-name]');
  q = q.toLowerCase();
  items.forEach(el => {
    const n = el.dataset.entityName.toLowerCase();
    el.style.display = n.includes(q) ? '' : 'none';
  });
}

// --- Utils ---
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}

function toast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:40px;left:50%;transform:translateX(-50%);background:var(--ink);color:white;padding:10px 20px;border-radius:999px;font-size:14px;z-index:1000;box-shadow:0 4px 16px rgba(0,0,0,0.2);';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}

// --- Router ---
const views = {
  'home':       view_home,
  'new-call':   view_newCall,
  'identify':   view_identify,
  'goals':      view_goals,
  'review':     view_review,
  'profile':    view_profile,
  'ticket':     view_ticket,
  'bulk':       view_bulk,
  'scan':       view_scan
};

function render() {
  const main = $('#main');
  const view = views[route.name] || views.home;
  main.innerHTML = view();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  render();
});
