(function(){
"use strict";

/* ---------- Config ---------- */
const CATS = [
  {id:"groceries", label:"Groceries", kind:"need", food:true, pct:18},
  {id:"eatout",    label:"Eating out", kind:"want", food:true, pct:8},
  {id:"snacks",    label:"Snacks & drinks", kind:"want", food:true, pct:3},
  {id:"gym",       label:"Gym & nutrition", kind:"goal", food:true, pct:12},
  {id:"rent",      label:"Rent & bills", kind:"need", pct:25, monthly:true},
  {id:"transport", label:"Transport", kind:"need", pct:8},
  {id:"phone",     label:"Phone & internet", kind:"need", pct:3, monthly:true},
  {id:"academic",  label:"Books & academic", kind:"need", pct:6, monthly:true},
  {id:"health",    label:"Health", kind:"need", pct:5, monthly:true},
  {id:"shopping",  label:"Shopping", kind:"want", pct:6},
  {id:"fun",       label:"Entertainment", kind:"want", pct:4},
  {id:"other",     label:"Other", kind:"other", pct:2}
];
const CAT = Object.fromEntries(CATS.map(c=>[c.id,c]));
const DEFAULT_SETTINGS = {monthlyBudget:15000, pct:Object.fromEntries(CATS.map(c=>[c.id,c.pct]))};

/* Food knowledge: [keywords, rating, label, why, swap, isProtein] */
const FOODS = [
  [["fried chicken","kfc","chicken fry","chicken 65","chicken lollipop"],"limit","Fried chicken","Deep-fried batter adds a lot of oil to otherwise good protein.","Tandoori or grilled chicken keeps the protein and drops most of the oil."],
  [["butter chicken","paneer butter masala","malai kofta","korma","shahi paneer"],"limit","Cream-heavy curry","Good protein buried in butter and cream.","Chicken curry or tandoori, with dal on the side."],
  [["fried momos","fried momo"],"limit","Fried momos","Frying roughly doubles the oil of steamed momos.","Steamed momos."],
  [["samosa","kachori","pakora","pakoda","bhajji","bhaji","vada pav","medu vada","bread pakora"],"limit","Fried snacks","Refined flour and deep-frying: filling for an hour, little protein.","Roasted chana, sprouts chaat or a couple of boiled eggs."],
  [["chole bhature","bhature","puri","poori"],"limit","Deep-fried bread","Heavy on oil and refined flour.","Chole with rotis or rice."],
  [["jalebi","gulab jamun","rasgulla","rasmalai","halwa","mithai","laddu","ladoo","barfi","kheer"],"limit","Sweets","Mostly sugar and ghee: a quick spike, then a crash.","A banana with a few dates, or curd with fruit."],
  [["cake","pastry","donut","doughnut","brownie","ice cream","icecream","chocolate","cookie","biscuit"],"limit","Desserts & bakery","Sugar plus fat, little protein or fibre.","Greek yogurt or a fruit bowl."],
  [["chips","namkeen","kurkure","bhujia","lays"],"limit","Packaged snacks","Salty, fried and easy to overeat.","Makhana, peanuts or roasted chana."],
  [["maggi","instant noodles","cup noodles","ramen","yippee"],"limit","Instant noodles","Refined flour and palm oil with very little protein.","Egg bhurji with roti, or poha with peanuts."],
  [["pizza","burger","french fries","fries"],"limit","Fast food","Calorie-dense and low in protein per rupee.","A chicken or egg roll with less oil, or a thali."],
  [["chowmein","chow mein","manchurian","fried rice","hakka noodles","noodles"],"limit","Indo-Chinese","Oil-heavy and made from refined flour or white rice.","Chicken or egg with steamed rice and veg."],
  [["cold drink","coke","pepsi","soda","soft drink","sprite","thums up","fanta","energy drink","red bull","packaged juice","frooti","maaza","sting"],"limit","Sugary drinks","Liquid sugar: no fullness and no nutrients.","Chaas, nimbu pani without sugar, or plain water."],
  [["beer","alcohol","whisky","vodka","rum","wine"],"limit","Alcohol","Empty calories that also slow recovery after training.","Skip it, or keep it to rare occasions."],
  [["biryani"],"okay","Biryani","Protein and carbs, but oily. Fine about once a week.","Add raita and skip the extra gravy."],
  [["mutton","goat"],"okay","Mutton","Good protein but fattier. Keep it occasional.",null,true],
  [["paratha"],"okay","Paratha","Decent pre-training fuel; the ghee is the part to watch.","Stuffed roti with curd and less ghee."],
  [["momos","momo"],"okay","Steamed momos","Moderate: filling but mostly refined flour.",null],
  [["roll","kathi","wrap","frankie","shawarma"],"okay","Rolls & wraps","Protein inside, oily paratha outside.",null],
  [["dosa","idli","uttapam","upma","poha"],"okay","Light South Indian / poha","Reasonable carbs, lighter on oil. Add a protein side.",null],
  [["rice","pulao"],"okay","Rice","Good training carbs. Pair with dal or chicken.",null],
  [["chai","tea","coffee"],"okay","Tea & coffee","Fine in itself; the sugar is what adds up.",null],
  [["pani puri","golgappa","bhel","chaat"],"okay","Chaat","Occasional treat; low in protein.",null],
  [["lassi","milkshake","shake"],"okay","Lassi & shakes","Protein from milk, but usually sweetened.",null],
  [["thali","mess meal","mess"],"okay","Thali / mess meal","Balanced when it includes dal and sabzi.",null],
  [["whey","protein powder","protein bar"],"fuel","Protein supplement","Convenient protein for recovery.",null,true],
  [["egg","anda","omelette","omelet","bhurji"],"fuel","Eggs","Cheap, complete protein; ideal after a workout.",null,true],
  [["chicken breast","grilled chicken","tandoori chicken","chicken tikka","chicken curry","chicken"],"fuel","Chicken","Lean protein that helps rebuild muscle.",null,true],
  [["fish","rohu","salmon","tuna","prawn","pomfret"],"fuel","Fish","Protein plus omega-3 fats.",null,true],
  [["paneer","tofu"],"fuel","Paneer / tofu","Protein-rich. Paneer is calorie-dense, so portion it.",null,true],
  [["soya","soy chunks","nutrela"],"fuel","Soya chunks","One of the cheapest protein sources per rupee.",null,true],
  [["dal","lentil","rajma","chana","chole","moong","sprouts","lobia"],"fuel","Dal & legumes","Protein and fibre that keep you full.",null,true],
  [["curd","dahi","yogurt","yoghurt","raita","chaas","buttermilk"],"fuel","Curd & chaas","Protein plus gut-friendly cultures.",null,true],
  [["milk"],"fuel","Milk","Protein and calcium; an easy post-workout option.",null,true],
  [["sattu"],"fuel","Sattu","Roasted gram flour: protein-rich and cheap.",null,true],
  [["oats","muesli","daliya","dalia"],"fuel","Oats & daliya","Slow carbs for steady energy.",null],
  [["banana","apple","orange","papaya","guava","fruit","watermelon","pomegranate","mango"],"fuel","Fruit","Fibre, vitamins and quick pre-workout energy.",null],
  [["salad","vegetable","veggies","sabzi","spinach","palak","broccoli","cucumber","veg"],"fuel","Vegetables","Micronutrients and fibre for recovery.",null],
  [["peanut butter","peanut","almond","nuts","walnut","makhana","roasted chana","seeds"],"fuel","Nuts & seeds","Healthy fats and some protein; a handful is enough.",null],
  [["roti","chapati","phulka","sweet potato","brown rice","khichdi"],"fuel","Whole carbs","Steady energy for training days.",null]
];
const KB = FOODS.map((f,i)=>({i,kw:f[0],rating:f[1],label:f[2],why:f[3],swap:f[4]||null,protein:!!f[5]}));
const MATCHERS = [];
KB.forEach(f=>f.kw.forEach(k=>MATCHERS.push({k, f, re:new RegExp("(^|[^a-z])"+k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(s|es)?(?=[^a-z]|$)")})));
MATCHERS.sort((a,b)=>b.k.length-a.k.length || a.f.i-b.f.i);

function analyseFood(text){
  const t=(text||"").toLowerCase();
  const parts=t.split(/[,+&\/;]| and | with /).map(s=>s.trim()).filter(Boolean);
  const found=[]; const seen=new Set();
  for(const p of parts){
    const m=MATCHERS.find(m=>m.re.test(" "+p+" "));
    if(m && !seen.has(m.f.i)){seen.add(m.f.i);found.push(m.f);}
  }
  let rating=null;
  const cnt=r=>found.filter(f=>f.rating===r).length;
  if(cnt("limit")) rating = cnt("fuel") ? "okay" : "limit";
  else if(cnt("fuel") && cnt("fuel")>=cnt("okay")) rating="fuel";
  else if(found.length) rating="okay";
  return {foods:found, rating};
}

/* ---------- Dates & money ---------- */
const pad=n=>String(n).padStart(2,"0");
const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const parse=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d);};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
const mondayOf=d=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());const wd=(x.getDay()+6)%7;return addDays(x,-wd);};
const TODAY=()=>ymd(new Date());
const inr=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
const money=n=>inr.format(Math.round(n||0));
const DOW=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function weekLabel(mon){const sun=addDays(mon,6);
  return mon.getMonth()===sun.getMonth() ? `${mon.getDate()}–${sun.getDate()} ${MON[sun.getMonth()]} ${sun.getFullYear()}` : `${mon.getDate()} ${MON[mon.getMonth()]} – ${sun.getDate()} ${MON[sun.getMonth()]} ${sun.getFullYear()}`;}
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

/* ---------- Example data (never saved) ---------- */
function buildExample(){
  const lastMon=addDays(mondayOf(new Date()),-7), prevMon=addDays(lastMon,-7);
  const mk=(mon,day,cat,amount,note)=>{const a=analyseFood(note);return {id:uid(),date:ymd(addDays(mon,day)),cat,amount,note,rating:CAT[cat].food?a.rating:null};};
  return [
    mk(lastMon,0,"rent",850,"hostel & mess fee share"), mk(lastMon,0,"groceries",420,"eggs, curd, bananas"), mk(lastMon,0,"transport",60,"auto to campus"), mk(lastMon,0,"snacks",40,"samosa"),
    mk(lastMon,1,"eatout",180,"chicken biryani"), mk(lastMon,1,"snacks",50,"cold drink"),
    mk(lastMon,2,"academic",120,"printing thesis draft"), mk(lastMon,2,"eatout",90,"masala dosa"),
    mk(lastMon,3,"groceries",310,"chicken breast 500g"), mk(lastMon,3,"snacks",30,"chips"),
    mk(lastMon,4,"eatout",260,"pizza with labmates"), mk(lastMon,4,"phone",299,"mobile recharge"),
    mk(lastMon,5,"fun",250,"movie"), mk(lastMon,5,"eatout",140,"egg roll"), mk(lastMon,5,"snacks",60,"jalebi"),
    mk(lastMon,6,"groceries",380,"dal, rice, vegetables"), mk(lastMon,6,"shopping",399,"gym t-shirt"), mk(lastMon,6,"snacks",20,"chai"),
    mk(prevMon,1,"rent",850,"hostel & mess fee share"), mk(prevMon,2,"eatout",320,"butter chicken"), mk(prevMon,3,"snacks",90,"maggi"), mk(prevMon,4,"groceries",350,"milk, oats, fruit"), mk(prevMon,5,"transport",150,"bus to Mandi town"), mk(prevMon,6,"fun",300,"cafe with friends")
  ];
}
const EXAMPLE = buildExample();

/* ---------- State & storage ---------- */
const state = {
  months:{},               // "2026-09" -> [entries]
  settings:structuredClone(DEFAULT_SETTINGS),
  backend:"pending",       // pending | cloud (Firebase, synced) | local (this device only)
  loaded:false,
  week:mondayOf(new Date()),
  jumpedToData:false,
  lastAdded:null
};
const LS_KEY="fuel-funds-v1";
const MODE_KEY="fuel-funds-mode";
const lsGet=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
const lsSet=(k,v)=>{try{ v==null?localStorage.removeItem(k):localStorage.setItem(k,v);}catch(e){}};

function realEntries(){return Object.values(state.months).flat();}
function exampleMode(){return false;}   // the installed app never shows sample entries
function entries(){return exampleMode()?EXAMPLE:realEntries();}
function readSettings(b){ return {monthlyBudget:Number(b.monthlyBudget)||DEFAULT_SETTINGS.monthlyBudget,pct:Object.assign({},DEFAULT_SETTINGS.pct,b.pct||{})}; }

function loadLocalData(){ try{ return JSON.parse(lsGet(LS_KEY)||"null"); }catch(e){ return null; } }
function saveLocal(){ lsSet(LS_KEY,JSON.stringify({months:state.months,settings:state.settings})); }

/* ---- Firebase (cloud sync) ---- */
let fb=null, auth=null, fs=null, user=null, unsubMonths=null, unsubSettings=null;
const cloud={pending:false, configured:false};
const dirtyKeys=new Set(); let settingsDirty=false;

function persistMonth(key){
  const list=(state.months[key]||[]).slice();
  if(state.backend==="local"){ saveLocal(); return; }
  if(state.backend!=="cloud"){ dirtyKeys.add(key); return; }
  // Firestore saves to the device first and syncs when online, so no waiting here.
  cloud.pending=true; setSync();
  fb.setDoc(fb.doc(fs,"users",user.uid,"months",key),{entries:list,updatedAt:new Date().toISOString()})
    .catch(e=>showToast(`<b>Sync failed</b> (${esc(e.code||"error")}). ${e.code==="permission-denied"?"Check the Firestore rules in SETUP.md.":"It will retry when you're online."}`));
}
function persistSettings(){
  if(state.backend==="local"){ saveLocal(); showToast("Budget saved."); return; }
  if(state.backend!=="cloud"){ settingsDirty=true; return; }
  fb.setDoc(fb.doc(fs,"users",user.uid,"meta","settings"),state.settings)
    .catch(e=>showToast(`Couldn't sync budget (${esc(e.code||"error")}).`));
  showToast("Budget saved.");
}

function startLocal(){
  stopCloud();
  state.backend="local";
  const o=loadLocalData();
  state.months = o&&o.months ? o.months : {};
  if(o&&o.settings) state.settings=readSettings(o.settings);
  dirtyKeys.clear(); settingsDirty=false;
  hideGate(); fillSettings(); setSync(); afterLoad();
}
function stopCloud(){
  if(unsubMonths){unsubMonths();unsubMonths=null;}
  if(unsubSettings){unsubSettings();unsubSettings=null;}
}
function startCloud(u){
  stopCloud();
  state.backend="cloud"; state.months={}; state.jumpedToData=false; state.loaded=false;
  hideGate(); setSync(); render();
  const monthsRef=fb.collection(fs,"users",u.uid,"months");
  unsubMonths=fb.onSnapshot(monthsRef,{includeMetadataChanges:true},snap=>{
    const m={};
    snap.docs.forEach(d=>{const b=d.data();if(b&&Array.isArray(b.entries)) m[d.id]=b.entries.slice();});
    dirtyKeys.forEach(k=>{ if(state.months[k]) m[k]=state.months[k]; });
    state.months=m; cloud.pending=snap.metadata.hasPendingWrites;
    if(dirtyKeys.size){ const ks=[...dirtyKeys]; dirtyKeys.clear(); ks.forEach(persistMonth); }
    setSync(); afterLoad();
  }, e=>showToast(`<b>Sync stopped</b> (${esc(e.code||"error")}). ${e.code==="permission-denied"?"Check the Firestore rules in SETUP.md.":"Reopen the app to reconnect."}`));
  unsubSettings=fb.onSnapshot(fb.doc(fs,"users",u.uid,"meta","settings"),snap=>{
    if(snap.exists() && !settingsDirty){ state.settings=readSettings(snap.data()); fillSettings(); render(); }
    if(settingsDirty){ settingsDirty=false; persistSettings(); }
  },()=>{});
  updateAccount();
}

async function initBackend(){
  const cfg=window.FIREBASE_CONFIG||{};
  cloud.configured = !!(cfg.apiKey && !/PASTE|YOUR_/i.test(cfg.apiKey) && cfg.projectId);
  if(!cloud.configured){ startLocal(); return; }
  try{ fb=await import("./firebase.bundle.js"); }
  catch(e){ showToast("Couldn't load sync. Using this device only for now."); startLocal(); return; }
  const app=fb.initializeApp(cfg);
  auth=fb.getAuth(app);
  try{ fs=fb.initializeFirestore(app,{localCache:fb.persistentLocalCache({tabManager:fb.persistentMultipleTabManager()})}); }
  catch(e){ fs=fb.initializeFirestore(app,{}); }
  fb.getRedirectResult(auth).catch(authError);
  fb.onAuthStateChanged(auth,u=>{
    user=u; updateAccount();
    if(u){ lsSet(MODE_KEY,null); startCloud(u); }
    else if(lsGet(MODE_KEY)==="local"){ startLocal(); }
    else { stopCloud(); state.backend="pending"; setSync(); showGate(); }
  });
}

function afterLoad(){
  state.loaded=true;
  if(!state.jumpedToData){
    state.jumpedToData=true;
    state.week = exampleMode() ? addDays(mondayOf(new Date()),-7) : mondayOf(new Date());
  }
  updateAccount();
  render();
}
function setSync(){
  const el=document.getElementById("sync"), t=document.getElementById("syncText");
  let s, txt;
  if(state.backend==="pending"){ s="pending"; txt="Starting…"; }
  else if(state.backend==="local"){ s="local"; txt= cloud.configured ? "This device only · Sign in to sync" : "Saved on this device"; }
  else if(!navigator.onLine){ s="local"; txt="Offline · will sync later"; }
  else if(cloud.pending){ s="pending"; txt="Syncing…"; }
  else { s="db"; txt="Synced"; }
  el.dataset.s=s; t.textContent=txt;
  el.disabled = !(state.backend==="local" && cloud.configured);
}

/* ---- Sign-in screen ---- */
const gate=document.getElementById("gate");
function showGate(){ gate.hidden=false; document.getElementById("gateErr").hidden=true; }
function hideGate(){ gate.hidden=true; }
function authError(e){
  if(!e||!e.code||e.code==="auth/popup-closed-by-user"||e.code==="auth/cancelled-popup-request") return;
  const msg={
    "auth/invalid-credential":"Email or password is wrong.",
    "auth/wrong-password":"Email or password is wrong.",
    "auth/user-not-found":"No account with that email. Tap “Create account”.",
    "auth/email-already-in-use":"That email already has an account. Tap “Sign in”.",
    "auth/weak-password":"Use a password of at least 6 characters.",
    "auth/invalid-email":"That email address doesn't look right.",
    "auth/network-request-failed":"No internet connection. Connect once to sign in; after that the app works offline.",
    "auth/unauthorized-domain":`This web address isn't allowed yet. In Firebase → Authentication → Settings → Authorized domains, add ${location.hostname}.`,
    "auth/operation-not-allowed":"This sign-in method is off. Turn it on in Firebase → Authentication → Sign-in method.",
    "auth/too-many-requests":"Too many attempts. Wait a minute and try again."
  }[e.code] || `Sign-in failed (${e.code}).`;
  const el=document.getElementById("gateErr"); el.textContent=msg; el.hidden=false;
  if(gate.hidden) showToast(esc(msg));
}
document.getElementById("googleBtn").addEventListener("click",async()=>{
  try{ await fb.signInWithPopup(auth,new fb.GoogleAuthProvider()); }
  catch(e){
    if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment"].includes(e.code)) fb.signInWithRedirect(auth,new fb.GoogleAuthProvider());
    else authError(e);
  }
});
const creds=()=>({email:document.getElementById("gEmail").value.trim(),pw:document.getElementById("gPass").value});
document.getElementById("emailForm").addEventListener("submit",async ev=>{
  ev.preventDefault(); const {email,pw}=creds();
  try{ await fb.signInWithEmailAndPassword(auth,email,pw); }catch(e){ authError(e); }
});
document.getElementById("signupBtn").addEventListener("click",async()=>{
  const {email,pw}=creds();
  try{ await fb.createUserWithEmailAndPassword(auth,email,pw); }catch(e){ authError(e); }
});
document.getElementById("resetBtn").addEventListener("click",async()=>{
  const {email}=creds();
  if(!email){ authError({code:"auth/invalid-email"}); return; }
  try{ await fb.sendPasswordResetEmail(auth,email); const el=document.getElementById("gateErr"); el.textContent="Reset link sent. Check your email."; el.hidden=false; }catch(e){ authError(e); }
});
document.getElementById("localBtn").addEventListener("click",()=>{ lsSet(MODE_KEY,"local"); startLocal(); });

/* ---- Account box ---- */
function updateAccount(){
  const who=document.getElementById("acctWho"), inB=document.getElementById("acctIn"), outB=document.getElementById("acctOut"), up=document.getElementById("uploadLocal");
  if(state.backend==="cloud" && user){
    who.textContent=`Syncing as ${user.email||"your account"}`; inB.hidden=true; outB.hidden=false;
    const o=loadLocalData(); const n=o&&o.months?Object.values(o.months).flat().length:0;
    up.hidden = n===0; up.textContent=`Copy ${n} entr${n===1?"y":"ies"} from this device to your account`;
  } else {
    who.textContent = cloud.configured ? "Not syncing. Entries stay on this device." : "Sync isn't set up (see SETUP.md). Entries stay on this device.";
    inB.hidden = !cloud.configured; outB.hidden=true; up.hidden=true;
  }
}
document.getElementById("acctIn").addEventListener("click",()=>{ lsSet(MODE_KEY,null); state.backend="pending"; setSync(); showGate(); });
document.getElementById("acctOut").addEventListener("click",async()=>{ lsSet(MODE_KEY,null); await fb.signOut(auth); });
document.getElementById("sync").addEventListener("click",()=>{ if(state.backend==="local"&&cloud.configured){ lsSet(MODE_KEY,null); state.backend="pending"; setSync(); showGate(); } });
document.getElementById("uploadLocal").addEventListener("click",()=>{
  const o=loadLocalData(); if(!o) return;
  const added=mergeData(o);
  showToast(`Copied ${added} entr${added===1?"y":"ies"} to your account.`);
});
window.addEventListener("online",setSync); window.addEventListener("offline",setSync);

/* ---------- Mutations ---------- */
function addEntry(e){
  const wasExample=exampleMode();
  const key=e.date.slice(0,7);
  (state.months[key] ||= []).push(e);
  state.months[key].sort((a,b)=>a.date.localeCompare(b.date)||(a.ts||0)-(b.ts||0));
  state.lastAdded=e.id;
  persistMonth(key);
  if(wasExample){ state.jumpedToData=true; }
  state.week=mondayOf(parse(e.date));
  render();
}
function deleteEntry(id){
  for(const [k,list] of Object.entries(state.months)){
    const i=list.findIndex(x=>x.id===id);
    if(i>=0){ list.splice(i,1); persistMonth(k); render(); showToast("Entry removed."); return; }
  }
}

/* ---------- Analysis ---------- */
function weekData(mon){
  const start=ymd(mon), end=ymd(addDays(mon,6));
  return entries().filter(e=>e.date>=start && e.date<=end);
}
function monthTarget(cat){return (Number(state.settings.monthlyBudget)||0)*(Number(state.settings.pct[cat])||0)/100;}
function monthToDate(cat, mon){
  const end=ymd(addDays(mon,6)), start=end.slice(0,8)+"01";
  return entries().filter(e=>e.cat===cat && e.date>=start && e.date<=end).reduce((a,e)=>a+e.amount,0);
}
/* For monthly-billed categories compare month-to-date with the monthly target; others compare the week with the weekly target. */
function catView(cat, mon, weekSpent){
  if(CAT[cat].monthly) return {s:monthToDate(cat,mon), t:monthTarget(cat), scope:"month"};
  return {s:weekSpent, t:targetFor(cat), scope:"week"};
}
function weeklyBudget(){return (Number(state.settings.monthlyBudget)||0)*12/52;}
function targetFor(cat){return weeklyBudget()*(Number(state.settings.pct[cat])||0)/100;}

function suggestions(list, total, mon){
  const less=[], more=[];
  const spent={}; CATS.forEach(c=>spent[c.id]=0); list.forEach(e=>spent[e.cat]=(spent[e.cat]||0)+e.amount);
  const wb=weeklyBudget();
  const foodOut=spent.eatout+spent.snacks;
  for(const c of CATS){
    if(c.id==="other") continue;
    const {s,t,scope}=catView(c.id, mon, spent[c.id]);
    if(t>0 && s>t*1.15 && s-t>=50){
      const over=s-t;
      let why;
      if(c.id==="eatout") why=`Over your target by ${money(over)}. Two home-cooked meals a week (eggs, dal, chicken with rice) would close most of this gap and add protein.`;
      else if(c.id==="snacks") why=`${money(over)} over target. Snack money is usually fried or sugary; move it to curd, fruit or roasted chana.`;
      else if(c.id==="shopping") why=`${money(over)} over target. Before the next purchase, wait 48 hours and check if it's needed.`;
      else if(c.id==="fun") why=`${money(over)} over target. Keep what you enjoy most and drop the rest this week.`;
      else if(c.id==="groceries") why=`${money(over)} over target. If this is replacing eating out, it's a good trade; otherwise look for packaged snacks and sweets in the basket.`;
      else if(c.id==="gym") why=`${money(over)} over target. Fine if it's a monthly membership or a big tub of whey; otherwise check it's not pricey supplements you don't need.`;
      else why=`${money(over)} over this month's target (${money(s)} of ${money(t)} so far). For a need like this, check if it was a one-off before cutting.`;
      const w = c.kind==="want"?1.5 : c.id==="groceries"?0.4 : 1;
      less.push({title:c.label+(scope==="month"?" (this month)":""), amt:over, why, weight:w*over});
    }
  }
  const junkSpend=list.filter(e=>e.rating==="limit").reduce((a,e)=>a+e.amount,0);
  if(junkSpend>=80 && !less.some(x=>x.title==="Snacks & drinks")){
    less.push({title:"Fried & sugary food", amt:junkSpend, why:`${money(junkSpend)} went on food rated “limit” this week. This is money that works against your fitness goal.`, weight:junkSpend*1.2});
  }
  if(total>0 && spent.other>total*0.1) less.push({title:"Uncategorised spending", amt:spent.other, why:`${money(spent.other)} is sitting in “Other”. Recategorise it so the report can tell where to cut.`, weight:spent.other*0.5});

  const gT=targetFor("gym");
  if(gT>0 && spent.gym<gT*0.5){
    const gap=gT-spent.gym;
    more.push({title:"Gym & nutrition", amt:gap, why:`Only ${money(spent.gym)} of a ${money(gT)} target. This is your goal category: spend it on eggs, chicken, curd, a gym membership or decent shoes${foodOut>0?`, funded by trimming eating out and snacks (${money(foodOut)} this week)`:""}.`, weight:gap*1.4});
  }
  const grT=targetFor("groceries");
  if(grT>0 && spent.groceries<grT*0.6 && foodOut>spent.groceries){
    more.push({title:"Groceries", amt:grT-spent.groceries, why:`Groceries ${money(spent.groceries)} vs eating out and snacks ${money(foodOut)}. Cooking more is cheaper per meal and makes a high-protein plate easier.`, weight:(grT-spent.groceries)*1.2});
  }
  if(wb>0 && total>0 && total<wb*0.85){
    more.push({title:"Savings", amt:wb-total, why:`You're ${money(wb-total)} under the weekly budget. Put it aside, or towards a protein staple you'll use all month (a tray of eggs, peanut butter, whey).`, weight:(wb-total)*0.6});
  }
  less.sort((a,b)=>b.weight-a.weight); more.sort((a,b)=>b.weight-a.weight);
  return {less:less.slice(0,4), more:more.slice(0,4), spent};
}

function plate(list){
  const food=list.filter(e=>CAT[e.cat]&&CAT[e.cat].food);
  const rated=food.filter(e=>e.rating);
  const n={fuel:0,okay:0,limit:0};
  rated.forEach(e=>n[e.rating]++);
  const total=rated.length;
  const score= total? Math.round((n.fuel*100 + n.okay*55)/total) : null;
  const keep={}, ease={};
  let protein=false;
  food.forEach(e=>{
    const a=analyseFood(e.note);
    a.foods.forEach(f=>{
      if(f.protein && f.rating!=="limit") protein=true;
      if(f.rating==="fuel" && e.rating!=="limit"){ (keep[f.label] ||= {f,count:0}).count++; }
      if(f.rating==="limit" && e.rating!=="fuel"){ const x=(ease[f.label] ||= {f,count:0,amt:0}); x.count++; x.amt+=e.amount; }
    });
    if(!a.foods.length && e.rating==="limit"){ const x=(ease[e.note||"Unnamed"] ||= {f:{label:e.note||"Unnamed",why:"You rated this as limit.",swap:null},count:0,amt:0}); x.count++; x.amt+=e.amount; }
  });
  return {food, rated, n, total, score, keep:Object.values(keep).sort((a,b)=>b.count-a.count), ease:Object.values(ease).sort((a,b)=>b.amt-a.amt), protein};
}

/* ---------- Render ---------- */
function render(){
  const mon=state.week, list=weekData(mon);
  const prev=weekData(addDays(mon,-7));
  const total=list.reduce((a,e)=>a+e.amount,0), prevTotal=prev.reduce((a,e)=>a+e.amount,0);
  const wb=weeklyBudget();
  const ex=exampleMode();

  document.getElementById("banner").hidden=!ex;
  document.getElementById("weekLabel").textContent=weekLabel(mon);
  const curMon=mondayOf(new Date());
  document.getElementById("nextWk").disabled = ymd(mon)>=ymd(curMon);
  document.getElementById("todayLabel").textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});

  // scoreboard
  document.getElementById("sbTotal").textContent=money(total);
  document.getElementById("sbOf").textContent= wb>0 ? `of ${money(wb)} weekly budget` : "no budget set";
  const ratio= wb>0 ? total/wb : 0;
  const st= ratio>1 ? "over" : ratio>0.85 ? "near" : "under";
  const pill=document.getElementById("sbPill"); pill.dataset.s=st; pill.textContent= st==="over"?`Over by ${money(total-wb)}`: st==="near"?"Near budget":"Under budget"; pill.hidden=!(wb>0);
  const meter=document.getElementById("sbMeter"); meter.style.width=Math.min(100,ratio*100)+"%"; meter.dataset.s=st;
  const dEl=document.getElementById("sbDelta"), dSub=document.getElementById("sbDeltaSub");
  if(prevTotal>0){ const d=total-prevTotal, p=Math.round(d/prevTotal*100); dEl.textContent=(d>=0?"+":"−")+money(Math.abs(d)); dSub.textContent=`${p>=0?"+":""}${p}% · last week ${money(prevTotal)}`; }
  else { dEl.textContent="—"; dSub.textContent="No entries last week"; }
  const days=new Set(list.map(e=>e.date)).size;

  const P=plate(list);
  document.getElementById("sbPlate").textContent= P.score==null ? "—" : P.score+"/100";
  document.getElementById("sbPlateSub").textContent= P.total ? `${P.n.fuel} fuel · ${P.n.okay} okay · ${P.n.limit} limit` : "No food logged";

  renderDaily(mon,list,wb);
  renderPlate(P);
  const S=suggestions(list,total,mon);
  renderAdvice(S,list);
  renderCats(S.spent,total,mon);
  renderEntries(list,days);
  renderToday();
}

function renderDaily(mon,list,wb){
  const byDay=Array(7).fill(0);
  list.forEach(e=>{const i=Math.round((parse(e.date)-mon)/864e5); if(i>=0&&i<7) byDay[i]+=e.amount;});
  const daily=wb/7;
  const max=Math.max(daily*1.15, ...byDay, 1);
  const cols=document.getElementById("cols"), labels=document.getElementById("colLabels");
  const today=TODAY();
  let h="";
  byDay.forEach((v,i)=>{
    const d=addDays(mon,i), over= daily>0 && v>daily;
    h+=`<div class="col" tabindex="0" data-tip="${DOW[i]} ${d.getDate()} ${MON[d.getMonth()]}: ${money(v)}${daily>0?` (daily share ${money(daily)})`:""}"><div class="val num">${v?money(v):""}</div><div class="bar" data-over="${over}" style="height:${v/max*150}px"></div></div>`;
  });
  if(daily>0) h+=`<div class="refline" style="bottom:${daily/max*150}px"><span>${money(daily)}/day</span></div>`;
  cols.innerHTML=h;
  labels.innerHTML=byDay.map((_,i)=>{const d=addDays(mon,i);return `<div data-today="${ymd(d)===today}">${DOW[i]}<br>${d.getDate()}</div>`;}).join("");
  const logged=byDay.filter(v=>v>0).length;
  document.getElementById("dailyAvg").textContent= logged ? `avg ${money(byDay.reduce((a,b)=>a+b,0)/7)}/day` : "";
}

function renderCats(spent,total,mon){
  const rows=CATS.map(c=>Object.assign({c},catView(c.id,mon,spent[c.id]||0)))
    .filter(r=>r.s>0 || r.t>0)
    .sort((a,b)=>(b.s-a.s)||(b.t-a.t));
  const max=Math.max(1,...rows.map(r=>Math.max(r.s,r.t)));
  const kindLabel={need:"need",want:"want",goal:"goal",other:"other"};
  document.getElementById("cats").innerHTML=rows.map(r=>{
    const over= r.t>0 && r.s>r.t*1.15;
    const goalLow= r.c.kind==="goal" && r.t>0 && r.s<r.t*0.5;
    const s= over?"over":goalLow?"goal-low":"ok";
    const tipScope = r.scope==="month" ? "month to date, monthly target" : "this week, weekly target";
    return `<div class="cat"><div class="name">${esc(r.c.label)}<small>${kindLabel[r.c.kind]}${r.scope==="month"?" · month":""}</small></div>
      <div class="track" tabindex="0" data-tip="${esc(r.c.label)}: ${money(r.s)} (${tipScope} ${money(r.t)})"><div class="fill" data-s="${s}" style="width:${r.s/max*100}%"></div>${r.t>0?`<div class="tick" style="left:calc(${r.t/max*100}% - 1px)"></div>`:""}</div>
      <div class="amt num">${money(r.s)}<small>of ${money(r.t)}</small></div></div>`;
  }).join("");
}

function renderAdvice(S,list){
  const li=x=>`<li><strong>${esc(x.title)}<em>${money(x.amt)}</em></strong>${esc(x.why)}</li>`;
  const none= list.length===0;
  document.getElementById("lessList").innerHTML = S.less.length ? S.less.map(li).join("") : `<li>${none?"No entries this week yet.":"Nothing is running over its target this week. Good control."}</li>`;
  document.getElementById("moreList").innerHTML = S.more.length ? S.more.map(li).join("") : `<li>${none?"Log a few days to get suggestions.":"Your goal and essentials are funded. Keep the same pattern next week."}</li>`;
}

function renderPlate(P){
  const el=document.getElementById("plate");
  document.getElementById("plateCount").textContent = P.food.length ? `${P.food.length} food buys` : "";
  if(!P.food.length){ el.innerHTML=`<p class="empty">No food logged this week. Add groceries, meals or snacks to see how your plate supports your fitness goal.</p>`; return; }
  const {n,total,score}=P;
  const limitShare= total? n.limit/total : 0, fuelShare= total? n.fuel/total : 0;
  let s,head,msg;
  if(score==null){ s="mixed"; head="Rate your food"; msg="None of this week's food buys has a rating yet. Pick Fuel, Okay or Limit when you log them."; }
  else if(fuelShare>=0.6 && limitShare<=0.15){ s="good"; head="Strong plate week"; msg=`${n.fuel} of ${total} food buys were fuel. This is what supports steady workouts and recovery. Keep it going.`; }
  else if(limitShare>=0.35){ s="bad"; head="Junk crept in"; msg=`${n.limit} of ${total} food buys were fried or sugary. Cutting them isn't about one meal; it's the weekly pattern that shows up in your energy at the gym. Try the swaps below.`; }
  else { s="mixed"; head="Mixed week"; msg=`Good base with ${n.fuel} fuel buys, but ${n.limit} “limit” item${n.limit===1?"":"s"} held the score back. Swap one or two next week.`; }
  const seg=(k,c)=> n[k] ? `<div class="s-${k}" style="flex:${n[k]}" tabindex="0" data-tip="${c}: ${n[k]} of ${total}">${Math.round(n[k]/total*100)}%</div>` : "";
  const keepHtml = P.keep.length ? P.keep.slice(0,4).map(k=>`<li><b>${esc(k.f.label)}</b>${k.count>1?` ×${k.count}`:""} — ${esc(k.f.why)}</li>`).join("") : `<li>No fuel foods logged. Start with eggs, dal or curd.</li>`;
  const easeHtml = P.ease.length ? P.ease.slice(0,4).map(k=>`<li><b>${esc(k.f.label)}</b>${k.count>1?` ×${k.count}`:""} · ${money(k.amt)} — ${esc(k.f.why)}${k.f.swap?`<span class="swap">${esc(k.f.swap)}</span>`:""}</li>`).join("") : `<li>Nothing to cut. No fried or sugary buys this week.</li>`;
  el.innerHTML=`
    <div class="plate-verdict"><div class="plate-score" data-s="${s}">${score==null?"—":score}<small>/100</small></div>
      <div><h3>${head}</h3><p>${msg}</p></div></div>
    ${total?`<div class="stack" role="img" aria-label="Fuel ${n.fuel}, okay ${n.okay}, limit ${n.limit}">${seg("fuel","Fuel")}${seg("okay","Okay")}${seg("limit","Limit")}</div>
    <div class="stack-legend"><span><i class="dot" data-r="fuel"></i>Fuel ${n.fuel}</span><span><i class="dot" data-r="okay"></i>Okay ${n.okay}</span><span><i class="dot" data-r="limit"></i>Limit ${n.limit}</span></div>`:""}
    <div class="foodcols">
      <div class="keep"><h4>Keep eating</h4><ul class="foodlist">${keepHtml}</ul></div>
      <div class="ease"><h4>Ease off</h4><ul class="foodlist bad">${easeHtml}</ul></div>
    </div>
    ${!P.protein?`<div class="nudge"><b>No protein source this week.</b> For general fitness, aim for some protein at most meals: eggs, chicken, fish, dal, curd, paneer or soya.</div>`:""}`;
}

function renderEntries(list,days){
  const ex=exampleMode();
  document.getElementById("entCount").textContent = `${list.length} entries · ${days}/7 days logged`;
  const rows=list.slice().sort((a,b)=>b.date.localeCompare(a.date));
  const rateTxt={fuel:"Fuel",okay:"Okay",limit:"Limit"};
  document.getElementById("entBody").innerHTML = rows.length ? rows.map(e=>{const d=parse(e.date);return `<tr${e.id===state.lastAdded?' class="new"':""}>
    <td class="num">${DOW[(d.getDay()+6)%7]} ${d.getDate()}</td>
    <td>${esc(e.note||"—")}</td>
    <td>${esc(CAT[e.cat]?CAT[e.cat].label:e.cat)}</td>
    <td>${e.rating?`<span class="tag"><i class="dot" data-r="${e.rating}"></i>${rateTxt[e.rating]}</span>`:""}</td>
    <td class="r amt">${money(e.amount)}</td>
    <td class="r">${ex?"":`<button class="del" type="button" data-del="${esc(e.id)}" aria-label="Delete ${esc(e.note||"entry")}">Delete</button>`}</td></tr>`;}).join("")
    : `<tr><td colspan="6" class="empty">No entries in this week.</td></tr>`;
}

function renderToday(){
  const t=TODAY();
  const all=realEntries();
  document.getElementById("dayTotal").textContent=money(all.filter(e=>e.date===t).reduce((a,e)=>a+e.amount,0));
  const recent=all.slice().sort((a,b)=>b.date.localeCompare(a.date)||(b.ts||0)-(a.ts||0)).slice(0,6);
  const dayName=ds=>{ if(ds===t) return "Today"; if(ds===ymd(addDays(parse(t),-1))) return "Yesterday"; const d=parse(ds); return `${DOW[(d.getDay()+6)%7]} ${d.getDate()} ${MON[d.getMonth()]}`; };
  document.getElementById("todayList").innerHTML = recent.length ? recent.map(e=>`<li><i class="dot" data-r="${e.rating||""}"></i><div class="li-main"><div>${esc(e.note||CAT[e.cat].label)}</div><small>${dayName(e.date)} · ${esc(CAT[e.cat].label)}</small></div><span class="num" style="font-family:var(--mono);font-size:13px">${money(e.amount)}</span></li>`).join("")
    : `<li style="display:block"><p class="empty">Nothing logged yet.</p></li>`;
}

/* ---------- Form ---------- */
const chipsEl=document.getElementById("catChips");
chipsEl.innerHTML=CATS.map((c,i)=>`<label class="chip" for="cat-${c.id}"><input type="radio" name="cat" id="cat-${c.id}" value="${c.id}"${i===0?" checked":""}><span>${esc(c.label)}${c.kind==="goal"?"<small>goal</small>":""}</span></label>`).join("");
const QUICK=["eggs","chicken","dal","curd","fruit","paneer","samosa","cold drink","maggi","biryani","pizza","chai"];
document.getElementById("quick").innerHTML=QUICK.map(q=>`<button type="button" data-q="${q}">${q}</button>`).join("");
const dateEl=document.getElementById("date"); dateEl.value=TODAY(); dateEl.max=TODAY();
let manualRate=false;

function currentCat(){const r=document.querySelector('input[name="cat"]:checked');return r?r.value:"other";}
function updateFoodBox(){
  const cat=currentCat(), box=document.getElementById("foodbox");
  box.hidden=!CAT[cat].food;
  if(box.hidden) return;
  const a=analyseFood(document.getElementById("note").value);
  const v=document.getElementById("verdict");
  if(!manualRate){ document.querySelectorAll('input[name="rate"]').forEach(r=>r.checked = r.value===a.rating); }
  const chosen=(document.querySelector('input[name="rate"]:checked')||{}).value||"";
  v.dataset.r=chosen;
  if(!document.getElementById("note").value.trim()){ v.dataset.r=""; v.textContent="Type the food to see how it fits your fitness goal."; return; }
  if(!a.foods.length){ v.innerHTML= chosen? `Rated <b>${chosen}</b> by you.` : "Not in the food list yet. Pick a rating below so the weekly report can count it."; return; }
  const top=a.foods.slice(0,3).map(f=>{
    const tag=f.rating==="fuel"?"Good pick":f.rating==="okay"?"Fine in moderation":"Ease off";
    return `<b>${tag}: ${esc(f.label)}.</b> ${esc(f.why)}${f.rating==="limit"&&f.swap?` Try: ${esc(f.swap)}`:""}`;
  });
  v.innerHTML=top.join("<br>");
}
chipsEl.addEventListener("change",()=>{updateFoodBox();});
document.getElementById("note").addEventListener("input",()=>{manualRate=false;updateFoodBox();});
document.querySelectorAll('input[name="rate"]').forEach(r=>r.addEventListener("change",()=>{manualRate=true;updateFoodBox();}));
document.getElementById("quick").addEventListener("click",e=>{
  const b=e.target.closest("button[data-q]"); if(!b) return;
  const n=document.getElementById("note"); n.value = n.value.trim() ? n.value.trim()+", "+b.dataset.q : b.dataset.q;
  manualRate=false; updateFoodBox(); n.focus();
});

document.getElementById("form").addEventListener("submit",ev=>{
  ev.preventDefault();
  const err=document.getElementById("formErr");
  const amount=Math.round(Number(document.getElementById("amt").value));
  const date=dateEl.value, cat=currentCat(), note=document.getElementById("note").value.trim();
  if(!(amount>0)){ err.textContent="Enter an amount above ₹0."; err.hidden=false; document.getElementById("amt").focus(); return; }
  if(!date){ err.textContent="Pick a date."; err.hidden=false; return; }
  err.hidden=true;
  const rating = CAT[cat].food ? ((document.querySelector('input[name="rate"]:checked')||{}).value||null) : null;
  addEntry({id:uid(),date,cat,amount,note,rating,ts:Date.now()});
  const a=analyseFood(note);
  const dd=parse(date);
  let msg=`Added <b>${money(amount)}</b> · ${esc(CAT[cat].label)} on ${date===TODAY()?"today":DOW[(dd.getDay()+6)%7]+" "+dd.getDate()+" "+MON[dd.getMonth()]}.`;
  if(CAT[cat].food){
    if(rating==="fuel") msg+=` Good fuel${a.foods[0]?` (${esc(a.foods[0].label.toLowerCase())})`:""}. Your body will use this.`;
    else if(rating==="limit"){ const f=a.foods.find(x=>x.rating==="limit"); msg+=` That's a “limit” food.${f&&f.swap?` Next time: ${esc(f.swap)}`:" Balance it with protein at your next meal."}`; }
    else if(rating==="okay") msg+=` Fine in moderation. Add a protein side if you can.`;
  }
  showToast(msg);
  document.getElementById("amt").value=""; document.getElementById("note").value=""; manualRate=false;
  document.querySelectorAll('input[name="rate"]').forEach(r=>r.checked=false);
  updateFoodBox(); document.getElementById("amt").focus();
});

document.getElementById("entBody").addEventListener("click",e=>{const b=e.target.closest("button[data-del]"); if(b) deleteEntry(b.dataset.del);});
document.getElementById("prevWk").addEventListener("click",()=>{state.week=addDays(state.week,-7);render();});
document.getElementById("nextWk").addEventListener("click",()=>{state.week=addDays(state.week,7);render();});
document.getElementById("thisWk").addEventListener("click",()=>{state.week=mondayOf(new Date());render();});

/* ---------- Settings ---------- */
function fillSettings(){
  document.getElementById("monthly").value=state.settings.monthlyBudget;
  document.getElementById("targets").innerHTML=CATS.map(c=>`<label for="pct-${c.id}">${esc(c.label)}</label><input class="input num" id="pct-${c.id}" type="number" min="0" max="100" step="1" value="${Number(state.settings.pct[c.id])||0}" aria-label="${esc(c.label)} percent">`).join("");
  updatePctSum();
}
function updatePctSum(){
  const sum=CATS.reduce((a,c)=>a+(Number(document.getElementById("pct-"+c.id).value)||0),0);
  const el=document.getElementById("pctSum"); el.dataset.ok=String(sum===100);
  const m=Number(document.getElementById("monthly").value)||0;
  el.textContent = `Total ${sum}%${sum===100?"":" — should add up to 100%"} · weekly budget ${money(m*12/52)}`;
}
document.getElementById("setForm").addEventListener("input",updatePctSum);
document.getElementById("setForm").addEventListener("submit",ev=>{
  ev.preventDefault();
  const m=Number(document.getElementById("monthly").value);
  if(!(m>=0)){ showToast("Enter a monthly budget in rupees."); return; }
  const pct={}; CATS.forEach(c=>pct[c.id]=Math.max(0,Number(document.getElementById("pct-"+c.id).value)||0));
  state.settings={monthlyBudget:m,pct};
  persistSettings();
  render();
});

/* ---------- Tooltip & toast ---------- */
const tip=document.getElementById("tip");
function showTip(el){ const r=el.getBoundingClientRect(); tip.textContent=el.dataset.tip; tip.classList.add("on");
  const tw=tip.offsetWidth, th=tip.offsetHeight; let x=r.left+r.width/2-tw/2; x=Math.max(8,Math.min(window.innerWidth-tw-8,x)); let y=r.top-th-8; if(y<8) y=r.bottom+8; tip.style.left=x+"px"; tip.style.top=y+"px"; }
document.addEventListener("pointerover",e=>{const el=e.target.closest("[data-tip]"); if(el) showTip(el); else tip.classList.remove("on");});
document.addEventListener("focusin",e=>{const el=e.target.closest("[data-tip]"); if(el) showTip(el);});
document.addEventListener("focusout",()=>tip.classList.remove("on"));
window.addEventListener("scroll",()=>tip.classList.remove("on"),{passive:true});
let toastT;
function showToast(html){const t=document.getElementById("toast"); t.innerHTML=html; t.classList.add("on"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("on"),4200);}

function refreshDate(){ const t=TODAY(); if(dateEl.max!==t){ const wasToday=dateEl.value===dateEl.max; dateEl.max=t; if(wasToday||!dateEl.value) dateEl.value=t; render(); } }
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") refreshDate(); });
dateEl.addEventListener("focus",refreshDate);

/* ---------- Backup ---------- */
function mergeData(d){
  let added=0;
  for(const [k,v] of Object.entries(d.months||{})){
    if(!/^\d{4}-\d{2}$/.test(k)) continue;
    const incoming=Array.isArray(v)?v:(v&&Array.isArray(v.entries)?v.entries:[]);
    const list=(state.months[k]||[]).slice(); const ids=new Set(list.map(e=>e.id));
    let changed=false;
    incoming.forEach(e=>{ if(e&&e.id&&!ids.has(e.id)&&CAT[e.cat]&&Number(e.amount)>0&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)){ list.push(e); ids.add(e.id); added++; changed=true; } });
    if(changed){ list.sort((a,b)=>a.date.localeCompare(b.date)||(a.ts||0)-(b.ts||0)); state.months[k]=list; persistMonth(k); }
  }
  state.jumpedToData=false; afterLoad();
  return added;
}
document.getElementById("exportBtn").addEventListener("click",()=>{
  const data={exportedAt:new Date().toISOString(),settings:state.settings,months:Object.fromEntries(Object.entries(state.months).map(([k,v])=>[k,{entries:v}]))};
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
  a.download=`fuel-funds-backup-${TODAY()}.json`; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
});
document.getElementById("importFile").addEventListener("change",async ev=>{
  const f=ev.target.files[0]; if(!f) return;
  try{
    const d=JSON.parse(await f.text());
    const added=mergeData(d);
    if(d.settings){ state.settings=readSettings(d.settings); fillSettings(); persistSettings(); }
    showToast(`Imported ${added} new entr${added===1?"y":"ies"}.`);
  }catch(e){ showToast("That file isn't a Fuel & Funds backup."); }
  ev.target.value="";
});

/* ---------- Install as an app ---------- */
let installEvt=null;
window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); installEvt=e; document.getElementById("installBtn").hidden=false; });
document.getElementById("installBtn").addEventListener("click",async()=>{ if(!installEvt) return; installEvt.prompt(); await installEvt.userChoice; installEvt=null; document.getElementById("installBtn").hidden=true; });
window.addEventListener("appinstalled",()=>{ document.getElementById("installBtn").hidden=true; showToast("Installed. Open Fuel & Funds from your home screen or app list."); });
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost"||location.hostname==="127.0.0.1")){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}

/* ---------- Boot ---------- */
fillSettings();
updateAccount();
state.week=mondayOf(new Date());
updateFoodBox();
render();
initBackend();
})();
