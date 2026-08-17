// ReLoop — Main Application
const API_BASE = window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1'?'http://localhost:3000':'';
let currentPage='home', uploadedImage=null, lastAnalysis=null;
const userListings=JSON.parse(localStorage.getItem('reloop_listings')||'[]');
const collectionReqs=JSON.parse(localStorage.getItem('reloop_collections')||'[]');

function saveState(){localStorage.setItem('reloop_listings',JSON.stringify(userListings));localStorage.setItem('reloop_collections',JSON.stringify(collectionReqs));}

// Toast
function showToast(msg,type='info'){const c=document.getElementById('toastContainer');const t=document.createElement('div');t.className='toast '+type;t.innerHTML=(type==='success'?'✅':type==='error'?'❌':'ℹ️')+' '+msg;c.appendChild(t);setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),300);},3000);}

// Navigation
function toggleMobileMenu() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) navLinks.classList.toggle('open');
}

function navigateHome() {
  navigateTo('home');
}

function navigateTo(page, event) {
  if (event) event.preventDefault();
  
  // Close dropdown & mobile drawer if open
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.remove('open');
  const navLinks = document.getElementById('navLinks');
  if (navLinks) navLinks.classList.remove('open');
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('open');
  const roleModalOverlay = document.getElementById('roleModalOverlay');
  if (roleModalOverlay) roleModalOverlay.classList.remove('open');

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
  if (page === 'collection') renderCollection();
  if (page === 'mymaterials') renderMyMaterials();
  if (page === 'industry_demand') renderIndustryDemand();
  if (page === 'suppliers') renderSuppliers();
  if (page === 'requests') renderRequests();
  if (page === 'myproducts') renderMyProducts();
  if (page === 'saved_items') renderSavedItems();
  if (page === 'purchases') renderPurchases();
  if (page === 'categories') renderCategories();
  if (page === 'createproduct') { openCreateListingModal(); navigateTo('myproducts'); }
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
uploadZone.addEventListener('click',(e)=>{if(e.target!==imageInput)imageInput.click();});
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
  imageInput.value = '';
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
  const filterTabsContainer = document.getElementById('filterTabs');
  if (filterTabsContainer) {
    filterTabsContainer.innerHTML=
      tabs.map(t=>`<button class="filter-tab ${activeFilter===t?'active':''}" onclick="setFilter('${t}')">${t}</button>`).join('')+
      chips.map(c=>`<button class="filter-tab" onclick="searchChip('${c}')">${c}</button>`).join('');
  }
  let items=[...MOCK_LISTINGS,...userListings];
  const searchInput = document.getElementById('marketSearch') || document.getElementById('marketplaceSearch');
  const q=(searchInput?.value||'').toLowerCase();
  if(q)items=items.filter(i=>(i.title+i.category+i.material+i.description).toLowerCase().includes(q));
  if(activeFilter==='Reusable Items')items=items.filter(i=>i.tag==='reusable');
  else if(activeFilter==='Recyclable Materials')items=items.filter(i=>i.tag==='recyclable');
  else if(activeFilter==='Handmade')items=items.filter(i=>i.tag==='handmade');
  else if(activeFilter==='Free / Donate')items=items.filter(i=>i.price===0||i.tag==='donate');
  
  const gridContainer = document.getElementById('marketplaceGrid') || document.getElementById('listingsGrid');
  if (gridContainer) {
    gridContainer.innerHTML=items.length?items.map(i=>`
      <div class="listing-card card" onclick="openListingModal(${i.id})">
        <div class="listing-img" style="font-size:3rem; text-align:center; padding:1.5rem 0; background:rgba(255,255,255,0.03); border-radius:12px 12px 0 0; position:relative;">
          <span class="listing-tag badge badge-primary" style="position:absolute; top:10px; right:10px;">${i.tag||i.category}</span>
          ${i.emoji||'📦'}
        </div>
        <div class="listing-body" style="padding:1rem;">
          <div class="listing-title" style="font-size:1.1rem; font-weight:700; margin-bottom:0.5rem;">${i.title}</div>
          <div class="listing-meta" style="font-size:0.85rem; color:var(--text-secondary); display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:0.75rem;">
            <span>📍 ${i.location}</span><span>📂 ${i.category}</span><span>🔧 ${i.condition}</span>
          </div>
          <div class="listing-footer" style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-light); padding-top:0.75rem;">
            <span class="listing-price" style="font-size:1.1rem; font-weight:700; color:var(--accent-emerald);">${i.price===0?'Free':i.currency+' '+i.price.toLocaleString()}</span>
            <span class="badge badge-secondary">${i.sellerRole}</span>
          </div>
        </div>
      </div>`).join(''):'<div class="empty-state" style="grid-column:1/-1; text-align:center; padding:3rem;"><div class="empty-state-icon" style="font-size:3rem; margin-bottom:1rem;">🛒</div><h3>No listings found</h3><p style="color:var(--text-secondary);">Try a different search query or category filter.</p></div>';
  }
}
function setFilter(f){activeFilter=f;renderMarketplace();}
function filterMarketCategory(cat, el) {
  if (el) {
    document.querySelectorAll('#marketCategoryTabs .tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }
  const map = {
    'all': 'All',
    'reusable': 'Reusable Items',
    'recyclable': 'Recyclable Materials',
    'handmade': 'Handmade',
    'donate': 'Free / Donate'
  };
  setFilter(map[cat] || 'All');
}
function filterMarketplace(){renderMarketplace();}
function searchChip(c){
  const searchInput = document.getElementById('marketSearch') || document.getElementById('marketplaceSearch');
  if (searchInput) searchInput.value=c;
  renderMarketplace();
}

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
function removeMyListing(id){
  const i=userListings.findIndex(x=>x.id===id);
  if(i>-1){
    userListings.splice(i,1);
    saveState();
    renderMyListings();
    if(currentPage==='marketplace') renderMarketplace();
    showToast('Listing removed','info');
  }
}

// Modal
function openModal(title,bodyHTML){
  document.getElementById('modalTitle').textContent=title;
  document.getElementById('modalBody').innerHTML=bodyHTML;
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal(e){if(!e||e.target===document.getElementById('modalOverlay'))document.getElementById('modalOverlay').classList.remove('open');}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeRoleModal();}});

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
  const profile=MOCK_PROFILES[currentRole]||{roleLabel:'Individual',name:'Demo User'};
  const listing={id:Date.now(),title:document.getElementById('lstTitle').value||'Untitled',description:document.getElementById('lstDesc').value,category:document.getElementById('lstCat').value||'Other',material:document.getElementById('lstMat').value||'Mixed',condition:document.getElementById('lstCond').value,price:parseInt(document.getElementById('lstPrice').value)||0,currency:'৳',location:document.getElementById('lstLoc').value||'Dhaka',sellerRole:profile.roleLabel,sellerName:profile.name,tag:parseInt(document.getElementById('lstPrice').value)===0?'donate':'reusable',emoji:'📦',listedAt:'Just now'};
  userListings.push(listing);saveState();closeModal();showToast('Listing published!','success');
  if(currentPage==='marketplace') renderMarketplace();
  if(currentPage==='mylistings') renderMyListings();
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
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.remove('open');
  document.getElementById('roleModalOverlay').classList.add('open');
}

function closeRoleModal(e) {
  if (!e || e.target === document.getElementById('roleModalOverlay')) {
    document.getElementById('roleModalOverlay').classList.remove('open');
  }
}

// ============================================================
// ROLE CONFIGURATION SYSTEM
// ============================================================
const ROLE_CONFIG = {
  individual: {
    nav: [
      { label: 'Dashboard', page: 'dashboard' },
      { label: 'Analyze Item', page: 'analyze' },
      { label: 'Marketplace', page: 'marketplace' },
      { label: 'My Listings', page: 'mylistings' },
      { label: 'Collection', page: 'collection' },
      { label: 'Activity', page: 'activity' }
    ],
    dropdown: [
      { label: '👤 My Profile', page: 'profile' },
      { label: '⚡ My Activity', page: 'activity' },
      { label: '📋 My Listings', page: 'mylistings' },
      { label: '❤️ Saved Items', page: 'saved_items' }
    ],
    headline: "Give your unused items a second life.",
    subhead: "Analyze items with AI, sell or donate, request waste collection, and find local recyclers.",
    actions: [
      { label: "🔬 Analyze Item", action: "navigateTo('analyze')", primary: true },
      { label: "📋 Create Listing", action: "openCreateListingModal()", primary: true },
      { label: "♻️ Find Recycler", action: "navigateTo('recyclers')", primary: true },
      { label: "🚛 Request Collection", action: "navigateTo('collection')", primary: true }
    ],
    footerColTitle: "For You",
    footerColLinks: [
      { label: "Analyze Item", page: "analyze" },
      { label: "Marketplace", page: "marketplace" },
      { label: "My Listings", page: "mylistings" },
      { label: "Collection", page: "collection" }
    ],
    footerExploreLinks: [
      { label: "Makers", page: "makers" },
      { label: "Recyclers", page: "recyclers" },
      { label: "Industries", page: "materials" }
    ],
    footerAccountLinks: [
      { label: "Profile", page: "profile" },
      { label: "Activity", page: "activity" },
      { label: "Switch Role", action: "openRoleSelectionModal()" }
    ]
  },
  recycler: {
    nav: [
      { label: 'Dashboard', page: 'dashboard' },
      { label: 'Available Materials', page: 'materials' },
      { label: 'Collection Requests', page: 'collection' },
      { label: 'My Materials', page: 'mymaterials' },
      { label: 'Industry Demand', page: 'industry_demand' },
      { label: 'Activity', page: 'activity' }
    ],
    dropdown: [
      { label: '👤 My Profile', page: 'profile' },
      { label: '⚡ My Collection Activity', page: 'activity' },
      { label: '📦 Accepted Materials', page: 'mymaterials' },
      { label: '🚛 Collection Requests', page: 'collection' }
    ],
    headline: "Find materials and manage collection requests.",
    subhead: "Connect with individuals who have recyclables, manage your pickups, and supply industries.",
    actions: [
      { label: "📋 View Requests", action: "navigateTo('collection')", primary: true },
      { label: "🔍 Find Materials", action: "navigateTo('materials')", primary: true },
      { label: "📦 Manage Materials", action: "navigateTo('mymaterials')", primary: true },
      { label: "🏭 View Industry Demand", action: "navigateTo('industry_demand')", primary: true }
    ],
    footerColTitle: "Recycler",
    footerColLinks: [
      { label: "Available Materials", page: "materials" },
      { label: "Collection Requests", page: "collection" },
      { label: "My Materials", page: "mymaterials" },
      { label: "Industry Demand", page: "industry_demand" }
    ],
    footerExploreLinks: [
      { label: "Marketplace", page: "marketplace" },
      { label: "Industries", page: "industry_demand" },
      { label: "Makers", page: "makers" }
    ],
    footerAccountLinks: [
      { label: "Profile", page: "profile" },
      { label: "Activity", page: "activity" },
      { label: "Switch Role", action: "openRoleSelectionModal()" }
    ]
  },
  industry: {
    nav: [
      { label: 'Dashboard', page: 'dashboard' },
      { label: 'Materials Needed', page: 'industry_demand' },
      { label: 'Suppliers', page: 'suppliers' },
      { label: 'Available Materials', page: 'materials' },
      { label: 'Requests', page: 'requests' },
      { label: 'Activity', page: 'activity' }
    ],
    dropdown: [
      { label: '🏢 Company Profile', page: 'profile' },
      { label: '📋 Material Requirements', page: 'industry_demand' },
      { label: '🤝 Suppliers', page: 'suppliers' },
      { label: '📩 Requests', page: 'requests' },
      { label: '⚡ Activity', page: 'activity' }
    ],
    headline: "Source recyclable materials for your business.",
    subhead: "Post your material requirements, connect with certified recyclers and scrap suppliers.",
    actions: [
      { label: "📢 Post Requirement", action: "openPostRequirementModal()", primary: true },
      { label: "🤝 Find Suppliers", action: "navigateTo('suppliers')", primary: true },
      { label: "📦 Browse Materials", action: "navigateTo('materials')", primary: true },
      { label: "📩 View Requests", action: "navigateTo('requests')", primary: true }
    ],
    footerColTitle: "Industry",
    footerColLinks: [
      { label: "Materials Needed", page: "industry_demand" },
      { label: "Suppliers", page: "suppliers" },
      { label: "Available Materials", page: "materials" },
      { label: "Requests", page: "requests" }
    ],
    footerExploreLinks: [
      { label: "Recyclers", page: "recyclers" },
      { label: "Makers", page: "makers" },
      { label: "Marketplace", page: "marketplace" }
    ],
    footerAccountLinks: [
      { label: "Profile", page: "profile" },
      { label: "Activity", page: "activity" },
      { label: "Switch Role", action: "openRoleSelectionModal()" }
    ]
  },
  maker: {
    nav: [
      { label: 'Dashboard', page: 'dashboard' },
      { label: 'Find Materials', page: 'materials' },
      { label: 'My Products', page: 'myproducts' },
      { label: 'Create Product', page: 'createproduct' },
      { label: 'Marketplace', page: 'marketplace' },
      { label: 'Activity', page: 'activity' }
    ],
    dropdown: [
      { label: '👤 My Profile', page: 'profile' },
      { label: '🎨 My Products', page: 'myproducts' },
      { label: '📦 Materials', page: 'materials' },
      { label: '📩 Orders / Requests', page: 'requests' },
      { label: '⚡ Activity', page: 'activity' }
    ],
    headline: "Find materials and create something new.",
    subhead: "Discover reclaimed wood, textiles, and plastic scraps to create and list upcycled crafts.",
    actions: [
      { label: "🔍 Find Materials", action: "navigateTo('materials')", primary: true },
      { label: "🎨 Create Product", action: "openCreateListingModal()", primary: true },
      { label: "📦 Manage Products", action: "navigateTo('myproducts')", primary: true },
      { label: "🛒 Browse Marketplace", action: "navigateTo('marketplace')", primary: true }
    ],
    footerColTitle: "Maker",
    footerColLinks: [
      { label: "Find Materials", page: "materials" },
      { label: "My Products", page: "myproducts" },
      { label: "Create Product", page: "createproduct" },
      { label: "Marketplace", page: "marketplace" }
    ],
    footerExploreLinks: [
      { label: "Recyclers", page: "recyclers" },
      { label: "Industries", page: "industry_demand" },
      { label: "Buyers", page: "marketplace" }
    ],
    footerAccountLinks: [
      { label: "Profile", page: "profile" },
      { label: "Activity", page: "activity" },
      { label: "Switch Role", action: "openRoleSelectionModal()" }
    ]
  },
  buyer: {
    nav: [
      { label: 'Marketplace', page: 'marketplace' },
      { label: 'Categories', page: 'categories' },
      { label: 'Saved Items', page: 'saved_items' },
      { label: 'My Purchases', page: 'purchases' },
      { label: 'Activity', page: 'activity' }
    ],
    dropdown: [
      { label: '👤 My Profile', page: 'profile' },
      { label: '❤️ Saved Items', page: 'saved_items' },
      { label: '🛍️ Purchases', page: 'purchases' },
      { label: '⚡ Activity', page: 'activity' }
    ],
    headline: "Discover useful, handmade and upcycled products.",
    subhead: "Shop unique upcycled creations, reclaimed goods, and sustainable products from local makers.",
    actions: [
      { label: "🛒 Browse Marketplace", action: "navigateTo('marketplace')", primary: true },
      { label: "❤️ View Saved Items", action: "navigateTo('saved_items')", primary: true },
      { label: "🛍️ View Purchases", action: "navigateTo('purchases')", primary: true }
    ],
    footerColTitle: "Shop",
    footerColLinks: [
      { label: "Marketplace", page: "marketplace" },
      { label: "Categories", page: "categories" },
      { label: "Handmade", page: "marketplace" },
      { label: "Upcycled", page: "marketplace" }
    ],
    footerExploreLinks: [
      { label: "Makers", page: "makers" },
      { label: "Recyclers", page: "recyclers" },
      { label: "Industries", page: "materials" }
    ],
    footerAccountLinks: [
      { label: "Profile", page: "profile" },
      { label: "Saved Items", page: "saved_items" },
      { label: "Activity", page: "activity" },
      { label: "Switch Role", action: "openRoleSelectionModal()" }
    ]
  }
};

function selectRole(role) {
  currentRole = role;
  localStorage.setItem('reloopRole', role);
  localStorage.setItem('reloopLoggedIn', 'true');
  closeRoleModal();
  applyRoleUI();
  navigateTo('dashboard');
  showToast(`Logged in as ${MOCK_PROFILES[role].name} (${MOCK_PROFILES[role].roleLabel})`, 'success');
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
  const navLinksContainer = document.getElementById('navLinks');
  const dropdownBodyContainer = document.getElementById('dropdownBody');
  
  if (!isLoggedIn) {
    if (infoEl) infoEl.style.display = 'none';
    if (btnEl) btnEl.style.display = 'block';
    if (heroActions) heroActions.innerHTML = `
      <button class="btn btn-primary btn-lg" onclick="openRoleSelectionModal()">Get Started →</button>
      <button class="btn btn-secondary btn-lg" onclick="document.getElementById('how-it-works').scrollIntoView({behavior: 'smooth'})">See How It Works</button>
    `;
    
    // Guest Landing Navbar
    if (navLinksContainer) {
      navLinksContainer.innerHTML = `
        <a href="#" class="nav-link ${currentPage==='home'?'active':''}" data-page="home" onclick="navigateTo('home', event)">How It Works</a>
        <a href="#" class="nav-link ${currentPage==='marketplace'?'active':''}" data-page="marketplace" onclick="navigateTo('marketplace', event)">Marketplace</a>
        <a href="#" class="nav-link ${currentPage==='materials'?'active':''}" data-page="materials" onclick="navigateTo('materials', event)">Materials</a>
        <a href="#" class="nav-link ${currentPage==='makers'?'active':''}" data-page="makers" onclick="navigateTo('makers', event)">Makers</a>
        <a href="#" class="nav-link ${currentPage==='recyclers'?'active':''}" data-page="recyclers" onclick="navigateTo('recyclers', event)">Recyclers</a>
      `;
    }
  } else {
    if (infoEl) infoEl.style.display = 'block';
    if (btnEl) btnEl.style.display = 'none';
    if (heroActions) heroActions.innerHTML = `
      <button class="btn btn-primary btn-lg" onclick="navigateTo('dashboard')">Continue to Dashboard →</button>
    `;

    const config = ROLE_CONFIG[currentRole] || ROLE_CONFIG.individual;
    const profile = MOCK_PROFILES[currentRole];

    if (profile) {
      const avatarEl = document.getElementById('navAvatarInitials');
      const userEl = document.getElementById('navUserName');
      const dropNameEl = document.getElementById('dropdownName');
      const dropRoleEl = document.getElementById('dropdownRole');
      if (avatarEl) avatarEl.textContent = profile.initials;
      if (userEl) userEl.textContent = profile.name + ' ▼';
      if (dropNameEl) dropNameEl.textContent = profile.name;
      if (dropRoleEl) dropRoleEl.textContent = profile.roleLabel;
    }

    // Dynamic Role Navbar
    if (navLinksContainer) {
      navLinksContainer.innerHTML = config.nav.map(item => `
        <a href="#" class="nav-link ${currentPage===item.page?'active':''}" data-page="${item.page}" onclick="navigateTo('${item.page}', event)">${item.label}</a>
      `).join('');
    }

    // Dynamic Profile Dropdown
    if (dropdownBodyContainer) {
      dropdownBodyContainer.innerHTML = `
        ${config.dropdown.map(item => `
          <a href="#" onclick="navigateTo('${item.page}', event)">${item.label}</a>
        `).join('')}
        <div class="dropdown-divider"></div>
        <a href="#" onclick="openRoleSelectionModal()">🔄 Switch Role</a>
        <a href="#" onclick="logout()" style="color:var(--text-muted)">🚪 Logout</a>
      `;
    }
  }

  // Render Footer according to current role
  renderFooter();
}

function renderFooter() {
  const footerEl = document.getElementById('appFooter');
  if (!footerEl) return;

  const isLoggedIn = localStorage.getItem('reloopLoggedIn') === 'true';

  if (!isLoggedIn) {
    footerEl.innerHTML = `
      <div class="footer-grid">
        <div class="footer-brand">
          <h3><span style="color:var(--accent-emerald)">↻</span> ReLoop</h3>
          <p>Give Things a Second Life.</p>
        </div>
        <div class="footer-links">
          <a href="#" onclick="navigateTo('home'); document.getElementById('how-it-works').scrollIntoView({behavior: 'smooth'}); return false;">How It Works</a>
          <a href="#" onclick="navigateTo('marketplace', event)">Marketplace</a>
          <a href="#" onclick="navigateTo('materials', event)">Materials</a>
          <a href="#" onclick="navigateTo('makers', event)">Makers</a>
          <a href="#" onclick="navigateTo('recyclers', event)">Recyclers</a>
        </div>
        <div>
          <button class="btn btn-primary" onclick="openRoleSelectionModal()">Join the Ecosystem →</button>
        </div>
      </div>
      <div class="footer-bottom">
        Built with Google Gemini AI | ReLoop Hackathon MVP 2026
      </div>
    `;
    return;
  }

  const config = ROLE_CONFIG[currentRole] || ROLE_CONFIG.individual;

  const renderLink = (item) => {
    if (item.action) {
      return `<a href="#" onclick="${item.action}; return false;">${item.label}</a>`;
    }
    return `<a href="#" onclick="navigateTo('${item.page}', event)">${item.label}</a>`;
  };

  footerEl.innerHTML = `
    <div class="footer-grid">
      <div class="footer-brand">
        <h3><span style="color:var(--accent-emerald)">↻</span> ReLoop</h3>
        <p>Give Things a Second Life.</p>
        <div style="margin-top:0.75rem; font-size:0.85rem; color:var(--text-muted);">
          Logged in as: <strong style="color:var(--accent-emerald)">${MOCK_PROFILES[currentRole].roleLabel}</strong>
        </div>
      </div>

      <div class="footer-links">
        <h4 style="color:var(--text-primary); font-size:0.95rem; margin-bottom:0.75rem;">${config.footerColTitle}</h4>
        ${config.footerColLinks.map(renderLink).join('')}
      </div>

      <div class="footer-links">
        <h4 style="color:var(--text-primary); font-size:0.95rem; margin-bottom:0.75rem;">Explore</h4>
        ${config.footerExploreLinks.map(renderLink).join('')}
      </div>

      <div class="footer-links">
        <h4 style="color:var(--text-primary); font-size:0.95rem; margin-bottom:0.75rem;">Account</h4>
        ${config.footerAccountLinks.map(renderLink).join('')}
      </div>
    </div>
    <div class="footer-bottom" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
      <span>Powered by <strong>Google Gemini AI</strong> | Circular Economy Platform</span>
      <button class="btn btn-secondary btn-sm" onclick="openRoleSelectionModal()">🔄 Switch Role</button>
    </div>
  `;
}

function renderDashboard() {
  const profile = MOCK_PROFILES[currentRole];
  const config = ROLE_CONFIG[currentRole] || ROLE_CONFIG.individual;
  if (!profile) return;

  const greetingEl = document.getElementById('dashboardGreeting');
  const subheadEl = document.getElementById('dashboardSubhead');
  
  if (greetingEl) greetingEl.innerHTML = `${profile.name.split(' ')[0]} 👋`;
  if (subheadEl) subheadEl.textContent = config.headline;

  const grid = document.getElementById('dashboardSummaryGrid');
  if (grid) {
    grid.innerHTML = profile.summaryStats.map(s => `
      <div class="summary-card">
        <h4>${s.label}</h4>
        <div class="val">${s.value}</div>
      </div>
    `).join('');
  }

  // Render Role-Aware AI Assistant Card
  renderDashboardAICard();

  const actionsGrid = document.getElementById('dashboardActionsGrid');
  if (actionsGrid) {
    actionsGrid.innerHTML = config.actions.map(a => `
      <button class="btn ${a.primary ? 'btn-primary' : 'btn-secondary'}" onclick="${a.action}">
        ${a.label}
      </button>
    `).join('');
  }
}

// ─── Role-Aware AI Assistant Client Engine ─────────────────

function setAICardInput(val) {
  const el = document.getElementById('aiRoleInput');
  if (el) el.value = val;
}

async function callRoleAI(role, task, input) {
  try {
    const res = await fetch(API_BASE + '/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, task, input })
    });
    if (!res.ok) throw new Error('API status ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn("API server call offline/unreachable, fallback response:", err.message);
    return {
      success: true,
      data: getClientFallbackData(role, task, input),
      demo: true,
      warning: "Offline demo mode active."
    };
  }
}

function getClientFallbackData(role, task, input) {
  if (role === 'recycler' || task === 'classify-material') {
    return {
      likelyMaterial: "PET Plastic Bottles",
      category: "Plastic",
      matchLevel: "High",
      recommendedAction: "Accept",
      reason: "Matches your active PET plastic recovery program (clear bottles).",
      suggestedResponse: "Thank you! We accept this collection request and can schedule pickup within 24 hours."
    };
  }
  if (role === 'industry' || task === 'structure-material-request') {
    return {
      material: "PET Plastic Flakes",
      quantity: "500 kg/month",
      frequency: "Monthly",
      priority: "High",
      description: "Clean, baled or crushed PET plastic for industrial bottle recycling and fiber spinning.",
      targetPrice: "৳ 45 / kg",
      keywords: ["PET", "plastic", "recyclable", "bulk"]
    };
  }
  if (role === 'maker' || task === 'upcycle-ideas') {
    return {
      rawMaterial: input || "Old Denim & Textiles",
      ideas: [
        {
          name: "Upcycled Denim Tote Bag",
          description: "Sturdy, stylish tote bag crafted from repurposed denim pockets and fabric scraps.",
          category: "Handmade",
          difficulty: "Easy",
          estimatedPrice: "৳ 650",
          materialsNeeded: ["Old denim jeans", "Lining fabric"]
        },
        {
          name: "Patchwork Desk Organizer",
          description: "Multi-pocket organizer designed for office tools and accessories.",
          category: "Handmade",
          difficulty: "Medium",
          estimatedPrice: "৳ 450",
          materialsNeeded: ["Denim scraps", "Cardboard"]
        },
        {
          name: "Eco Cushion Cover",
          description: "Hand-stitched decorative cushion cover blending denim tones.",
          category: "Handmade",
          difficulty: "Easy",
          estimatedPrice: "৳ 550",
          materialsNeeded: ["Denim patches", "Zipper"]
        }
      ]
    };
  }
  if (role === 'buyer' || task === 'parse-shopping-request') {
    return {
      interpretedNeed: "Low-cost study table made from reclaimed wood",
      category: "Furniture",
      material: "Reclaimed Wood",
      pricePreference: "Low",
      keywords: ["wood", "table", "furniture", "reclaimed"]
    };
  }

  // Individual fallback
  return {
    itemName: input || "Unused Plastic Containers",
    category: "Plastic",
    material: "HDPE / PET Plastic",
    condition: "Good",
    reusability: "High",
    recommendedAction: "Recycle",
    alternativeActions: ["Reuse", "Upcycle"],
    reason: "Clean recyclable plastic suitable for local collection or community maker reuse.",
    upcyclingIdeas: ["Planter pots", "Storage container"],
    listingTitle: "Reusable Plastic Items",
    listingDescription: "Clean plastic containers ready for recycling pickup or local maker upcycling.",
    tags: ["plastic", "recycle", "reuse"],
    hazardous: false,
    hazardNote: ""
  };
}

function renderDashboardAICard() {
  const cardContainer = document.getElementById('dashboardAICard');
  if (!cardContainer) return;

  const role = currentRole;
  
  if (role === 'individual') {
    cardContainer.innerHTML = `
      <div class="ai-role-card">
        <div class="ai-card-header">
          <div class="ai-card-title">✨ ReLoop AI Advisor</div>
          <span class="ai-badge-gemini">✨ Powered by Gemini</span>
        </div>
        <div class="ai-card-subtitle">"Not sure what to do with something you no longer need?"</div>
        
        <div class="ai-demo-presets">
          <label>Try demo items:</label>
          <button class="demo-chip-btn" onclick="setAICardInput('old plastic bottles')">🍾 15 Plastic Bottles</button>
          <button class="demo-chip-btn" onclick="setAICardInput('broken wooden chair')">🪑 Wooden Chair</button>
          <button class="demo-chip-btn" onclick="setAICardInput('used denim jacket')">🧥 Denim Jacket</button>
        </div>

        <div class="ai-input-group">
          <input type="text" id="aiRoleInput" placeholder="Describe what you have (e.g. 15 plastic bottles, old wooden chair)...">
          <button class="btn btn-primary" onclick="runIndividualAI()"><span class="emoji">🤖</span> Analyze & Advise</button>
        </div>

        <div class="ai-loading-box" id="aiRoleLoading">
          <div class="ai-spinner"></div>
          <div>
            <strong style="color:var(--accent-emerald);">Gemini is working...</strong>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">Evaluating material, condition, reusability, and potential matches.</p>
          </div>
        </div>

        <div class="ai-result-box" id="aiRoleResult"></div>
      </div>
    `;
  } else if (role === 'recycler') {
    cardContainer.innerHTML = `
      <div class="ai-role-card">
        <div class="ai-card-header">
          <div class="ai-card-title">♻️ AI Material Matcher</div>
          <span class="ai-badge-gemini">✨ Powered by Gemini</span>
        </div>
        <div class="ai-card-subtitle">Help recyclers quickly understand which available materials match accepted material types.</div>
        
        <div class="ai-demo-presets">
          <label>Try demo requests:</label>
          <button class="demo-chip-btn" onclick="setAICardInput('8 kg of clear plastic bottles')">🍾 8 kg PET Bottles</button>
          <button class="demo-chip-btn" onclick="setAICardInput('15 kg corrugated cardboard boxes')">📦 15 kg Cardboard</button>
          <button class="demo-chip-btn" onclick="setAICardInput('5 kg aluminum scrap cans')">🥫 5 kg Aluminum</button>
        </div>

        <div class="ai-input-group">
          <input type="text" id="aiRoleInput" placeholder="Enter collection request (e.g. 8 kg of clear plastic bottles)...">
          <button class="btn btn-primary" onclick="runRecyclerAIMatch()"><span class="emoji">🔍</span> Match Material</button>
        </div>

        <div class="ai-loading-box" id="aiRoleLoading">
          <div class="ai-spinner"></div>
          <div>
            <strong style="color:var(--accent-emerald);">Gemini is matching material...</strong>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">Comparing request text against accepted material streams.</p>
          </div>
        </div>

        <div class="ai-result-box" id="aiRoleResult"></div>
      </div>
    `;
  } else if (role === 'industry') {
    cardContainer.innerHTML = `
      <div class="ai-role-card">
        <div class="ai-card-header">
          <div class="ai-card-title">🏭 AI Sourcing Assistant</div>
          <span class="ai-badge-gemini">✨ Powered by Gemini</span>
        </div>
        <div class="ai-card-subtitle">Turn natural-language requirements into structured material requests & find matching suppliers.</div>
        
        <div class="ai-demo-presets">
          <label>Try demo requirements:</label>
          <button class="demo-chip-btn" onclick="setAICardInput('Need 500 kg PET plastic monthly for bottle recycling')">PET Plastic (500kg)</button>
          <button class="demo-chip-btn" onclick="setAICardInput('Looking for 200 kg cotton fabric scraps for fiber spinning')">Cotton Scraps (200kg)</button>
          <button class="demo-chip-btn" onclick="setAICardInput('1 ton corrugated cardboard boxes for paper mill')">Cardboard (1 Ton)</button>
        </div>

        <div class="ai-input-group">
          <input type="text" id="aiRoleInput" placeholder="Enter material requirement (e.g. I need around 500 kg of PET plastic every month)...">
          <button class="btn btn-primary" onclick="runIndustryAISourcing()"><span class="emoji">⚡</span> Structure & Match</button>
        </div>

        <div class="ai-loading-box" id="aiRoleLoading">
          <div class="ai-spinner"></div>
          <div>
            <strong style="color:var(--accent-emerald);">Gemini is structuring requirement...</strong>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">Creating structured specifications & ranking local suppliers.</p>
          </div>
        </div>

        <div class="ai-result-box" id="aiRoleResult"></div>
      </div>
    `;
  } else if (role === 'maker') {
    cardContainer.innerHTML = `
      <div class="ai-role-card">
        <div class="ai-card-header">
          <div class="ai-card-title">🎨 AI Upcycle Studio</div>
          <span class="ai-badge-gemini">✨ Powered by Gemini</span>
        </div>
        <div class="ai-card-subtitle">Turn available raw waste materials into marketable upcycled product ideas.</div>
        
        <div class="ai-demo-presets">
          <label>Try demo raw materials:</label>
          <button class="demo-chip-btn" onclick="setAICardInput('5 old denim jeans and fabric scraps')">👖 Denim & Fabrics</button>
          <button class="demo-chip-btn" onclick="setAICardInput('reclaimed wooden shipping pallets')">🪵 Pallet Wood</button>
          <button class="demo-chip-btn" onclick="setAICardInput('empty glass wine bottles')">🍾 Glass Bottles</button>
        </div>

        <div class="ai-input-group">
          <input type="text" id="aiRoleInput" placeholder="Enter materials you have (e.g. 5 old denim jeans and fabric scraps)...">
          <button class="btn btn-primary" onclick="runMakerAIUpcycle()"><span class="emoji">💡</span> Generate Ideas</button>
        </div>

        <div class="ai-loading-box" id="aiRoleLoading">
          <div class="ai-spinner"></div>
          <div>
            <strong style="color:var(--accent-emerald);">Gemini is inventing products...</strong>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">Crafting 3 upcycled product concepts with titles, descriptions & prices.</p>
          </div>
        </div>

        <div class="ai-result-box" id="aiRoleResult"></div>
      </div>
    `;
  } else if (role === 'buyer') {
    cardContainer.innerHTML = `
      <div class="ai-role-card">
        <div class="ai-card-header">
          <div class="ai-card-title">🛒 AI Product Finder</div>
          <span class="ai-badge-gemini">✨ Powered by Gemini</span>
        </div>
        <div class="ai-card-subtitle">Discover relevant upcycled and sustainable products using natural language.</div>
        
        <div class="ai-demo-presets">
          <label>Try demo queries:</label>
          <button class="demo-chip-btn" onclick="setAICardInput('low-cost study table made from reused wood')">🪑 Wooden Study Table</button>
          <button class="demo-chip-btn" onclick="setAICardInput('upcycled denim tote bag')">👜 Denim Tote Bag</button>
          <button class="demo-chip-btn" onclick="setAICardInput('handcrafted planter from glass')">🪴 Glass Planter</button>
        </div>

        <div class="ai-input-group">
          <input type="text" id="aiRoleInput" placeholder="What are you looking for? (e.g. low-cost study table made from reused wood)...">
          <button class="btn btn-primary" onclick="runBuyerAIFinder()"><span class="emoji">🔍</span> Find Products</button>
        </div>

        <div class="ai-loading-box" id="aiRoleLoading">
          <div class="ai-spinner"></div>
          <div>
            <strong style="color:var(--accent-emerald);">Gemini is analyzing your request...</strong>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">Extracting search criteria & matching local marketplace items.</p>
          </div>
        </div>

        <div class="ai-result-box" id="aiRoleResult"></div>
      </div>
    `;
  }
}

// ─── Role AI Workflows ────────────────────────────────────

async function runIndividualAI() {
  const inputEl = document.getElementById('aiRoleInput');
  const text = (inputEl?.value || '').trim();
  if (!text) {
    showToast('Please enter an item description or select a demo preset.', 'warning');
    return;
  }

  const loadingEl = document.getElementById('aiRoleLoading');
  const resultEl = document.getElementById('aiRoleResult');
  if (loadingEl) loadingEl.style.display = 'flex';
  if (resultEl) resultEl.style.display = 'none';

  const res = await callRoleAI('individual', 'analyze-item', text);
  if (loadingEl) loadingEl.style.display = 'none';

  if (!res || !res.data) {
    if (resultEl) {
      resultEl.innerHTML = `<div style="color:var(--accent-coral);">AI couldn't complete this request right now. Please try again.</div>`;
      resultEl.style.display = 'block';
    }
    return;
  }

  const d = res.data;
  if (resultEl) {
    const jsonStr = JSON.stringify(d).replace(/"/g, '&quot;');
    resultEl.innerHTML = `
      <div class="ai-result-header">
        <span class="ai-result-title">🎯 Recommended Action: <strong>${d.recommendedAction}</strong></span>
        <span class="badge badge-primary">${d.category}</span>
      </div>
      <p style="font-size:0.95rem; color:var(--text-primary); margin-bottom:0.75rem;">${d.reason}</p>
      
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
        <span class="ai-tag-chip">Material: ${d.material}</span>
        <span class="ai-tag-chip">Condition: ${d.condition || 'Good'}</span>
        <span class="ai-tag-chip">Reusability: ${d.reusability || 'High'}</span>
      </div>

      ${d.upcyclingIdeas && d.upcyclingIdeas.length ? `
        <div style="margin-bottom:1rem; font-size:0.9rem; color:var(--text-secondary);">
          <strong>💡 Upcycling Suggestions:</strong> ${d.upcyclingIdeas.join(' • ')}
        </div>
      ` : ''}

      <div style="display:flex; gap:0.75rem; flex-wrap:wrap; border-top:1px solid var(--border-light); padding-top:1rem;">
        <button class="btn btn-primary btn-sm" onclick="prefillListingFromAI(${jsonStr})">📋 Create Listing with AI</button>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('recyclers')">🚚 Find Recyclers</button>
      </div>
    `;
    resultEl.style.display = 'block';
  }
}

async function runRecyclerAIMatch() {
  const inputEl = document.getElementById('aiRoleInput');
  const text = (inputEl?.value || '').trim();
  if (!text) {
    showToast('Please enter a collection request or select a preset.', 'warning');
    return;
  }

  const loadingEl = document.getElementById('aiRoleLoading');
  const resultEl = document.getElementById('aiRoleResult');
  if (loadingEl) loadingEl.style.display = 'flex';
  if (resultEl) resultEl.style.display = 'none';

  const res = await callRoleAI('recycler', 'classify-material', text);
  if (loadingEl) loadingEl.style.display = 'none';

  const d = res.data;
  if (resultEl && d) {
    const matEscaped = (d.likelyMaterial || 'Scrap Material').replace(/'/g, "\\'");
    const textEscaped = text.replace(/'/g, "\\'");
    resultEl.innerHTML = `
      <div class="ai-result-header">
        <span class="ai-result-title">♻️ Likely Material: <strong>${d.likelyMaterial}</strong></span>
        <span class="badge ${d.matchLevel === 'High' ? 'badge-primary' : 'badge-warning'}">Match: ${d.matchLevel || 'High'}</span>
      </div>
      <p style="font-size:0.95rem; color:var(--text-primary); margin-bottom:0.75rem;">${d.reason}</p>
      
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); border-radius:8px; padding:0.75rem; font-size:0.88rem; color:var(--text-secondary); margin-bottom:1rem;">
        💬 <strong>Suggested Response:</strong> "${d.suggestedResponse}"
      </div>

      <div style="display:flex; gap:0.75rem;">
        <button class="btn btn-primary btn-sm" onclick="acceptRecyclerCollectionFromAI('${matEscaped}', '${textEscaped}')">✅ Accept Collection Request</button>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('collection')">📋 View All Requests</button>
      </div>
    `;
    resultEl.style.display = 'block';
  }
}

async function runIndustryAISourcing() {
  const inputEl = document.getElementById('aiRoleInput');
  const text = (inputEl?.value || '').trim();
  if (!text) {
    showToast('Please enter a material requirement or select a preset.', 'warning');
    return;
  }

  const loadingEl = document.getElementById('aiRoleLoading');
  const resultEl = document.getElementById('aiRoleResult');
  if (loadingEl) loadingEl.style.display = 'flex';
  if (resultEl) resultEl.style.display = 'none';

  const res = await callRoleAI('industry', 'structure-material-request', text);
  if (loadingEl) loadingEl.style.display = 'none';

  const d = res.data;
  if (resultEl && d) {
    const matQuery = (d.material + ' ' + (d.keywords || []).join(' ')).toLowerCase();
    const matchedSuppliers = (typeof MOCK_RECYCLERS !== 'undefined' ? MOCK_RECYCLERS : []).filter(r => 
      matQuery.includes(r.materials[0]?.toLowerCase() || '') || r.materials.some(m => matQuery.includes(m.toLowerCase()))
    ).slice(0, 3);
    const supplierList = matchedSuppliers.length ? matchedSuppliers : (typeof MOCK_RECYCLERS !== 'undefined' ? MOCK_RECYCLERS.slice(0, 2) : []);

    const jsonStr = JSON.stringify(d).replace(/"/g, '&quot;');
    resultEl.innerHTML = `
      <div class="ai-result-header">
        <span class="ai-result-title">📋 Structured Requirement: <strong>${d.material}</strong></span>
        <span class="badge badge-primary">${d.quantity}</span>
      </div>
      <p style="font-size:0.95rem; color:var(--text-primary); margin-bottom:0.75rem;">${d.description}</p>

      <div style="margin-bottom:1rem;">
        <h5 style="color:var(--accent-emerald); margin-bottom:0.5rem; font-size:0.9rem;">📍 AI Suggested Local Supplier Matches:</h5>
        <div style="display:grid; gap:0.5rem;">
          ${supplierList.map(s => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid var(--border-light); padding:8px 12px; border-radius:6px; font-size:0.85rem;">
              <div><strong>${s.name}</strong> <span style="color:var(--text-secondary);">(${s.location})</span></div>
              <button class="btn btn-secondary btn-sm" style="padding:2px 8px;" onclick="showToast('Contact request sent to ${s.name}','success')">Contact</button>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display:flex; gap:0.75rem;">
        <button class="btn btn-primary btn-sm" onclick="prefillRequirementFromAI(${jsonStr})">📢 Post Requirement & Edit</button>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('suppliers')">🏢 Browse All Suppliers</button>
      </div>
    `;
    resultEl.style.display = 'block';
  }
}

async function runMakerAIUpcycle() {
  const inputEl = document.getElementById('aiRoleInput');
  const text = (inputEl?.value || '').trim();
  if (!text) {
    showToast('Please enter raw materials or select a preset.', 'warning');
    return;
  }

  const loadingEl = document.getElementById('aiRoleLoading');
  const resultEl = document.getElementById('aiRoleResult');
  if (loadingEl) loadingEl.style.display = 'flex';
  if (resultEl) resultEl.style.display = 'none';

  const res = await callRoleAI('maker', 'upcycle-ideas', text);
  if (loadingEl) loadingEl.style.display = 'none';

  const d = res.data;
  if (resultEl && d && d.ideas) {
    resultEl.innerHTML = `
      <div class="ai-result-header" style="margin-bottom:1rem;">
        <span class="ai-result-title">💡 3 Upcycled Product Concepts for: <em>${d.rawMaterial}</em></span>
      </div>
      <div style="display:grid; gap:0.75rem; margin-bottom:1rem;">
        ${d.ideas.map((idea, idx) => {
          const ideaStr = JSON.stringify(idea).replace(/"/g, '&quot;');
          return `
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); border-radius:8px; padding:1rem; display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;">
              <div style="flex:1; min-width:200px;">
                <div style="font-weight:700; font-size:1rem; color:var(--text-primary); margin-bottom:0.25rem;">${idx + 1}. ${idea.name}</div>
                <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.5rem;">${idea.description}</div>
                <div style="display:flex; gap:0.5rem; font-size:0.8rem;">
                  <span class="badge badge-secondary">${idea.difficulty || 'Easy'}</span>
                  <span style="color:var(--accent-emerald); font-weight:700;">Est: ${idea.estimatedPrice || '৳ 500'}</span>
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="prefillProductFromAI(${ideaStr})">🎨 Create Product with AI</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
    resultEl.style.display = 'block';
  }
}

async function runBuyerAIFinder() {
  const inputEl = document.getElementById('aiRoleInput');
  const text = (inputEl?.value || '').trim();
  if (!text) {
    showToast('Please enter what you are searching for or select a preset.', 'warning');
    return;
  }

  const loadingEl = document.getElementById('aiRoleLoading');
  const resultEl = document.getElementById('aiRoleResult');
  if (loadingEl) loadingEl.style.display = 'flex';
  if (resultEl) resultEl.style.display = 'none';

  const res = await callRoleAI('buyer', 'parse-shopping-request', text);
  if (loadingEl) loadingEl.style.display = 'none';

  const d = res.data;
  if (resultEl && d) {
    const cat = (d.category || 'All').toLowerCase();
    const kw = (d.material + ' ' + (d.keywords || []).join(' ')).toLowerCase();
    let matches = (typeof MOCK_LISTINGS !== 'undefined' ? MOCK_LISTINGS : []).filter(i => {
      if (cat !== 'all' && i.category.toLowerCase() !== cat) return false;
      return (i.title + ' ' + i.description + ' ' + i.material).toLowerCase().includes(kw) || kw.includes(i.category.toLowerCase());
    });

    if (!matches.length) matches = typeof MOCK_LISTINGS !== 'undefined' ? MOCK_LISTINGS.slice(0, 3) : [];

    resultEl.innerHTML = `
      <div class="ai-result-header">
        <span class="ai-result-title">🎯 Search Preferences Extracted:</span>
        <span class="badge badge-primary">Category: ${d.category || 'All'}</span>
      </div>
      <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1rem;">Interpreted: <em>"${d.interpretedNeed}"</em></p>

      <h5 style="color:var(--accent-emerald); margin-bottom:0.75rem; font-size:0.95rem;">🛍️ AI Recommended For You:</h5>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:1rem; margin-bottom:1rem;">
        ${matches.map(i => `
          <div class="card" style="padding:0.75rem; border-radius:8px; cursor:pointer;" onclick="openListingModal(${i.id})">
            <div style="font-size:2rem; text-align:center; padding:0.5rem; background:rgba(255,255,255,0.03); border-radius:6px;">${i.emoji || '📦'}</div>
            <div style="font-weight:700; font-size:0.95rem; margin:0.5rem 0 0.25rem;">${i.title}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
              <span style="color:var(--accent-emerald); font-weight:700;">${i.price === 0 ? 'Free' : i.currency + ' ' + i.price.toLocaleString()}</span>
              <span class="badge badge-secondary">${i.category}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <button class="btn btn-secondary btn-sm" onclick="navigateTo('marketplace')">🛒 View Full Marketplace</button>
    `;
    resultEl.style.display = 'block';
  }
}

// ─── Editable Action Helpers ───────────────────────────────

function prefillListingFromAI(d) {
  openCreateListingModal();
  setTimeout(() => {
    const titleEl = document.getElementById('modalListingTitle');
    const catEl = document.getElementById('modalListingCategory');
    const descEl = document.getElementById('modalListingDesc');
    if (titleEl && d.listingTitle) titleEl.value = d.listingTitle;
    if (catEl && d.category) catEl.value = d.category;
    if (descEl && d.listingDescription) descEl.value = d.listingDescription;
    showToast('Listing pre-filled with AI recommendations. Edit anytime before submitting.', 'info');
  }, 100);
}

function prefillRequirementFromAI(d) {
  showToast(`Requirement for "${d.material}" prepared. Edit details before posting.`, 'success');
  navigateTo('industry_demand');
}

function prefillProductFromAI(idea) {
  if (typeof MOCK_MAKER_PRODUCTS !== 'undefined') {
    MOCK_MAKER_PRODUCTS.unshift({
      id: Date.now(),
      title: idea.name,
      category: idea.category || 'Handmade',
      material: idea.materialsNeeded?.join(', ') || 'Reclaimed Waste',
      price: parseInt((idea.estimatedPrice || '500').replace(/[^0-9]/g, '')),
      status: 'Active',
      emoji: '🎨'
    });
  }
  showToast(`Upcycled product "${idea.name}" generated! Ready for editing.`, 'success');
  navigateTo('myproducts');
}

function acceptRecyclerCollectionFromAI(material, requestText) {
  if (typeof MOCK_COLLECTION_REQUESTS !== 'undefined') {
    MOCK_COLLECTION_REQUESTS.unshift({
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      requester: 'Community User',
      material: material,
      quantity: requestText,
      location: 'Dhaka, Bangladesh',
      date: 'Today',
      status: 'Accepted'
    });
  }
  showToast(`Accepted collection request for ${material}!`, 'success');
  navigateTo('collection');
}

function renderProfile() {
  const profile = MOCK_PROFILES[currentRole];
  if (!profile) return;
  
  const avatarEl = document.getElementById('profileAvatar');
  const nameEl = document.getElementById('profileName');
  const badgeEl = document.getElementById('profileRoleBadge');
  const locEl = document.getElementById('profileLocation');
  const joinedEl = document.getElementById('profileJoined');

  if (avatarEl) avatarEl.textContent = profile.initials;
  if (nameEl) nameEl.textContent = profile.name;
  if (badgeEl) badgeEl.textContent = profile.roleLabel;
  if (locEl) locEl.textContent = `📍 ${profile.location}`;
  if (joinedEl) joinedEl.textContent = `📅 Member since ${profile.memberSince}`;

  const titleEl = document.getElementById('profileStatsTitle');
  if (titleEl) titleEl.textContent = `${profile.roleLabel} Profile & Key Metrics`;

  const grid = document.getElementById('profileStatsGrid');
  if (grid) {
    grid.innerHTML = profile.stats.map(s => `
      <div class="summary-card">
        <h4>${s.label}</h4>
        <div class="val">${s.value}</div>
      </div>
    `).join('');
  }
}

function renderActivity() {
  const profile = MOCK_PROFILES[currentRole];
  if (!profile) return;
  const container = document.getElementById('activityTimeline');
  if (container) {
    container.innerHTML = profile.activities.map(a => `
      <div class="activity-item">
        <div class="activity-icon">${a.icon}</div>
        <div class="activity-content">
          <div class="activity-time">${a.time}</div>
          <div class="activity-desc">${a.action} <span class="activity-detail">${a.detail || a.type}</span></div>
        </div>
      </div>
    `).join('');
  }
}

// Render Collection Requests view
function renderCollection() {
  const container = document.getElementById('collectionContent');
  if (!container) return;

  container.innerHTML = `
    <div class="card" style="margin-bottom:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1rem;">
        <h3>Active Pickup & Collection Requests</h3>
        ${currentRole === 'individual' ? `<button class="btn btn-primary btn-sm" onclick="showToast('New collection request scheduled!', 'success')">➕ Request New Pickup</button>` : ''}
      </div>
      <div class="table-responsive">
        <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.95rem;">
          <thead>
            <tr style="border-bottom:1px solid var(--border-light); color:var(--text-secondary);">
              <th style="padding:0.75rem;">Item</th>
              <th style="padding:0.75rem;">Quantity</th>
              <th style="padding:0.75rem;">Location</th>
              <th style="padding:0.75rem;">Recycler</th>
              <th style="padding:0.75rem;">Status</th>
              <th style="padding:0.75rem;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${MOCK_COLLECTION_REQUESTS.map(req => `
              <tr style="border-bottom:1px solid var(--border-light);">
                <td style="padding:0.75rem; font-weight:600;"><span class="emoji">${req.emoji}</span> ${req.item}</td>
                <td style="padding:0.75rem;">${req.qty}</td>
                <td style="padding:0.75rem;">${req.location}</td>
                <td style="padding:0.75rem; color:var(--accent-emerald);">${req.recycler}</td>
                <td style="padding:0.75rem;">
                  <span class="badge ${req.status==='Completed'?'badge-primary':'badge-secondary'}">${req.status}</span>
                </td>
                <td style="padding:0.75rem;">
                  ${currentRole === 'recycler' && req.status === 'Pending Pickup' 
                    ? `<button class="btn btn-primary btn-sm" onclick="req.status='Accepted'; renderCollection(); showToast('Pickup accepted!', 'success')">Accept</button>`
                    : `<button class="btn btn-secondary btn-sm" onclick="showToast('Collection details opened', 'info')">Details</button>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Render Recycler's Accepted Materials view
function renderMyMaterials() {
  const container = document.getElementById('myMaterialsContent');
  if (!container) return;

  container.innerHTML = `
    <div class="card" style="margin-bottom:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
        <h3>Accepted Waste & Recovery Streams</h3>
        <button class="btn btn-primary btn-sm" onclick="showToast('New material stream added', 'success')">➕ Add Accepted Material</button>
      </div>
      <div class="listings-grid" style="grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));">
        <div class="listing-card card">
          <div class="listing-header"><span class="emoji">🍾</span> <h4>PET Plastic Bottles</h4></div>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin:0.5rem 0;">Min quantity: 5 kg | Clean, sorted</p>
          <span class="badge badge-primary">Active Accepting</span>
        </div>
        <div class="listing-card card">
          <div class="listing-header"><span class="emoji">📦</span> <h4>Cardboard & Paper</h4></div>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin:0.5rem 0;">Min quantity: 10 kg | Baled paper</p>
          <span class="badge badge-primary">Active Accepting</span>
        </div>
        <div class="listing-card card">
          <div class="listing-header"><span class="emoji">⚙️</span> <h4>Aluminum Scrap</h4></div>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin:0.5rem 0;">Min quantity: 20 kg | Cans & sheet</p>
          <span class="badge badge-primary">Active Accepting</span>
        </div>
      </div>
    </div>
  `;
}

// Render Industry Demand & Requirements view
function renderIndustryDemand() {
  const container = document.getElementById('industryDemandContent');
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
      <h3>Sourcing Requirements</h3>
      ${currentRole === 'industry' ? `<button class="btn btn-primary" onclick="openPostRequirementModal()">📢 Post Requirement</button>` : ''}
    </div>
    <div class="listings-grid">
      ${MOCK_INDUSTRY_REQUIREMENTS.map(req => `
        <div class="listing-card card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
            <div>
              <h3 style="margin-bottom:0.25rem;"><span class="emoji">${req.emoji}</span> ${req.material}</h3>
              <small style="color:var(--accent-cyan); font-weight:600;">${req.company}</small>
            </div>
            <span class="badge badge-primary">${req.status}</span>
          </div>
          <p style="color:var(--text-secondary); font-size:0.95rem; margin-bottom:0.75rem;">Seeking: <strong>${req.quantity}</strong> @ <strong>${req.price}</strong></p>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:var(--text-muted);">
            <span>📍 ${req.location}</span>
            <button class="btn btn-secondary btn-sm" onclick="showToast('Inquiry sent to ${req.company}', 'success')">🤝 Offer Supply</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Render Suppliers view
function renderSuppliers() {
  const container = document.getElementById('suppliersContent');
  if (!container) return;

  container.innerHTML = `
    <div class="listings-grid">
      ${MOCK_RECYCLERS.map(rec => `
        <div class="listing-card card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
            <div>
              <h3><span class="emoji">${rec.emoji}</span> ${rec.name}</h3>
              <small style="color:var(--accent-emerald);">📍 ${rec.area}</small>
            </div>
            <span class="badge badge-primary">⭐ ${rec.rating}</span>
          </div>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:0.75rem;">${rec.description}</p>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
            ${rec.materials.map(m => `<span class="badge badge-secondary" style="font-size:0.75rem;">${m}</span>`).join('')}
          </div>
          <button class="btn btn-primary btn-sm" style="width:100%;" onclick="showToast('Connected with ${rec.name}', 'success')">🤝 Connect Supplier</button>
        </div>
      `).join('')}
    </div>
  `;
}

// Render Requests view
function renderRequests() {
  const container = document.getElementById('requestsContent');
  if (!container) return;

  container.innerHTML = `
    <div class="card">
      <h3 style="margin-bottom:1rem;">Incoming Material Inquiries</h3>
      <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Review offers and inquiries from buyers and industry partners.</p>
      <div class="activity-timeline">
        <div class="activity-item">
          <div class="activity-icon">📩</div>
          <div class="activity-content">
            <div class="activity-time">2 hours ago</div>
            <div class="activity-desc">Bulk PET Plastic Offer from <span class="activity-detail">GreenCycle BD</span> (500 kg)</div>
            <button class="btn btn-primary btn-sm" style="margin-top:0.5rem;" onclick="showToast('Offer accepted!', 'success')">Accept Offer</button>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">💬</div>
          <div class="activity-content">
            <div class="activity-time">Yesterday</div>
            <div class="activity-desc">Inquiry regarding <span class="activity-detail">Aluminum Scrap pricing</span></div>
            <button class="btn btn-secondary btn-sm" style="margin-top:0.5rem;" onclick="showToast('Reply sent', 'info')">Reply</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render Maker Products view
function renderMyProducts() {
  const container = document.getElementById('myProductsContent');
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
      <h3>Handmade & Upcycled Catalog</h3>
      <button class="btn btn-primary" onclick="openCreateListingModal()">🎨 Add New Product</button>
    </div>
    <div class="listings-grid">
      ${MOCK_MAKER_PRODUCTS.map(p => `
        <div class="listing-card card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
            <h3><span class="emoji">${p.emoji}</span> ${p.title}</h3>
            <span class="badge badge-primary">৳ ${p.price}</span>
          </div>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:0.75rem;">Category: ${p.category} | Sales: ${p.sales} units</p>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="showToast('Product editing opened', 'info')">✏️ Edit</button>
            <button class="btn btn-secondary btn-sm" onclick="showToast('Product removed', 'info')">🗑️ Remove</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Render Saved Items view
function renderSavedItems() {
  const container = document.getElementById('savedItemsContent');
  if (!container) return;

  container.innerHTML = `
    <div class="listings-grid">
      ${MOCK_SAVED_ITEMS.map(item => `
        <div class="listing-card card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
            <h3><span class="emoji">${item.emoji}</span> ${item.title}</h3>
            <span class="badge badge-primary">৳ ${item.price}</span>
          </div>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:0.75rem;">Seller: ${item.seller} | 📍 ${item.location}</p>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-primary btn-sm" onclick="showToast('Listing opened', 'info')">View Listing</button>
            <button class="btn btn-secondary btn-sm" onclick="showToast('Item removed from saved', 'info')">Unsave</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Render Purchases view
function renderPurchases() {
  const container = document.getElementById('purchasesContent');
  if (!container) return;

  container.innerHTML = `
    <div class="card">
      <h3 style="margin-bottom:1rem;">Your Order History</h3>
      <div class="table-responsive">
        <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.95rem;">
          <thead>
            <tr style="border-bottom:1px solid var(--border-light); color:var(--text-secondary);">
              <th style="padding:0.75rem;">Product</th>
              <th style="padding:0.75rem;">Date</th>
              <th style="padding:0.75rem;">Price</th>
              <th style="padding:0.75rem;">Seller</th>
              <th style="padding:0.75rem;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${MOCK_PURCHASES.map(p => `
              <tr style="border-bottom:1px solid var(--border-light);">
                <td style="padding:0.75rem; font-weight:600;"><span class="emoji">${p.emoji}</span> ${p.title}</td>
                <td style="padding:0.75rem;">${p.date}</td>
                <td style="padding:0.75rem; font-weight:600; color:var(--accent-emerald);">৳ ${p.price}</td>
                <td style="padding:0.75rem;">${p.seller}</td>
                <td style="padding:0.75rem;"><span class="badge badge-primary">${p.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Render Categories view
function renderCategories() {
  const container = document.getElementById('categoriesContent');
  if (!container) return;

  const cats = [
    { name: "Plastic & Polymer", emoji: "🍾", count: "42 items", desc: "PET, HDPE, bottles, containers" },
    { name: "Reclaimed Wood", emoji: "🪑", count: "28 items", desc: "Furniture, pallets, timber scraps" },
    { name: "Textiles & Denim", emoji: "🎒", count: "35 items", desc: "Fabric scraps, old denim, clothes" },
    { name: "Metal Scrap", emoji: "⚙️", count: "19 items", desc: "Aluminum cans, tin, steel wire" },
    { name: "Glass Bottles", emoji: "🫙", count: "14 items", desc: "Glass jars, wine bottles, broken glass" },
    { name: "E-Waste & Electronics", emoji: "💻", count: "22 items", desc: "Phones, circuit boards, cables" },
    { name: "Paper & Cardboard", emoji: "📦", count: "31 items", desc: "Boxes, packaging, newspapers" },
    { name: "Handmade Crafts", emoji: "🎨", count: "50 items", desc: "Upcycled decor, tote bags, art" }
  ];

  container.innerHTML = `
    <div class="listings-grid" style="grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));">
      ${cats.map(c => `
        <div class="listing-card card" style="cursor:pointer;" onclick="navigateTo('marketplace')">
          <div style="font-size:2.5rem; margin-bottom:0.5rem;">${c.emoji}</div>
          <h3>${c.name}</h3>
          <p style="color:var(--accent-emerald); font-size:0.85rem; margin:0.25rem 0;">${c.count}</p>
          <p style="color:var(--text-secondary); font-size:0.85rem;">${c.desc}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// Helper modal for Industry to post material requirement
function openPostRequirementModal() {
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  if (!modalTitle || !modalBody) return;

  modalTitle.textContent = "📢 Post Material Requirement";
  modalBody.innerHTML = `
    <form onsubmit="event.preventDefault(); submitIndustryReq();">
      <div class="form-group" style="margin-bottom:1rem;">
        <label>Material Name</label>
        <input type="text" id="reqMat" required placeholder="e.g. PET Plastic Bottles">
      </div>
      <div class="form-group" style="margin-bottom:1rem;">
        <label>Monthly Quantity Needed</label>
        <input type="text" id="reqQty" required placeholder="e.g. 500 kg/month">
      </div>
      <div class="form-group" style="margin-bottom:1rem;">
        <label>Target Price</label>
        <input type="text" id="reqPrice" required placeholder="e.g. ৳ 45/kg">
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%; margin-top:1rem;">📢 Post Requirement</button>
    </form>
  `;
  document.getElementById('modalOverlay').classList.add('open');
}

function submitIndustryReq() {
  const material = document.getElementById('reqMat').value;
  const quantity = document.getElementById('reqQty').value;
  const price = document.getElementById('reqPrice').value;
  
  MOCK_INDUSTRY_REQUIREMENTS.unshift({
    id: Date.now(),
    company: MOCK_PROFILES.industry.name,
    material,
    quantity,
    price,
    location: MOCK_PROFILES.industry.location,
    status: "Actively Sourcing",
    emoji: "🏭"
  });

  closeModal();
  renderIndustryDemand();
  showToast('Material requirement posted!', 'success');
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

// Generate SVG Circuit Background
function generateCircuit() {
  const container = document.getElementById('floatingSquares');
  if (!container) return;
  container.innerHTML = '';
  
  // Set up SVG container
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 1920 1080');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.opacity = '0.6';
  
  // Parallax wrapper for SVG
  const wrapper = document.createElement('div');
  wrapper.className = 'circuit-parallax-wrapper';
  wrapper.style.width = '100%';
  wrapper.style.height = '100%';
  wrapper.style.position = 'absolute';
  wrapper.appendChild(svg);
  container.appendChild(wrapper);

  // Network Definitions
  const paths = [
    { d: "M -100 200 L 300 200 L 300 500 L 700 500 L 700 800 L 1000 800", color: "var(--accent-emerald)", dur: "12s" },
    { d: "M 1920 150 L 1400 150 L 1400 400 L 1000 400", color: "var(--accent-cyan)", dur: "10s" },
    { d: "M 500 -100 L 500 350 L 100 350", color: "rgba(255,255,255,0.4)", dur: "8s" },
    { d: "M 2020 850 L 1600 850 L 1600 600 L 1200 600 L 1200 1000 L 800 1000", color: "var(--accent-indigo)", dur: "15s" },
    { d: "M 800 0 L 800 250 L 1150 250 L 1150 150", color: "var(--accent-emerald)", dur: "9s" },
    { d: "M 0 900 L 400 900 L 400 700 L 800 700", color: "var(--accent-cyan)", dur: "11s" },
    { d: "M 1500 1180 L 1500 900 L 1800 900", color: "rgba(255,255,255,0.4)", dur: "7s" }
  ];

  const boxes = [
    { x: 300, y: 170, w: 100, h: 60, text: "AI", color: "var(--accent-emerald)" },
    { x: 1400, y: 120, w: 140, h: 60, text: "RECYCLE", color: "var(--accent-cyan)" },
    { x: 700, y: 470, w: 120, h: 60, text: "MAKER", color: "var(--accent-indigo)" },
    { x: 1600, y: 820, w: 140, h: 60, text: "INDUSTRY", color: "var(--accent-emerald)" },
    { x: 400, y: 870, w: 120, h: 60, text: "BUYER", color: "var(--accent-cyan)" }
  ];

  const nodes = [
    { x: 300, y: 200 }, { x: 300, y: 500 }, { x: 700, y: 500 }, { x: 700, y: 800 },
    { x: 1400, y: 150 }, { x: 1400, y: 400 }, { x: 1000, y: 400 },
    { x: 500, y: 350 }, { x: 1600, y: 850 }, { x: 1600, y: 600 },
    { x: 1200, y: 600 }, { x: 1200, y: 1000 }, { x: 800, y: 250 },
    { x: 1150, y: 250 }, { x: 400, y: 900 }, { x: 400, y: 700 },
    { x: 1500, y: 900 }
  ];

  // Draw Paths
  paths.forEach((p, i) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', p.d);
    path.setAttribute('id', `circuit-path-${i}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(255, 255, 255, 0.04)');
    path.setAttribute('stroke-width', '2');
    svg.appendChild(path);

    // Glowing Particle
    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particle.setAttribute('r', '3');
    particle.setAttribute('fill', p.color);
    particle.setAttribute('filter', 'drop-shadow(0 0 5px ' + p.color + ')');
    
    const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
    animateMotion.setAttribute('dur', p.dur);
    animateMotion.setAttribute('repeatCount', 'indefinite');
    
    const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
    mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#circuit-path-${i}`);
    
    animateMotion.appendChild(mpath);
    particle.appendChild(animateMotion);
    svg.appendChild(particle);
  });

  // Draw Boxes
  boxes.forEach(b => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', b.x - b.w/2);
    rect.setAttribute('y', b.y - b.h/2);
    rect.setAttribute('width', b.w);
    rect.setAttribute('height', b.h);
    rect.setAttribute('fill', 'rgba(17, 24, 39, 0.8)');
    rect.setAttribute('stroke', b.color);
    rect.setAttribute('stroke-width', '1');
    rect.setAttribute('rx', '4');
    svg.appendChild(rect);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', b.x);
    text.setAttribute('y', b.y + 4); // center alignment adjustment
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', b.color);
    text.setAttribute('font-size', '12px');
    text.setAttribute('font-weight', '600');
    text.setAttribute('letter-spacing', '2px');
    text.textContent = b.text;
    svg.appendChild(text);
  });

  // Draw Nodes
  nodes.forEach(n => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', n.x);
    circle.setAttribute('cy', n.y);
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', 'var(--bg-card)');
    circle.setAttribute('stroke', 'rgba(255,255,255,0.2)');
    circle.setAttribute('stroke-width', '1.5');
    svg.appendChild(circle);
  });

  // Mouse and Scroll tracking for Parallax
  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });
  
  function updateParallax() {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;
    
    wrapper.style.transform = `translate3d(${currentX * 30}px, ${currentY * 30 - window.scrollY * 0.15}px, 0)`;
    requestAnimationFrame(updateParallax);
  }
  
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    updateParallax();
  }
}
generateCircuit();
