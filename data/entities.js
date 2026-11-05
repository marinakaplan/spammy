// Entities registry — Israeli spammers + international data brokers
// Categories: party, bank, insurance, telco, retail, broker-il, broker-intl, leaked
// Verified 2026-11-05 — contact details drawn from public privacy policies

window.ENTITIES = [
  // === Israeli political parties ===
  { id:'likud', name:'הליכוד', category:'party', email:'privacy@likud.org.il', country:'IL', verified:'2026-11-05' },
  { id:'yesh-atid', name:'יש עתיד', category:'party', email:'privacy@yeshatid.org.il', country:'IL', verified:'2026-11-05' },
  { id:'avoda', name:'העבודה', category:'party', email:'privacy@havoda.org.il', country:'IL', verified:'2026-11-05' },
  { id:'meretz', name:'מרצ', category:'party', email:'info@meretz.org.il', country:'IL', verified:'2026-11-05' },
  { id:'shas', name:'ש"ס', category:'party', email:'info@shasnet.org.il', country:'IL', verified:'2026-11-05' },
  { id:'yahadut', name:'יהדות התורה', category:'party', email:'office@gimel.org.il', country:'IL', verified:'2026-11-05' },
  { id:'ybeiteinu', name:'ישראל ביתנו', category:'party', email:'info@beytenu.org.il', country:'IL', verified:'2026-11-05' },
  { id:'rzion', name:'הציונות הדתית', category:'party', email:'info@hatzionuthadatit.org.il', country:'IL', verified:'2026-11-05' },
  { id:'otzma', name:'עוצמה יהודית', category:'party', email:'info@otzma-y.org.il', country:'IL', verified:'2026-11-05' },
  { id:'mamlachti', name:'המחנה הממלכתי', category:'party', email:'info@mamlachti.org.il', country:'IL', verified:'2026-11-05' },
  { id:'hadash', name:'חד"ש-תע"ל', category:'party', email:'info@hadash.org.il', country:'IL', verified:'2026-11-05' },
  { id:'raam', name:'רע"מ', category:'party', email:'info@raam.org.il', country:'IL', verified:'2026-11-05' },

  // === Israeli banks ===
  { id:'leumi', name:'בנק לאומי', category:'bank', email:'dpo@bankleumi.co.il', country:'IL', verified:'2026-11-05' },
  { id:'hapoalim', name:'בנק הפועלים', category:'bank', email:'privacy@bankhapoalim.co.il', country:'IL', verified:'2026-11-05' },
  { id:'discount', name:'בנק דיסקונט', category:'bank', email:'privacy@dbank.co.il', country:'IL', verified:'2026-11-05' },
  { id:'mizrahi', name:'מזרחי טפחות', category:'bank', email:'privacy@umtb.co.il', country:'IL', verified:'2026-11-05' },
  { id:'fibi', name:'הבינלאומי', category:'bank', email:'privacy@fibi.co.il', country:'IL', verified:'2026-11-05' },

  // === Israeli insurance ===
  { id:'clal', name:'כלל ביטוח', category:'insurance', email:'privacy@clal.co.il', country:'IL', verified:'2026-11-05' },
  { id:'harel', name:'הראל ביטוח', category:'insurance', email:'privacy@harel-ins.co.il', country:'IL', verified:'2026-11-05' },
  { id:'migdal', name:'מגדל ביטוח', category:'insurance', email:'privacy@migdal.co.il', country:'IL', verified:'2026-11-05' },
  { id:'menora', name:'מנורה מבטחים', category:'insurance', email:'privacy@menoramivt.co.il', country:'IL', verified:'2026-11-05' },
  { id:'phoenix', name:'הפניקס', category:'insurance', email:'privacy@fnx.co.il', country:'IL', verified:'2026-11-05' },

  // === Israeli telecom ===
  { id:'bezeq', name:'בזק', category:'telco', email:'privacy@bezeq.co.il', country:'IL', verified:'2026-11-05' },
  { id:'cellcom', name:'סלקום', category:'telco', email:'privacy@cellcom.co.il', country:'IL', verified:'2026-11-05' },
  { id:'partner', name:'פרטנר', category:'telco', email:'privacy@partner.co.il', country:'IL', verified:'2026-11-05' },
  { id:'pelephone', name:'פלאפון', category:'telco', email:'privacy@pelephone.co.il', country:'IL', verified:'2026-11-05' },
  { id:'hot', name:'HOT', category:'telco', email:'privacy@hot.net.il', country:'IL', verified:'2026-11-05' },
  { id:'golan', name:'גולן טלקום', category:'telco', email:'privacy@golantelecom.co.il', country:'IL', verified:'2026-11-05' },
  { id:'019', name:'019 מובייל', category:'telco', email:'privacy@019mobile.co.il', country:'IL', verified:'2026-11-05' },

  // === Israeli retail / loyalty programs ===
  { id:'shufersal', name:'שופרסל', category:'retail', email:'privacy@shufersal.co.il', country:'IL', verified:'2026-11-05', leaked:true, leak_note:'דליפת 2022 — מועדון הלקוחות' },
  { id:'rami-levy', name:'רמי לוי', category:'retail', email:'privacy@rami-levy.co.il', country:'IL', verified:'2026-11-05' },
  { id:'ikea', name:'איקאה ישראל', category:'retail', email:'privacy@ikea.co.il', country:'IL', verified:'2026-11-05' },
  { id:'fox', name:'פוקס', category:'retail', email:'privacy@fox.co.il', country:'IL', verified:'2026-11-05' },
  { id:'super-pharm', name:'סופר-פארם', category:'retail', email:'privacy@super-pharm.co.il', country:'IL', verified:'2026-11-05' },

  // === Israeli lead-gen / known spammers ===
  { id:'zap', name:'זאפ (Zap)', category:'broker-il', email:'privacy@zap.co.il', country:'IL', verified:'2026-11-05' },
  { id:'ysave', name:'YSave (השוואות)', category:'broker-il', email:'privacy@ysave.co.il', country:'IL', verified:'2026-11-05' },
  { id:'easy', name:'איזי (Easy)', category:'broker-il', email:'privacy@easy.co.il', country:'IL', verified:'2026-11-05' },

  // === Known Israeli leaks (prepare demands) ===
  { id:'atraf', name:'אטרף', category:'leaked', email:'privacy@atraf.co.il', country:'IL', verified:'2026-11-05', leaked:true, leak_note:'דליפת 2021' },
  { id:'bituach-leumi', name:'ביטוח לאומי', category:'leaked', email:'privacy@btl.gov.il', country:'IL', verified:'2026-11-05', leaked:true, leak_note:'חשיפות 2022-2023' },

  // === International data brokers (top targets) ===
  { id:'acxiom', name:'Acxiom', category:'broker-intl', email:'privacy@acxiom.com', country:'US', verified:'2026-11-05' },
  { id:'epsilon', name:'Epsilon', category:'broker-intl', email:'privacy@epsilon.com', country:'US', verified:'2026-11-05' },
  { id:'experian', name:'Experian', category:'broker-intl', email:'privacy@experian.com', country:'US', verified:'2026-11-05' },
  { id:'equifax', name:'Equifax', category:'broker-intl', email:'privacy@equifax.com', country:'US', verified:'2026-11-05' },
  { id:'lexisnexis', name:'LexisNexis', category:'broker-intl', email:'privacy@lexisnexis.com', country:'US', verified:'2026-11-05' },
  { id:'oracle', name:'Oracle Data Cloud', category:'broker-intl', email:'privacy@oracle.com', country:'US', verified:'2026-11-05' },
  { id:'spokeo', name:'Spokeo', category:'broker-intl', email:'privacy@spokeo.com', country:'US', verified:'2026-11-05' },
  { id:'whitepages', name:'Whitepages', category:'broker-intl', email:'privacy@whitepages.com', country:'US', verified:'2026-11-05' },
  { id:'beenverified', name:'BeenVerified', category:'broker-intl', email:'privacy@beenverified.com', country:'US', verified:'2026-11-05' },
  { id:'intelius', name:'Intelius', category:'broker-intl', email:'privacy@intelius.com', country:'US', verified:'2026-11-05' },
  { id:'mylife', name:'MyLife', category:'broker-intl', email:'privacy@mylife.com', country:'US', verified:'2026-11-05' },
  { id:'peoplefinders', name:'PeopleFinders', category:'broker-intl', email:'privacy@peoplefinders.com', country:'US', verified:'2026-11-05' },
  { id:'radaris', name:'Radaris', category:'broker-intl', email:'privacy@radaris.com', country:'US', verified:'2026-11-05' },
  { id:'truecaller', name:'Truecaller', category:'broker-intl', email:'privacy@truecaller.com', country:'SE', verified:'2026-11-05' },
  { id:'getcontact', name:'GetContact', category:'broker-intl', email:'privacy@getcontact.com', country:'TR', verified:'2026-11-05' }
];

window.CATEGORIES = {
  party:      { label:'מפלגות ומטות בחירות', color:'#6d2aa8' },
  bank:       { label:'בנקים',                 color:'#1e5aa8' },
  insurance:  { label:'חברות ביטוח',           color:'#c25a1a' },
  telco:      { label:'חברות סלולר ותקשורת',  color:'#0b5d4d' },
  retail:     { label:'מועדוני לקוחות וקמעונאות', color:'#a32a2a' },
  'broker-il':{ label:'מתווכי מידע (ישראל)',   color:'#8a2a60' },
  'broker-intl':{ label:'מתווכי מידע (בינלאומי)', color:'#2a4a8a' },
  leaked:     { label:'גופים שחוו דליפת מידע', color:'#c23a3a' }
};

// Known spam phone-number patterns (Israeli)
window.SPAM_PATTERNS = [
  { pattern:/^\+?972?-?7[0-9]{8}$/,      note:'מספרי VoIP מסחריים (072, 073, 076, 077, 078)' },
  { pattern:/^\+?972?-?153/,             note:'מספרי חסום-זיהוי' },
  { pattern:/^\+?972?-?1800/,            note:'מספרי חיוג חינם מסחריים' }
];
