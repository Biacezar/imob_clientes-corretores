const LOGO="imagens/imobLogo.jpg";
const BG="imagens/login-fundo.jpg";
const STATUS=["Novo Lead","Em Atendimento","Simulação","Documentação","Venda Fechada"];
const BROKERS=[{id:1,nome:"Ana Souza"},{id:2,nome:"Carlos Lima"},{id:3,nome:"Marina Alves"}];
const PROPS=[
 {id:1,nome:"Residencial Vista Verde",regiao:"Zona Norte",preco:189000,t:"Na planta",mcmv:true,q:2,e:"🌳"},
 {id:2,nome:"Edifício Solar das Águas",regiao:"Centro",preco:365000,t:"Pronto",q:2,e:"🌊"},
 {id:3,nome:"Condomínio Parque Azul",regiao:"Zona Leste",preco:248000,t:"Na planta",mcmv:true,q:2,e:"🏞️"},
 {id:4,nome:"Torre Dourada",regiao:"Zona Sul",preco:520000,t:"Pronto",q:3,e:"🌇"},
 {id:5,nome:"Residencial Bosque Real",regiao:"Guarulhos",preco:235000,t:"Na planta",mcmv:true,q:3,e:"🌲"},
 {id:6,nome:"Vila Horizonte",regiao:"Zona Oeste",preco:455000,t:"Pronto",q:3,e:"☀️"}];
const REGIOES=["Centro","Zona Norte","Zona Sul","Zona Leste","Zona Oeste","Guarulhos","Outra"];
const RENDAS=["Até R$ 3.000","R$ 3.001 a R$ 5.000","R$ 5.001 a R$ 9.000","Acima de R$ 9.000"];
const KEY="imob-ta-na-mao-v2";
const SEED=[["Joana Prado","11988887701",1,"Zona Norte","Em Atendimento"],["Pedro Nunes","11977776602",4,"Zona Sul","Simulação"],["Luiza Matos","11966665503",3,"Zona Leste","Documentação"],["Bruno Reis","11955554404",5,"Guarulhos","Venda Fechada"],["Carla Dias","11944443305",2,"Centro","Novo Lead"],["Marcos Silva","11933332206",6,"Zona Oeste","Novo Lead"]];
let db,view="cliente",brokerSel=1;
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&d.clients)return d}catch(e){}return seed()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}
function seed(){db={clients:[],rr:0};SEED.forEach(s=>{const r=addLead({nome:s[0],tel:s[1],imovel:s[2],regiao:s[3]});if(s[4]!=="Novo Lead")setStatus(r.c.id,s[4])});return db}
const now=()=>new Date().toISOString();
const digits=t=>String(t).replace(/\D/g,"");
const prop=id=>PROPS.find(p=>p.id==id);
const broker=id=>BROKERS.find(b=>b.id==id);

function addLead(d){
  const tel=digits(d.tel);
  const ex=db.clients.find(c=>c.tel===tel);
  if(ex){ex.historico.push({d:now(),t:"Novo contato do mesmo cliente (duplicidade evitada). Lead travado com "+broker(ex.corretorId).nome+"."});save();return{dup:true,c:ex}}
  let b=broker(d.corretorId);if(!b){b=BROKERS[db.rr%BROKERS.length];db.rr++}
  const c={id:Date.now()+Math.floor(Math.random()*999),nome:d.nome,tel,imovel:+d.imovel,regiao:d.regiao||"",renda:d.renda||"",contato:d.contato||"",email:d.email||"",obs:d.obs||"",origem:d.corretorId?"corretor":"site",travado:true,status:"Novo Lead",corretorId:b.id,criado:now(),
    historico:[{d:now(),t:(d.corretorId?"Lead cadastrado pelo corretor ":"Lead distribuído por ordem de chegada e travado para ")+b.nome+"."}]};
  db.clients.push(c);save();return{dup:false,c};
}
function setStatus(id,s){const c=db.clients.find(x=>x.id==id);if(!c)return;c.status=s;c.historico.push({d:now(),t:"Status alterado para "+s+"."});save()}

const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const money=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
const fdate=i=>new Date(i).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});
const fone=t=>t.length>=10?`(${t.slice(0,2)}) ${t.slice(2,t.length-4)}-${t.slice(-4)}`:t;
const val=c=>(prop(c.imovel)||{preco:0}).preco;
function toast(m){const t=document.getElementById("toast");t.textContent=m;t.style.display="block";clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display="none",3200)}
const opts=(arr,sel)=>arr.map(a=>`<option ${a==sel?"selected":""}>${esc(a)}</option>`).join("");
const statusSel=c=>`<select class="inp" style="padding:6px 8px;font-size:14px" data-status="${c.id}">${opts(STATUS,c.status)}</select>`;

function viewCliente(){
  return `
  <section class="card" style="padding:28px;border-left:5px solid var(--gold)"><div>
    <p class="text-gold font-bold text-sm">SUA IMOBILIÁRIA NO BOLSO</p>
    <h1 class="text-4xl font-extrabold mt-1">IMOB <span class="text-gold">Tá Na Mão</span></h1>
    <p class="mt-2 opacity-90">Apartamentos na planta pelo Minha Casa Minha Vida e imóveis prontos. Escolha, simule e fale com um corretor parceiro em poucos toques.</p>
    <a href="#atender" class="btn btn-gold mt-4">Solicitar atendimento</a> <a href="#cadastro" class="btn btn-out mt-4">Cadastro completo</a></div></section>
  <section>
    <h2 class="text-xl font-extrabold mb-3">Empreendimentos disponíveis</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    ${PROPS.map(p=>`<article class="card" style="padding:0;overflow:hidden">
      <div style="height:64px;display:flex;align-items:center;padding:0 16px;color:var(--gold);font-size:12px;font-weight:700;letter-spacing:.12em;background:#0F172A;border-bottom:3px solid var(--gold)">${p.t.toUpperCase()}</div>
      <div class="p-4"><h3 class="font-bold">${p.nome}</h3>
      <p class="text-sm text-muted">${p.regiao} · ${p.q} quartos</p><p class="mt-1 flex gap-1 flex-wrap"><span class="pill">${p.t}</span>${p.mcmv?'<span class="pill" style="background:var(--gold);color:#14213A;border-color:var(--gold)">Minha Casa Minha Vida</span>':""}</p>
      <p class="font-extrabold text-lg mt-1" style="color:var(--blue)">${money(p.preco)}</p>
      <button class="btn btn-blue w-full mt-3" data-act="interesse" data-id="${p.id}">Tenho interesse</button></div></article>`).join("")}
    </div>
  </section>
  <section class="grid md:grid-cols-2 gap-4">
    <div class="card" id="sim">
      <h2 class="text-xl font-extrabold mb-1">Simulação de financiamento</h2>
      <p class="text-sm text-muted mb-3">Valores indicativos (Tabela Price, 10,5% a.a.). No Minha Casa Minha Vida, taxa e subsídio dependem da faixa de renda e da análise de crédito.</p>
      <div class="space-y-3">
        <div><label>Valor do imóvel</label><input class="inp" id="sv" type="number" value="300000" inputmode="numeric"></div>
        <div><label>Entrada</label><input class="inp" id="se" type="number" value="60000" inputmode="numeric"></div>
        <div><label>Prazo (meses)</label><input class="inp" id="sp" type="number" value="360" inputmode="numeric"></div>
      </div>
      <div class="mt-4 p-3 rounded-xl" style="background:var(--bg);border:1px solid var(--gold)" id="simres"></div>
    </div>
    <div class="card" id="atender">
      <h2 class="text-xl font-extrabold mb-3">Solicitar atendimento</h2>
      <form id="formLead" class="space-y-3">
        <div><label>Nome</label><input class="inp" name="nome" required autocomplete="name"></div>
        <div><label>Telefone (WhatsApp)</label><input class="inp" name="tel" required type="tel" inputmode="tel" placeholder="(11) 99999-9999" minlength="10"></div>
        <div><label>Interesse (imóvel/empreendimento)</label><select class="inp" name="imovel" id="fImovel">${PROPS.map(p=>`<option value="${p.id}">${p.nome}</option>`).join("")}</select></div>
        <details class="text-sm"><summary class="font-semibold cursor-pointer">Quer agilizar? (opcional)</summary><div class="space-y-3 mt-3"><div><label>Faixa de renda familiar</label><select class="inp" name="renda"><option value="">Prefiro informar depois</option>${opts(RENDAS)}</select></div><div><label>Melhor forma de contato</label><select class="inp" name="contato">${opts(["WhatsApp","Ligação","E-mail"])}</select></div><div><label>Região desejada</label><select class="inp" name="regiao">${opts(REGIOES)}</select></div></div></details>
        <button class="btn btn-gold w-full" type="submit">Enviar e receber atendimento</button>
      </form>
      <div id="res" class="mt-3 text-sm"></div>
    </div>
  </section>`;
}
function calcSim(){
  const v=+document.getElementById("sv").value||0,e=+document.getElementById("se").value||0,n=Math.max(1,+document.getElementById("sp").value||1);
  const pv=Math.max(0,v-e),i=Math.pow(1.105,1/12)-1,pmt=pv*i/(1-Math.pow(1+i,-n));
  document.getElementById("simres").innerHTML=`<p class="text-sm text-muted">Valor financiado: <b>${money(pv)}</b></p><p class="text-sm text-muted mt-1">Parcela estimada</p><p class="text-2xl font-extrabold" style="color:var(--blue)">${money(pmt||0)}<span class="text-sm font-semibold">/mês</span></p><p class="text-xs text-muted mt-1">Total pago: ${money((pmt||0)*n+e)}</p>`;
}

function viewCorretor(){
  const mine=db.clients.filter(c=>c.corretorId==brokerSel);
  const vendas=mine.filter(c=>c.status==="Venda Fechada");
  const carteira=mine.filter(c=>c.status!=="Venda Fechada").reduce((s,c)=>s+val(c),0);
  return `
  <div class="card flex items-center gap-3 flex-wrap" ${user.role==="corretor"?'style="display:none"':""}><label style="margin:0">Visualizar carteira de:</label>
    <select class="inp" style="width:auto" data-broker>${BROKERS.map(b=>`<option value="${b.id}" ${b.id==brokerSel?"selected":""}>${b.nome}</option>`).join("")}</select></div>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div class="card kpi"><span class="text-sm text-muted">Leads na carteira</span><b>${mine.length}</b></div>
    <div class="card kpi"><span class="text-sm text-muted">Em andamento</span><b>${mine.length-vendas.length}</b></div>
    <div class="card kpi"><span class="text-sm text-muted">Vendas fechadas</span><b>${vendas.length}</b></div>
    <div class="card kpi"><span class="text-sm text-muted">Carteira em aberto</span><b style="font-size:20px">${money(carteira)}</b></div>
  </div>
  <details class="card"><summary class="font-extrabold cursor-pointer">Cadastrar novo cliente</summary><form id="formCorretor" class="space-y-3 mt-3"><div><label>Nome</label><input class="inp" name="nome" required></div><div><label>Telefone (WhatsApp)</label><input class="inp" name="tel" required type="tel" inputmode="tel" placeholder="(11) 99999-9999"></div><div><label>Interesse</label><select class="inp" name="imovel">${PROPS.map(p=>`<option value="${p.id}">${p.nome}</option>`).join("")}</select></div><div><label>Faixa de renda</label><select class="inp" name="renda"><option value="">Não informada</option>${opts(RENDAS)}</select></div><button class="btn btn-gold w-full" type="submit">Salvar na minha carteira</button></form></details>
  <h2 class="text-xl font-extrabold">Meus leads</h2>
  ${mine.length?`<div class="grid md:grid-cols-2 gap-4">${mine.slice().reverse().map(c=>`
   <article class="card space-y-2">
     <div class="flex justify-between gap-2"><div><h3 class="font-bold">${esc(c.nome)}</h3><p class="text-sm text-muted">${fone(c.tel)} · ${esc(c.regiao)}</p></div><span class="pill">${money(val(c))}</span></div>
     <p class="text-sm">${(prop(c.imovel)||{nome:"-"}).nome}</p>
     ${statusSel(c)}
     <div class="flex gap-2"><a class="btn btn-gold flex-1" target="_blank" rel="noopener" href="https://wa.me/55${c.tel}" style="text-decoration:none">WhatsApp</a></div>
     <div class="flex gap-2"><input class="inp" id="n${c.id}" placeholder="Anotação do atendimento"><button class="btn btn-blue" data-act="note" data-id="${c.id}">Salvar</button></div>
     <details><summary class="text-sm font-semibold cursor-pointer">Histórico (${c.historico.length})</summary>
       <ul class="text-xs text-muted mt-2 space-y-1">${c.historico.slice().reverse().map(h=>`<li><b>${fdate(h.d)}</b> — ${esc(h.t)}</li>`).join("")}</ul></details>
   </article>`).join("")}</div>`:`<div class="card text-muted">Nenhum lead atribuído ainda.</div>`}`;
}

function viewGestor(){
  const all=db.clients,vendas=all.filter(c=>c.status==="Venda Fechada"),vgv=vendas.reduce((t,c)=>t+val(c),0);
  const conv=all.length?Math.round(vendas.length/all.length*100):0;
  const efic=all.length?Math.round(all.filter(c=>c.status!=="Novo Lead").length/all.length*100):0;
  const opp=all.filter(c=>c.status==="Simulação"||c.status==="Documentação").sort((a,b)=>val(b)-val(a));
  const max=Math.max(1,...STATUS.map(x=>all.filter(c=>c.status===x).length));
  const AVC=["#2563EB","#F59E0B","#E11D48"],ago=d=>{const k=Math.floor((Date.now()-new Date(d))/864e5);return k<=0?"Hoje":k===1?"Ontem":k+" dias atrás"};
  const sec=(t,n,c)=>`<div class="flex items-center justify-between mt-6 mb-2"><h2 class="font-bold flex items-center gap-2"><span style="width:9px;height:9px;border-radius:50%;background:${c}"></span>${t}</h2><span class="cnt" style="color:${c}">${n}</span></div>`;
  const circ=(n,l,c,bg)=>`<div class="circ" style="border-color:${c};background:${bg};color:${c}"><b style="font-size:26px;line-height:1">${n}</b><span style="font-size:12px;font-weight:600">${l}</span></div>`;
  const met=(l,v,c)=>`<div><p class="sub">${l}</p><p class="text-2xl font-extrabold mt-1" style="color:${c}">${v}</p></div>`;
  return head("PAINEL DO GESTOR","Visão geral da imobiliária","Indicadores, equipe e oportunidades em um só lugar.")+`
  <div class="card" style="padding:24px;border-radius:16px;position:relative;overflow:hidden">
   <svg style="position:absolute;left:0;top:10px;width:100%;height:150px;opacity:.35;pointer-events:none" viewBox="0 0 600 120" preserveAspectRatio="none"><path d="M0,60 C150,110 300,10 450,110 C520,150 600,60 600,60" fill="none" stroke="#2563EB" stroke-width="2" stroke-dasharray="4 4"/><path d="M0,60 C150,10 300,110 450,10 C520,-20 600,60 600,60" fill="none" stroke="#10B981" stroke-width="2" stroke-dasharray="4 4"/></svg>
   <div class="flex items-center justify-around" style="position:relative;min-height:140px">${circ(BROKERS.length,"Corretores","#60A5FA","rgba(30,58,138,.35)")}${circ(all.length,"Clientes","#34D399","rgba(6,78,59,.35)")}${circ(opp.length,"Oportunidades","#FBBF24","rgba(120,53,15,.35)")}</div>
   <hr style="border-color:var(--line);margin:20px 0">
   <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${met("Vendas totais",money(vgv),"#fff")}${met("Taxa de conversão",conv+"%","#34D399")}${met("Eficiência de atendimento",efic+"%","#FBBF24")}</div></div>
  ${sec("Equipe de corretores",BROKERS.length,"#60A5FA")}
  <div class="space-y-2">${BROKERS.map((b,i)=>{const m=all.filter(c=>c.corretorId===b.id),v=m.filter(c=>c.status==="Venda Fechada");return `<div class="card-item"><div class="flex items-center gap-3"><div class="avatar" style="background:${AVC[i%3]}">${b.nome[0]}<i></i></div><div><p class="font-bold text-sm">${b.nome}</p><p class="text-xs text-muted">${m.length} clientes vinculados · ${v.length} vendas</p></div></div><div class="text-right"><b class="text-sm">${money(v.reduce((t,c)=>t+val(c),0))}</b><p class="sub">Vendas totais</p></div></div>`}).join("")}</div>
  ${sec("Últimos cadastros",Math.min(5,all.length),"#34D399")}
  <div class="space-y-2">${all.slice(-5).reverse().map(c=>`<div class="card-item"><div><div class="flex items-center gap-2"><button class="font-bold text-sm" data-act="open" data-id="${c.id}">${esc(c.nome)}</button><span class="tag">${ago(c.criado)}</span></div><p class="text-xs text-muted mt-1">${(prop(c.imovel)||{nome:"-"}).nome}</p><p class="text-xs text-muted">Responsável: <span style="color:var(--blue);font-weight:500">${broker(c.corretorId).nome}</span></p></div><b class="text-sm">${money(val(c))}</b></div>`).join("")}</div>
  ${sec("Funil de atendimento",all.length,"#FBBF24")}
  <div class="card">${STATUS.map(x=>{const n=all.filter(c=>c.status===x).length;return `<div class="mb-3"><div class="flex justify-between text-sm"><span>${x}</span><b>${n}</b></div><div class="bar" style="width:${Math.max(4,n/max*100)}%;${x==="Venda Fechada"?"background:var(--gold)":""}"></div></div>`}).join("")}</div>
  ${sec("Oportunidades (Simulação e Documentação)",opp.length,"#C59B27")}
  <div class="space-y-2">${opp.length?opp.map(c=>`<div class="card-item"><div><button class="font-bold text-sm" data-act="open" data-id="${c.id}">${esc(c.nome)}</button><p class="text-xs text-muted">${c.status} · ${broker(c.corretorId).nome}</p></div><b class="text-sm">${money(val(c))}</b></div>`).join(""):`<div class="card text-sm text-muted">Sem oportunidades no momento.</div>`}</div>
  <div class="flex justify-between items-center gap-2 flex-wrap mt-6 mb-2"><h2 class="font-bold flex items-center gap-2"><span style="width:9px;height:9px;border-radius:50%;background:#94A3B8"></span>Todos os clientes</h2><div class="flex gap-2"><button class="btn btn-blue" data-act="demo">+ Simular novo lead</button><button class="btn btn-out" data-act="reset">Restaurar demo</button></div></div>
  <div class="card overflow-x-auto"><table class="w-full"><thead><tr><th>Cliente</th><th>Telefone</th><th>Interesse</th><th>Renda</th><th>Origem</th><th>Corretor 🔒</th><th>Status</th></tr></thead><tbody>
  ${all.slice().reverse().map(c=>`<tr><td><button class="font-bold underline" style="color:var(--blue)" data-act="open" data-id="${c.id}">${esc(c.nome)}</button></td><td>${fone(c.tel)}</td><td>${(prop(c.imovel)||{nome:"-"}).nome}</td><td>${esc(c.renda||"-")}</td><td>${c.origem==="corretor"?"Corretor":"Site"}</td><td>🔒 ${broker(c.corretorId).nome}</td><td>${statusSel(c)}</td></tr>`).join("")}
  </tbody></table></div>`;
}
const ROUTES=["cliente","cadastro","corretor","acomp","historico","gestor"];
const mask=v=>{v=digits(v).slice(0,11);let o=v;if(v.length>2)o="("+v.slice(0,2)+") "+v.slice(2);if(v.length>7){const k=v.length>10?7:6;o="("+v.slice(0,2)+") "+v.slice(2,k)+"-"+v.slice(k)}return o};
const head=(t,h,s)=>`<div><p class="ttl">${t}</p><h1 class="text-2xl font-extrabold">${h}</h1><p class="text-sm text-muted">${s}</p></div>`;
function viewCadastro(){
  const rec=user.role==="cliente"?[]:db.clients.filter(scope).slice(-5).reverse();
  return head("CADASTRO","Ficha de cadastro de cliente","Os dados são encaminhados automaticamente a um corretor parceiro, por ordem de chegada.")+`
  <div class="grid lg:grid-cols-3 gap-4"><form id="formCad" class="card lg:col-span-2 space-y-4" novalidate>
   <div class="grid sm:grid-cols-2 gap-3"><h3 class="font-bold sm:col-span-2">1. Dados de contato</h3>
    <div class="sm:col-span-2"><label>Nome completo *</label><input class="inp" name="nome" autocomplete="name"><small class="err" data-e="nome"></small></div>
    <div><label>Telefone / WhatsApp *</label><input class="inp" name="tel" id="cadTel" inputmode="tel" placeholder="(11) 99999-9999" autocomplete="tel"><small class="err" data-e="tel"></small></div>
    <div><label>E-mail</label><input class="inp" name="email" type="email" autocomplete="email"><small class="err" data-e="email"></small></div></div>
   <div class="grid sm:grid-cols-2 gap-3"><h3 class="font-bold sm:col-span-2">2. Perfil de interesse</h3>
    <div><label>Empreendimento *</label><select class="inp" name="imovel">${PROPS.map(p=>`<option value="${p.id}">${p.nome} (${p.t})</option>`).join("")}</select></div>
    <div><label>Região desejada</label><select class="inp" name="regiao">${opts(REGIOES)}</select></div>
    <div><label>Faixa de renda familiar</label><select class="inp" name="renda"><option value="">Prefiro informar depois</option>${opts(RENDAS)}</select></div>
    <div><label>Forma de contato preferida</label><select class="inp" name="contato">${opts(["WhatsApp","Ligação","E-mail"])}</select></div>
    <div class="sm:col-span-2"><label>Observações</label><textarea class="inp" name="obs" rows="3" placeholder="Ex.: tem FGTS, busca 2 quartos, melhor horário para contato"></textarea></div></div>
   <div><label style="display:flex;gap:8px;font-weight:400;align-items:flex-start"><input type="checkbox" name="lgpd" style="margin-top:3px"> Autorizo o uso dos meus dados para contato comercial, conforme a LGPD. *</label><small class="err" data-e="lgpd"></small></div>
   <div class="flex gap-2"><button class="btn btn-blue" type="submit">Enviar cadastro</button><button class="btn btn-out" type="reset">Limpar</button></div><div id="cadRes"></div></form>
   <aside class="card" ${user.role==="cliente"?'style="display:none"':""}><h2 class="font-bold mb-2">Últimos cadastros</h2>${rec.map(c=>`<div class="py-2 text-sm" style="border-top:1px solid var(--line)"><b>${esc(c.nome)}</b><br><span class="text-muted">${(prop(c.imovel)||{nome:"-"}).nome} · ${broker(c.corretorId).nome}</span></div>`).join("")}</aside></div>`;
}
let fq="",fb="0",hq="",hc="0",openId=null;
function boardHTML(){return STATUS.map((s,i)=>{const L=db.clients.filter(c=>c.status===s&&scope(c)&&(fb==="0"||c.corretorId==fb)&&(!fq||(c.nome+c.tel).toLowerCase().includes(fq.toLowerCase())));
  return `<div class="col"><div class="flex justify-between items-center mb-2"><b class="text-sm">${s}</b><span class="pill">${L.length}</span></div>${L.map(c=>`<div class="kcard"><button class="font-bold text-left" data-act="open" data-id="${c.id}">${esc(c.nome)}</button><p class="text-xs text-muted mt-1">${(prop(c.imovel)||{nome:"-"}).nome}<br>${broker(c.corretorId).nome} · ${money(val(c))}</p><div class="flex justify-between mt-2"><button class="mv" ${i?"":"disabled"} data-act="mv" data-id="${c.id}" data-d="-1" aria-label="Voltar etapa">←</button><button class="mv" ${i<4?"":"disabled"} data-act="mv" data-id="${c.id}" data-d="1" aria-label="Avançar etapa">→</button></div></div>`).join("")||`<p class="text-xs text-muted">Nenhum cliente</p>`}</div>`}).join("")}
function viewAcomp(){return head("ACOMPANHAMENTO","Funil de atendimento","Avance os clientes entre as etapas ou abra a ficha para ver o histórico completo.")+`<div class="card flex gap-3 flex-wrap"><input class="inp" style="flex:1;min-width:180px" id="fq" placeholder="Buscar por nome ou telefone" value="${esc(fq)}"><select class="inp" style="width:auto" id="fb"><option value="0">Todos os corretores</option>${BROKERS.map(b=>`<option value="${b.id}" ${fb==b.id?"selected":""}>${b.nome}</option>`).join("")}</select></div><div id="board" class="board">${boardHTML()}</div>`}
function histHTML(){const R=[];db.clients.forEach(c=>c.historico.forEach(h=>R.push({...h,c})));
  const L=R.sort((a,b)=>b.d.localeCompare(a.d)).filter(r=>scope(r.c)&&(hc==="0"||r.c.id==hc)&&(!hq||(r.t+r.c.nome).toLowerCase().includes(hq.toLowerCase()))).slice(0,100);
  return L.length?L.map(r=>`<li class="tl"><span class="dot"></span><div><p class="text-xs text-muted">${fdate(r.d)} · ${broker(r.c.corretorId).nome}</p><p class="text-sm"><button class="font-bold underline" data-act="open" data-id="${r.c.id}">${esc(r.c.nome)}</button> — ${esc(r.t)}</p></div></li>`).join(""):`<li class="text-sm text-muted py-3">Nenhum registro encontrado.</li>`}
function viewHist(){return head("HISTÓRICO","Registro de atividades","Todas as movimentações, anotações e distribuições, da mais recente para a mais antiga.")+`<div class="card flex gap-3 flex-wrap"><input class="inp" style="flex:1;min-width:180px" id="hq" placeholder="Buscar no histórico" value="${esc(hq)}"><select class="inp" style="width:auto;max-width:100%" id="hc"><option value="0">Todos os clientes</option>${db.clients.filter(scope).map(c=>`<option value="${c.id}" ${hc==c.id?"selected":""}>${esc(c.nome)}</option>`).join("")}</select></div><ul class="card" id="hlist" style="padding-top:6px;padding-bottom:6px">${histHTML()}</ul>`}
function drawModal(){const m=document.getElementById("modal"),c=db.clients.find(x=>x.id==openId);if(!c){m.style.display="none";return}
  const p=prop(c.imovel)||{nome:"-"},row=(k,v)=>`<div><p class="text-xs text-muted">${k}</p><p class="text-sm font-semibold">${esc(v||"-")}</p></div>`;
  m.style.display="flex";m.innerHTML=`<div class="card" style="max-width:600px;width:100%;max-height:92vh;overflow:auto"><div class="flex justify-between gap-3"><div><p class="ttl">FICHA DO CLIENTE · IMB-${String(c.id).slice(-6)}</p><h2 class="text-xl font-extrabold">${esc(c.nome)}</h2></div><button class="btn btn-out" data-act="close">Fechar</button></div>
  <div class="grid grid-cols-2 gap-3 my-4">${row("Telefone",fone(c.tel))}${row("E-mail",c.email)}${row("Empreendimento",p.nome)}${row("Região",c.regiao)}${row("Faixa de renda",c.renda)}${row("Contato preferido",c.contato)}${row("Origem",c.origem==="corretor"?"Cadastro do corretor":"Site")}${row("Corretor (lead travado)",broker(c.corretorId).nome)}${row("Cadastrado em",fdate(c.criado))}${row("Valor do imóvel",money(p.preco||0))}</div>${c.obs?`<div class="mb-4">${row("Observações",c.obs)}</div>`:""}
  <label>Etapa do atendimento</label>${statusSel(c)}
  <h3 class="font-bold mt-4">Histórico</h3><ul>${c.historico.slice().reverse().map(h=>`<li class="tl"><span class="dot"></span><div><p class="text-xs text-muted">${fdate(h.d)}</p><p class="text-sm">${esc(h.t)}</p></div></li>`).join("")}</ul>
  <div class="flex gap-2 mt-3"><input class="inp" id="mn${c.id}" placeholder="Registrar anotação"><button class="btn btn-blue" data-act="mnote" data-id="${c.id}">Salvar</button></div></div>`}
document.addEventListener("submit",e=>{if(e.target.id!=="formCad")return;e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),er={};
  if((f.nome||"").trim().length<3)er.nome="Informe o nome completo.";
  if(digits(f.tel||"").length<10)er.tel="Informe um telefone válido com DDD.";
  if(f.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email))er.email="E-mail inválido.";
  if(!f.lgpd)er.lgpd="É necessário autorizar o uso dos dados.";
  e.target.querySelectorAll("[data-e]").forEach(s=>s.textContent=er[s.dataset.e]||"");
  if(Object.keys(er).length){toast("Revise os campos destacados");return}
  const r=addLead(f);render();const box=document.getElementById("cadRes");
  box.innerHTML=`<div class="p-3 rounded-lg text-sm" style="border:1px solid var(--gold);background:var(--bg)">${r.dup?"Cliente já cadastrado. O atendimento permanece com":"Cadastro recebido. Protocolo <b>IMB-"+String(r.c.id).slice(-6)+"</b>. Corretor responsável:"} <b>${broker(r.c.corretorId).nome}</b>.</div>`;box.scrollIntoView({behavior:"smooth",block:"center"})});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&openId){openId=null;drawModal()}});
const USERS=[{email:"gestor@imob.com.br",senha:"imob123",role:"gestor",nome:"Gestão IMOB"},{email:"ana@imob.com.br",senha:"ana123",role:"corretor",brokerId:1,nome:"Ana Souza"},{email:"carlos@imob.com.br",senha:"carlos123",role:"corretor",brokerId:2,nome:"Carlos Lima"},{email:"marina@imob.com.br",senha:"marina123",role:"corretor",brokerId:3,nome:"Marina Alves"}];
const ALLOWED={cliente:["cliente","cadastro"],corretor:["corretor","acomp","historico"],gestor:ROUTES};
const START={cliente:"cliente",corretor:"corretor",gestor:"gestor"};
let user=null;try{user=JSON.parse(sessionStorage.getItem("imob-user"))}catch(e){}
if(user&&user.brokerId)brokerSel=user.brokerId;
const scope=c=>!user||user.role!=="corretor"||c.corretorId===user.brokerId;
function setUser(u){user=u;try{u?sessionStorage.setItem("imob-user",JSON.stringify(u)):sessionStorage.removeItem("imob-user")}catch(e){}
  if(u){if(u.brokerId)brokerSel=u.brokerId;view=START[u.role];if(location.hash!=="#"+view)location.hash=view}else{history.replaceState(null,"",location.pathname+location.search)}
  render();window.scrollTo(0,0)}
function drawWho(){document.getElementById("login").style.display="none";
  document.getElementById("who").innerHTML=`<span class="text-sm text-muted" style="white-space:nowrap">${esc(user.nome)} · <b>${{cliente:"Cliente",corretor:"Corretor",gestor:"Gestor"}[user.role]}</b></span><button class="btn btn-out" style="padding:8px 14px;min-height:38px" data-act="logout">Sair</button>`}
function drawLogin(){openId=null;drawModal();document.getElementById("who").innerHTML="";document.getElementById("app").innerHTML="";
  const L=document.getElementById("login");L.style.display="block";L.style.background="#9A8C80";
  L.innerHTML=`<div style="position:fixed;inset:-40px;background:url(${BG}) center/cover;filter:blur(22px)"></div><div style="position:fixed;inset:0;background:url(${BG}) center/contain no-repeat"></div><div style="position:relative;min-height:100%;display:flex;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top,0px)) 16px calc(24px + env(safe-area-inset-bottom,0px))"><div style="width:100%;max-width:400px;background:rgba(15,23,42,.92);padding:22px;border-radius:16px;border:1px solid #1E293B;box-shadow:0 10px 40px rgba(0,0,0,.45)">
   <div class="text-center mb-5"><img src="${LOGO}" alt="Logo IMOB Tá Na Mão" style="width:140px;height:auto;margin:0 auto;border-radius:12px;display:block"><h1 class="text-2xl font-extrabold mt-4" style="color:var(--gold)">Acesse sua conta</h1><p class="text-sm text-muted">Plataforma de gestão IMOB Tá Na Mão</p></div>
   <form id="formLogin" class="card space-y-3" style="border-top:4px solid var(--gold)"><div><label>E-mail</label><input class="inp" name="email" type="email" autocomplete="username" required></div><div><label>Senha</label><input class="inp" name="senha" type="password" autocomplete="current-password" required></div><small class="err" id="loginErr"></small><button class="btn btn-gold w-full" type="submit">Entrar</button><button type="button" class="btn btn-out w-full" data-act="guest">Continuar como cliente</button></form>
   <details class="card mt-3 text-sm"><summary class="font-semibold cursor-pointer">Acessos de demonstração</summary><div class="mt-2 text-muted space-y-1">${USERS.map(u=>`<p><b>${u.nome}</b> (${u.role}) · ${u.email} · senha: ${u.senha}</p>`).join("")}</div></details>
   <p class="text-center text-xs text-muted mt-4">IMOB Imobiliária · CRECI 050285-J</p></div></div>`}
document.addEventListener("submit",e=>{if(e.target.id!=="formLogin")return;e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),u=USERS.find(x=>x.email===f.email.trim().toLowerCase()&&x.senha===f.senha);
  if(!u){document.getElementById("loginErr").textContent="E-mail ou senha incorretos.";return}setUser({role:u.role,nome:u.nome,brokerId:u.brokerId})});
function render(){
  if(!user){drawLogin();return}
  if(!ALLOWED[user.role].includes(view))view=START[user.role];
  drawWho();
  document.getElementById("app").innerHTML={cliente:viewCliente,cadastro:viewCadastro,corretor:viewCorretor,acomp:viewAcomp,historico:viewHist,gestor:viewGestor}[view]();
  document.querySelectorAll(".tab").forEach(t=>{t.classList.toggle("on",t.dataset.t===view);t.style.display=ALLOWED[user.role].includes(t.dataset.t)?"":"none"});
  if(view==="cliente")calcSim();drawModal();
}
function route(){const h=location.hash.replace("#","");if(ROUTES.includes(h)&&user&&ALLOWED[user.role].includes(h)){view=h;render();window.scrollTo(0,0)}else if(h!=="atender"&&!document.getElementById("app").innerHTML){view="cliente";render()}}
window.addEventListener("hashchange",route);
window.addEventListener("storage",e=>{if(e.key===KEY){db=load();render()}});
document.addEventListener("submit",e=>{if(e.target.id!=="formCorretor")return;e.preventDefault();const f=Object.fromEntries(new FormData(e.target));
  if(digits(f.tel).length<10){toast("Informe um telefone válido com DDD");return}
  const r=addLead({...f,regiao:"",corretorId:brokerSel});render();toast(r.dup?"Cliente já pertence a "+broker(r.c.corretorId).nome+" (lead travado)":"Cliente cadastrado na sua carteira")});

document.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;
  if(a==="guest")setUser({role:"cliente",nome:"Visitante"});
  if(a==="logout")setUser(null);
  if(a==="open"){openId=b.dataset.id;drawModal()}
  if(a==="close"){openId=null;drawModal()}
  if(a==="mv"){const c=db.clients.find(x=>x.id==b.dataset.id),i=STATUS.indexOf(c.status)+ +b.dataset.d;if(STATUS[i]){setStatus(c.id,STATUS[i]);render();toast(c.nome+": "+STATUS[i])}}
  if(a==="mnote"){const i=document.getElementById("mn"+b.dataset.id),c=db.clients.find(x=>x.id==b.dataset.id);if(i.value.trim()){c.historico.push({d:now(),t:"Anotação: "+i.value.trim()});save();render();toast("Anotação salva")}}
  if(a==="interesse"){document.getElementById("fImovel").value=b.dataset.id;document.getElementById("atender").scrollIntoView({behavior:"smooth"})}
  if(a==="note"){const i=document.getElementById("n"+b.dataset.id),c=db.clients.find(x=>x.id==b.dataset.id);if(i.value.trim()){c.historico.push({d:now(),t:"Anotação: "+i.value.trim()});save();render();toast("Anotação salva")}}
  if(a==="demo"){const n=["Rita Gomes","Tiago Pires","Elaine Cruz","Paulo Faria"][Math.floor(Math.random()*4)],p=PROPS[Math.floor(Math.random()*PROPS.length)];
    const r=addLead({nome:n,tel:"119"+Math.floor(10000000+Math.random()*89999999),imovel:p.id,regiao:p.regiao});render();toast("Lead distribuído para "+broker(r.c.corretorId).nome)}
  if(a==="reset"&&confirm("Restaurar os dados de demonstração?")){localStorage.removeItem(KEY);seed();render()}
});
document.addEventListener("change",e=>{
  if(e.target.dataset.status){setStatus(e.target.dataset.status,e.target.value);render();toast("Status atualizado")}
  if(e.target.hasAttribute("data-broker")){brokerSel=+e.target.value;render()}
  if(e.target.id==="fb"){fb=e.target.value;render()}
  if(e.target.id==="hc"){hc=e.target.value;render()}
});
document.addEventListener("input",e=>{const id=e.target.id;if(["sv","se","sp"].includes(id))calcSim();
  if(id==="cadTel")e.target.value=mask(e.target.value);
  if(id==="fq"){fq=e.target.value;document.getElementById("board").innerHTML=boardHTML()}
  if(id==="hq"){hq=e.target.value;document.getElementById("hlist").innerHTML=histHTML()}});
document.addEventListener("click",e=>{if(e.target.id==="modal"){openId=null;drawModal()}});
document.addEventListener("submit",e=>{
  if(e.target.id!=="formLead")return;e.preventDefault();
  const f=Object.fromEntries(new FormData(e.target));
  if(digits(f.tel).length<10){toast("Informe um telefone válido com DDD");return}
  const r=addLead(f);e.target.reset();
  document.getElementById("res").innerHTML=`<div class="p-3 rounded-xl" style="border:1px solid var(--gold);background:var(--bg)">${r.dup?"Você já está em nosso sistema! Seu atendimento continua com":"Cadastro recebido! Seu corretor será"} <b>${broker(r.c.corretorId).nome}</b>${r.dup?".":"."} Ele falará com você pelo WhatsApp.</div>`;
});

db=load();
document.getElementById("hdrLogo").src=LOGO;
if(ROUTES.includes(location.hash.slice(1)))view=location.hash.slice(1);
render();
