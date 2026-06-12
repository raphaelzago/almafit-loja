const SUPABASE_URL = 'https://pvdzpriyjassmqwbrcpn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZHpwcml5amFzc21xd2JyY3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMDkxOTksImV4cCI6MjA5Njc4NTE5OX0.5QDleXnTnoyLfInuLGS-z32RJhjByOfu3XdB5syUV9s';

// Imagens locais por produto
const IMGS = {
  'Flare Set Cinza': 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAMOAjEDASIAAhEBAxEB/8QAHQAAAQUBAQEBAAAAAAAAAAAAAwECBAUGBwAICf/EAEwQAAEDAgQDBgQCBwYEBAYCAwEAAgMEEQUSITEGQVETImFxgZEHFDKhQlIVIzOSscHRQ1NiguHwCBYkcjRUY7IXJTVEovFVg5OUwv/EABsBAAMBAQEBAQAAAAAAAAAAAAABAgMEBQYH/8QALBEAAgICAwAABwACAgIDAAAAAAECEQMhBBIxBRMUIjJBUSNhFTNCUmJxgf/aAAwDAQACEQMRAD8A4dS4kBuVMjxRlvqsse/FaRt7OGnigPxqEbPutl6OzesxRv5gjsxNh/GFzR+PtH0po4jI2JVWFnU24i22jk8V4tuuWDilzepXjxZKNg4+qmgs6oK4HmU4Vq5O7i2o5MPumO4srDezfuigs65874r3zoH4x7rkDuK67lb3QXcTYiRo4BFBZ2X59g/tB7rxxGL+8C4s/iHEXf2gCG7HMRP9uUUFnbDicI3lHumnF6f++b7riDsWr3Ek1DvdMOI1p3qH+6QWdxON0g3mHuhv4goh/bD3XDnVlU7ed/umGec7yv8AdAJnbn8S0IH7Ye6iy8U0Av8ArWX81xkyyH+0d7pC5x3cfdGh9mdaqOK6ADSVvuqyp4spLGz2rm9z1XkqQdmbap4phd9J+ypcQxrt2loA1VGvIoVlhSTN1udCpmF4zNhVS50V8p1VNFe+hRZ23arTJNWeOqs7NKY7jfEDs37rIC909u6n0Zp38ZYnyP3Q3cWYs78dvVZ+wTgqQrLp3E2LO/t7IbsfxV29S5VYRGhMLJpxbEnfVVSe6Ya2sdvUye6AB4JbJNgPM9QfqmkP+YpCZCNXuPmSkDbhPbspEIL9T7p1ilCcAgBoalypwsl0QAmVKG2XszeZSGRg5p0A70XkztoxsV4zM6ooLHWSO2TDOy+6E+fkklYWekUSZEfKSeaE65OxQFgXHQr0Rs8EonZOOzT7JW00p2YfZFDtFhSzNecoU1uw1CrKejqWm4Yb+SlOgrGC7mp0TZMC9cdVXl043SGaUbpUOyxuvXHVVhqnt0umGsdbdAFtdIXDqFUGreeaUTTO2Y8+QKBl',
  'Jumpsuit Olive':  'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAM8AhgDASIAAhEBAxEB/8QAHQAAAQQDAQEAAAAAAAAAAAAABAIDBQYAAQcICf/EAFAQAAEDAgQDBQUEBggEBAYBBQEAAgMEEQUSITEGQVEHEyJhcRSBkaGxCDJCwRUjUmJy0SQzU4KSorLwFjRD4TVjc8IXJSaz0vFUNkRVdMP/xAAbAQACAwEBAQAAAAAAAAAAAAACAwABBAUGB//EACwRAAICAQQBBAICAwADAQAAAAABAhEDBBIhMUEFEyJRFDIjYTNCcRU0gUP/2gAMAwEAAhEDEQA/AOL4filJVBrqStiffYZ7H4bqUgxSqpzYSG3rdcLBLTcEgqSouIMXo7CGtkLR+F5zD5q5YUPjnaO70fE8sZDZGl3opuh4ngfa78p81wai41qGkCrpGSDmYzlPwUzR8VYZNoal8Djykbp8Up4TRHVs7rDi8EgB70H3px1fGQdfmuPU2K3a10FSx4OxY+6MbxDPF/1SbdUPstDPfTOmy1jRshX4mG6B2nQ6j4Ln7+JpyBsfQod2PTvO9verpguaZ0J2IsNyQB/CfyTMmJ04FzN7joueS4xJe8k4aPM2UfV8S0UN+8rmEj8LfEVNsmUssYnTH4zFHci7hbrdCycSQt219CuR1fGUQJ9mglcf2icoUXV8X4tMCGGKO/MNu74q1hbBlqq6OzzcU5RcDRRGIcew0wOaaFnvufgFxiqxCuqj+vqpXjoXaIZNWAVLUts6ZifaVISWwzTS9Moyj5qtYhxpitU45bNaf2nFx+tvkqyBcaLYFt0yGNCnlk+2HVGKYlUkmSqkseTTlHyQtrnM8kk73KSLg3vonGWJF9kzakBY9RtOfQKR7zKgo3tZrdY+fMLBC1yWFOmGqQ+oAtqgy833WXPNFyVYQ6Uv56dVoOPK5TLQ5zgGgk32AurDgnBXF2MDNhvD2JTtP4hAWt/xGwUbSLSbIaNx2T7BfVdNwPsB48rsr632HDGbkzy3I9zQfqrnhXYLgVKwfp3it1Q4DxR0jAL/AOo/RLeSK8hrFN9o8+yNsd/5JVPQ1dVIGU1LPPITo2NjnE+4BesMC7MuA6QhtFwrVYrKNpKgOeCfME2/yq+4PwxjUTO5 ',
};

let produtos = [];
let cart = JSON.parse(localStorage.getItem('almafit_cart') || '[]');
let filtroAtual = 'todos';
let produtoSelecionado = null;
let tamanhoSelecionado = null;

async function carregarProdutos() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/produtos?select=*&ativo=eq.true&order=criado_em.asc`, {
      headers: {'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`}
    });
    produtos = await res.json();
    renderProdutos();
  } catch(e) {
    document.getElementById('prodGrid').innerHTML = '<div style="color:#555;padding:2rem">Erro ao carregar produtos.</div>';
  }
}

function renderProdutos() {
  const grid = document.getElementById('prodGrid');
  const lista = filtroAtual === 'todos' ? produtos : produtos.filter(p => p.categoria === filtroAtual);
  if(!lista.length) { grid.innerHTML = '<div style="color:#555;padding:2rem">Nenhum produto nesta categoria.</div>'; return; }
  grid.innerHTML = lista.map(p => {
    const temImg = IMGS[p.nome];
    const desconto = p.preco_original ? Math.round((1 - p.preco/p.preco_original)*100) : null;
    return `<div class="prod-card">
      <div class="prod-img">
        ${temImg ? `<img src="${temImg}" alt="${p.nome}">` : `<div style="height:100%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:48px;opacity:.15">👗</div>`}
        ${desconto ? `<span class="prod-badge">-${desconto}%</span>` : ''}
        ${!p.preco_original ? `<span class="prod-badge new">Novo</span>` : ''}
      </div>
      <div class="prod-body">
        <div class="prod-cat">${p.categoria}</div>
        <div class="prod-name">${p.nome}</div>
        <div class="prod-foot">
          <div class="prod-price">
            R$ ${p.preco.toFixed(2).replace('.',',')}
            ${p.preco_original ? `<s>R$ ${p.preco_original.toFixed(2).replace('.',',')}</s>` : ''}
          </div>
          <button class="add-btn" onclick="abrirModal('${p.id}')">+</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filtrar(btn, cat) {
  document.querySelectorAll('.filt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filtroAtual = cat;
  renderProdutos();
}

function abrirModal(id) {
  produtoSelecionado = produtos.find(p => p.id === id);
  tamanhoSelecionado = null;
  document.getElementById('modalCat').textContent = produtoSelecionado.categoria;
  document.getElementById('modalName').textContent = produtoSelecionado.nome;
  const grid = document.getElementById('sizeGrid');
  grid.innerHTML = (produtoSelecionado.tamanhos || ['P','M','G']).map(sz =>
    `<div class="sz" onclick="selecionarTamanho(this,'${sz}')">${sz}</div>`
  ).join('');
  document.getElementById('modalOverlay').classList.add('open');
}

function selecionarTamanho(el, sz) {
  document.querySelectorAll('.sz').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  tamanhoSelecionado = sz;
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  produtoSelecionado = null; tamanhoSelecionado = null;
}

function confirmarAdd() {
  if(!tamanhoSelecionado) { showToast('Escolha um tamanho!'); return; }
  addToCart(produtoSelecionado, tamanhoSelecionado);
  closeModal();
}

function addToCart(produto, tamanho) {
  const key = produto.id + '_' + tamanho;
  const existing = cart.find(i => i.key === key);
  if(existing) { existing.qty++; }
  else { cart.push({key, id: produto.id, nome: produto.nome, preco: produto.preco, tamanho, qty: 1, categoria: produto.categoria}); }
  saveCart();
  showToast(`${produto.nome} (${tamanho}) adicionado!`);
  toggleCart(true);
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
}

function saveCart() {
  localStorage.setItem('almafit_cart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const el = document.getElementById('cartItems');
  const count = cart.reduce((s,i) => s+i.qty, 0);
  const total = cart.reduce((s,i) => s+i.preco*i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = 'R$ ' + total.toFixed(2).replace('.',',');
  if(!cart.length) { el.innerHTML = '<div class="cart-empty">Seu carrinho está vazio</div>'; return; }
  el.innerHTML = cart.map(item => {
    const imgSrc = IMGS[item.nome];
    return `<div class="cart-item">
      ${imgSrc ? `<img class="cart-item-img" src="${imgSrc}" alt="${item.nome}">` : `<div class="cart-item-img-placeholder">👗</div>`}
      <div class="cart-item-info">
        <div class="cart-item-name">${item.nome}</div>
        <div class="cart-item-detail">Tam: ${item.tamanho} · Qtd: ${item.qty}</div>
        <div class="cart-item-price">R$ ${(item.preco*item.qty).toFixed(2).replace('.',',')}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.key}')">✕</button>
    </div>`;
  }).join('');
}

function toggleCart(forceOpen) {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const isOpen = sidebar.classList.contains('open');
  if(forceOpen || !isOpen) { sidebar.classList.add('open'); overlay.classList.add('open'); }
  else { sidebar.classList.remove('open'); overlay.classList.remove('open'); }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

carregarProdutos();
renderCart();
