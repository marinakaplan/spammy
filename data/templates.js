// Hebrew request templates — based on חוק הגנת הפרטיות, התשמ"א-1981
// Each template takes: { userName, userId, entityName, callDate, callChannel, knownDetails, isLeak }

window.TEMPLATES = {
  source: {
    id:'source',
    title:'בירור מקור המידע',
    desc:'מאיפה הגיעו אליכם הפרטים שלי',
    legal_basis:'סעיף 13 לחוק הגנת הפרטיות — זכות עיון',
    subject:(d)=>`בקשה לבירור מקור המידע האישי — ${d.userName}`,
    body:(d)=>`לכבוד ${d.entityName},

שמי ${d.userName}${d.userId ? ', ת.ז. ' + d.userId : ''}.

${d.callDate ? `ביום ${d.callDate} נוצר איתי קשר ${d.callChannel ? '(' + d.callChannel + ') ' : ''}מטעמכם או מגורם הפועל בשמכם. ` : ''}בידי הפונה היה עליי לפחות המידע הבא: ${d.knownDetails || 'שם ומספר טלפון'}.

בהתאם לסעיף 13 לחוק הגנת הפרטיות, התשמ"א-1981, הריני מבקש/ת:
1. לפרט מהו המקור שממנו הגיע אליכם המידע האישי שלי.
2. לפרט אילו פרטים אישיים נוספים מוחזקים עליי במאגריכם.
3. לפרט למי הועבר המידע שלי, אם הועבר.

אבקש מענה בכתב תוך 30 יום, כקבוע בחוק.

בברכה,
${d.userName}
${new Date().toLocaleDateString('he-IL')}`
  },

  stop: {
    id:'stop',
    title:'הפסקת פניות (דיוור ישיר)',
    desc:'תפסיקו להתקשר ולשלוח הודעות',
    legal_basis:'סעיף 17ו לחוק הגנת הפרטיות',
    subject:(d)=>`דרישה להפסקת פניות דיוור ישיר — ${d.userName}`,
    body:(d)=>`לכבוד ${d.entityName},

שמי ${d.userName}${d.userId ? ', ת.ז. ' + d.userId : ''}.

${d.callDate ? `ביום ${d.callDate} נוצר איתי קשר ${d.callChannel ? '(' + d.callChannel + ') ' : ''}מטעמכם.\n\n` : ''}בהתאם לסעיף 17ו לחוק הגנת הפרטיות, התשמ"א-1981, הריני דורש/ת:
1. להפסיק מיידית כל פנייה אליי לצורכי דיוור ישיר.
2. למחוק את פרטיי מכל רשימת תפוצה או מאגר שיווקי, לרבות מאגרים של ספקים מטעמכם.
3. להעביר הודעה על המחיקה לכל גורם שלישי שאליו הועברו פרטיי לצורכי דיוור.

אבקש אישור בכתב על ביצוע המחיקה תוך 30 יום. המשך פניות לאחר מועד זה יהווה הפרת חוק ויגרור פנייה לרשות להגנת הפרטיות ושקילת הגשת תביעה.

בברכה,
${d.userName}
${new Date().toLocaleDateString('he-IL')}`
  },

  delete: {
    id:'delete',
    title:'מחיקה מהמאגר',
    desc:'מחקו את כל המידע שלי',
    legal_basis:'סעיף 14 לחוק הגנת הפרטיות',
    subject:(d)=>`בקשת מחיקת מידע אישי — ${d.userName}`,
    body:(d)=>`לכבוד ${d.entityName},

שמי ${d.userName}${d.userId ? ', ת.ז. ' + d.userId : ''}.

${d.isLeak ? 'כפי שידוע, הייתה אצלכם דליפת מידע שבה נחשפו פרטים אישיים. ' : ''}בהתאם לסעיף 14 לחוק הגנת הפרטיות, התשמ"א-1981, הריני מבקש/ת למחוק את כל המידע האישי המוחזק עליי במאגריכם, שכן:
• לא נתתי הסכמה מדעת לשמירת המידע או להעברתו אליכם;
• המידע אינו רלוונטי עוד למטרה לגיטימית;
• שמירת המידע פוגעת בפרטיותי.

אבקש:
1. למחוק את כל המידע האישי שלי מכל המאגרים שלכם.
2. להודיע לכל צד שלישי שאליו הועבר המידע על המחיקה.
3. לשלוח אישור בכתב על ביצוע המחיקה תוך 30 יום.

בברכה,
${d.userName}
${new Date().toLocaleDateString('he-IL')}`
  },

  gdpr: {
    id:'gdpr',
    title:'מחיקה לפי GDPR (לגופים בינלאומיים)',
    desc:'Article 17 — Right to erasure',
    legal_basis:'GDPR Article 17 — Right to erasure',
    subject:(d)=>`GDPR Article 17 – Erasure request – ${d.userName}`,
    body:(d)=>`Dear Data Protection Officer at ${d.entityName},

My name is ${d.userName}${d.userId ? ', national ID: ' + d.userId : ''}, resident of Israel.

Pursuant to Article 17 of the General Data Protection Regulation (EU) 2016/679, and to any equivalent right under California Consumer Privacy Act (CCPA / CPRA) where applicable, I hereby request:

1. Erasure of all personal data you hold about me, including data obtained from third parties.
2. Disclosure of the sources from which my personal data was obtained.
3. Disclosure of any third parties to whom my personal data has been disclosed or sold, and notification to them of this erasure request.
4. Written confirmation of the erasure within 30 days.

Known identifiers that may help you locate my records: ${d.knownDetails || 'name, phone, email'}.

Please do not sell or share my personal information under CCPA §1798.120.

Sincerely,
${d.userName}
${new Date().toLocaleDateString('en-GB')}`
  },

  complaint: {
    id:'complaint',
    title:'תלונה לרשות להגנת הפרטיות',
    desc:'אחרי שהגוף לא הגיב / סירב',
    legal_basis:'סעיף 10 לחוק הגנת הפרטיות — סמכות הרשות',
    subject:(d)=>`תלונה על ${d.entityName} בעניין הפרת חוק הגנת הפרטיות — ${d.userName}`,
    body:(d)=>`לכבוד הרשות להגנת הפרטיות,

שמי ${d.userName}${d.userId ? ', ת.ז. ' + d.userId : ''}.

הריני להגיש תלונה כנגד ${d.entityName} בגין הפרת הוראות חוק הגנת הפרטיות, התשמ"א-1981.

העובדות:
${d.callDate ? `• ביום ${d.callDate} נוצר איתי קשר ${d.callChannel ? '(' + d.callChannel + ') ' : ''}מטעם ${d.entityName}, כאשר בידי הפונה היה עליי מידע אישי: ${d.knownDetails || 'שם, מספר טלפון'}.\n` : ''}• פניתי בכתב ל-${d.entityName} ודרשתי בירור מקור המידע / הפסקת פניות / מחיקה.
• הגוף לא השיב / השיב באופן שאינו עולה בקנה אחד עם החוק / המשיך לפנות אליי לאחר הדרישה.

הפרות לכאורה:
• סעיף 8 לחוק — ניהול מאגר מידע ללא רישום או ללא הסכמה.
• סעיף 17ו לחוק — פנייה לדיוור ישיר ללא זכות.
• סעיף 13 לחוק — אי מתן זכות עיון.

אבקש מהרשות:
1. לפתוח בבדיקה מנהלית / חקירה.
2. לחייב את הגוף בקנסות ובביצוע מחיקה.
3. לקבל ממני תיעוד נוסף ככל שנדרש.

בברכה,
${d.userName}
${new Date().toLocaleDateString('he-IL')}`
  }
};
