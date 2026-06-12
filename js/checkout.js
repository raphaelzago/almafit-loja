const API_BASE = '/api';
const MP_PUB_KEY  = 'APP_USR-c7f639fd-cc32-48a7-a2ee-00bf5c3b1c0a';

let cart = JSON.parse(localStorage.getItem('almafit_cart')||'[]');
let payMethod = 'pix', mpInstance, cardForm, cardReady = false;

window.addEventListener('load', () => {
  mpInstance = new MercadoPago(MP_PUB_KEY, {locale:'pt-BR'});
  renderResumo();
});

function selectPay(m, el) {
  payMethod = m;
  document.querySelectorAll('.pay-method').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('pixInfo').style.display   = m==='pix' ? '' : 'none';
  document.getElementById('cardSection').classList.toggle('show', m==='card');
  if(m==='card' && !cardForm) initCard();
}

function initCard() {
  cardReady = false;
  cardForm = mpInstance.cardForm({
    amount: String(getTotal()),
    iframe: true,
    form: {
      id: 'cardSection',
      cardNumber:     {id:'form-checkout__cardNumber',     placeholder:'0000 0000 0000 0000'},
      expirationDate: {id:'form-checkout__expirationDate', placeholder:'MM/YY'},
      securityCode:   {id:'form-checkout__securityCode',   placeholder:'123'},
      cardholderName: {id:'form-checkout__cardholderName'},
      issuer:         {id:'form-checkout__issuer'},
      installments:   {id:'form-checkout__installments'},
    },
    callbacks: {
      onFormMounted: e => { if(!e) cardReady = true; },
    }
  });
}

function getTotal() { return cart.reduce((s,i)=>s+i.preco*i.qty,0); }
function fmt(n) { return 'R$ '+n.toFixed(2).replace('.',','); }
function renderResumo() {
  const el = document.getElementById('resumoItems');
  if(!cart.length) { el.innerHTML='<div class="resumo-empty">Carrinho vazio</div>'; return; }
  el.innerHTML = cart.map(i=>`
    <div class="resumo-item">
      <div><div class="resumo-item-name">${i.nome}</div><div class="resumo-item-detail">Tam: ${i.tamanho} · Qtd: ${i.qty}</div></div>
      <div class="resumo-item-price">${fmt(i.preco*i.qty)}</div>
    </div>`).join('');
  document.getElementById('rSubtotal').textContent = fmt(getTotal());
  document.getElementById('rTotal').textContent    = fmt(getTotal());
}

async function buscarCep() {
  const cep = document.getElementById('cep').value.replace(/\D/g,'');
  if(cep.length!==8) return;
  try {
    const d = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json();
    if(!d.erro) {
      document.getElementById('rua').value    = d.logradouro+(d.bairro?', '+d.bairro:'');
      document.getElementById('cidade').value = d.localidade;
      document.getElementById('estado').value = d.uf;
    }
  }catch(e){}
}

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('cpf').addEventListener('input',function(){
    let v=this.value.replace(/\D/g,'');
    v=v.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
    this.value=v;
  });
  document.getElementById('cep').addEventListener('input',function(){
    let v=this.value.replace(/\D/g,'');
    this.value=v.replace(/(\d{5})(\d)/,'$1-$2');
  });
});

function showErr(msg) {
  const el=document.getElementById('errMsg');
  el.textContent='⚠️ '+msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),6000);
}
function setLoading(on) {
  document.getElementById('loadingPay').classList.toggle('show',on);
  document.querySelectorAll('.btn-pagar').forEach(b=>b.disabled=on);
}
function gerarNum() { return 'ALM'+Date.now().toString().slice(-8); }

async function salvarPedido(num,mpId,mpStatus,forma) {
  const p={
    numero:num, status:mpStatus==='approved'?'pago':'aguardando_pagamento',
    cliente_nome:document.getElementById('nome').value,
    cliente_email:document.getElementById('email').value,
    cliente_telefone:document.getElementById('telefone').value,
    cliente_cep:document.getElementById('cep').value,
    cliente_endereco:[document.getElementById('rua').value,document.getElementById('numero').value,document.getElementById('cidade').value,document.getElementById('estado').value].filter(Boolean).join(', '),
    itens:cart, subtotal:getTotal(), frete:0, total:getTotal(),
    forma_pagamento:forma, mp_payment_id:String(mpId||''), mp_status:mpStatus||''
  };
  await fetch(`${API_BASE}/pedidos`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(p)
  });
}

function mostrarSucesso(num, pixData) {
  document.getElementById('checkoutWrap').classList.add('hide');
  const ss=document.getElementById('successScreen');
  ss.classList.add('show');
  document.getElementById('successNum').textContent='Pedido #'+num;
  if(pixData) {
    document.getElementById('pixQr').classList.add('show');
    if(pixData.qr_code_base64)
      document.getElementById('qrImage').innerHTML=`<img src="data:image/png;base64,${pixData.qr_code_base64}" style="width:180px;height:180px;margin:.75rem auto;display:block;border-radius:4px">`;
    document.getElementById('pixCode').textContent=pixData.qr_code||'';
    window._pixCode=pixData.qr_code||'';
    document.getElementById('successMsg').textContent='Aguardando confirmação do PIX.';
  }
}

async function pagar() {
  document.getElementById('errMsg').classList.remove('show');
  if(!cart.length)                          { showErr('Carrinho vazio!'); return; }
  const nome=document.getElementById('nome').value.trim();
  const email=document.getElementById('email').value.trim();
  const cpf=document.getElementById('cpf').value.replace(/\D/g,'');
  if(!nome||!email||!cpf)                   { showErr('Preencha nome, e-mail e CPF.'); return; }
  if(payMethod==='card'&&!cardReady)        { showErr('Formulário do cartão carregando, aguarde e tente novamente.'); return; }

  setLoading(true);
  try {
    const [fn,...rn]=nome.split(' ');
    const baseBody={
      transaction_amount: getTotal(),
      description: 'AlmaFit — Pedido',
      payer:{ email, first_name:fn, last_name:rn.join(' ')||fn, identification:{type:'CPF',number:cpf} }
    };

    let body;
    if(payMethod==='pix') {
      body = {...baseBody, payment_method_id:'pix'};
    } else {
      const d = await cardForm.getCardFormData();
      if(!d.token) throw new Error('Não foi possível tokenizar o cartão. Verifique os dados.');
      body = {...baseBody, token:d.token, installments:parseInt(d.installments)||1, payment_method_id:d.paymentMethodId};
    }

    const resp = await fetch(`${API_BASE}/pay`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    const data = await resp.json();
    if(data.error) throw new Error(data.message||data.error);

    const num=gerarNum();
    await salvarPedido(num, data.id, data.status, payMethod);
    localStorage.removeItem('almafit_cart');
    mostrarSucesso(num, data.point_of_interaction?.transaction_data);

  } catch(e) {
    showErr(e.message);
  } finally {
    setLoading(false);
  }
}

function copiarPix() {
  if(window._pixCode) {
    navigator.clipboard.writeText(window._pixCode);
    const b=document.querySelector('.copy-btn');
    b.textContent='✅ Copiado!';
    setTimeout(()=>b.textContent='📋 Copiar código PIX',2000);
  }
}
