const $ = (s) => document.querySelector(s);
const config = window.FORME_CONFIG;
const read = (key, fallback) => {try{return JSON.parse(localStorage.getItem(`forme-${key}`)) ?? fallback;}catch{return fallback;}};
let products=[], cart=read('cart',{}), wishlist=read('wishlist',[]);
let role='User', category='All', wishlistOnly=false, toastTimer, uploadedUrl='';
let session=read('session',null), backendUsers=[], backendOrders=[];
const demoUsers=[
  {name:'Pranita Sharma',email:'pranita@example.com',role:'User'},
  {name:'Riya Seller',email:'seller@example.com',role:'Sales Person'},
  {name:'Admin Team',email:'admin@example.com',role:'Admin'}
];
const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
const escapeHtml = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const emailPattern = '[^\\s@]+@[^\\s@]+\\.[^\\s@]+';
const apiBase = () => (config.apiBaseUrl || 'http://localhost:5000').replace(/\/$/,'');
const uiRole = r => r==='admin'?'Admin':r==='sales'?'Sales Person':'User';
const apiRole = r => r==='Admin'?'admin':r==='Sales Person'?'sales':'user';
const authHeaders = () => session?.token ? {Authorization:`Bearer ${session.token}`} : {};
async function api(path, options={}){
  const res=await fetch(`${apiBase()}${path}`,{...options,headers:{'Content-Type':'application/json',...(options.headers||{}),...authHeaders()}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.message||'Request failed');
  return data;
}
function save(){localStorage.setItem('forme-cart',JSON.stringify(cart));localStorage.setItem('forme-wishlist',JSON.stringify(wishlist));localStorage.setItem('forme-products',JSON.stringify(products));updateCounts();}
function saveSession(value){session=value;value?localStorage.setItem('forme-session',JSON.stringify(value)):localStorage.removeItem('forme-session');role=value?.user?uiRole(value.user.role):'User';updateLoginButton();}
function updateLoginButton(){const b=$('#login-button');if(!b)return;b.textContent=session?.user?`${session.user.name}  ${uiRole(session.user.role)}`:'Login';}
function toast(message){$('#toast').textContent=message;$('#toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.display='none',3200);}
function showQuickCheckout(productId){
  const product=products.find(p=>p.id===productId);
  const bar=$('#quick-checkout');
  $('#quick-item').textContent=product?product.name:'Ready for checkout';
  bar.classList.add('show');
}
function hideQuickCheckout(){$('#quick-checkout')?.classList.remove('show');}
function updateCounts(){$('#cart-count').textContent=Object.values(cart).reduce((a,b)=>a+b,0);$('#wish-count').textContent=wishlist.length;}
function safeImage(url){try{const u=new URL(url);return u.protocol==='https:'&&u.hostname==='res.cloudinary.com'?u.href:'';}catch{return '';}}
function applyCartState(data){
  cart={};
  (data?.items||[]).forEach(item=>{
    if(item.product?.id)cart[String(item.product.id)]=item.quantity;
  });
  localStorage.setItem('forme-cart',JSON.stringify(cart));
  updateCounts();
}
function applyWishlistState(data){
  wishlist=(data?.products||[]).map(p=>String(p.id));
  localStorage.setItem('forme-wishlist',JSON.stringify(wishlist));
  updateCounts();
}
async function loadCart(){
  if(!session)return;
  const data=await api('/cart');
  applyCartState(data.cart);
}
async function loadWishlist(){
  if(!session)return;
  const data=await api('/wishlist');
  applyWishlistState(data.wishlist);
}
async function refreshUserCollections(){
  if(!session)return;
  try{await Promise.all([loadCart(),loadWishlist()]);}catch(error){toast(error.message);}
}
async function loadProducts(){
  try{
    const data=await api('/products');
    products=(data.products||[]).map(p=>({...p,id:p.id,owner:p.sellerId||'seller'}));
    localStorage.removeItem('forme-products');
  }catch{}
}
async function loadUsers(){
  if(!session||session.user.role!=='admin'){backendUsers=[];return;}
  try{backendUsers=(await api('/users')).users||[];}catch(error){toast(error.message);}
}
async function loadOrders(){
  if(!session){backendOrders=[];return;}
  try{backendOrders=(await api('/orders')).orders||[];}catch(error){backendOrders=[];toast(error.message);}
}
function render(){
  $('#categories').innerHTML=['All','Home & Living','Accessories','Lifestyle'].map(c=>`<button data-category="${c}" class="${category===c?'active':''}" aria-pressed="${category===c}">${c}</button>`).join('');
  let result=products.filter(p=>(category==='All'||p.category===category)&&`${p.name} ${p.category}`.toLowerCase().includes($('#search').value.toLowerCase())&&p.price<=Number($('#max-price').value)&&(!wishlistOnly||wishlist.includes(p.id)));
  const sort=$('#sort').value;if(sort==='low')result.sort((a,b)=>a.price-b.price);if(sort==='high')result.sort((a,b)=>b.price-a.price);if(sort==='name')result.sort((a,b)=>a.name.localeCompare(b.name));
  $('#result-label').textContent=`${wishlistOnly?'Wishlist  ':''}${result.length} objects`;
  $('#products').innerHTML=result.length?result.map(p=>`<article class="product-card"><div class="product-photo"><img src="${escapeHtml(safeImage(p.imageUrl))}" alt="${escapeHtml(p.name)}" loading="lazy">${p.badge?`<span class="badge">${escapeHtml(p.badge)}</span>`:''}<button class="heart ${wishlist.includes(p.id)?'selected':''}" data-wish="${p.id}" aria-label="${wishlist.includes(p.id)?'Remove from':'Add to'} wishlist: ${escapeHtml(p.name)}" aria-pressed="${wishlist.includes(p.id)}">${wishlist.includes(p.id)?'♥':'♡'}</button><button class="card-buy-now" data-buy-now="${p.id}">Buy now</button></div><div class="product-meta"><div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category)}</p></div><span class="price">${money(p.price)}</span></div><button class="add-cart" data-add="${p.id}">Add to bag <span>+</span></button></article>`).join(''):'<p class="empty">No products yet. Login as Admin or Sales Person and add products with Cloudinary.</p>';
  updateCounts();
}
function openPanel(title,html){$('#panel-title').textContent=title;$('#panel-content').innerHTML=html;if(!$('#panel').open)$('#panel').showModal();}
function showCart(){const entries=products.filter(p=>cart[p.id]);const total=entries.reduce((sum,p)=>sum+p.price*cart[p.id],0);
  openPanel('Your bag',entries.length?entries.map(p=>`<div class="cart-row"><img src="${escapeHtml(safeImage(p.imageUrl))}" alt="${escapeHtml(p.name)}"><div class="row-info"><h3>${escapeHtml(p.name)}</h3><p>${money(p.price)}</p><button class="remove" data-remove="${p.id}">Remove</button></div><div class="quantity"><button data-quantity="${p.id}" data-change="-1" aria-label="Decrease quantity">-</button><span>${cart[p.id]}</span><button data-quantity="${p.id}" data-change="1" aria-label="Increase quantity">+</button></div></div>`).join('')+`<div class="total"><span>Subtotal</span><strong>${money(total)}</strong></div><button class="button dark full" id="checkout">Buy now -></button><p class="hint">Secure checkout opens with Razorpay test mode after you login.</p>`:'<p class="empty">Your bag is waiting for something good.</p><button class="button dark full" id="continue-shopping">Explore the collection</button>');
}
function showAccount(){openPanel('Welcome to Pranita',session?`<p class="hint">Logged in as ${escapeHtml(session.user.email)} (${escapeHtml(uiRole(session.user.role))})</p><div class="role-options">${['User','Sales Person','Admin'].map(r=>`<button data-role="${r}"><strong>${r}${role===r?'  Active':''}</strong><span>${r==='User'?'Orders, wishlist and bag':r==='Admin'?'Users, sales people, products and orders':'Your products and related orders'}</span></button>`).join('')}</div><button class="button dark full" id="open-panel">Open panel</button><button class="button full" id="logout-button">Logout</button>`:`<div class="field-row"><button id="sign-in" class="button dark">Sign in</button><button id="register" class="button">Create account</button></div>`);}
function authForm(register=false){openPanel(register?'Create account':'Login',`<form id="auth-form" data-mode="${register?'register':'login'}">${register?'<label>Your name<input name="name" autocomplete="name" required placeholder="Pranita"></label>':''}<label>Email address<input type="email" name="email" autocomplete="email" pattern="${emailPattern}" required placeholder="pranita12@gmail.com"></label><label>Password<input type="password" name="password" autocomplete="${register?'new-password':'current-password'}" minlength="8" required placeholder="At least 8 characters"></label><button class="button dark full" type="submit">${register?'Create account':'Login'} </button><p class="hint">${register?'New users register as User accounts. Already used emails cannot be registered again.':'Login with your registered email and password.'}</p></form>`);}
window.handleLoginClick = () => {
  if (session) {
    showAccount();
  } else {
    authForm(false);
  }
};
function orderTable(){
  const rows=backendOrders.map(o=>`<tr><td>${escapeHtml(String(o.id).slice(-6).toUpperCase())}</td><td>${money(o.totalAmount)}</td><td>${escapeHtml(o.paymentStatus)}</td><td>${(o.items||[]).map(i=>escapeHtml(i.name)).join(', ')}</td></tr>`).join('');
  return rows?`<h2>Orders</h2><div class="table-wrap"><table><thead><tr><th>ORDER</th><th>TOTAL</th><th>PAYMENT</th><th>ITEMS</th></tr></thead><tbody>${rows}</tbody></table></div>`:'';
}
async function showDashboard(openView=true){if(!session)return;await Promise.all([loadUsers(),loadOrders()]);const own=role==='Admin'?products:products.filter(p=>String(p.sellerId)===String(session?.user?.id)),bagItems=Object.values(cart).reduce((a,b)=>a+b,0),orderSales=backendOrders.reduce((sum,o)=>sum+Number(o.totalAmount||0),0);
  const stats=(role==='User'?[['Wishlist',wishlist.length],['Bag items',bagItems],['Orders',backendOrders.length]]:role==='Admin'?[['Users',backendUsers.length],['Sales people',backendUsers.filter(u=>u.role==='sales').length],['Orders',backendOrders.length]]:[['Your products',own.length],['Orders',backendOrders.length],['Sales',money(orderSales)]]).map(([k,v])=>`<div class="stat"><span>${k}</span><strong>${v}</strong></div>`).join('');
  const title=role==='User'?'User panel':role==='Admin'?'Admin panel':'Sales person panel';
  if(role==='User'){if(openView)openPanel(title,`<div class="stats">${stats}</div>${orderTable()}<p class="hint">Your wishlist, bag, and orders are saved after login.</p>`);return;}
  const productRows=own.map(p=>`<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.category)}</td><td>${role==='Admin'?escapeHtml(String(p.sellerId||'Seller')):'You'}</td><td>${money(p.price)}</td><td><button data-edit="${p.id}">Edit</button><button data-delete="${p.id}">Delete</button></td></tr>`).join('');
  const userRows=backendUsers.map(u=>`<tr><td>${escapeHtml(u.name)}</td><td>${escapeHtml(u.email)}</td><td>${escapeHtml(uiRole(u.role))}</td><td>${u.role!=='admin'?`<button data-set-role="${u.id}" data-next-role="${u.role==='sales'?'user':'sales'}">${u.role==='sales'?'Make User':'Make Sales'}</button>`:'Admin'}</td></tr>`).join('');
  const content=role==='Admin'?`<div class="stats">${stats}</div><p class="hint">Admin panel: handle user and sales person login data, roles, and all products added by sales people.</p><div class="field-row"><button class="button dark" id="add-sales-person">Add Sales Person +</button><button class="button" id="add-product">Add product +</button></div><h2>Login data</h2><div class="table-wrap"><table><thead><tr><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>ACTION</th></tr></thead><tbody>${userRows}</tbody></table></div>${orderTable()}<h2>All seller products</h2><div class="table-wrap"><table><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>OWNER</th><th>PRICE</th><th>ACTIONS</th></tr></thead><tbody>${productRows}</tbody></table></div>`:`<div class="stats">${stats}</div><p class="hint">Sales person panel: add products and manage only your own listed items.</p><button class="button dark full" id="add-product">Add product +</button>${orderTable()}<div class="table-wrap"><table><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>OWNER</th><th>PRICE</th><th>ACTIONS</th></tr></thead><tbody>${productRows}</tbody></table></div>`;
  if(openView)openPanel(title,content);
}
function salesPersonForm(){openPanel('Add Sales Person',`<form id="sales-person-form"><label>Name<input name="name" required maxlength="80" placeholder="Sales person name"></label><label>Email address<input type="email" name="email" pattern="${emailPattern}" required autocomplete="email" placeholder="seller12@gmail.com"></label><label>Password<input type="password" name="password" minlength="8" required autocomplete="new-password" placeholder="At least 8 characters"></label><button class="button dark full" type="submit">Create sales login <span>-></span></button><p class="hint">This creates a Sales Person account. Already used emails cannot be registered again.</p></form>`);}
function productForm(id){const p=products.find(p=>p.id===id);uploadedUrl=p?.imageUrl||'';openPanel(p?'Edit object':'Add an object',`<form id="product-form" data-id="${p?.id||''}"><label>Product name<input name="name" required maxlength="80" value="${escapeHtml(p?.name||'')}" placeholder="The Everyday Carry"></label><div class="field-row"><label>Category<select name="category">${['Home & Living','Accessories','Lifestyle'].map(c=>`<option ${p?.category===c?'selected':''}>${c}</option>`).join('')}</select></label><label>Price (Rs)<input type="number" name="price" min="1" max="12000" step="1" required value="${p?.price||''}"></label></div><label>Product image<button type="button" id="upload-image">Upload through Cloudinary</button></label><div id="upload-preview">${uploadedUrl?`<img class="uploaded-preview" src="${escapeHtml(safeImage(uploadedUrl))}" alt="Product preview">`:'<p class="hint">Images upload directly to Cloudinary using a backend signature. Only the returned secure URL is saved.</p>'}</div><button class="button dark full" type="submit">Save product <span>+</span></button><p class="hint">Only Admin and Sales Person accounts can upload and save products.</p></form>`);}
async function chooseImageFile(){
  return new Promise(resolve=>{
    const input=document.createElement('input');
    input.type='file';
    input.accept='image/png,image/jpeg,image/webp';
    input.onchange=()=>resolve(input.files?.[0]||null);
    input.click();
  });
}
async function uploadImage(){
  if(!session||!['admin','sales'].includes(session.user.role)){toast('Login as Admin or Sales Person first.');return;}
  const file=await chooseImageFile();
  if(!file)return;
  if(file.size>5*1024*1024){toast('Choose an image under 5 MB.');return;}
  const button=$('#upload-image');button.disabled=true;button.textContent='Uploading...';
  try{
    const signed=await api('/uploads/sign',{method:'POST',body:JSON.stringify({})});
    const data=new FormData();
    data.append('file',file);
    data.append('api_key',signed.apiKey);
    data.append('timestamp',signed.timestamp);
    data.append('folder',signed.folder);
    data.append('signature',signed.signature);
    const res=await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,{method:'POST',body:data});
    const uploaded=await res.json();
    if(!res.ok)throw new Error(uploaded.error?.message||'Cloudinary upload failed');
    uploadedUrl=safeImage(uploaded.secure_url);
    if(!uploadedUrl)throw new Error('Cloudinary did not return a valid secure image URL');
    $('#upload-preview').innerHTML=`<img class="uploaded-preview" src="${escapeHtml(uploadedUrl)}" alt="Uploaded product preview">`;
    toast('Image uploaded to Cloudinary.');
  }catch(error){toast(error.message);}finally{button.disabled=false;button.textContent='Upload through Cloudinary';}
}
async function addToCart(id,showQuick=true){
  try{
    if(session){
      const data=await api('/cart',{method:'POST',body:JSON.stringify({productId:id,quantity:1})});
      applyCartState(data.cart);
    }else{
      cart[id]=(cart[id]||0)+1;
      save();
    }
    toast('Added to your bag.');
    if(showQuick)showQuickCheckout(id);
  }catch(error){toast(error.message);}
}
async function buyNowFromCard(id){
  if(!session){authForm(false);return;}
  await addToCart(id,false);
  await checkoutFromCart();
}
async function toggleWishlist(id){
  try{
    if(session){
      const selected=wishlist.includes(id);
      const data=await api(`/wishlist/${id}`,{method:selected?'DELETE':'POST'});
      applyWishlistState(data.wishlist);
    }else{
      wishlist=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id];
      save();
    }
    render();
  }catch(error){toast(error.message);}
}
async function changeCartQuantity(id,change){
  try{
    const next=(cart[id]||0)+Number(change);
    if(session){
      const data=next>0
        ? await api(`/cart/${id}`,{method:'PATCH',body:JSON.stringify({quantity:next})})
        : await api(`/cart/${id}`,{method:'DELETE'});
      applyCartState(data.cart);
    }else{
      cart[id]=next;
      if(cart[id]<=0)delete cart[id];
      save();
    }
    showCart();
  }catch(error){toast(error.message);}
}
async function removeCartItem(id){
  try{
    if(session){
      const data=await api(`/cart/${id}`,{method:'DELETE'});
      applyCartState(data.cart);
    }else{
      delete cart[id];
      save();
    }
    showCart();
  }catch(error){toast(error.message);}
}
async function checkoutFromCart(){
  if(!session){authForm(false);return;}
  try{
    hideQuickCheckout();
    const data=await api('/orders/from-cart',{method:'POST',body:JSON.stringify({})});
    const order=data.order;
    const razorpay=data.razorpay;
    if(!window.Razorpay)throw new Error('Razorpay checkout script is still loading. Refresh once and try again.');
    const checkout=new window.Razorpay({
      key: razorpay.keyId,
      amount: razorpay.amount,
      currency: razorpay.currency,
      name: 'Pranita',
      description: 'Order payment',
      order_id: razorpay.orderId,
      prefill: {
        name: session.user.name,
        email: session.user.email
      },
      theme: { color: '#8d6bff' },
      handler: async response => {
        try{
          const verified=await api(`/orders/${order.id}/verify-payment`,{method:'POST',body:JSON.stringify(response)});
          await loadCart();
          await loadOrders();
          render();
          openPanel('Payment complete',`<p>Your payment is successful.</p><p class="hint">Order ${escapeHtml(String(verified.order.id).slice(-6).toUpperCase())} is marked paid.</p><button class="button dark full" id="continue-shopping">Continue shopping <span>-></span></button>`);
          toast('Payment verified.');
        }catch(error){toast(error.message);}
      },
      modal: {
        ondismiss: () => toast('Payment cancelled.')
      }
    });
    checkout.open();
    $('#panel').close();
  }catch(error){toast(error.message);}
}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.category){category=b.dataset.category;wishlistOnly=false;render();}
  if(b.dataset.add){await addToCart(b.dataset.add);}
  if(b.dataset.buyNow){await buyNowFromCard(b.dataset.buyNow);}
  if(b.dataset.wish){await toggleWishlist(b.dataset.wish);}
  if(b.dataset.quantity){await changeCartQuantity(b.dataset.quantity,b.dataset.change);}
  if(b.dataset.remove){await removeCartItem(b.dataset.remove);}
  if(b.dataset.role){if(!session){authForm(false);return;}const wanted=apiRole(b.dataset.role);if(session.user.role!==wanted&&session.user.role!=='admin'){toast('Login with that role first.');return;}role=b.dataset.role;showDashboard();}
  if(b.dataset.setRole){api(`/users/${b.dataset.setRole}/role`,{method:'PATCH',body:JSON.stringify({role:b.dataset.nextRole})}).then(()=>showDashboard(false)).then(()=>toast('Role updated.')).catch(err=>toast(err.message));}
  if(b.dataset.edit&&role!=='User')productForm(b.dataset.edit);
  if(b.dataset.delete&&role!=='User'){
    const p=products.find(x=>x.id===b.dataset.delete);
    if(!p)return;
    if(role!=='Admin'&&String(p.sellerId)!==String(session?.user?.id)){toast('Sales person can delete only their own products.');return;}
    openPanel('Delete this product?',`<p>Remove ${escapeHtml(p.name)} from the shop collection?</p><button class="button dark full" data-confirm-delete="${p.id}">Delete product</button>`);
  }
  if(b.dataset.confirmDelete){
    const id=b.dataset.confirmDelete,p=products.find(x=>x.id===id);
    if(!p||role==='User'||(role!=='Admin'&&String(p.sellerId)!==String(session?.user?.id)))return;
    try{
      await api(`/products/${id}`,{method:'DELETE'});
      await loadProducts();
      delete cart[id];
      wishlist=wishlist.filter(x=>x!==id);
      save();
      render();
      $('#panel').close();
      await showDashboard();
      toast('Product deleted.');
    }catch(error){toast(error.message);}
  }
  if(b.classList.contains('close')||b.id==='continue-shopping')$('#panel').close();
  if(b.id==='cart-button')showCart();if(b.id==='login-button'){session?showAccount():authForm(false);}if(b.id==='logout-button'){saveSession(null);backendOrders=[];backendUsers=[];$('#panel').close();toast('Logged out.');}if(b.id==='open-panel')showDashboard();if(b.id==='add-product'&&role!=='User')productForm();if(b.id==='upload-image')uploadImage();
  if(b.id==='quick-buy')await checkoutFromCart();if(b.id==='quick-close')hideQuickCheckout();
  if(b.id==='sign-in')authForm(false);if(b.id==='register')authForm(true);if(b.id==='add-sales-person')salesPersonForm();
  if(b.id==='wish-button'){wishlistOnly=!wishlistOnly;render();$('#shop').scrollIntoView({behavior:'smooth'});}
  if(b.id==='filter-button'){$('#filters').hidden=!$('#filters').hidden;b.setAttribute('aria-expanded',String(!$('#filters').hidden));}
  if(b.id==='reset-filters'){category='All';wishlistOnly=false;$('#max-price').value=12000;$('#price-label').textContent=money(12000);$('#search').value='';$('#sort').value='featured';render();}
  if(b.id==='checkout')await checkoutFromCart();
});
document.addEventListener('submit',async e=>{if(e.target.id==='sales-person-form'){e.preventDefault();const f=new FormData(e.target);try{await api('/users/sales',{method:'POST',body:JSON.stringify({name:f.get('name'),email:f.get('email'),password:f.get('password')})});await loadUsers();$('#panel').close();await showDashboard(false);toast('Sales person login created.');}catch(err){toast(err.message);}return;}if(e.target.id==='auth-form'){e.preventDefault();const f=new FormData(e.target),mode=e.target.dataset.mode;try{const data=await api(`/auth/${mode}`,{method:'POST',body:JSON.stringify({name:f.get('name'),email:f.get('email'),password:f.get('password')})});saveSession(data);await refreshUserCollections();$('#panel').close();await showDashboard();render();toast(`Logged in as ${uiRole(data.user.role)}.`);}catch(err){toast(err.message);}return;}if(e.target.id!=='product-form')return;e.preventDefault();if(role==='User')return;if(!uploadedUrl)return toast('Upload a product image through Cloudinary first.');const f=new FormData(e.target),id=e.target.dataset.id,old=products.find(p=>p.id===id);const payload={name:f.get('name').trim(),category:f.get('category'),price:Number(f.get('price')),imageUrl:uploadedUrl};if(!payload.name||payload.price<1||payload.price>12000)return toast('Enter a valid name and price.');try{const data=await api(id?`/products/${id}`:'/products',{method:id?'PATCH':'POST',body:JSON.stringify(payload)});await loadProducts();render();$('#panel').close();showDashboard(false);toast('Product saved.');}catch(err){toast(err.message);}});
$('#search').addEventListener('input',render);$('#sort').addEventListener('change',render);$('#max-price').addEventListener('input',()=>{$('#price-label').textContent=money(Number($('#max-price').value));render();});
$('#panel').addEventListener('click',e=>{if(e.target===$('#panel')){const r=$('#panel').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#panel').close();}});
let sparkleTick=0;
document.addEventListener('pointermove',e=>{
  const glow=$('.cursor-glow');
  if(glow){glow.style.left=`${e.clientX}px`;glow.style.top=`${e.clientY}px`;}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(++sparkleTick%3)return;
  const s=document.createElement('span');
  s.className='cursor-sparkle';
  s.style.left=`${e.clientX}px`;
  s.style.top=`${e.clientY}px`;
  s.style.setProperty('--dx',`${(Math.random()-.5)*52}px`);
  s.style.setProperty('--dy',`${(Math.random()-.5)*52}px`);
  document.body.append(s);
  setTimeout(()=>s.remove(),760);
});
saveSession(session);loadProducts().then(refreshUserCollections).then(()=>{render();showDashboard(false);});



