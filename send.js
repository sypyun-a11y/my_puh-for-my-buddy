/* 도토리집 — 9시 푸시 발송 (GitHub Actions에서 실행, 레포 루트에 두기) */
const admin = require('firebase-admin');

const sa = JSON.parse(process.env.FIREBASE_SA);
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const SITE = 'https://sypyun-a11y.github.io/my_puh-for-my-buddy/';

(async () => {
  // 어떤 시간대인지: cron '0 0 * * *'(=09시 KST)면 아침, 그 외(=21시 KST)면 저녁
  const sched = process.env.SCHED || '';
  const morning = sched.trim().startsWith('0 0') || (!sched && new Date().getUTCHours() < 6);
  const title = morning ? '도토리집 🌰' : '도토리집 🌙';
  const body  = morning ? '오늘의 미션 확인해봐~! 🎯' : '오늘 미션 인증했어? 📸';

  // push 컬렉션의 모든 토큰 모으기
  const snap = await db.collection('push').get();
  let tokens = [];
  snap.forEach(d => { tokens = tokens.concat(d.data().tokens || []); });
  tokens = [...new Set(tokens)];
  if (!tokens.length) { console.log('보낼 토큰 없음'); return; }

  const res = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    webpush: { fcmOptions: { link: SITE }, notification: { icon: 'heart.png' } }
  });
  console.log(`발송: 성공 ${res.successCount} / 실패 ${res.failureCount} (총 ${tokens.length})`);

  // 죽은 토큰 정리
  const dead = [];
  res.responses.forEach((r, i) => {
    if (!r.success) {
      const code = r.error && r.error.code;
      if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-argument') dead.push(tokens[i]);
    }
  });
  if (dead.length) {
    const batch = db.batch();
    snap.forEach(d => {
      const t = (d.data().tokens || []).filter(x => !dead.includes(x));
      batch.set(d.ref, { tokens: t }, { merge: true });
    });
    await batch.commit();
    console.log(`죽은 토큰 ${dead.length}개 정리`);
  }
})().catch(e => { console.error(e); process.exit(1); });
