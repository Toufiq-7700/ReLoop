// ReLoop — Main Application
const API_BASE = window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1'?'http://localhost:3000':'';
let currentPage='home', uploadedImage=null, lastAnalysis=null;
const userListings=JSON.parse(localStorage.getItem('reloop_listings')||'[]');
const collectionReqs=JSON.parse(localStorage.getItem('reloop_collections')||'[]');

function saveState(){localStorage.setItem('reloop_listings',JSON.stringify(userListings));localStorage.setItem('reloop_collections',JSON.stringify(collectionReqs));}

// Toast
function showToast(msg,type='info'){const c=document.getElementById('toastContainer');const t=document.createElement('div');t.className='toast '+type;t.innerHTML=(type==='success'?'✅':type==='error'?'❌':'ℹ️')+' '+msg;c.appendChild(t);setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),300);},3000);}

// Navigation
function navigateHome() {
  navigateTo('home');
}

function navigateTo(page, event) {
  if (event) event.preventDefault();
  
  // Close dropdown if open
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.remove('open');

  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) { el.classList.add('active'); currentPage = page; }
  const nav = document.querySelector(`[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  const mc = document.getElementById('mainContent');
  if (page === 'home') mc.classList.add('landing'); else mc.classList.remove('landing');
  window.scrollTo(0, 0);
  if (page === 'marketplace') renderMarketplace();
  if (page === 'materials') renderMaterials();
  if (page === 'makers') renderMakers();
  if (page === 'recyclers') renderRecyclers();
  if (page === 'mylistings') renderMyListings();
  if (page === 'dashboard') renderDashboard();
  if (page === 'profile') renderProfile();
  if (page === 'activity') renderActivity();
}

// Impact stats
function renderImpact(){
  const g=document.getElementById('impactGrid');
  const s=IMPACT_STATS;
  g.innerHTML=`
    <div class="impact-card"><div class="impact-num">${s.itemsDiverted.toLocaleString()}</div><div class="impact-label">Items Diverted from Waste</div></div>
    <div class="impact-card"><div class="impact-num">${s.materialsRecovered} kg</div><div class="impact-label">Materials Recovered</div></div>
    <div class="impact-card"><div class="impact-num">${s.communityListings}</div><div class="impact-label">Community Listings</div></div>
    <div class="impact-card"><div class="impact-num">${s.localMakers}</div><div class="impact-label">Local Makers</div></div>`;
}

// Demo presets
function renderDemoPresets(){
  const g=document.getElementById('demoPresetsGrid');
  g.innerHTML=DEMO_ITEMS.map(d=>`<button class="demo-preset-btn" onclick="loadDemo('${d.id}')"><span class="emoji">${d.emoji}</span>${d.label}</button>`).join('');
}

function loadDemo(id){
  const d=DEMO_ITEMS.find(x=>x.id===id);if(!d)return;
  document.getElementById('itemDescription').value=d.description;
  showToast('Demo item loaded: '+d.label,'success');
}

// Upload handling
const uploadZone=document.getElementById('uploadZone');
const imageInput=document.getElementById('imageInput');
uploadZone.addEventListener('click',()=>imageInput.click());
uploadZone.addEventListener('keydown',e=>{if(e.key==='Enter')imageInput.click();});
uploadZone.addEventListener('dragover',e=>{e.preventDefault();uploadZone.classList.add('dragover');});
uploadZone.addEventListener('dragleave',()=>uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop',e=>{e.preventDefault();uploadZone.classList.remove('dragover');if(e.dataTransfer.files[0])handleImage(e.dataTransfer.files[0]);});
imageInput.addEventListener('change',e=>{if(e.target.files[0])handleImage(e.target.files[0]);});

function handleImage(file){
  if(!file.type.startsWith('image/')){showToast('Please upload an image file.','error');return;}
  if(file.size>5*1024*1024){showToast('Image too large. Max 5MB.','error');return;}
  const reader=new FileReader();
  reader.onload=e=>{
    uploadedImage=e.target.result;
    const prev=document.getElementById('imagePreview');
    prev.src=uploadedImage;prev.style.display='block';
    showToast('Image loaded!','success');
  };
  reader.readAsDataURL(file);
}

function clearAnalysis(){
  document.getElementById('itemDescription').value='';
  uploadedImage=null;
  document.getElementById('imagePreview').style.display='none';
  document.getElementById('analyzeResult').style.display='none';
  document.getElementById('analyzeInput').style.display='block';
  document.getElementById('analyzeLoading').style.display='none';
}

// Analyze item
async function analyzeItem(){
  const desc=document.getElementById('itemDescription').value.trim();
  if(!desc&&!uploadedImage){showToast('Please describe your item or upload an image.','error');return;}
  const description=desc||'[Image uploaded — please analyze based on typical items]';
  document.getElementById('analyzeInput').style.display='none';
  document.getElementById('analyzeLoading').style.display='flex';
  document.getElementById('analyzeResult').style.display='none';
  try{
    const res=await fetch(API_BASE+'/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({description,hasImage:!!uploadedImage})});
    if(!res.ok)throw new Error('API error: '+res.status);
    const data=await res.json();
    if(data.analysis){lastAnalysis=data.analysis;renderResult(data.analysis,data.warning);}
    else throw new Error('No analysis returned');
  }catch(err){
    console.error(err);
    // Fallback demo analysis
    lastAnalysis=generateFallback(description);
    renderResult(lastAnalysis,'Using offline demo analysis — connect to the API for full Gemini analysis.');
  }
  document.getElementById('analyzeLoading').style.display='none';
  document.getElementById('analyzeResult').style.display='block';
}

function generateFallback(desc){
  const dl=desc.toLowerCase();
  let item='Item',mat='Mixed',cat='Other',cond='Used',act='Recycle',alts=['Donate','Reuse'],ideas=['Creative reuse project','Donate to community','Check local recycler'];
  if(dl.includes('plastic')||dl.includes('bottle')){item='Plastic Bottles';mat='PET Plastic';cat='Plastic';act='Recycle';alts=['Upcycle','Collect'];ideas=['Make planters','Craft art projects','Send to PET recycler'];}
  else if(dl.includes('chair')||dl.includes('furniture')||dl.includes('wood')){item='Wooden Furniture';mat='Wood';cat='Furniture';cond='Fair';act='Sell';alts=['Donate','Upcycle'];ideas=['Restore and repaint','Convert to shelf','Sand and refinish'];}
  else if(dl.includes('cloth')||dl.includes('shirt')||dl.includes('jean')||dl.includes('denim')){item='Used Clothing';mat='Mixed Fabric';cat='Clothing';act='Donate';alts=['Upcycle','Sell'];ideas=['Make tote bags','Create patchwork quilts','Donate to shelter'];}
  else if(dl.includes('laptop')||dl.includes('phone')||dl.includes('electronic')){item='Old Electronics';mat='Mixed (Metal, Plastic, PCB)';cat='Electronics';cond='Broken';act='Recycle';alts=['Sell for Parts','Collect'];ideas=['Recover components','Responsible e-waste disposal','Sell working parts'];}
  else if(dl.includes('cardboard')||dl.includes('paper')||dl.includes('box')){item='Cardboard Boxes';mat='Cardboard';cat='Paper';act='Recycle';alts=['Reuse','Collect'];ideas=['Use for storage/moving','Compost','Send to paper recycler'];}
  else if(dl.includes('metal')||dl.includes('aluminum')||dl.includes('iron')){item='Scrap Metal';mat='Metal';cat='Metal';act='Recycle';alts=['Sell','Collect'];ideas=['Sell to scrap dealer','Art/sculpture project','Industrial recycling'];}
  else if(dl.includes('glass')||dl.includes('jar')){item='Glass Containers';mat='Glass';cat='Glass';act='Reuse';alts=['Recycle','Upcycle'];ideas=['Storage jars','Candle holders','Vases'];}
  return{itemName:item,category:cat,material:mat,condition:cond,reusability:'Medium',recommendedAction:act,alternativeActions:alts,reason:'This item appears to be reusable or recyclable. Consider the recommended action or check with local services for the best option.',upcyclingIdeas:ideas,listingTitle:item+' — Available',listingDescription:item+' in '+cond.toLowerCase()+' condition. Available for '+act.toLowerCase()+' or other reuse.',tags:[cat.toLowerCase(),mat.toLowerCase(),'reuse'],hazardous:false,hazardNote:''};
}

function renderResult(a,warning){
  const matches=getMatches(a);
  const r=document.getElementById('analyzeResult');
  r.innerHTML=`
    <button class="btn btn-ghost btn-sm" onclick="clearAnalysis()" style="margin-bottom:1rem;">← Analyze Another Item</button>
    ${warning?'<div class="hazard-warning" style="background:#fefce8;border-color:#fde68a;color:#92400e;">⚠️ <span>'+warning+'</span></div>':''}
    ${a.hazardous?'<div class="hazard-warning">⚠️ <span><strong>Safety Notice:</strong> '+(a.hazardNote||'This item may contain hazardous materials. Please consult local authorities for safe disposal.')+'</span></div>':''}
    <div class="card" style="margin-bottom:2rem;">
      <div class="result-header">
        <div><div class="result-item-name">${a.itemName||'Item'}</div><div style="margin-top:.5rem;">${a.tags?a.tags.map(t=>'<span class="badge badge-primary">'+t+'</span>').join(' '):''}</div></div>
        <span class="badge badge-accent">🤖 AI Analysis</span>
      </div>
      <div class="result-grid">
        <div class="result-meta"><div class="result-meta-label">Category</div><div class="result-meta-value">${a.category||'—'}</div></div>
        <div class="result-meta"><div class="result-meta-label">Material</div><div class="result-meta-value">${a.material||'—'}</div></div>
        <div class="result-meta"><div class="result-meta-label">Condition</div><div class="result-meta-value">${a.condition||'—'}</div></div>
        <div class="result-meta"><div class="result-meta-label">Reusability</div><div class="result-meta-value">${a.reusability||'—'}</div></div>
      </div>
      <div class="result-section"><h3>💡 Why?</h3><div class="result-reason">${a.reason||'This item may still have value.'}</div></div>
    </div>
    <div class="result-section"><h3>🎯 What can you do?</h3>
      <div class="result-actions-grid">
        <button class="result-action-btn ${a.recommendedAction==='Sell'?'recommended':''}" onclick="actionSell()">💰 Sell It</button>
        <button class="result-action-btn ${a.recommendedAction==='Donate'?'recommended':''}" onclick="actionDonate()">🎁 Donate It</button>
        <button class="result-action-btn ${a.recommendedAction==='Recycle'||a.recommendedAction==='Collect'?'recommended':''}" onclick="actionFindRecycler()">♻️ Find Recycler</button>
        <button class="result-action-btn ${a.recommendedAction==='Upcycle'?'recommended':''}" onclick="actionFindMaker()">🎨 Find a Maker</button>
        <button class="result-action-btn" onclick="openCollectionModal()">🚛 Request Collection</button>
      </div>
    </div>
    ${a.upcyclingIdeas&&a.upcyclingIdeas.length?'<div class="result-section" style="margin-top:2rem;"><h3>✨ Upcycling Ideas</h3><ul class="upcycle-ideas">'+a.upcyclingIdeas.map(i=>'<li>'+i+'</li>').join('')+'</ul></div>':''}
    <div class="result-section" style="margin-top:2rem;"><h3><span class="ai-badge">AI Match</span> Possible Matches</h3>
      ${matches.map(m=>`<div class="match-card"><div class="match-avatar">${m.emoji}</div><div class="match-info"><div class="match-name">${m.name} <span class="badge badge-role">${m.role}</span></div><div class="match-reason">${m.reason}</div></div></div>`).join('')}
    </div>
    <div style="margin-top:2rem;display:flex;gap:1rem;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="openCreateListingModal()">📝 Create Listing with AI</button>
      <button class="btn btn-secondary" onclick="clearAnalysis()">Analyze Another</button>
    </div>`;
}

function getMatches(a){
  const matches=[];const mat=(a.material||'').toLowerCase();const cat=(a.category||'').toLowerCase();
  for(const m of MOCK_MAKERS){if(m.materials.some(x=>mat.includes(x.toLowerCase())||x.toLowerCase().includes(cat))){matches.push({name:m.name,role:'Maker',emoji:m.emoji,reason:'Works with '+m.materials.join(', ')+'.'});if(matches.length>=2)break;}}
  for(const r of MOCK_RECYCLERS){if(r.materials.some(x=>mat.includes(x.toLowerCase())||x.toLowerCase().includes(cat))){matches.push({name:r.name,role:'Recycler',emoji:r.emoji,reason:'Accepts '+r.materials.join(', ')+' in '+r.area+'.'});if(matches.length>=4)break;}}
  for(const m of MOCK_MATERIALS){if(mat.includes(m.seeking.toLowerCase())||m.seeking.toLowerCase().includes(cat)){matches.push({name:m.company,role:'Industry',emoji:m.emoji,reason:'Looking for '+m.seeking+' ('+m.quantity+').'});if(matches.length>=5)break;}}
  if(!matches.length){matches.push({name:'GreenCycle BD',role:'Recycler',emoji:'♻️',reason:'General recycler accepting various materials.'},{name:'EcoCraft Studio',role:'Maker',emoji:'🎨',reason:'May be interested in creative reuse of this material.'});}
  return matches;
}

function actionSell(){openCreateListingModal();}
function actionDonate(){openCreateListingModal('donate');}
function actionFindRecycler(){navigateTo('recyclers');}
function actionFindMaker(){navigateTo('makers');}

// Marketplace
let activeFilter='All';
function renderMarketplace(){
  const tabs=['All','Reusable Items','Recyclable Materials','Handmade','Free / Donate'];
  const chips=['Plastic','Metal','Wood','Paper','Electronics','Clothes','Furniture','Handmade'];
  document.getElementById('filterTabs').innerHTML=
    tabs.map(t=>`<button class="filter-tab ${activeFilter===t?'active':''}" onclick="setFilter('${t}')">${t}</button>`).join('')+
    chips.map(c=>`<button class="filter-tab" onclick="searchChip('${c}')">${c}</button>`).join('');
  let items=[...MOCK_LISTINGS,...userListings];
  const q=(document.getElementById('marketplaceSearch')?.value||'').toLowerCase();
  if(q)items=items.filter(i=>(i.title+i.category+i.material+i.description).toLowerCase().includes(q));
  if(activeFilter==='Reusable Items')items=items.filter(i=>i.tag==='reusable');
  else if(activeFilter==='Recyclable Materials')items=items.filter(i=>i.tag==='recyclable');
  else if(activeFilter==='Handmade')items=items.filter(i=>i.tag==='handmade');
  else if(activeFilter==='Free / Donate')items=items.filter(i=>i.price===0||i.tag==='donate');
  document.getElementById('listingsGrid').innerHTML=items.length?items.map(i=>`
    <div class="listing-card" onclick="openListingModal(${i.id})">
      <div class="listing-img"><span class="listing-tag badge badge-primary">${i.tag||i.category}</span>${i.emoji||'📦'}</div>
      <div class="listing-body">
        <div class="listing-title">${i.title}</div>
        <div class="listing-meta"><span>📍 ${i.location}</span><span>📂 ${i.category}</span><span>🔧 ${i.condition}</span></div>
        <div class="listing-footer">
          <span class="listing-price ${i.price===0?'free':''}">${i.price===0?'Free':i.currency+' '+i.price.toLocaleString()}</span>
          <span class="badge badge-role">${i.sellerRole}</span>
        </div>
      </div>
    </div>`).join(''):'<div class="empty-state"><div class="empty-state-icon">🛒</div><h3>No listings found</h3><p>Try a different search or filter.</p></div>';
}
function setFilter(f){activeFilter=f;renderMarketplace();}
function filterMarketplace(){renderMarketplace();}
function searchChip(c){document.getElementById('marketplaceSearch').value=c;renderMarketplace();}

// Materials
function renderMaterials(){
  document.getElementById('materialsGrid').innerHTML=MOCK_MATERIALS.map(m=>`
    <div class="card entity-card">
      <div class="entity-header"><div class="entity-icon">${m.emoji}</div><div><div class="entity-name">${m.company}</div><div class="entity-sub">${m.location}</div></div></div>
      <div class="entity-details">${m.description}</div>
      <div class="entity-stat">🔍 Looking for: <strong>${m.seeking}</strong></div>
      <div class="entity-stat">📦 Required: ${m.quantity}</div>
      <div class="entity-stat">📊 Status: <span class="badge ${m.status==='Actively Sourcing'?'badge-primary':'badge-warning'}">${m.status}</span></div>
      <button class="btn btn-primary btn-sm" style="margin-top:1rem;width:100%;" onclick="showToast('Demo: Material offer submitted to ${m.company}','success')">Offer Material</button>
    </div>`).join('');
}

// Makers
function renderMakers(){
  document.getElementById('makersGrid').innerHTML=MOCK_MAKERS.map(m=>`
    <div class="card entity-card">
      <div class="entity-header"><div class="entity-icon">${m.emoji}</div><div><div class="entity-name">${m.name}</div><div class="entity-sub">${m.specialty}</div></div></div>
      <div class="entity-details">${m.description}</div>
      <div class="entity-tags">${m.materials.map(x=>'<span class="badge badge-primary">'+x+'</span>').join('')}</div>
      <div class="entity-stat">📍 ${m.location}</div>
      <div class="entity-stat">⭐ ${m.rating} · ${m.itemsSold} items sold</div>
      <div class="entity-stat">🛍️ Products: ${m.products.join(', ')}</div>
      <button class="btn btn-secondary btn-sm" style="margin-top:1rem;width:100%;" onclick="showToast('Demo: Viewing ${m.name} profile','info')">View Maker</button>
    </div>`).join('');
}

// Recyclers
function renderRecyclers(){
  document.getElementById('recyclersGrid').innerHTML=MOCK_RECYCLERS.map(r=>`
    <div class="card entity-card">
      <div class="entity-header"><div class="entity-icon">${r.emoji}</div><div><div class="entity-name">${r.name} ${r.certified?'<span class="badge badge-primary">✓ Certified</span>':''}</div><div class="entity-sub">${r.area}</div></div></div>
      <div class="entity-details">${r.description}</div>
      <div class="entity-tags">${r.materials.map(x=>'<span class="badge badge-primary">'+x+'</span>').join('')}</div>
      <div class="entity-stat">📦 Min: ${r.minQuantity}</div>
      <div class="entity-stat">🚛 Collection: ${r.collection?'Available':'Drop-off only'}</div>
      <div class="entity-stat">⭐ ${r.rating}</div>
      <button class="btn btn-primary btn-sm" style="margin-top:1rem;width:100%;" onclick="openCollectionModal('${r.name}')">Request Collection</button>
    </div>`).join('');
}

// My Listings
function renderMyListings(){
  const c=document.getElementById('myListingsContent');
  if(!userListings.length){c.innerHTML='<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No listings yet</h3><p>Turn your unused items into value.</p><button class="btn btn-primary" onclick="navigateTo(\'analyze\')">Analyze an Item</button></div>';return;}
  c.innerHTML=userListings.map(l=>`
    <div class="my-listing-item"><span class="emoji">${l.emoji||'📦'}</span><div class="my-listing-info"><h4>${l.title}</h4><small>${l.category} · ${l.condition} · ${l.price===0?'Free':l.currency+' '+l.price}</small></div>
    <button class="btn btn-ghost btn-sm" onclick="removeMyListing(${l.id})">🗑️</button></div>`).join('');
}
function removeMyListing(id){const i=userListings.findIndex(x=>x.id===id);if(i>-1){userListings.splice(i,1);saveState();renderMyListings();showToast('Listing removed','info');}}

// Modal
function openModal(title,bodyHTML){
  document.getElementById('modalTitle').textContent=title;
  document.getElementById('modalBody').innerHTML=bodyHTML;
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal(e){if(!e||e.target===document.getElementById('modalOverlay'))document.getElementById('modalOverlay').classList.remove('open');}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

function openListingModal(id){
  const item=[...MOCK_LISTINGS,...userListings].find(x=>x.id===id);if(!item)return;
  openModal(item.title,`
    <div style="text-align:center;font-size:4rem;margin:1rem 0;">${item.emoji||'📦'}</div>
    <p>${item.description}</p>
    <div style="margin:1rem 0;">
      <div class="entity-stat">📂 Category: ${item.category}</div>
      <div class="entity-stat">🔧 Material: ${item.material}</div>
      <div class="entity-stat">📊 Condition: ${item.condition}</div>
      <div class="entity-stat">📍 Location: ${item.location}</div>
      <div class="entity-stat">👤 Seller: ${item.sellerName} (${item.sellerRole})</div>
      <div class="entity-stat">⏰ Listed: ${item.listedAt||'Today'}</div>
    </div>
    <div style="font-size:1.3rem;font-weight:700;color:var(--primary);margin:1rem 0;">${item.price===0?'Free':item.currency+' '+item.price.toLocaleString()}</div>
    <button class="btn btn-primary" style="width:100%;" onclick="showToast('Demo: Contact request sent to ${item.sellerName}','success');closeModal();">Contact Seller</button>`);
}

function openCollectionModal(recyclerName){
  const itemName=lastAnalysis?lastAnalysis.itemName:'Your items';
  openModal('Request Collection',`
    <div class="form-group"><label>Recycler</label><input type="text" id="colRecycler" value="${recyclerName||'GreenCycle BD'}"></div>
    <div class="form-group"><label>Item</label><input type="text" id="colItem" value="${itemName}"></div>
    <div class="form-group"><label>Approximate Quantity</label><input type="text" id="colQty" placeholder="e.g. 10 kg"></div>
    <div class="form-group"><label>Location</label><input type="text" id="colLocation" placeholder="e.g. Mirpur, Dhaka"></div>
    <div class="form-group"><label>Preferred Date</label><input type="date" id="colDate"></div>
    <button class="btn btn-primary" style="width:100%;" onclick="submitCollection()">🚛 Request Collection</button>`);
}

function submitCollection(){
  const req={id:Date.now(),recycler:document.getElementById('colRecycler').value,item:document.getElementById('colItem').value,qty:document.getElementById('colQty').value,location:document.getElementById('colLocation').value,date:document.getElementById('colDate').value,status:'Submitted'};
  collectionReqs.push(req);saveState();closeModal();showToast('Collection request submitted!','success');
}

function openCreateListingModal(type){
  const a=lastAnalysis||{};const isDonate=type==='donate';
  openModal('Create Listing with AI',`
    <p style="color:var(--text-secondary);margin-bottom:1rem;">AI-generated fields — edit before publishing.</p>
    <div class="form-group"><label>Title</label><input type="text" id="lstTitle" value="${a.listingTitle||a.itemName||''}"></div>
    <div class="form-group"><label>Description</label><textarea id="lstDesc" rows="3">${a.listingDescription||''}</textarea></div>
    <div class="form-group"><label>Category</label><input type="text" id="lstCat" value="${a.category||'Other'}"></div>
    <div class="form-group"><label>Material</label><input type="text" id="lstMat" value="${a.material||''}"></div>
    <div class="form-group"><label>Condition</label><select id="lstCond"><option ${a.condition==='New'?'selected':''}>New</option><option ${a.condition==='Good'?'selected':''}>Good</option><option ${a.condition==='Fair'?'selected':''}>Fair</option><option ${a.condition==='Poor'?'selected':''}>Poor</option><option ${a.condition==='Broken'?'selected':''}>Broken</option></select></div>
    <div class="form-group"><label>Price (৳) ${isDonate?'— Donation: Free':'— 0 for free'}</label><input type="number" id="lstPrice" value="${isDonate?0:''}" min="0"></div>
    <div class="form-group"><label>Location</label><input type="text" id="lstLoc" placeholder="e.g. Mirpur, Dhaka"></div>
    <button class="btn btn-primary" style="width:100%;" onclick="publishListing()">📋 Publish Listing</button>`);
}

function publishListing(){
  const listing={id:Date.now(),title:document.getElementById('lstTitle').value||'Untitled',description:document.getElementById('lstDesc').value,category:document.getElementById('lstCat').value||'Other',material:document.getElementById('lstMat').value||'Mixed',condition:document.getElementById('lstCond').value,price:parseInt(document.getElementById('lstPrice').value)||0,currency:'৳',location:document.getElementById('lstLoc').value||'Dhaka',sellerRole:'Individual',sellerName:'Demo User',tag:parseInt(document.getElementById('lstPrice').value)===0?'donate':'reusable',emoji:'📦',listedAt:'Just now'};
  userListings.push(listing);saveState();closeModal();showToast('Listing published!','success');
}

// Init
renderImpact();renderDemoPresets();

// Role Management
let currentRole = localStorage.getItem('reloopRole') || 'individual';

const roleDisplayNames = {
  'individual': 'Individual / User',
  'recycler': 'Recycler / Collector',
  'industry': 'Industry',
  'maker': 'Maker / Upcycler',
  'buyer': 'Buyer'
};

function openRoleSelectionModal() {
  document.getElementById('roleModalOverlay').classList.add('open');
}

function closeRoleModal(e) {
  if (!e || e.target === document.getElementById('roleModalOverlay')) {
    document.getElementById('roleModalOverlay').classList.remove('open');
  }
}

function selectRole(role) {
  currentRole = role;
  localStorage.setItem('reloopRole', role);
  localStorage.setItem('reloopLoggedIn', 'true');
  closeRoleModal();
  applyRoleUI();
  navigateTo('dashboard');
  showToast(`Logged in as ${MOCK_PROFILES[role].name}`, 'success');
}

function logout() {
  localStorage.removeItem('reloopLoggedIn');
  applyRoleUI();
  navigateHome();
  showToast('Logged out successfully', 'info');
}

function toggleProfileDropdown(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown && dropdown.classList.contains('open') && !e.target.closest('#navUserArea')) {
    dropdown.classList.remove('open');
  }
});

function applyRoleUI() {
  const isLoggedIn = localStorage.getItem('reloopLoggedIn') === 'true';
  const infoEl = document.getElementById('navUserArea');
  const btnEl = document.getElementById('nav-get-started');
  const heroActions = document.getElementById('heroActions');
  
  if (isLoggedIn) {
    if (infoEl) infoEl.style.display = 'block';
    if (btnEl) btnEl.style.display = 'none';
    if (heroActions) heroActions.innerHTML = `<button class="btn btn-primary btn-lg" onclick="navigateTo('dashboard')">Continue to Dashboard →</button>`;
    
    // Update profile dropdown and avatar
    const profile = MOCK_PROFILES[currentRole];
    if (profile) {
      document.getElementById('navAvatarInitials').textContent = profile.initials;
      document.getElementById('navUserName').textContent = profile.name + ' ▼';
      document.getElementById('dropdownName').textContent = profile.name;
      document.getElementById('dropdownRole').textContent = profile.roleLabel;
    }
  } else {
    if (infoEl) infoEl.style.display = 'none';
    if (btnEl) btnEl.style.display = 'block';
    if (heroActions) heroActions.innerHTML = `<button class="btn btn-primary btn-lg" onclick="openRoleSelectionModal()">Get Started →</button><button class="btn btn-secondary btn-lg" onclick="document.getElementById('how-it-works').scrollIntoView({behavior: 'smooth'})">See How It Works</button>`;
  }

  // Update Navigation based on role
  const showNav = (id, show) => {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'block' : 'none';
  };

  if (currentRole === 'individual') {
    showNav('nav-materials-link', false);
    showNav('nav-makers-link', false);
    showNav('nav-recyclers-link', false);
    showNav('nav-mylistings-link', true);
    showNav('dropdown-listings', true);
  } else if (currentRole === 'recycler') {
    showNav('nav-materials-link', true);
    showNav('nav-makers-link', false);
    showNav('nav-recyclers-link', true);
    showNav('nav-mylistings-link', false);
    showNav('dropdown-listings', false);
  } else if (currentRole === 'industry') {
    showNav('nav-materials-link', true);
    showNav('nav-makers-link', true);
    showNav('nav-recyclers-link', true);
    showNav('nav-mylistings-link', false);
    showNav('dropdown-listings', false);
  } else if (currentRole === 'maker') {
    showNav('nav-materials-link', true);
    showNav('nav-makers-link', true);
    showNav('nav-recyclers-link', false);
    showNav('nav-mylistings-link', true);
    showNav('dropdown-listings', true);
  } else if (currentRole === 'buyer') {
    showNav('nav-materials-link', false);
    showNav('nav-makers-link', true);
    showNav('nav-recyclers-link', false);
    showNav('nav-mylistings-link', false);
    showNav('dropdown-listings', false);
  }
}

function renderDashboard() {
  const profile = MOCK_PROFILES[currentRole];
  if(!profile) return;
  document.getElementById('dashboardGreeting').innerHTML = `Good afternoon, ${profile.name.split(' ')[0]} 👋`;
  
  const grid = document.getElementById('dashboardSummaryGrid');
  grid.innerHTML = profile.summaryStats.map(s => `
    <div class="summary-card">
      <h4>${s.label}</h4>
      <div class="val">${s.value}</div>
    </div>
  `).join('');

  const actions = document.getElementById('dashboardActionsGrid');
  let actionHtml = '';
  if (currentRole === 'individual') {
    actionHtml = `<button class="btn btn-primary" onclick="navigateTo('analyze')">🔬 Analyze Item</button><button class="btn btn-secondary" onclick="navigateTo('marketplace')">🛒 Browse Marketplace</button>`;
  } else if (currentRole === 'recycler') {
    actionHtml = `<button class="btn btn-primary" onclick="navigateTo('materials')">🏭 View Material Requests</button>`;
  } else if (currentRole === 'industry') {
    actionHtml = `<button class="btn btn-primary" onclick="navigateTo('recyclers')">♻️ Find Suppliers</button>`;
  } else if (currentRole === 'maker') {
    actionHtml = `<button class="btn btn-primary" onclick="navigateTo('marketplace')">🛒 Find Materials</button>`;
  } else if (currentRole === 'buyer') {
    actionHtml = `<button class="btn btn-primary" onclick="navigateTo('marketplace')">🛒 Browse Products</button>`;
  }
  actions.innerHTML = actionHtml;
}

function renderProfile() {
  const profile = MOCK_PROFILES[currentRole];
  if(!profile) return;
  document.getElementById('profileAvatar').textContent = profile.initials;
  document.getElementById('profileName').textContent = profile.name;
  document.getElementById('profileRoleBadge').textContent = profile.roleLabel;
  document.getElementById('profileLocation').textContent = `📍 ${profile.location}`;
  document.getElementById('profileJoined').textContent = `📅 Member since ${profile.memberSince}`;
  
  document.getElementById('profileStatsGrid').innerHTML = profile.stats.map(s => `
    <div class="summary-card">
      <h4>${s.label}</h4>
      <div class="val">${s.value}</div>
    </div>
  `).join('');
}

function renderActivity() {
  const profile = MOCK_PROFILES[currentRole];
  if(!profile) return;
  document.getElementById('activityTimeline').innerHTML = profile.activities.map(a => `
    <div class="activity-item">
      <div class="activity-icon">${a.icon}</div>
      <div class="activity-content">
        <div class="activity-time">${a.time}</div>
        <div class="activity-desc">${a.action} <span class="activity-detail">${a.detail || a.type}</span></div>
      </div>
    </div>
  `).join('');
}

// Initial UI setup
applyRoleUI();
navigateTo('home');

// Scroll Animations (Intersection Observer)
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});

// Generate Floating Squares with Mouse/Scroll Parallax
function generateSquares() {
  const container = document.getElementById('floatingSquares');
  if (!container) return;
  container.innerHTML = '';
  
  const numSquares = 40;
  for (let i = 0; i < numSquares; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'square-wrapper';
    
    const square = document.createElement('div');
    square.className = 'square';
    
    const size = Math.random() * 100 + 20;
    const left = Math.random() * 110 - 5;
    const top = Math.random() * 110 - 5;
    const delay = Math.random() * 5;
    const duration = Math.random() * 15 + 15;
    const depth = Math.random() * 2.5 + 1; // 1 to 3.5
    
    wrapper.style.left = `${left}%`;
    wrapper.style.top = `${top}%`;
    wrapper.style.setProperty('--depth', depth);
    
    square.style.width = `${size}px`;
    square.style.height = `${size}px`;
    square.style.animationDelay = `-${delay}s`;
    square.style.animationDuration = `${duration}s`;
    
    // Opacity based on depth - closer is more visible
    square.style.opacity = 0.05 + (1 / depth) * 0.15;
    
    wrapper.appendChild(square);
    container.appendChild(wrapper);
  }

  // Hero section floating elements
  const heroGrid = document.querySelector('.hero');
  if (heroGrid) {
    const heroSquaresData = [
      { label: "AI", icon: "✨", color: "rgba(16, 185, 129, 0.2)" },
      { label: "Recycle", icon: "♻️", color: "rgba(6, 182, 212, 0.2)" },
      { label: "Maker", icon: "🎨", color: "rgba(99, 102, 241, 0.2)" },
      { label: "Buyer", icon: "🛍️", color: "rgba(244, 114, 182, 0.2)" },
      { label: "Industry", icon: "🏭", color: "rgba(251, 191, 36, 0.2)" }
    ];
    
    heroSquaresData.forEach((data, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'square-wrapper hero-float-wrapper';
      wrapper.style.setProperty('--depth', 1.2 + Math.random());
      
      const angle = (index / heroSquaresData.length) * Math.PI * 2;
      const radius = 35 + Math.random() * 10;
      wrapper.style.left = `calc(50% + ${Math.cos(angle) * radius}% - 40px)`;
      wrapper.style.top = `calc(50% + ${Math.sin(angle) * radius}% - 40px)`;
      
      const el = document.createElement('div');
      el.className = 'hero-float-square';
      el.style.borderColor = data.color;
      el.style.boxShadow = `0 0 15px ${data.color}`;
      el.innerHTML = `<span class="icon">${data.icon}</span><span class="label">${data.label}</span>`;
      el.style.animationDelay = `-${Math.random() * 5}s`;
      
      wrapper.appendChild(el);
      heroGrid.appendChild(wrapper);
    });
  }

  // Mouse and Scroll tracking for CSS variables
  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });
  
  // Smooth interpolation loop
  function updateParallax() {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;
    
    document.documentElement.style.setProperty('--mouse-x', currentX);
    document.documentElement.style.setProperty('--mouse-y', currentY);
    document.documentElement.style.setProperty('--scroll-y', window.scrollY);
    
    requestAnimationFrame(updateParallax);
  }
  
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    updateParallax();
  }
}
generateSquares();
