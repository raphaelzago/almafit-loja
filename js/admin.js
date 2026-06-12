const API_BASE = '/api';

let pedidos = [], produtos = [], editandoId = null, imgBase64 = null;

async function loadAll() {
  pedidos  = await apiFetch('/pedidos');
  produtos = await apiFetch('/produtos/admin');
  renderPedidos(pedidos);
  renderProdutos(produtos);
  renderMetricas(pedidos);
}

async function apiFetch(path, method='GET', body=null) {
  const opts = { method, headers: {'Content-Type':'application/json'} };
  if(body) opts.body = JSON.stringify(body);
  const r = await fetch(`${API_BASE}${path}`, opts);
  const data = r.status===204 ? null : await r.json();
  if(!r.ok) throw new Error(data?.error || data?.message || 'Erro');
  return data;
}

function renderMetricas(data) {
  const pagos = data.filter(p=>p.status==='pago');
  const receita = pagos.reduce((s,p)=>s+parseFloat(p.total||0),0);
  document.getElementById('mTotal').textContent = data.length;
  document.getElementById('mPagos').innerHTML = `<span>${pagos.length}</span>`;
  document.getElementById('mAguardando').textContent = data.filter(p=>p.status==='aguardando_pagamento').length;
  document.getElementById('mReceita').innerHTML = `<span>R$ ${receita.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}</span>`;
}

const STATUS_LABEL = {pago:'Pago',aguardando_pagamento:'Aguardando',em_separacao:'Em separação',enviado:'Enviado',entregue:'Entregue',cancelado:'Cancelado'};
function statusBadge(s) {
  return `<span class="badge badge-${s||'aguardando'}">${STATUS_LABEL[s]||s}</span>`;
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});
}
function renderPedidos(data) {
  const tb = document.getElementById('pedidosTable');
  if(!data.length) { tb.innerHTML='<tr><td colspan="7" class="table-empty">Nenhum pedido encontrado</td></tr>'; return; }
  tb.innerHTML = data.map(p=>{
    const nItens = (Array.isArray(p.itens)?p.itens:[]).reduce((s,i)=>s+(i.qty||1),0);
    return `<tr onclick="abrirPedido('${p.id}')">
      <td>${p.numero}</td>
      <td>${p.cliente_nome}</td>
      <td>${nItens} item(s)</td>
      <td>R$ ${parseFloat(p.total||0).toFixed(2).replace('.',',')}</td>
      <td>${p.forma_pagamento==='pix'?'📱 PIX':'💳 Cartão'}</td>
      <td>${statusBadge(p.status)}</td>
      <td>${formatDate(p.criado_em)}</td>
    </tr>`;
  }).join('');
}
function filtrarPedidos(q) {
  renderPedidos(q ? pedidos.filter(p=>p.cliente_nome?.toLowerCase().includes(q.toLowerCase())||p.numero?.includes(q)) : pedidos);
}
function filtrarStatus(s) {
  renderPedidos(s ? pedidos.filter(p=>p.status===s) : pedidos);
}

function abrirPedido(id) {
  const p = pedidos.find(x=>x.id===id); if(!p) return;
  const itens = Array.isArray(p.itens)?p.itens:[];
  document.getElementById('dpNum').textContent = p.numero;
  document.getElementById('dpBody').innerHTML = `
    <div class="detail-section"><h3>Cliente</h3>
      <div class="detail-row"><span>Nome</span><span>${p.cliente_nome}</span></div>
      <div class="detail-row"><span>E-mail</span><span>${p.cliente_email}</span></div>
      <div class="detail-row"><span>Telefone</span><span>${p.cliente_telefone||'—'}</span></div>
      <div class="detail-row"><span>Endereço</span><span>${p.cliente_endereco||'—'}</span></div>
    </div>
    <div class="detail-section"><h3>Itens (${itens.reduce((s,i)=>s+(i.qty||1),0)})</h3>
      ${itens.map(i=>`<div class="detail-item">
        <div><div class="detail-item-name">${i.nome}</div><div class="detail-item-meta">Tam: ${i.tamanho} · Qtd: ${i.qty||1}</div></div>
        <div class="detail-item-price">R$ ${(parseFloat(i.preco)*(i.qty||1)).toFixed(2).replace('.',',')}</div>
      </div>`).join('')}
    </div>
    <div class="detail-section"><h3>Pagamento</h3>
      <div class="detail-row"><span>Forma</span><span>${p.forma_pagamento==='pix'?'📱 PIX':'💳 Cartão'}</span></div>
      <div class="detail-row"><span>ID Mercado Pago</span><span style="font-size:11px;color:#444">${p.mp_payment_id||'—'}</span></div>
      <div class="detail-row"><span>Total</span><span style="color:#fff;font-weight:600">R$ ${parseFloat(p.total||0).toFixed(2).replace('.',',')}</span></div>
    </div>
    <div class="detail-section"><h3>Atualizar status</h3>
      <div class="status-update">
        <label>Status do pedido</label>
        <select class="status-select" id="statusSel">
          ${Object.entries(STATUS_LABEL).map(([v,l])=>`<option value="${v}" ${p.status===v?'selected':''}>${l}</option>`).join('')}
        </select>
        <button class="btn-update" onclick="atualizarStatus('${p.id}')">Salvar status</button>
      </div>
    </div>
    <div style="text-align:center;font-size:12px;color:#333;margin-top:1.5rem">Pedido em ${formatDate(p.criado_em)}</div>
  `;
  document.getElementById('drawerPedidoOverlay').classList.add('open');
}
async function atualizarStatus(id) {
  const s = document.getElementById('statusSel').value;
  await apiFetch(`/pedidos/${id}`,'PATCH',{status:s,atualizado_em:new Date().toISOString()});
  toast('Status atualizado!','success');
  closePedidoDrawer();
  loadAll();
}
function fecharDrawerPedido(e) { if(e.target===document.getElementById('drawerPedidoOverlay')) closePedidoDrawer(); }

async function checkAuth() {
  const res = await fetch(`${API_BASE}/admin/check`);
  if (!res.ok) return window.location.href = 'login.html';
  await loadAll();
  setInterval(loadAll, 30000);
}

async function logout() {
  await fetch(`${API_BASE}/logout`, { method: 'POST' });
  window.location.href = 'login.html';
}

function closePedidoDrawer() { document.getElementById('drawerPedidoOverlay').classList.remove('open'); }

function renderProdutos(data) {
  const grid = document.getElementById('prodGrid');
  if(!data.length) { grid.innerHTML='<div class="grid-empty">Nenhum produto cadastrado.<br><br><button class="btn-novo" onclick="abrirNovoProduto()">+ Cadastrar primeiro produto</button></div>'; return; }
  grid.innerHTML = data.map(p => {
    const sizes = (p.tamanhos||[]).map(s=>`<span class="sz-chip">${s}</span>`).join('');
    const desconto = p.preco_original ? Math.round((1-p.preco/p.preco_original)*100) : null;
    return `<div class="prod-card-admin">
      <div class="prod-card-img">
        ${p.imagem_url ? `<img src="${p.imagem_url}" alt="${p.nome}">` : `<div class="prod-card-img-empty">👗</div>`}
        ${!p.ativo ? `<div class="prod-inactive">Inativo</div>` : ''}
      </div>
      <div class="prod-card-body">
        <div class="prod-card-cat">${p.categoria||'Sem categoria'}</div>
        <div class="prod-card-name">${p.nome}</div>
        <div class="prod-card-price">
          R$ ${parseFloat(p.preco).toFixed(2).replace('.',',')}
          ${p.preco_original ? `<s>R$ ${parseFloat(p.preco_original).toFixed(2).replace('.',',')}</s>` : ''}
          ${desconto ? `<span style="background:var(--pink);color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:2px;font-family:var(--sans)">-${desconto}%</span>` : ''}
        </div>
        <div class="prod-card-sizes">${sizes}</div>
        <div class="prod-card-actions">
          <button class="btn-edit" onclick="editarProduto('${p.id}')">✏️ Editar</button>
          <button class="btn-toggle ${p.ativo?'ativo':'inativo'}" onclick="toggleAtivo('${p.id}',${p.ativo})">${p.ativo?'Ocultar':'Ativar'}</button>
          <button class="btn-del" onclick="deletarProduto('${p.id}','${p.nome}')">🗑</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function abrirNovoProduto() {
  editandoId = null; imgBase64 = null;
  document.getElementById('dprodTitle').textContent = 'Novo Produto';
  limparFormProd();
  document.getElementById('drawerProdOverlay').classList.add('open');
}

function editarProduto(id) {
  const p = produtos.find(x=>x.id===id); if(!p) return;
  editandoId = id; imgBase64 = null;
  document.getElementById('dprodTitle').textContent = 'Editar Produto';
  limparFormProd();
  document.getElementById('pNome').value    = p.nome||'';
  document.getElementById('pDesc').value    = p.descricao||'';
  document.getElementById('pCat').value     = p.categoria||'';
  document.getElementById('pAtivo').value   = String(p.ativo);
  document.getElementById('pPreco').value   = p.preco||'';
  document.getElementById('pPrecoOrig').value = p.preco_original||'';
  document.querySelectorAll('#sizesSelector .sz-toggle').forEach(el => {
    el.classList.toggle('on', (p.tamanhos||[]).includes(el.textContent.trim()));
  });
  if(p.imagem_url) {
    document.getElementById('uploadPrompt').style.display = 'none';
    document.getElementById('uploadPreview').style.display = 'block';
    document.getElementById('previewImg').src = p.imagem_url;
    imgBase64 = p.imagem_url;
  }
  calcDesconto();
  document.getElementById('drawerProdOverlay').classList.add('open');
}

function limparFormProd() {
  ['pNome','pDesc','pPreco','pPrecoOrig'].forEach(id => document.getElementById(id).value='');
  document.getElementById('pCat').value = '';
  document.getElementById('pAtivo').value = 'true';
  document.querySelectorAll('#sizesSelector .sz-toggle').forEach(el => {
    el.classList.toggle('on', ['M','G','GG'].includes(el.textContent.trim()));
  });
  document.getElementById('uploadPrompt').style.display = '';
  document.getElementById('uploadPreview').style.display = 'none';
  document.getElementById('previewImg').src = '';
  document.getElementById('descontoPreview').style.display = 'none';
  imgBase64 = null;
}

function fecharDrawerProd(e) { if(e.target===document.getElementById('drawerProdOverlay')) closeProdDrawer(); }
function closeProdDrawer() { document.getElementById('drawerProdOverlay').classList.remove('open'); }

function onImgSelect(e) {
  const file = e.target.files[0]; if(!file) return;
  if(file.size > 2*1024*1024) { toast('Imagem muito grande! Máx 2MB.','error'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    imgBase64 = ev.target.result;
    document.getElementById('previewImg').src = imgBase64;
    document.getElementById('uploadPrompt').style.display = 'none';
    document.getElementById('uploadPreview').style.display = 'block';
  };
  reader.readAsDataURL(file);
}
function removerImagem(e) {
  e.preventDefault(); e.stopPropagation();
  imgBase64 = null;
  document.getElementById('imgInput').value = '';
  document.getElementById('previewImg').src = '';
  document.getElementById('uploadPrompt').style.display = '';
  document.getElementById('uploadPreview').style.display = 'none';
}

function toggleSize(el, sz) { el.classList.toggle('on'); }

function calcDesconto() {
  const preco = parseFloat(document.getElementById('pPreco').value);
  const orig  = parseFloat(document.getElementById('pPrecoOrig').value);
  const prev  = document.getElementById('descontoPreview');
  if(preco > 0 && orig > preco) {
    const pct = Math.round((1-preco/orig)*100);
    document.getElementById('descontoPct').textContent = pct + '%';
    prev.style.display = 'block';
  } else {
    prev.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('pPreco').addEventListener('input', calcDesconto);
  document.getElementById('pPrecoOrig').addEventListener('input', calcDesconto);
});

async function salvarProduto() {
  const nome  = document.getElementById('pNome').value.trim();
  const cat   = document.getElementById('pCat').value;
  const preco = parseFloat(document.getElementById('pPreco').value);
  if(!nome) { toast('Preencha o nome do produto.','error'); return; }
  if(!cat)  { toast('Selecione uma categoria.','error'); return; }
  if(!preco || preco <= 0) { toast('Informe um preço válido.','error'); return; }

  const tamanhos = Array.from(document.querySelectorAll('#sizesSelector .sz-toggle.on')).map(el=>el.textContent.trim());
  const precoOrig = parseFloat(document.getElementById('pPrecoOrig').value) || null;

  const payload = {
    nome,
    descricao: document.getElementById('pDesc').value.trim() || null,
    categoria: cat,
    preco,
    preco_original: precoOrig,
    tamanhos,
    ativo: document.getElementById('pAtivo').value === 'true',
    imagem_url: imgBase64 || null,
  };

  const btn = document.getElementById('btnSalvarProd');
  btn.disabled = true; btn.textContent = 'Salvando...';

  try {
    if(editandoId) {
      await apiFetch(`/produtos/${editandoId}`,'PATCH', payload);
      toast('Produto atualizado!','success');
    } else {
      await apiFetch('/produtos','POST', payload);
      toast('Produto cadastrado!','success');
    }
    closeProdDrawer();
    loadAll();
  } catch(e) {
    toast('Erro: '+e.message,'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Salvar produto';
  }
}

async function toggleAtivo(id, ativo) {
  await apiFetch(`/produtos/${id}`,'PATCH',{ativo:!ativo});
  toast(ativo?'Produto ocultado':'Produto ativado!','success');
  loadAll();
}

async function deletarProduto(id, nome) {
  if(!confirm(`Deletar "${nome}"? Esta ação não pode ser desfeita.`)) return;
  await apiFetch(`/produtos/${id}`,'DELETE');
  toast('Produto deletado.','success');
  loadAll();
}

function showSection(sec, el) {
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('secPedidos').style.display  = sec==='pedidos'  ? '' : 'none';
  document.getElementById('secProdutos').style.display = sec==='produtos' ? '' : 'none';
  document.getElementById('secMetricas').style.display = sec==='metricas' ? '' : 'none';
  document.getElementById('topTitle').textContent = {pedidos:'Pedidos',produtos:'Produtos',metricas:'Métricas'}[sec];
  document.getElementById('btnNovo').style.display = sec==='produtos' ? '' : 'none';
}

function toast(msg, type='success') {
  const el = document.getElementById('toast');
  el.textContent = (type==='success'?'✓  ':'✕  ') + msg;
  el.className = `toast ${type} show`;
  setTimeout(()=>el.classList.remove('show'), 2800);
}

checkAuth();
