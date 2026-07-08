const Cart = (() => {

    const KEY = "importhub_cart";

    function get() {
        return JSON.parse(localStorage.getItem(KEY) || "[]");
    }

    function save(cart) {
        localStorage.setItem(KEY, JSON.stringify(cart));
        updateBadge();
        renderDrawer();
        window.dispatchEvent(new CustomEvent("cart_updated"));
    }

    function add(product) {

        let cart = get();

        const found = cart.find(i => i.id == product.id);

        if (found) {

            found.qty++;

        } else {

            cart.push({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                image: product.img || "",
                emoji: product.emoji || "",
                qty: 1
            });

        }

        save(cart);
        showToast(product.name + ' added to cart');

    }

    function showToast(msg){
        let t = document.getElementById('cart-toast');
        if(!t){
            t = document.createElement('div');
            t.id = 'cart-toast';
            t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#1a1612;color:#fff;padding:12px 22px;border-radius:50px;font-size:.85rem;font-weight:600;z-index:9999;opacity:0;transition:.3s;box-shadow:0 8px 24px rgba(0,0,0,.25);pointer-events:none;';
            document.body.appendChild(t);
        }
        t.textContent = '🛒 ' + msg;
        t.style.opacity = '1';
        t.style.transform = 'translateX(-50%) translateY(0)';
        clearTimeout(t._hideTimer);
        t._hideTimer = setTimeout(()=>{
            t.style.opacity = '0';
            t.style.transform = 'translateX(-50%) translateY(20px)';
        }, 1800);
    }

    function remove(id){

        let cart=get().filter(x=>x.id!=id);

        save(cart);

    }

    function qty(id,value){

        let cart=get();

        const item=cart.find(x=>x.id==id);

        if(!item) return;

        item.qty=value;

        if(item.qty<=0){

            remove(id);

            return;

        }

        save(cart);

    }

    function total(){

        return get().reduce((a,b)=>a+b.price*b.qty,0);

    }

    function count(){

        return get().reduce((a,b)=>a+b.qty,0);

    }

    function clear(){

        save([]);

    }

    function updateBadge(){

        document.querySelectorAll(".cart-count").forEach(x=>{

            x.innerHTML=count();

        });

    }

    // ══════════════════════════════════════════════
    // SIDE CART DRAWER
    // ══════════════════════════════════════════════
    function ensureDrawer(){
        if (document.getElementById('cartDrawerRoot')) return;

        const style = document.createElement('style');
        style.id = 'cart-drawer-styles';
        style.textContent = `
        #cartDrawerOverlay{position:fixed;inset:0;background:rgba(15,20,25,.45);z-index:998;opacity:0;pointer-events:none;transition:opacity .3s;}
        #cartDrawerOverlay.open{opacity:1;pointer-events:auto;}
        #cartDrawerPanel{position:fixed;top:0;right:0;bottom:0;width:400px;max-width:92vw;background:#fff;z-index:999;box-shadow:-8px 0 40px rgba(0,0,0,.18);transform:translateX(100%);transition:transform .32s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;font-family:'Inter','Plus Jakarta Sans',sans-serif;}
        #cartDrawerPanel.open{transform:translateX(0);}
        .cd-head{padding:22px 22px 16px;border-bottom:1px solid #eee;}
        .cd-head-row{display:flex;align-items:center;justify-content:space-between;}
        .cd-title{font-size:1.15rem;font-weight:800;color:#1a1612;display:flex;align-items:center;gap:8px;}
        .cd-sub{font-size:.82rem;color:#8892a8;margin-top:4px;}
        .cd-close{width:36px;height:36px;border-radius:50%;background:#f2f0ec;border:none;cursor:pointer;font-size:1rem;color:#1a1612;flex-shrink:0;}
        .cd-close:hover{background:#e8e4dc;}
        .cd-body{flex:1;overflow-y:auto;padding:18px 22px;}
        .cd-empty{text-align:center;padding:70px 10px;color:#8892a8;}
        .cd-empty .cd-emoji{font-size:3.2rem;margin-bottom:16px;display:block;}
        .cd-empty .cd-e1{font-weight:700;color:#1a1612;margin-bottom:6px;font-size:1rem;}
        .cd-empty .cd-e2{font-size:.86rem;}
        .cd-line{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid #f2f0ec;}
        .cd-thumb{width:56px;height:56px;border-radius:10px;background:#f5f3ee;display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0;object-fit:contain;overflow:hidden;}
        .cd-thumb img{width:100%;height:100%;object-fit:contain;}
        .cd-info{flex:1;min-width:0;}
        .cd-name{font-weight:700;font-size:.9rem;color:#1a1612;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .cd-price{font-size:.82rem;color:#8892a8;margin-bottom:8px;}
        .cd-qty{display:flex;align-items:center;gap:8px;}
        .cd-qty button{width:26px;height:26px;border:1px solid #e0e0e0;background:#fff;border-radius:7px;cursor:pointer;font-size:.95rem;}
        .cd-qty button:hover{background:#1a1612;color:#fff;border-color:#1a1612;}
        .cd-qty span{width:22px;text-align:center;font-weight:700;font-size:.85rem;}
       .cd-remove{
    width:32px;
    height:32px;
    border:none;
    border-radius:50%;
    background:#f5f5f5;
    color:#666;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:16px;
    margin-left:auto;
    transition:.25s ease;
}

.cd-remove:hover{
    background:#ff4d4f;
    color:#fff;
    transform:scale(1.08);
}
        .cd-line-total{font-weight:800;font-size:.86rem;color:#1a1612;white-space:nowrap;align-self:center;}
        .cd-foot{border-top:1px solid #eee;padding:18px 22px 22px;}
        .cd-subtotal-row{display:flex;justify-content:space-between;font-size:1rem;font-weight:800;margin-bottom:14px;}
        .cd-checkout-btn{width:100%;padding:15px;border:none;border-radius:50px;background:#1a1612;color:#fff;font-weight:800;font-size:.95rem;cursor:pointer;transition:.2s;}
        .cd-checkout-btn:hover{background:#c8441a;}
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.id = 'cartDrawerOverlay';
        overlay.onclick = closeDrawer;

        const panel = document.createElement('div');
        panel.id = 'cartDrawerPanel';
        panel.innerHTML = `
          <div class="cd-head">
            <div class="cd-head-row">
              <div>
                <div class="cd-title">🛒 Your Cart</div>
                <div class="cd-sub" id="cdItemCount">0 items</div>
              </div>
              <button class="cd-close" onclick="Cart.closeDrawer()">✕</button>
            </div>
          </div>
          <div class="cd-body" id="cdBody"></div>
          <div class="cd-foot" id="cdFoot"></div>
        `;

        const root = document.createElement('div');
        root.id = 'cartDrawerRoot';
        root.appendChild(overlay);
        root.appendChild(panel);
        document.body.appendChild(root);
    }

    function renderDrawer(){
        if (!document.getElementById('cartDrawerRoot')) return; // drawer not built yet on this page load
        const cart = get();
        document.getElementById('cdItemCount').textContent = count() + ' item' + (count() !== 1 ? 's' : '');

        const body = document.getElementById('cdBody');
        const foot = document.getElementById('cdFoot');

        if (cart.length === 0) {
            body.innerHTML = `
              <div class="cd-empty">
                <span class="cd-emoji">🛒</span>
                <div class="cd-e1">Your cart is empty</div>
                <div class="cd-e2">Add some products to get started</div>
              </div>`;
            foot.innerHTML = '';
            return;
        }

        body.innerHTML = cart.map(function(p){
            const thumb = p.image
              ? '<div class="cd-thumb"><img src="' + p.image + '" onerror="this.parentElement.textContent=\'' + (p.emoji || '📦') + '\'"/></div>'
              : '<div class="cd-thumb">' + (p.emoji || '📦') + '</div>';
            return `<div class="cd-line">
              ${thumb}
              <div class="cd-info">
                <div class="cd-name">${p.name}</div>
                <div class="cd-price">Rs. ${Number(p.price).toLocaleString()}</div>
                <div class="cd-qty">
                  <button onclick="Cart.qty('${p.id}', ${p.qty - 1})">−</button>
                  <span>${p.qty}</span>
                  <button onclick="Cart.qty('${p.id}', ${p.qty + 1})">+</button>
<button class="cd-remove" onclick="Cart.remove('${p.id}')" title="Remove Item">
    🗑️
</button>
                </div>
              </div>
              <div class="cd-line-total">Rs. ${(p.price * p.qty).toLocaleString()}</div>
            </div>`;
        }).join('');

        foot.innerHTML = `
          <div class="cd-subtotal-row"><span>Subtotal</span><span>Rs. ${total().toLocaleString()}</span></div>
          <button class="cd-checkout-btn" onclick="window.location.href='checkout.html'">Proceed to Checkout →</button>
        `;
    }

    function openDrawer(){
        ensureDrawer();
        renderDrawer();
        document.getElementById('cartDrawerOverlay').classList.add('open');
        document.getElementById('cartDrawerPanel').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer(){
        const overlay = document.getElementById('cartDrawerOverlay');
        const panel   = document.getElementById('cartDrawerPanel');
        if (overlay) overlay.classList.remove('open');
        if (panel) panel.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.addEventListener("DOMContentLoaded", () => { updateBadge(); ensureDrawer(); });

    return{

        get,
        add,
        remove,
        qty,
        total,
        count,
        clear,
        updateBadge,
        openDrawer,
        closeDrawer

    };

})();