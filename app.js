/* On Campus Students Interaction Management System - front end logic.
   Data comes from data.js (rows copied from the DBMS tables). */

/* ============ STATE ============ */
const KEY='ocsims.db.v2', SKEY='ocsims.session.v2';
let db, userId=null, authTab='login', memStore={};
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return memStore[k]||null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){memStore[k]=v}}
function lsDel(k){try{localStorage.removeItem(k)}catch(e){delete memStore[k]}}
function loadDb(){
  try{const raw=lsGet(KEY); if(raw){const d=JSON.parse(raw); if(d&&d.student)return d}}catch(e){}
  return JSON.parse(JSON.stringify(SEED));
}
function saveDb(){lsSet(KEY,JSON.stringify(db))}
db=loadDb();
(function(){const s=lsGet(SKEY); if(s&&db.student.some(x=>x.student_id==s)) userId=+s;})();
const me=()=>db.student.find(s=>s.student_id===userId)||null;
const nextId=(arr,key,min)=>Math.max(min||0,...arr.map(r=>r[key]))+1;

/* ============ HELPERS ============ */
const $=s=>document.querySelector(s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtD=s=>{if(!s)return'';const [y,m,d]=String(s).slice(0,10).split('-');return `${+d} ${MON[+m-1]} ${y}`};
const fmtT=t=>{if(!t)return'';let [h,m]=String(t).slice(0,5).split(':');h=+h;return `${h%12||12}:${m} ${h>=12?'PM':'AM'}`};
const fmtDT=s=>s?`${fmtD(s)}, ${fmtT(String(s).slice(11,16))}`:'';
const money=n=>'₹'+Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const pad=n=>String(n).padStart(2,'0');
const todayISO=()=>{const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`};
const nowTS=()=>{const d=new Date();return `${todayISO()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`};
const byPhone=p=>db.student.find(s=>s.phone===p);
const PAY={UPI:['UPI','UPI'],CREDIT_CARD:['Credit Card','CC'],NET_BANKING:['Net Banking','NB']};

const ICON_RULES=[[/ear ?phone|headphone/i,'head'],[/laptop/i,'laptop'],[/phone|mobile/i,'phone'],[/wallet/i,'wallet'],[/calculator/i,'calc'],[/bag|backpack/i,'bag'],[/usb|pen ?drive/i,'usb'],[/book/i,'book'],[/\bkeys?\b/i,'key'],[/card/i,'card'],[/speaker/i,'speaker'],[/power ?bank/i,'battery']];
const iconFor=n=>{for(const [re,i] of ICON_RULES) if(re.test(n)) return i; return 'box'};
const svg=n=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const pillCls=s=>/^(active|available)$/i.test(s)?'ok':/^(sold|closed)$/i.test(s)?'':'warn';
const media=(name,url)=>{
  const isData=String(url).startsWith('data:');
  return `<div class="media"><span class="disc">${svg(iconFor(name))}</span>${isData?`<img src="${esc(url)}" alt="${esc(name)}">`:''}</div>`;
};

/* ============ MODULES ============ */
const MODS={
  found:{name:'Found Item',c:'m-found',icon:'search',desc:'Things students found on campus. Is yours here?'},
  lost:{name:'Lost Item',c:'m-lost',icon:'flag',desc:'Things students lost. Seen one? Contact the owner.'},
  sell:{name:'Sell Item',c:'m-sell',icon:'tag',desc:'Books and gadgets students have listed for sale.'},
  buy:{name:'Buy Item',c:'m-buy',icon:'cart',desc:'Books and gadgets you can buy right now.'}
};
const counts=()=>({found:db.found_post.length,lost:db.lost_post.length,sell:db.product_posts.length,buy:db.products.filter(p=>p.status==='available').length});

/* ============ ROUTER ============ */
const POSTS=['post-found','post-lost','post-sell'];
const PROTECTED=['dashboard','found','lost','sell','buy',...POSTS];
const route=()=>(location.hash||'#home').slice(1)||'home';
function render(){
  let r=route();
  if(PROTECTED.includes(r)&&!me()){authTab='login';r='auth';if(location.hash!=='#auth')history.replaceState(null,'','#auth')}
  if(r==='auth'&&me()){location.hash='dashboard';return}
  if(!['home','auth','about',...PROTECTED].includes(r)) r='home';
  renderTop();
  $('#app').innerHTML = r==='home'?viewHome(): r==='auth'?viewAuth(): r==='about'?viewAbout(): r==='dashboard'?viewDash(): r.startsWith('post-')?viewPost(r.slice(5)): viewList(r);
  window.scrollTo(0,0);
  if(r.startsWith('post-')){const f=$('#p-name'); if(f) f.focus({preventScroll:true})}
}
window.addEventListener('hashchange',render);

function renderTop(){
  const u=me(), r=route();
  /* Keep Home, Login and About Us beside the project name on every page.
     When logged in, show the student's name and Logout at the far right. */
  const links=[['#home','Home',['home']],['#auth','Login',['auth']],['#about','About Us',['about']]];
  const canPost=u&&['found','lost','sell'].includes(r);
  $('#topbar').innerHTML=`
    <a class="brand" href="#home">
      <img src="assets/logo.svg" alt="Project logo" width="54" height="54">
      <span class="bt"><small>DBMS field project</small><strong>On Campus Students Interaction Management System</strong></span>
    </a>
    <nav class="topnav" id="navlinks" aria-label="Main navigation">
      ${links.map(([h,t,ks])=>`<a href="${h}"${h==='#auth'?' data-act="login-tab"':''}${ks.includes(r)?' class="on" aria-current="page"':''}>${t}</a>`).join('')}
    </nav>
    ${u?`<div class="who"><span>${esc(u.student_name)}</span><button class="linkbtn" data-act="logout" type="button">Logout</button>${canPost?'<button class="btn sun post" data-act="post" type="button">+ Post Item</button>':''}</div>`:''}`;
}
/* ============ VIEWS ============ */
function viewHome(){
  const logged=!!me();
  const svc=[['found','Report a found item','Post what you picked up so its owner can recognise and claim it.'],
             ['lost','Report a lost item','Describe what you lost and where, and let other students help trace it.'],
             ['sell','Sell books and gadgets','List study material and electronics you no longer need.'],
             ['buy','Buy from other students','Browse available listings and pay through the system.']];
  return `<div class="hero-band"><section class="wrap hero">
    <div>
      <h1>Recover what you lose. Pass on what you don’t need.</h1>
      <p class="lead">A single place for students to report lost and found belongings and to buy and sell books and gadgets, with every post linked to a registered student account.</p>
      <div class="cta">${logged
        ?'<a class="btn big" href="#dashboard">Go to Dashboard</a>'
        :'<a class="btn big" href="#auth" data-act="login-tab">Login / Register</a><a class="btn ghost big" href="#about">About the project</a>'}</div>
    </div>
    <aside class="desk" aria-label="Services">
      <h2>What you can do here</h2>
      <ul>${svc.map(([k,t,d])=>`<li class="${MODS[k].c}"><span class="sq">${svg(MODS[k].icon)}</span><div><strong>${t}</strong><span class="d">${d}</span></div></li>`).join('')}</ul>
    </aside>
  </section></div>
  <section class="wrap home-sec">
    <h2>How it works</h2>
    <ol class="steps">
      <li><h3>Create your student account</h3><p>Register once with your name, email, phone, department and class.</p></li>
      <li><h3>Post or browse</h3><p>Report a lost or found item, list something for sale, or search what others have posted.</p></li>
      <li><h3>Connect and complete</h3><p>Contact the poster by their preferred email or phone, or buy a listed item and track it in your transactions.</p></li>
    </ol>
  </section>
`;
}

function viewAbout(){
  return `<div class="wrap about">
    <div class="phead"><h1 class="ptitle"><span>About Us</span></h1></div>
    <section class="blk"><h2>The project</h2><p>On Campus Students Interaction Management System is a DBMS field project. It gives students of a college one place to report lost and found items, and to buy and sell books and gadgets with each other.</p></section>
    <section class="blk"><h2>What students can do</h2>
      <ul class="mlist">
        ${Object.values(MODS).map(m=>`<li class="${m.c}">${m.name}<span>${m.desc}</span></li>`).join('')}
      </ul></section>
    <section class="blk"><h2>Where the data comes from</h2><p>Every record on this website comes from the project database, campusdb: student, item, lost_item, lost_post, found_item, found_post, products, product_posts, transactions, payments and transaction_products.</p></section>
  </div>`;
}

function viewAuth(){
  const login=authTab==='login';
  return `<div class="auth"><div class="sheet">
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" type="button" data-act="tab" data-tab="login" aria-selected="${login}">Login</button>
      <button class="tab" role="tab" type="button" data-act="tab" data-tab="register" aria-selected="${!login}">Register</button>
    </div>
    ${login?`
      <h2>Welcome back</h2><p class="hint">Log in with your student username and password.</p>
      <form data-form="login" novalidate>
        <div class="fields">
          <div class="field full"><label for="l-user">Username</label><input id="l-user" name="username" autocomplete="username" required></div>
          <div class="field full"><label for="l-pass">Password</label><input id="l-pass" name="password" type="password" autocomplete="current-password" required></div>
        </div>
        <div id="auth-err"></div>
        <div class="form-actions"><button class="btn block" type="submit">Login</button></div>
      </form>
`
    :`
      <h2>Student form</h2><p class="hint">Create your account.</p>
      <form data-form="register" novalidate>
        <div class="fields">
          <div class="field full"><label for="r-name">Student name <i>*</i></label><input id="r-name" name="student_name" maxlength="100" required></div>
          <div class="field"><label for="r-email">Email <i>*</i></label><input id="r-email" name="email" type="email" maxlength="100" required></div>
          <div class="field"><label for="r-phone">Phone <i>*</i></label><input id="r-phone" name="phone" inputmode="tel" maxlength="15" required></div>
          <div class="field"><label for="r-user">Username <i>*</i></label><input id="r-user" name="username" maxlength="50" autocomplete="username" required></div>
          <div class="field"><label for="r-pass">Password <i>*</i></label><input id="r-pass" name="password" type="password" maxlength="255" autocomplete="new-password" required></div>
          <div class="field"><label for="r-dept">Department</label><input id="r-dept" name="department" maxlength="100" placeholder="e.g. Computer Science"></div>
          <div class="field"><label for="r-class">Class</label><input id="r-class" name="class_name" maxlength="50" placeholder="e.g. SYBSc CS"></div>
        </div>
        <div id="auth-err"></div>
        <div class="form-actions"><button class="btn block" type="submit">Register</button></div>
      </form>`}
  </div></div>`;
}

function viewDash(){
  const u=me(), c=counts();
  return `<div class="wrap">
    <div class="phead">
      <h1 class="ptitle"><span>Dashboard</span></h1>
      <p>Hi ${esc(u.student_name.split(' ')[0])}${u.class_name?` from ${esc(u.class_name)}`:''}. Pick an option to see the details.</p>
    </div>
    <nav class="opts" aria-label="Dashboard options">
      ${Object.entries(MODS).map(([k,m])=>`<a class="opt ${m.c}" href="#${k}">
        <span class="bubble">${svg(m.icon)}</span>
        <span class="t"><h3>${m.name}</h3><p>${m.desc}</p></span>
        <span class="num">${c[k]}<small>${k==='buy'?'available':'posts'}</small></span>
        <span class="go" aria-hidden="true">&rsaquo;</span></a>`).join('')}
    </nav>
  </div>`;
}

/* ----- data builders ----- */
function lostFoundRows(kind){
  const posts=kind==='lost'?db.lost_post:db.found_post, head=kind==='lost'?db.lost_item:db.found_item, k=kind+'_item_id';
  return posts.map(p=>{
    const h=head.find(x=>x[k]===p[k]), it=db.item.find(x=>x.item_id===p.item_id), st=db.student.find(s=>s.student_id===(h&&h.student_id));
    return {p,h,it,st,date:p[kind+'_date'],time:p[kind+'_time'],loc:p[kind+'_location']};
  }).filter(r=>r.it).sort((a,b)=>(b.date+(b.time||'')).localeCompare(a.date+(a.time||'')));
}
function productRows(onlyAvailable){
  return db.product_posts.map(p=>{
    const pr=db.products.find(x=>x.product_id===p.product_id);
    return {p,pr,seller:byPhone(p.contact_info)};
  }).filter(r=>r.pr&&(!onlyAvailable||r.pr.status==='available')).sort((a,b)=>b.p.post_date.localeCompare(a.p.post_date));
}

function cardLF(kind,r){
  const m=MODS[kind], u=me(), mine=r.st&&u&&r.st.student_id===u.student_id;
  const contact=r.st?(r.p.contact_preference==='Email'?r.st.email:r.st.phone):'';
  return `<article class="card ${m.c}">
    ${media(r.it.item_name,r.p.image_url)}
    <div class="cbody">
      <div class="pills"><span class="pill cat">${esc(r.it.category)}</span><span class="pill ${pillCls(r.p.post_status)}">${esc(r.p.post_status)}</span>${mine?'<span class="pill mine">Your post</span>':''}</div>
      <h3>${esc(r.it.item_name)}</h3>
      <p class="desc">${esc(r.p.description||r.it.description)}</p>
      <dl class="meta">
        <dt>Brand</dt><dd>${esc(r.it.brand||'-')}</dd>
        <dt>Colour</dt><dd>${esc(r.it.color||'-')}</dd>
        <dt>Mark</dt><dd>${esc(r.it.identification_mark||'-')}</dd>
        <dt>${kind==='lost'?'Lost at':'Found at'}</dt><dd>${esc(r.loc)}</dd>
        <dt>When</dt><dd>${fmtD(r.date)}${r.time?`, ${fmtT(r.time)}`:''}</dd>
        <dt>Posted by</dt><dd>${r.st?`${esc(r.st.student_name)} &middot; ${esc(r.st.class_name||'')}`:'-'}</dd>
        <dt>Contact</dt><dd>${esc(r.p.contact_preference||'-')}${contact?`: ${esc(contact)}`:''}</dd>
      </dl>
    </div></article>`;
}
function cardProduct(kind,r){
  const m=MODS[kind], u=me(), mine=r.seller&&u&&r.seller.student_id===u.student_id;
  return `<article class="card ${m.c}">
    ${media(r.pr.product_name,r.p.image_url)}
    <div class="cbody">
      <div class="pills"><span class="pill cat">${esc(r.pr.category)}</span>${r.p.condition?`<span class="pill">${esc(r.p.condition)}</span>`:''}<span class="pill ${pillCls(r.pr.status)}">${esc(r.pr.status)}</span>${mine?'<span class="pill mine">Your listing</span>':''}</div>
      <h3>${esc(r.pr.product_name)}</h3>
      <div class="price">${money(r.pr.cost)}</div>
      <p class="desc">${esc(r.p.description||'')}</p>
      <dl class="meta">
        <dt>Seller</dt><dd>${r.seller?`${esc(r.seller.student_name)} &middot; ${esc(r.seller.class_name||'')}`:'-'}</dd>
        <dt>Contact</dt><dd>${esc(r.p.contact_info||'-')}</dd>
        <dt>Posted</dt><dd>${fmtDT(r.p.post_date)}</dd>
      </dl>
    </div>
    ${kind==='buy'?`<div class="cfoot"><button class="btn block" type="button" data-act="buy" data-id="${r.pr.product_id}" ${mine?'disabled':''}>${mine?'This is your listing':'Buy for '+money(r.pr.cost)}</button></div>`:''}
  </article>`;
}

let filt={q:''};
function viewList(kind){
  const m=MODS[kind];
  filt={q:''};
  const body=listBody(kind);
  return `<div class="wrap ${m.c}">
    <div class="phead">
      <a class="back" href="#dashboard">&larr; Dashboard</a>
      <h1 class="ptitle"><span>${m.name}</span></h1>
      <p>${m.desc}</p>
    </div>
    <div class="toolbar">
      <label class="sr" for="f-q">Search</label>
      <input id="f-q" type="search" placeholder="Search ${m.name.toLowerCase()}s" data-kind="${kind}">
    </div>
    <div id="list-area">${body.html}</div>
    ${kind==='buy'?txnSection():''}
  </div>`;
}
function listBody(kind){
  const q=filt.q.trim().toLowerCase();
  let rows,getCat,getText,card;
  if(kind==='lost'||kind==='found'){
    rows=lostFoundRows(kind);
    getCat=r=>r.it.category; getText=r=>[r.it.item_name,r.it.brand,r.it.color,r.it.identification_mark,r.p.description,r.loc,r.st&&r.st.student_name].join(' ');
    card=r=>cardLF(kind,r);
  }else{
    rows=productRows(kind==='buy');
    getCat=r=>r.pr.category; getText=r=>[r.pr.product_name,r.pr.category,r.p.description,r.seller&&r.seller.student_name].join(' ');
    card=r=>cardProduct(kind,r);
  }
  const shown=rows.filter(r=>!q||getText(r).toLowerCase().includes(q));
  const html=shown.length?`<div class="grid">${shown.map(card).join('')}</div>`:`<div class="empty">Nothing matches your search.</div>`;
  return {html};
}
function txnSection(){
  const u=me();
  const rows=db.transactions.filter(t=>t.buyer_id===u.student_id||t.seller_id===u.student_id).sort((a,b)=>b.created_at.localeCompare(a.created_at));
  const nm=id=>{const s=db.student.find(x=>x.student_id===id);return s?s.student_name:'-'};
  return `<h2 class="h2">My transactions</h2>
  ${rows.length?`<div class="tablewrap"><table><thead><tr><th>ID</th><th>Product</th><th>Buyer</th><th>Seller</th><th>Amount</th><th>Payment</th><th>Reference</th><th>Status</th><th>Date</th></tr></thead><tbody>
    ${rows.map(t=>{
      const tp=db.transaction_products.filter(x=>x.transaction_id===t.transaction_id).map(x=>{const p=db.products.find(y=>y.product_id===x.product_id);return p?p.product_name:''}).join(', ');
      const pay=db.payments.find(x=>x.transaction_id===t.transaction_id);
      return `<tr><td>#${t.transaction_id}</td><td>${esc(tp)}</td><td>${esc(nm(t.buyer_id))}${t.buyer_id===u.student_id?' (you)':''}</td><td>${esc(nm(t.seller_id))}${t.seller_id===u.student_id?' (you)':''}</td><td>${money(t.total_amount)}</td><td>${pay?esc(PAY[pay.payment_method][0]):'-'}</td><td>${pay?esc(pay.gateway_reference_id):'-'}</td><td><span class="pill ${t.status==='COMPLETED'?'ok':'warn'}">${esc(t.status)}</span></td><td>${fmtDT(t.created_at)}</td></tr>`;
    }).join('')}
  </tbody></table></div>`:`<div class="empty">No transactions yet. Buy or sell an item and it shows up here.</div>`}`;
}

/* ============ MODALS ============ */
function openModal(html){
  closeModal();
  const d=document.createElement('div');
  d.className='overlay'; d.id='ov';
  d.innerHTML=`<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  d.addEventListener('mousedown',e=>{if(e.target===d)closeModal()});
  $('#layer').appendChild(d);
  const f=d.querySelector('input,select'); if(f) f.focus();
}
function closeModal(){const o=$('#ov'); if(o)o.remove()}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
let toastT;
function toast(msg){
  const old=$('.toast'); if(old)old.remove(); clearTimeout(toastT);
  const t=document.createElement('div'); t.className='toast'; t.setAttribute('role','status'); t.textContent=msg;
  document.body.appendChild(t); toastT=setTimeout(()=>t.remove(),3400);
}

/* ----- Post Item ----- */
function openPost(kind){
  if(!['found','lost','sell'].includes(kind)) return;
  location.hash='post-'+kind;   /* opens the Post page */
}
function viewPost(kind){
  if(!MODS[kind]||kind==='buy'){location.hash='dashboard';return ''}
  const m=MODS[kind];
  const title={found:'Post a found item',lost:'Post a lost item',sell:'Post an item for sale'}[kind];
  const sub={found:'Fill in the details of the item you found so its owner can recognise it.',
             lost:'Describe the item you lost and where you last had it.',
             sell:'List a book or gadget for other students to buy.'}[kind];
  return `<div class="wrap ${m.c}">
    <div class="phead">
      <a class="back" href="#${kind}">&larr; ${m.name}</a>
      <h1 class="ptitle">${title}</h1>
      <p>${sub}</p>
    </div>
    <div class="postsheet">${kind==='sell'?sellForm():lfForm(kind)}</div>
  </div>`;
}
const CATS=['Electronics','Personal Item','Stationery','Bags','Study Material','College Document'];
function lfForm(kind){
  const w=kind==='lost'?'Lost':'Found', lw=w.toLowerCase();
  return `<form data-form="post-${kind}" novalidate><div class="fields">
    <div class="group">Item details</div>
    <div class="field"><label for="p-name">Item name <i>*</i></label><input id="p-name" name="item_name" maxlength="100" placeholder="e.g. Laptop" required></div>
    <div class="field"><label for="p-cat">Category <i>*</i></label><input id="p-cat" name="category" maxlength="50" list="cats" placeholder="e.g. Electronics" required><datalist id="cats">${CATS.map(c=>`<option value="${c}">`).join('')}</datalist></div>
    <div class="field"><label for="p-brand">Brand</label><input id="p-brand" name="brand" maxlength="50"></div>
    <div class="field"><label for="p-color">Colour</label><input id="p-color" name="color" maxlength="30"></div>
    <div class="field full"><label for="p-idm">Identification mark</label><input id="p-idm" name="identification_mark" maxlength="150" placeholder="e.g. Small sticker near keyboard"></div>
    <div class="field full"><label for="p-idesc">Item description</label><input id="p-idesc" name="item_description" placeholder="e.g. Dell laptop"></div>
    <div class="group">${w} post</div>
    <div class="field"><label for="p-date">${w} date <i>*</i></label><input id="p-date" name="date" type="date" max="${todayISO()}" value="${todayISO()}" required></div>
    <div class="field"><label for="p-time">${w} time</label><input id="p-time" name="time" type="time"></div>
    <div class="field full"><label for="p-loc">${w} location <i>*</i></label><input id="p-loc" name="location" maxlength="150" placeholder="e.g. College Library" required></div>
    <div class="field full"><label for="p-desc">Description</label><textarea id="p-desc" name="description" placeholder="e.g. Samsung phone ${lw} in library"></textarea></div>
    <div class="field"><label for="p-contact">Contact preference</label><select id="p-contact" name="contact_preference"><option>Email</option><option>Phone</option></select></div>
    <div class="field"><label for="p-img">Image</label><input id="p-img" name="image" type="file" accept="image/*"></div>
  </div>
  <div id="post-err"></div>
  <div class="form-actions"><a class="btn ghost" href="#${kind}">Cancel</a><button class="btn" type="submit">Post ${lw} item</button></div></form>`;
}
function sellForm(){
  const u=me();
  return `<form data-form="post-sell" novalidate><div class="fields">
    <div class="group">Product</div>
    <div class="field full"><label for="p-name">Product name <i>*</i></label><input id="p-name" name="product_name" maxlength="100" placeholder="e.g. Python Programming Book" required></div>
    <div class="field"><label for="p-cat">Category <i>*</i></label><select id="p-cat" name="category"><option>Books</option><option>Gadgets</option></select></div>
    <div class="field"><label for="p-cost">Cost (₹) <i>*</i></label><input id="p-cost" name="cost" type="number" min="1" step="0.01" inputmode="decimal" required></div>
    <div class="group">Post</div>
    <div class="field full"><label for="p-desc">Description</label><textarea id="p-desc" name="description" placeholder="e.g. Java book, latest edition"></textarea></div>
    <div class="field"><label for="p-cond">Condition</label><select id="p-cond" name="condition"><option>Like New</option><option selected>Good</option><option>Fair</option></select></div>
    <div class="field"><label for="p-img">Image</label><input id="p-img" name="image" type="file" accept="image/*"></div>
    <div class="field full"><label for="p-ci">Contact info</label><input id="p-ci" name="contact_info" value="${esc(u.phone||'')}" readonly><small>Your registered phone number.</small></div>
  </div>
  <div id="post-err"></div>
  <div class="form-actions"><a class="btn ghost" href="#sell">Cancel</a><button class="btn" type="submit">Post for sale</button></div></form>`;
}
function readImage(file){
  return new Promise(res=>{
    if(!file||!file.size||file.size>1500000) return res('');
    const fr=new FileReader(); fr.onload=()=>res(String(fr.result)); fr.onerror=()=>res(''); fr.readAsDataURL(file);
  });
}
async function submitPost(form,kind){
  const f=new FormData(form), u=me(), v=n=>String(f.get(n)||'').trim();
  const err=$('#post-err'); const fail=m=>{err.innerHTML=`<div class="err">${esc(m)}</div>`};
  const file=f.get('image'); const img=await readImage(file);
  const note=(file&&file.size&&!img)?' (image skipped, it was over 1.5 MB)':'';
  if(kind==='sell'){
    const cost=parseFloat(v('cost'));
    if(!v('product_name')) return fail('Enter the product name.');
    if(!(cost>0)) return fail('Enter a cost greater than 0.');
    const pid=nextId(db.products,'product_id'), post=nextId(db.product_posts,'post_id');
    db.products.push({product_id:pid,product_name:v('product_name'),category:v('category'),cost:cost,status:'available'});
    db.product_posts.push({post_id:post,product_id:pid,description:v('description'),condition:v('condition'),image_url:img,contact_info:u.phone,post_date:nowTS()});
    saveDb(); closeModal(); toast('Your item is now listed for sale'+note);
    if(route()==='sell'||route()==='buy') render(); else location.hash='sell';
    return;
  }
  if(!v('item_name')) return fail('Enter the item name.');
  if(!v('category')) return fail('Enter a category.');
  if(!v('date')) return fail('Choose a date.');
  if(!v('location')) return fail('Enter the location.');
  const iid=nextId(db.item,'item_id',100);
  db.item.push({item_id:iid,item_name:v('item_name'),category:v('category'),description:v('item_description'),color:v('color'),brand:v('brand'),identification_mark:v('identification_mark'),image_url:img});
  if(kind==='lost'){
    const id=nextId(db.lost_item,'lost_item_id',200);
    db.lost_item.push({lost_item_id:id,student_id:u.student_id,status:'Lost',reported_date:todayISO()});
    db.lost_post.push({lost_item_id:id,item_id:iid,lost_date:v('date'),lost_time:v('time'),lost_location:v('location'),description:v('description'),image_url:img,contact_preference:v('contact_preference'),post_status:'Active'});
  }else{
    const id=nextId(db.found_item,'found_item_id',300);
    db.found_item.push({found_item_id:id,student_id:u.student_id,status:'Found',reported_date:todayISO()});
    db.found_post.push({found_item_id:id,item_id:iid,found_date:v('date'),found_time:v('time'),found_location:v('location'),description:v('description'),image_url:img,contact_preference:v('contact_preference'),post_status:'Active'});
  }
  saveDb(); closeModal(); toast(`Your ${kind} item is posted`+note);
  if(route()===kind) render(); else location.hash=kind;
}

/* ----- Buy ----- */
function openBuy(pid){
  const r=productRows(true).find(x=>x.pr.product_id===pid); if(!r) return;
  openModal(`<h2>Buy ${esc(r.pr.product_name)}</h2>
    <div class="sum"><span>Seller: ${r.seller?esc(r.seller.student_name):'-'}</span><span>${money(r.pr.cost)}</span></div>
    <p class="hint" style="margin-top:16px;margin-bottom:0">Confirm this purchase to mark the item as sold.</p>
    <div class="form-actions"><button class="btn ghost" type="button" data-act="close">Cancel</button><button class="btn" type="button" data-act="buy-confirm" data-id="${pid}">Confirm Buy</button></div>`);
}
function confirmBuy(pid){
  const u=me(), r=productRows(true).find(x=>x.pr.product_id===pid);
  if(!r||!r.seller){closeModal();toast('This item can no longer be bought');return}
  const tid=nextId(db.transactions,'transaction_id');
  const ts=nowTS();
  db.transactions.push({transaction_id:tid,buyer_id:u.student_id,seller_id:r.seller.student_id,total_amount:r.pr.cost,status:'COMPLETED',created_at:ts});
  db.transaction_products.push({transaction_id:tid,product_id:pid,cost:r.pr.cost});
  r.pr.status='sold';
  saveDb(); closeModal(); toast('Purchase recorded. '+r.pr.product_name+' is marked as sold.'); render();
}

/* ============ EVENTS ============ */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]'); if(!a) return;
  const act=a.dataset.act;
  if(act==='post') openPost(route());
  else if(act==='login-tab'){authTab='login';if(location.hash==='#auth')render()}
  else if(act==='close') closeModal();
  else if(act==='logout'){userId=null;lsDel(SKEY);if(location.hash==='#home')render();else location.hash='home'}
  else if(act==='tab'){authTab=a.dataset.tab;render()}
  else if(act==='buy') openBuy(+a.dataset.id);
  else if(act==='buy-confirm') confirmBuy(+a.dataset.id);
});
document.addEventListener('submit',e=>{
  const form=e.target.closest('form[data-form]'); if(!form) return;
  e.preventDefault();
  const t=form.dataset.form, f=new FormData(form), v=n=>String(f.get(n)||'').trim();
  if(t==='login'){
    const s=db.student.find(x=>x.username===v('username')&&x.password===String(f.get('password')||''));
    if(!s){$('#auth-err').innerHTML='<div class="err">Wrong username or password. Check both and try again.</div>';return}
    userId=s.student_id; lsSet(SKEY,String(userId)); location.hash='dashboard'; render();
  }else if(t==='register'){
    const err=m=>{$('#auth-err').innerHTML=`<div class="err">${esc(m)}</div>`};
    if(!v('student_name')||!v('email')||!v('phone')||!v('username')||!String(f.get('password')||'')) return err('Fill in name, email, phone, username and password.');
    if(!/^\S+@\S+\.\S+$/.test(v('email'))) return err('Enter a valid email address.');
    if(db.student.some(x=>x.username.toLowerCase()===v('username').toLowerCase())) return err('That username is taken. Choose another.');
    if(db.student.some(x=>x.email.toLowerCase()===v('email').toLowerCase())) return err('That email is already registered. Log in instead.');
    if(db.student.some(x=>x.phone===v('phone'))) return err('That phone number is already registered. Log in instead.');
    const s={student_id:nextId(db.student,'student_id'),student_name:v('student_name'),email:v('email'),phone:v('phone'),username:v('username'),password:String(f.get('password')),department:v('department'),class_name:v('class_name')};
    db.student.push(s); saveDb(); userId=s.student_id; lsSet(SKEY,String(userId)); location.hash='dashboard'; render();
  }else if(t.startsWith('post-')){
    submitPost(form,t.slice(5));
  }
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='f-q'){
    filt.q=t.value;
    $('#list-area').innerHTML=listBody(t.dataset.kind).html;
  }
});

render();
