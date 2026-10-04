const $=s=>document.querySelector(s),n=v=>parseFloat(v)||0;
const money=v=>'$'+n(v).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2});
const pc=v=>Math.round(n(v)*100)+'%';
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const uid=()=>Math.random().toString(36).slice(2,9);
const G=[['contratista','Contratista'],['rfc','RFC'],['obra','Obra'],['cliente','Cliente'],['ubic','Ubicación'],['contrato','Contrato'],['estNo','Estimación No.'],['periodo','Periodo de la estimación'],['fecha','Fecha de elaboración','date'],['fracc','Primera línea de la tabla de conceptos (p. ej. Fraccionamiento)'],['linea2','Segunda línea de la tabla de conceptos (p. ej. Baja tensión, Media tensión)'],['aj1','Ajuste 1 al contrato original ($)','number'],['aj2','Ajuste 2 al contrato original ($)','number'],['an1','Primer anticipo ($)','number'],['an2','Segundo anticipo ($)','number'],['an3','Tercer anticipo ($)','number'],['antTot','Total del anticipo (se calcula solo)'],['amAnt','Amortizado hasta la estimación anterior ($)','number'],['amPct','% de amortización','number'],['iva','% de IVA','number'],['rEmp','Realizó — empresa'],['rNom','Realizó — nombre'],['vEmp','Revisó — empresa'],['vNom','Revisó — nombre'],['aEmp','Autorizó — empresa'],['aNom','Autorizó — nombre']];
const blank=()=>({id:null,g:{estNo:'01',amPct:20,iva:16,fecha:new Date().toISOString().slice(0,10)},items:[],gen:{},ev:{},rf:{},sel:''});
var S=blank(),tab='g';
/* ==================================================================
   ALMACENAMIENTO: base de datos compartida (Supabase).
   ⚠️ Pon aquí los datos de TU proyecto (Supabase → Project Settings → API).
   Mientras digan "TU_SUPABASE..." el sistema muestra una pantalla de aviso
   en vez de intentar conectarse.
   ================================================================== */
const SUPA_URL='https://nczsjqeooclqtvuegluu.supabase.co';
const SUPA_KEY='TU_SUPABASE_ANON_KEY';
const supa=(window.supabase&&!SUPA_URL.startsWith('TU_'))?window.supabase.createClient(SUPA_URL,SUPA_KEY):null;
/* 'k' (borrador en edición) es solo tuyo, no se comparte: vive en localStorage de tu navegador.
   'estimaciones' SÍ es la biblioteca compartida (tabla en Supabase). */
var idbPut=(store,val,key)=>{
if(store=='k'){try{localStorage.setItem('draft',JSON.stringify(val))}catch(e){}return Promise.resolve()}
return supa.from('estimaciones').upsert({id:val.id,owner:val.owner,payload:val}).then(({error})=>{if(error)throw error});
};
var idbDel=(store,key)=>{
if(store=='k')return Promise.resolve();
return supa.from('estimaciones').delete().eq('id',key).then(({error})=>{if(error)throw error});
};
async function load(){try{return JSON.parse(localStorage.getItem('draft')||'null')}catch(e){return null}}
let tm;const save=()=>{clearTimeout(tm);tm=setTimeout(async()=>{try{await idbPut('k',S)}catch(e){}},300)};
async function listaEstimaciones(){let q=supa.from('estimaciones').select('*').order('updated_at',{ascending:false});if(AUTH.rol!='admin')q=q.eq('owner',AUTH.email);
const{data,error}=await q;if(error)throw error;return(data||[]).map(r=>r.payload)}
async function loadUsuarios(){const[{data:p,error:e1},{data:iv,error:e2}]=await Promise.all([supa.from('profiles').select('*'),supa.from('invites').select('*')]);if(e1)throw e1;if(e2)throw e2;USERS=p||[];INVITES=iv||[]}
/* ---- cálculos ---- */
function C(){const r=S.items.filter(i=>!i.isHead).map(i=>{const q=n(i.cant),p=n(i.pu),a=n(i.ant),e=n(i.est);return{...i,imp:q*p,aI:a*p,eI:e*p,acQ:a+e,dif:q-(a+e),acI:(a+e)*p,av:q?(a+e)/q:0}});
const s=k=>r.reduce((t,x)=>t+x[k],0),g=S.g,t={r,contrato:s('imp'),ant:s('aI'),est:s('eI')};
t.act=t.contrato+n(g.aj1)+n(g.aj2);t.acum=t.ant+t.est;t.saldo=t.act-t.acum;const P=x=>t.act?x/t.act:0;t.pAnt=P(t.ant);t.pEst=P(t.est);t.pAc=t.pAnt+t.pEst;
t.antTot=n(g.an1)+n(g.an2)+n(g.an3);t.amEst=t.est*n(g.amPct)/100;t.amAc=n(g.amAnt)+t.amEst;t.amSal=t.antTot-t.amAc;
t.sinIva=t.est-t.amEst;t.ivaI=t.sinIva*n(g.iva)/100;t.liq=t.sinIva+t.ivaI;return t}
function letras(x){const u='_ UN DOS TRES CUATRO CINCO SEIS SIETE OCHO NUEVE DIEZ ONCE DOCE TRECE CATORCE QUINCE DIECISEIS DIECISIETE DIECIOCHO DIECINUEVE VEINTE VEINTIUN VEINTIDOS VEINTITRES VEINTICUATRO VEINTICINCO VEINTISEIS VEINTISIETE VEINTIOCHO VEINTINUEVE'.split(' ').map(a=>a=='_'?'':a),
d=',,,TREINTA,CUARENTA,CINCUENTA,SESENTA,SETENTA,OCHENTA,NOVENTA'.split(','),c=',CIENTO,DOSCIENTOS,TRESCIENTOS,CUATROCIENTOS,QUINIENTOS,SEISCIENTOS,SETECIENTOS,OCHOCIENTOS,NOVECIENTOS'.split(',');
const l=v=>{let s='';if(v>=100){s=v==100?'CIEN':c[v/100|0];v%=100;if(v)s+=' '}return s+(v<30?u[v]:d[v/10|0]+(v%10?' Y '+u[v%10]:''))};
x=Math.round(n(x)*100);const e=Math.floor(x/100),ct=String(x%100).padStart(2,'0'),mm=Math.floor(e/1e6),m=Math.floor(e/1e3)%1e3,r=e%1e3;
let s=(mm?(mm==1?'UN MILLON':l(mm)+' MILLONES')+' ':'')+(m?(m==1?'MIL':l(m)+' MIL')+' ':'')+(r?l(r):'');return(s.trim()||'CERO')+' '+ct+'/100 M.N'}
const dt=v=>v?String(v).split('-').reverse().join('/'):'',ordW=()=>letras(parseInt(S.g.estNo)||0).replace(/ \d\d\/100 M\.N$/,'').replace(/UN$/,'UNO');
function HDR(f){const g=S.g,b=(l,v)=>`<div><small>${l}</small><b>${esc(v)||'&nbsp;'}</b></div>`;return`<div class="hd" style="position:relative">${g.logo?`<img src="${g.logo}" style="position:absolute;right:6px;top:6px;max-height:40px;max-width:130px">`:''}${(f?[['CONTRATISTA',g.contratista],['RFC',g.rfc],['FECHA DE ELABORACION DE ESTIMACION',dt(g.fecha)],['OBRA',g.obra],['CLIENTE',g.cliente],['PERIODO DE LA ESTIMACION',g.periodo],['UBICACIÓN',g.ubic],['CONTRATO',g.contrato],['ESTIMACION No.',g.estNo]]:[['OBRA',g.obra],['UBICACIÓN',g.ubic],['CONTRATISTA',g.contratista],['CLIENTE',g.cliente],['ESTIMACION No.',g.estNo],['FECHA / PERIODO',dt(g.fecha)+'  '+(g.periodo||'')]]).map(x=>b(...x)).join('')}</div>`}
function FIR(){const g=S.g;return`<div class="fr">${[['Realizó','r'],['Revisó','v'],['Autorizó','a']].map(([l,k])=>`<div><small>${l}</small><span>${esc(g[k+'Emp'])}</span><i>${g['s'+k]?`<img src="${g['s'+k]}">`:''}</i><b>${esc(g[k+'Nom'])}</b></div>`).join('')}</div>`}
function sig(k,i){const f=i.files[0];if(!f)return;const im=new Image;im.onload=()=>{const q=Math.min(1,400/im.width),c=document.createElement('canvas');c.width=im.width*q;c.height=im.height*q;c.getContext('2d').drawImage(im,0,0,c.width,c.height);S.g[k]=c.toDataURL('image/png');save();draw()};im.src=URL.createObjectURL(f)}
function logo(i){const f=i.files[0];if(!f)return;const im=new Image;im.onload=()=>{const q=Math.min(1,300/im.width),c=document.createElement('canvas');c.width=im.width*q;c.height=im.height*q;c.getContext('2d').drawImage(im,0,0,c.width,c.height);S.g.logo=c.toDataURL('image/png');save();draw()};im.src=URL.createObjectURL(f)}
function ej(){if(!confirm('Esto reemplaza los datos generales actuales. ¿Continuar?'))return;Object.assign(S.g,{contratista:'SIMAVER',rfc:'AAPJ740822JQ3',obra:'HACIENDA LA PARROQUIA',cliente:'INGENIERIA PERICO SA DE CV',ubic:'Manzana 82',estNo:'01',fecha:'2026-09-23',an1:24004.84,amAnt:3188.96,amPct:20,iva:16,rEmp:'SIMAVER',rNom:'JARET ALVAREZ DIAZ',vEmp:'Ingeniería Perico S.A. DE C.V.',vNom:'ING. RICARDO RODRIGUEZ',aEmp:'Ingeniería Perico S.A. DE C.V.',aNom:'ING. JOSE LUIS VICENTE REYES.'});save();draw()}
/* ---- editor: pestañas Datos generales / Conceptos / Generador / Croquis / Carátula ---- */
const TABS=[['g','Datos generales'],['c','Conceptos'],['v','Generador de volumen'],['e','Croquis y fotos'],['f','RF Canalización'],['r','Carátula']];
function nav(){const e=$('#nav');if(e)e.innerHTML=TABS.map(([k,t])=>`<button class="${k==tab?'on':''}" onclick="go('${k}')">${t}</button>`).join('')}
function go(k){tab=k;nav();draw()}
const sel=()=>{if(!S.items.length)return'<p class="mut">Primero agrega conceptos en la pestaña Conceptos.</p>';if(!S.items.find(i=>i.id==S.sel))S.sel=S.items[0].id;
return`<label>Concepto<select onchange="S.sel=this.value;draw()">${S.items.map(i=>`<option value="${i.id}" ${i.id==S.sel?'selected':''}>${esc(i.clave)} — ${esc((i.desc||'').slice(0,80))}</option>`).join('')}</select></label>`};
function draw(){const m=$('#m');if(!m)return;
if(tab=='g'){const g=S.g;m.innerHTML=`<div class="card"><div class="grid">${G.map(([k,l,t])=>k=='antTot'?`<label>${l}<div class="ro" data-c="T:antTot"></div></label>`:`<label>${l}<input data-g="${k}" type="${t||'text'}" ${t=='number'?'step="any"':''} value="${esc(g[k])}"></label>`).join('')}</div></div>
<div class="card"><b>Logo de la empresa</b><p class="mut">Sale en la esquina del encabezado de cada hoja: Carátula, Cuerpo, Generador y Croquis y fotos, en pantalla, Excel y PDF.</p>
<label class="btn" style="display:inline-block">Subir logo<input type="file" accept="image/*" hidden onchange="logo(this)"></label> ${g.logo?`<img src="${g.logo}" style="height:36px;vertical-align:middle;margin-left:8px"> <button onclick="S.g.logo='';save();draw()">Quitar</button>`:''}</div>
<div class="card"><b>Firmas</b><p class="mut">Sube la imagen de la firma (opcional). Sale igual en carátula, cuerpo, generador y croquis, en pantalla, Excel y PDF.</p><div class="grid">${[['sr','Realizó'],['sv','Revisó'],['sa','Autorizó']].map(([k,l])=>`<div><label class="btn" style="display:inline-block">Firma: ${l}<input type="file" accept="image/*" hidden onchange="sig('${k}',this)"></label> ${g[k]?`<img src="${g[k]}" style="height:36px;vertical-align:middle"> <button onclick="S.g['${k}']='';save();draw()">Quitar</button>`:''}</div>`).join('')}</div></div>
<p><button onclick="ej()">Cargar datos de ejemplo (archivo original)</button></p><p class="mut">Este borrador se guarda solo en este navegador. Usa “Guardar en Mis Estimaciones” cuando quieras conservarlo en tu biblioteca.</p>`}
if(tab=='c'){const hdrs=['Clave','Descripción','Unidad','Cantidad','P.U.','Importe total','Acum. anterior','Esta estimación','Acumulado','Diferencia','Importe anterior','Imp. esta est.','Importe acumulado','Avance',''];
const row=i=>i.isHead?`<tr><td colspan="14" style="background:var(--blue);padding:0"><input style="background:transparent;border:none;color:#fff;font-weight:700;width:100%;padding:7px 8px" placeholder="Nombre de la sección, p. ej. OBRA CIVIL" data-h="${i.id}" value="${esc(i.text)}"></td><td style="background:var(--blue)"><button onclick="moveI('${i.id}',-1)" title="Subir">↑</button><button onclick="moveI('${i.id}',1)" title="Bajar">↓</button><button onclick="delI('${i.id}')">✕</button></td></tr>`
:`<tr><td><input style="width:80px" data-i="${i.id}:clave" value="${esc(i.clave)}"></td><td><textarea data-i="${i.id}:desc">${esc(i.desc)}</textarea></td><td><input style="width:60px" data-i="${i.id}:unidad" value="${esc(i.unidad)}"></td><td><input style="width:90px" type="number" step="any" data-i="${i.id}:cant" value="${esc(i.cant)}"></td><td><input style="width:100px" type="number" step="any" data-i="${i.id}:pu" value="${esc(i.pu)}"></td><td class="c" data-c="imp:${i.id}"></td><td><input style="width:90px" type="number" step="any" data-i="${i.id}:ant" value="${esc(i.ant)}"></td><td><input style="width:90px" type="number" step="any" data-i="${i.id}:est" value="${esc(i.est)}"></td><td class="c" data-c="acQ:${i.id}"></td><td class="c" data-c="dif:${i.id}"></td><td class="c" data-c="aI:${i.id}"></td><td class="c" data-c="eI:${i.id}"></td><td class="c" data-c="acI:${i.id}"></td><td class="c" data-c="av:${i.id}"></td><td><button onclick="moveI('${i.id}',-1)" title="Subir">↑</button><button onclick="moveI('${i.id}',1)" title="Bajar">↓</button><button onclick="delI('${i.id}')">✕</button></td></tr>`;
m.innerHTML=`<div class="card"><b>Cargar conceptos</b><p class="mut">Importa un presupuesto en Excel o PDF (clave, descripción, unidad, cantidad y precio unitario). Si una clave ya existe se actualiza. También puedes pegar las columnas desde Excel.</p><p><label class="btn p" style="display:inline-block;background:var(--acc);color:#fff">Importar desde Excel o PDF<input type="file" accept=".xlsx,.pdf" hidden onchange="imp(this)"></label> <span id="impm" class="mut"></span></p><textarea id="pst" rows="3" placeholder="OC-01 ⇥ INSTALACION DE BASE... ⇥ PZA ⇥ 2 ⇥ 1225.25"></textarea><p><button onclick="paste()">Agregar conceptos pegados</button> <button onclick="addI()">Agregar concepto vacío</button> <button onclick="addHead()">＋ Agregar sección (p. ej. OBRA CIVIL)</button></p></div>
<div class="card tw"><table><thead><tr>${hdrs.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
${S.items.map(row).join('')||'<tr><td colspan="15" class="mut" style="padding:14px">Aún no hay conceptos. Pega tu catálogo desde Excel o agrega uno.</td></tr>'}
</tbody><tfoot><tr><td colspan="6">Totales</td><td></td><td></td><td></td><td></td><td class="c" data-c="T:ant"></td><td class="c" data-c="T:est"></td><td class="c" data-c="T:acum"></td><td class="c" data-c="T:pAc"></td><td></td></tr></tfoot></table></div>`}
if(tab=='v'){const id=S.sel,rows=S.gen[id]||[];m.innerHTML=`${HDR()}<div class="card">${sel()}</div>${S.items.length?`<div class="card tw"><table><thead><tr><th>Elemento</th><th>Eje</th><th>Piezas</th><th>Largo</th><th>Alto</th><th>Ancho</th><th>Cantidad</th><th></th></tr></thead><tbody>
${rows.map((r,x)=>`<tr><td><input data-v="${x}:elem" value="${esc(r.elem)}"></td><td><input data-v="${x}:eje" value="${esc(r.eje)}"></td>${['pzas','largo','alto','ancho'].map(f=>`<td><input type="number" step="any" data-v="${x}:${f}" value="${esc(r[f])}"></td>`).join('')}<td class="c" data-c="gv:${x}"></td><td><button onclick="delV(${x})">✕</button></td></tr>`).join('')}
</tbody><tfoot><tr><td colspan="6">Total del concepto</td><td class="c" data-c="gt:"></td><td></td></tr></tfoot></table><p><button onclick="addV()">Agregar renglón</button> <span class="mut">La cantidad de “esta estimación” se actualiza sola con este total.</span></p></div>`:''}${FIR()}`}
if(tab=='e'){const id=S.sel,im=S.ev[id]||[];m.innerHTML=`${HDR()}<div class="card">${sel()}</div>${S.items.length?`<div class="card"><label class="btn" style="display:inline-block">Subir croquis o fotos<input type="file" accept="image/*" multiple hidden onchange="imgs(this)"></label><p class="mut">Las imágenes se reducen automáticamente para que el archivo no pese de más.</p><div class="th">${im.map((s,x)=>`<div><img src="${s}"><b onclick="delE(${x})">✕</b></div>`).join('')||'<span class="mut">Sin imágenes para este concepto.</span>'}</div></div>`:''}${FIR()}`}
if(tab=='f'){const id=S.sel,im=(S.rf[id]=S.rf[id]||[]);m.innerHTML=`${HDR()}<div class="card">${sel()}</div>${S.items.length?`<div class="card"><b>Registro fotográfico de canalización</b><p class="mut">Sube exactamente 2 fotografías por clave (antes/después, o dos ángulos de la excavación). Se muestran una junto a otra, con encabezado y firmas, igual que en Croquis.</p>
${im.length<2?`<label class="btn" style="display:inline-block">Subir ${2-im.length==1?'1 fotografía':'2 fotografías'}<input type="file" accept="image/*" multiple hidden onchange="imgsRF(this)"></label>`:'<p class="mut">Ya hay 2 fotografías para esta clave. Elimina una para reemplazarla.</p>'}
<div class="th" style="margin-top:8px">${im.map((s,x)=>`<div><img src="${s}"><b onclick="delRF(${x})">✕</b></div>`).join('')||'<span class="mut">Sin fotografías para este concepto.</span>'}</div></div>`:''}${FIR()}`}
if(tab=='r'){const t=C(),g=S.g,mv=v=>n(v)?money(v):'',T=(tt,rows)=>`<table class="cx"><thead><tr><th colspan="2">${tt}</th></tr></thead><tbody>${rows.map(([a,b,f])=>`<tr class="${f||''}"><td>${a}</td><td>${b}</td></tr>`).join('')}</tbody></table>`;
m.innerHTML=`${HDR(1)}<div class="two"><div>${T('ESTADO DE CUENTA',[['IMPORTE TOTAL DEL CONTRATO',money(t.contrato)],['AJUSTES AL CONTRATO ORIGINAL',mv(g.aj1)],['AJUSTES AL CONTRATO ORIGINAL',mv(g.aj2)],['IMPORTE DEL CONTRATO ACTUALIZADO',money(t.act),'b'],['ESTIMADO ANTERIOR',money(t.ant)],['IMPORTE DE ESTA ESTIMACION',money(t.est),'t'],['ACUMULADO ESTIMADO',money(t.acum)],['SALDO POR EJERCER',money(t.saldo)]])}
${T('AMORTIZACION',[['PRIMER ANTICIPO',mv(g.an1)],['SEGUNDO ANTICIPO',mv(g.an2)],['TERCERO ANTICIPO',mv(g.an3)],['TOTAL DEL ANTICIPO',money(t.antTot),'b'],['AMORTIZADO HASTA LA ESTIMACION ANTERIOR',money(g.amAnt)],[`AMORTIZADO EN ESTA ESTIMACION ${n(g.amPct)}%`,money(t.amEst),'t'],['TOTAL ACUMULADO AMORTIZADO',money(t.amAc)],['SALDO POR AMORTIZAR',money(t.amSal)]])}</div>
<div>${T('AVANCES DE OBRA ESTIMADO',[['HASTA LA ESTIMACION ANTERIOR',pc(t.pAnt)],['EN ESTA ESTIMACION',pc(t.pEst)],['HASTA ESTA ESTIMACION',pc(t.pAc)],['SALDO POR ESTIMAR',pc(1-t.pAc)]])}
${T(`ESTIMACION ${esc(g.estNo)} (${ordW()})`,[['IMPORTE DE ESTA ESTIMACION',money(t.est)],['AMORTIZADO EN ESTA ESTIMACION',money(t.amEst)],['TOTAL EN ESTIMACION SIN IVA',money(t.sinIva)]])}
${T('IMPORTES CON IVA',[['IMPORTE DE ESTA ESTIMACION',money(t.sinIva)],[`IVA ${n(g.iva)}%`,money(t.ivaI)],['IMPORTE LIQUIDO A COBRAR',money(t.liq)]])}</div></div>
<div class="liq"><div><span>IMPORTE LIQUIDO TOTAL</span><span>$ ${n(t.liq).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div><div><span>CON LETRA</span><span>${letras(t.liq)}</span></div></div>${FIR()}`}
refresh()}
function refresh(){const t=C();const A={};t.r.forEach(r=>A[r.id]=r);const rows=S.gen[S.sel]||[];const gv=r=>(n(r.pzas)||1)*(n(r.largo)||1)*(n(r.alto)||1)*(n(r.ancho)||1)*((r.pzas||r.largo||r.alto||r.ancho)?1:0);
const MK={imp:x=>money(x.imp),av:x=>pc(x.av),acQ:x=>n(x.acQ).toFixed(2),dif:x=>n(x.dif).toFixed(2),aI:x=>money(x.aI),eI:x=>money(x.eI),acI:x=>money(x.acI)};
document.querySelectorAll('[data-c]').forEach(e=>{const[k,id]=e.dataset.c.split(':');e.textContent=MK[k]?(A[id]?MK[k](A[id]):''):k=='T'?(id=='pAc'?pc(t[id]):money(t[id])):k=='gv'?gv(rows[id]).toFixed(2):k=='gt'?rows.reduce((s,r)=>s+gv(r),0).toFixed(2):''});nav()}
document.addEventListener('input',e=>{const d=e.target.dataset,v=e.target.value;
if(d.g){S.g[d.g]=v}
else if(d.i){const[id,f]=d.i.split(':');S.items.find(i=>i.id==id)[f]=v}
else if(d.h){S.items.find(i=>i.id==d.h).text=v}
else if(d.v){const[x,f]=d.v.split(':');const r=S.gen[S.sel][x];r[f]=v;const q=(n(r.pzas)||1)*(n(r.largo)||1)*(n(r.alto)||1)*(n(r.ancho)||1);r.cant=(r.pzas||r.largo||r.alto||r.ancho)?q:0;
const it=S.items.find(i=>i.id==S.sel);it.est=+S.gen[S.sel].reduce((s,r)=>s+n(r.cant),0).toFixed(4)}
else if(d.u){UF[d.u]=v;return}
else if(d.p){AUTH[d.p]=v;profSave();return}
else return;save();refresh()});
document.addEventListener('change',e=>{if(e.target.dataset.up){UF.perm[e.target.dataset.up]=e.target.checked}});
function addI(o={}){S.items.push({id:uid(),clave:'',desc:'',unidad:'PZA',cant:'',pu:'',ant:0,est:0,...o});save();draw()}
function addHead(){S.items.push({id:uid(),isHead:true,text:''});save();draw()}
function moveI(id,dir){const i=S.items.findIndex(x=>x.id==id),j=i+dir;if(j<0||j>=S.items.length)return;[S.items[i],S.items[j]]=[S.items[j],S.items[i]];save();draw()}
function delI(id){if(confirm(S.items.find(i=>i.id==id)?.isHead?'¿Eliminar esta sección?':'¿Eliminar este concepto?')){S.items=S.items.filter(i=>i.id!=id);delete S.gen[id];delete S.ev[id];delete S.rf[id];save();draw()}}
function paste(){$('#pst').value.split('\n').filter(l=>l.trim()).forEach(l=>{const c=l.split('\t');addI({clave:c[0]?.trim(),desc:c[1]?.trim(),unidad:c[2]?.trim()||'PZA',cant:n(String(c[3]).replace(/[$,]/g,'')),pu:n(String(c[4]).replace(/[$,]/g,''))})})}
function addV(){(S.gen[S.sel]=S.gen[S.sel]||[]).push({elem:'',eje:'',pzas:'',largo:'',alto:'',ancho:'',cant:0});save();draw()}
function delV(x){S.gen[S.sel].splice(x,1);const it=S.items.find(i=>i.id==S.sel);it.est=+S.gen[S.sel].reduce((s,r)=>s+n(r.cant),0).toFixed(4);save();draw()}
function delE(x){S.ev[S.sel].splice(x,1);save();draw()}
async function imgs(inp){for(const f of inp.files){const u=await new Promise(r=>{const i=new Image;i.onload=()=>{const k=Math.min(1,1400/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.75))};i.src=URL.createObjectURL(f)});(S.ev[S.sel]=S.ev[S.sel]||[]).push(u)}save();draw()}
function delRF(x){S.rf[S.sel].splice(x,1);save();draw()}
async function imgsRF(inp){const cupo=2-(S.rf[S.sel]||[]).length;if(cupo<=0)return;const files=[...inp.files].slice(0,cupo);
if(inp.files.length>files.length)alert('Solo se tomaron las primeras '+files.length+' foto(s); el límite es 2 por clave.');
for(const f of files){const u=await new Promise(r=>{const i=new Image;i.onload=()=>{const k=Math.min(1,1400/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.75))};i.src=URL.createObjectURL(f)});(S.rf[S.sel]=S.rf[S.sel]||[]).push(u)}save();draw()}
/* ---- importar Excel / PDF ---- */
const CL=/^[A-Za-z]{1,5}[-A-Za-z0-9.]*\d[A-Za-z0-9.-]*$/,UN=/^(PZAS?|PZ|ML|M2|M3|M|KG|LT|TON|LOTE|JGO|REG|SERV|HR|DIA|VIAJE)$/i,
num=v=>typeof v=='number'?v:parseFloat(String(v).replace(/[$,\s]/g,'')),isNum=v=>typeof v=='number'||/^[\s$]*-?[\d,]*\.?\d+\s*$/.test(String(v));
function rowItem(c){c=Array.from(c).map(v=>v&&v.result!==undefined?v.result:v&&v.richText?v.richText.map(t=>t.text).join(''):v==null||typeof v=='object'?'':v);
const k=c.findIndex(v=>typeof v=='string'&&CL.test(v.trim())),u=c.findIndex((v,x)=>k>=0&&x>k&&UN.test(String(v).trim()));if(k<0||u<0)return;
const q=c.slice(u+1).filter(v=>v!==''&&isNum(v)).map(num);if(q.length<2)return;
return{clave:String(c[k]).trim(),desc:c.slice(k+1,u).filter(v=>v!=='').join(' ').replace(/\s+/g,' ').trim(),unidad:String(c[u]).trim().toUpperCase(),cant:q[0],pu:q[1]}}
async function impX(b){const wb=new ExcelJS.Workbook();await wb.xlsx.load(b);const o=[];wb.eachSheet(w=>{if(w.state=='visible'&&!/GENERADOR|CROQUIS|CARATULA|FOTO/i.test(w.name))w.eachRow(r=>{const i=rowItem(r.values.slice(1));i&&o.push(i)})});return o}
async function pw(){pdfjsLib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([await(await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js')).text()],{type:'text/javascript'}))}
async function impP(b){await pw();const pdf=await pdfjsLib.getDocument({data:b}).promise,o=[],SK=/^(IMPORTE .*|OBRA (CIVIL|ELECTROMECANICA)|MEDIA TENSION|BAJA TENSION|ALUMBRADO MANZANA|TR[ÁA]MITES|FRACCIONAMIENTO .*|MANZANA \d+.*|SUBTOTAL.*|IVA.*|TOTAL.*|ING\. .*|GERENCIA .*|FRANCISCO .*|PRESUPUESTO|CLAVE.*|DESCRIPCI.*|VERACRUZ.*|MEDIA, BAJA.*|FRACC\. .*|ATN\. .*|PARR-.*)$/i;
for(let p=1;p<=pdf.numPages;p++){const tc=await(await pdf.getPage(p)).getTextContent(),L=[];
tc.items.filter(t=>t.str.trim()).forEach(t=>{const y=t.transform[5];let l=L.find(l=>Math.abs(l.y-y)<2.5);if(!l)L.push(l={y,t:[]});l.t.push({x:t.transform[4],s:t.str.trim()})});
L.sort((a,b)=>b.y-a.y);L.forEach(l=>{l.t.sort((a,b)=>a.x-b.x);l.it=rowItem(l.t.map(t=>t.s));l.parts=l.it?[[l.y,l.it.desc]]:[]});
const A=L.filter(l=>l.it);L.forEach(l=>{if(l.it||!A.length)return;const s=l.t.map(t=>t.s).join(' ');if(SK.test(s)||l.t.some(t=>isNum(t.s)))return;
const a=A.reduce((m,x)=>Math.abs(x.y-l.y)<Math.abs(m.y-l.y)?x:m);if(Math.abs(a.y-l.y)<45)a.parts.push([l.y,s])});
A.forEach(a=>{a.it.desc=a.parts.sort((x,y)=>y[0]-x[0]).map(x=>x[1]).join(' ').replace(/\s+/g,' ').trim();o.push(a.it)})}return o}
async function imp(i){const f=i.files[0];if(!f)return;const m=$('#impm');m.textContent='Leyendo '+f.name+'…';
try{const b=await f.arrayBuffer(),l=/\.pdf$/i.test(f.name)?await impP(b):await impX(b);if(!l.length){m.textContent='No encontré conceptos con clave, unidad, cantidad y precio en ese archivo.';return}
let a=0,u=0;l.filter((x,k)=>l.findIndex(y=>y.clave==x.clave)==k).forEach(x=>{const e=S.items.find(i=>i.clave==x.clave);if(e){Object.assign(e,x);u++}else{S.items.push({id:uid(),ant:0,est:0,...x});a++}});save();draw();$('#impm').textContent=`Se agregaron ${a} y se actualizaron ${u} conceptos. Revisa las descripciones.`}
catch(e){m.textContent='No pude leer el archivo: '+e.message}i.value=''}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click()}
const bk=()=>dl(new Blob([JSON.stringify(S)],{type:'application/json'}),`estimacion_${S.g.estNo||''}.json`);
function nueva(){if(!confirm('Se guardará un respaldo de esta estimación y se preparará la siguiente:\n• Se conservan datos generales, firmas, anticipos y conceptos.\n• Lo estimado ahora pasa a "cantidad anterior" y el amortizado a "amortizado hasta la anterior".\n• Se limpian generador, croquis/fotos y periodo.\n¿Continuar?'))return;bk();const t=C();
S.g.amAnt=+(n(S.g.amAnt)+t.amEst).toFixed(2);S.items.forEach(i=>{i.ant=+(n(i.ant)+n(i.est)).toFixed(4);i.est=0});S.gen={};S.ev={};S.rf={};
S.g.estNo=String((parseInt(S.g.estNo)||0)+1).padStart(2,'0');S.g.periodo='';S.g.fecha=new Date().toISOString().slice(0,10);save();go('c')}
function borrar(){if(!confirm('Se borrarán TODOS los datos de este borrador (conceptos, firmas, fotos). Antes se descargará un respaldo. Tus estimaciones ya guardadas en la biblioteca no se ven afectadas. ¿Continuar?'))return;bk();S=blank();save();renderRoot()}
function rs(i){const r=new FileReader;r.onload=()=>{S=JSON.parse(r.result);if(!S.id)S.id=null;S.rf=S.rf||{};save();page='editor';tab='g';renderRoot()};r.readAsText(i.files[0]);i.value=''}
const fname=e=>`Estimacion_${S.g.estNo||'01'}_${(S.g.obra||'obra').replace(/\W+/g,'_')}.${e}`;
/* ==================================================================
   MIS ESTIMACIONES (biblioteca guardada)
   ================================================================== */
async function guardarLib(){if(!S.items.length&&!S.g.obra){alert('Agrega al menos los datos generales o un concepto antes de guardar.');return}
if(!S.id)S.id=uid();
const rec={id:S.id,owner:AUTH.email,ownerNombre:(AUTH.nombre||'')+' '+(AUTH.apellido||''),savedAt:new Date().toISOString(),meta:{obra:S.g.obra||'',contratista:S.g.contratista||'',cliente:S.g.cliente||'',ubic:S.g.ubic||'',estNo:S.g.estNo||'',fecha:S.g.fecha||''},data:JSON.parse(JSON.stringify(S))};
await idbPut('estimaciones',rec);save();alert('Estimación guardada en tu biblioteca (Mis estimaciones).')}
function libRow(r){const m=r.meta;return`<div class="libr"><div><b>Estimación ${esc(m.estNo)} — ${esc(m.obra||'(sin nombre de obra)')}</b><div class="mt">${esc(m.contratista||'—')} · Cliente: ${esc(m.cliente||'—')} · ${esc(m.ubic||'—')} · ${dt(m.fecha)}${AUTH.rol=='admin'?' · Por: '+esc(r.ownerNombre||r.owner):''}</div></div><div class="ac"><button onclick="editLib('${r.id}')">Abrir / Editar</button><button onclick="dlLibXlsx('${r.id}')">Excel</button><button onclick="dlLibPdf('${r.id}')">PDF</button><button onclick="delLib('${r.id}')" style="color:#a4353f">Eliminar</button></div></div>`}
function editLib(id){const r=LIB.find(x=>x.id==id);if(!r)return;S=JSON.parse(JSON.stringify(r.data));S.id=r.id;S.rf=S.rf||{};save();page='editor';tab='g';renderRoot()}
async function delLib(id){if(!confirm('¿Eliminar esta estimación de la biblioteca? No se puede deshacer.'))return;await idbDel('estimaciones',id);LIB=LIB.filter(x=>x.id!=id);renderRoot()}
async function withData(data,fn){const b=S;data.rf=data.rf||{};S=data;try{await fn()}finally{S=b}}
async function dlLibXlsx(id){const r=LIB.find(x=>x.id==id);if(r)await withData(r.data,xlsx)}
async function dlLibPdf(id){const r=LIB.find(x=>x.id==id);if(r)await withData(r.data,pdf)}
/* ---- Excel ---- */
async function xlsx(){const t=C(),g=S.g,wb=new ExcelJS.Workbook(),T1={style:'thin'},B={top:T1,left:T1,bottom:T1,right:T1},M='"$"#,##0.00',fl=a=>({type:'pattern',pattern:'solid',fgColor:{argb:a}}),
H=(row,c)=>row.eachCell(x=>{x.font={bold:true,name:'Arial',size:9};x.fill=fl(c||'FFBDD7EE');x.border=B;x.alignment={wrapText:true,vertical:'middle',horizontal:'center'}}),
P=w=>{w.pageSetup={orientation:'landscape',paperSize:9,fitToPage:true,fitToWidth:1,fitToHeight:0}},
BX=(w,rg,pr)=>{const[a,b=a]=rg.split(':'),ca=w.getCell(a),cb=w.getCell(b);if(a!=b)w.mergeCells(rg);ca.value={richText:pr.flatMap(([l,v])=>[{text:l+':\n',font:{size:8,color:{argb:'FF666666'},name:'Arial'}},{text:(v||'')+'\n',font:{bold:true,size:10,name:'Arial'}}])};ca.alignment={wrapText:true,vertical:'top'};for(let r=ca.row;r<=cb.row;r++)for(let k=ca.col;k<=cb.col;k++)w.getCell(r,k).border=B},
HD=(w,R,r)=>{w.getRow(r).height=62;[[['OBRA',g.obra],['UBICACIÓN',g.ubic]],[['CONTRATISTA',g.contratista],['CLIENTE',g.cliente]],[['ESTIMACION No.',g.estNo],['FECHA / PERIODO',dt(g.fecha)+'  '+(g.periodo||'')]]].forEach((p,i)=>BX(w,`${R[i][0]}${r}:${R[i][1]}${r}`,p))},
LG=(w,col,row)=>{if(!g.logo)return;w.addImage(wb.addImage({base64:g.logo,extension:'png'}),{tl:{col:col-1+.15,row:(row||1)-1+.12},ext:{width:110,height:40}})},
FIR=(w,r,R)=>{[['Realizó','r'],['Revisó','v'],['Autorizó','a']].forEach(([l,k],i)=>{const[a,b]=R[i],c1=w.getColumn(a).number,c2=w.getColumn(b).number;[l,g[k+'Emp']||'','','',g[k+'Nom']||''].forEach((x,j)=>{if(a!=b)w.mergeCells(r+j,c1,r+j,c2);const c=w.getCell(r+j,c1);c.value=x;c.font={name:'Arial',size:8,bold:j==4};c.alignment={horizontal:'center',vertical:'middle'};for(let q=c1;q<=c2;q++)w.getCell(r+j,q).border={left:q==c1?T1:undefined,right:q==c2?T1:undefined,top:j==0?T1:undefined,bottom:j==4?T1:undefined}});
w.getRow(r+2).height=22;w.getRow(r+3).height=22;const s=g['s'+k];if(s)w.addImage(wb.addImage({base64:s,extension:s.includes('png')?'png':'jpeg'}),{tl:{col:c1-1+.25,row:r+1},ext:{width:130,height:55}})})};
const cu=wb.addWorksheet('CARATULA'),cp=wb.addWorksheet('CUERPO'),ge=wb.addWorksheet('GENERADOR'),ev=wb.addWorksheet('CROQUIS Y FOTOS'),rf=wb.addWorksheet('RF CANALIZACION');[cu,cp,ge,ev,rf].forEach(P);cu.pageSetup.fitToHeight=1;
/* CUERPO */
const RC=[['A','B'],['C','H'],['I','N']];cp.columns=[9,60,8,11,13,14,11,11,11,11,14,14,14,9].map(w=>({width:w}));cp.addRow([]);HD(cp,RC,1);LG(cp,14,1);
const hr1=cp.addRow(['Clave','Descripción','Unidad','Cantidad','P.U.','Importe total','VOLUMENES','','','','IMPORTES','','','Avance']);
const hr2=cp.addRow(['','','','','','','Acum. anterior','Esta estimación','Acumulado','Diferencia','Importe anterior','Imp. esta estimación','Importe acumulado','']);
['A','B','C','D','E','F','N'].forEach(c=>cp.mergeCells(`${c}${hr1.number}:${c}${hr2.number}`));cp.mergeCells(`G${hr1.number}:J${hr1.number}`);cp.mergeCells(`K${hr1.number}:M${hr1.number}`);
[hr1,hr2].forEach(r=>{for(let c=1;c<=14;c++){const cc=r.getCell(c);cc.font={bold:true,size:8.5,name:'Arial'};cc.fill=fl('FFBDD7EE');cc.border=B;cc.alignment={horizontal:'center',vertical:'middle',wrapText:true}}});hr1.height=16;hr2.height=26;
const subt=(txt)=>{if(!txt)return;const w=cp.addRow([txt]);cp.mergeCells(w.number,1,w.number,14);const c=w.getCell(1);c.font={bold:true,size:10,color:{argb:'FF1F4E79'},name:'Arial'};c.alignment={vertical:'middle',indent:1};w.height=16};
subt(g.fracc);subt(g.linea2);
const firstR=cp.rowCount+1;
S.items.forEach(i=>{
if(i.isHead){const w=cp.addRow([i.text||'']);cp.mergeCells(w.number,1,w.number,14);const c=w.getCell(1);c.font={bold:true,size:10,color:{argb:'FFFFFFFF'},name:'Arial'};c.fill=fl('FF2F5D8A');c.alignment={vertical:'middle',indent:1};for(let k=1;k<=14;k++)w.getCell(k).border=B;w.height=18;return}
const r=cp.rowCount+1,w=cp.addRow([i.clave,i.desc,i.unidad,n(i.cant),n(i.pu),{formula:`D${r}*E${r}`},n(i.ant),n(i.est),{formula:`G${r}+H${r}`},{formula:`D${r}-I${r}`},{formula:`G${r}*E${r}`},{formula:`H${r}*E${r}`},{formula:`K${r}+L${r}`},{formula:`IF(D${r}=0,0,I${r}/D${r})`}]);w.height=Math.max(16,Math.ceil(String(i.desc||'').length/58)*11.5+5);
w.eachCell(c=>{c.border=B;c.font={name:'Arial',size:9};c.alignment={wrapText:true,vertical:'middle'}});w.getCell(8).fill=fl('FFFFF6C0');[5,6,11,12,13].forEach(k=>w.getCell(k).numFmt=M);w.getCell(14).numFmt='0%'});
const lastR=cp.rowCount,T=cp.rowCount+1,f=cp.addRow(['TOTALES','','','','',{formula:`SUM(F${firstR}:F${lastR})`},'','','','',{formula:`SUM(K${firstR}:K${lastR})`},{formula:`SUM(L${firstR}:L${lastR})`},{formula:`SUM(M${firstR}:M${lastR})`}]);H(f);[6,11,12,13].forEach(k=>f.getCell(k).numFmt=M);
const ivaP=n(g.iva),fi=cp.addRow(['IVA '+ivaP+'%','','','','',{formula:`F${T}*${ivaP}/100`},'','','','',{formula:`K${T}*${ivaP}/100`},{formula:`L${T}*${ivaP}/100`},{formula:`M${T}*${ivaP}/100`}]);H(fi);[6,11,12,13].forEach(k=>fi.getCell(k).numFmt=M);
const ft=cp.addRow(['TOTAL CON IVA','','','','',{formula:`F${T}+F${T+1}`},'','','','',{formula:`K${T}+K${T+1}`},{formula:`L${T}+L${T+1}`},{formula:`M${T}+M${T+1}`}]);H(ft);[6,11,12,13].forEach(k=>ft.getCell(k).numFmt=M);
cp.views=[{state:'frozen',ySplit:3}];cp.pageSetup.printTitlesRow='2:3';FIR(cp,T+4,RC);
/* CARATULA (misma distribución que el archivo original) */
cu.columns=[42,16,30,16,42,16].map(w=>({width:w}));cu.mergeCells('A1:F1');cu.getCell('A1').value='CARATULA DE ESTIMACION';cu.getCell('A1').font={bold:true,size:14,name:'Arial'};cu.getCell('A1').alignment={horizontal:'center'};LG(cu,6,1);
[[['CONTRATISTA',g.contratista],['RFC',g.rfc],['FECHA DE ELABORACION DE ESTIMACION',dt(g.fecha)]],[['OBRA',g.obra],['CLIENTE',g.cliente],['PERIODO DE LA ESTIMACION',g.periodo]],[['UBICACIÓN',g.ubic],['CONTRATO',g.contrato],['ESTIMACION No.',g.estNo]]].forEach((row,i)=>{cu.getRow(i+2).height=38;row.forEach((p,j)=>BX(cu,`${'ACE'[j]}${i+2}:${'BDF'[j]}${i+2}`,[p]))});
const st=(c,bd,f)=>{c.font={name:'Arial',size:9,bold:!!bd};if(f)c.fill=fl(f);c.border=B},
TH=(r,a,b,x)=>{cu.mergeCells(`${a}${r}:${b}${r}`);[a,b].forEach(k=>st(cu.getCell(k+r),1,'FFBDD7EE'));const c=cu.getCell(a+r);c.value=x;c.alignment={horizontal:'center'}},
TR=(r,a,b,l,v,fm,bd,f)=>{const x=cu.getCell(a+r),y=cu.getCell(b+r);x.value=l;y.value=v;y.numFmt=fm||M;y.alignment={horizontal:'right'};st(x,bd,f);st(y,bd,f)},TN='FFDEEBF7',z=v=>n(v)?n(v):null;
TH(6,'A','B','ESTADO DE CUENTA');TR(7,'A','B','IMPORTE TOTAL DEL CONTRATO',{formula:`CUERPO!F${T}`});TR(8,'A','B','AJUSTES AL CONTRATO ORIGINAL',z(g.aj1));TR(9,'A','B','AJUSTES AL CONTRATO ORIGINAL',z(g.aj2));TR(10,'A','B','IMPORTE DEL CONTRATO ACTUALIZADO',{formula:'SUM(B7:B9)'},M,1);TR(11,'A','B','ESTIMADO ANTERIOR',{formula:`CUERPO!K${T}`});TR(12,'A','B','IMPORTE DE ESTA ESTIMACION',{formula:`CUERPO!L${T}`},M,1,TN);TR(13,'A','B','ACUMULADO ESTIMADO',{formula:'B11+B12'});TR(14,'A','B','SALDO POR EJERCER',{formula:'B10-B13'});
TH(17,'A','B','AMORTIZACION');TR(18,'A','B','PRIMER ANTICIPO',z(g.an1));TR(19,'A','B','SEGUNDO ANTICIPO',z(g.an2));TR(20,'A','B','TERCERO ANTICIPO',z(g.an3));TR(21,'A','B','TOTAL DEL ANTICIPO',{formula:'SUM(B18:B20)'},M,1);TR(22,'A','B','AMORTIZADO HASTA LA ESTIMACION ANTERIOR',n(g.amAnt));TR(23,'A','B',`AMORTIZADO EN ESTA ESTIMACION ${n(g.amPct)}%`,{formula:`B12*${n(g.amPct)}/100`},M,1,TN);TR(24,'A','B','TOTAL ACUMULADO AMORTIZADO',{formula:'B22+B23'});TR(25,'A','B','SALDO POR AMORTIZAR',{formula:'B21-B24'});
TH(6,'E','F','AVANCES DE OBRA ESTIMADO');TR(7,'E','F','HASTA LA ESTIMACION ANTERIOR',{formula:'IF(B10=0,0,B11/B10)'},'0%');TR(8,'E','F','EN ESTA ESTIMACION',{formula:'IF(B10=0,0,B12/B10)'},'0%');TR(9,'E','F','HASTA ESTA ESTIMACION',{formula:'F7+F8'},'0%');TR(10,'E','F','SALDO POR ESTIMAR',{formula:'1-F9'},'0%');
TH(12,'E','F',`ESTIMACION ${g.estNo||''} (${ordW()})`);TR(13,'E','F','IMPORTE DE ESTA ESTIMACION',{formula:'B12'});TR(14,'E','F','AMORTIZADO EN ESTA ESTIMACION',{formula:'B23'});TR(15,'E','F','TOTAL EN ESTIMACION SIN IVA',{formula:'F13-F14'});
TH(17,'E','F','IMPORTES CON IVA');TR(18,'E','F','IMPORTE DE ESTA ESTIMACION',{formula:'F15'});TR(19,'E','F',`IVA ${n(g.iva)}%`,{formula:`F18*${n(g.iva)}/100`});TR(20,'E','F','IMPORTE LIQUIDO A COBRAR',{formula:'F18+F19'});
cu.mergeCells('A27:D27');cu.mergeCells('A28:F28');cu.getCell('A27').value='IMPORTE LIQUIDO TOTAL';cu.getCell('E27').value='$';cu.getCell('F27').value={formula:'F20'};cu.getCell('F27').numFmt='#,##0.00';cu.getCell('A28').value='CON LETRA: '+letras(t.liq);[27,28].forEach(r=>{for(let c=1;c<=6;c++)st(cu.getCell(r,c),1,'FFBDD7EE')});cu.getCell('F27').alignment={horizontal:'right'};FIR(cu,30,[['A','B'],['C','D'],['E','F']]);
/* GENERADOR */
const RG=[['A','B'],['C','E'],['F','I']];ge.columns=[9,50,14,12,9,9,9,9,11].map(w=>({width:w}));ge.addRow([]);HD(ge,RG,1);LG(ge,9,1);H(ge.addRow(['Clave','Concepto','Elemento','Eje','Piezas','Largo','Alto','Ancho','Cantidad']));
S.items.forEach(i=>{const rs=S.gen[i.id]||[];if(!rs.length)return;const a=ge.rowCount+1;rs.forEach((r,x)=>{const q=ge.rowCount+1,w=ge.addRow([x?'':i.clave,x?'':i.desc,r.elem,r.eje,n(r.pzas)||null,n(r.largo)||null,n(r.alto)||null,n(r.ancho)||null,{formula:`IF(COUNT(E${q}:H${q})=0,0,IF(E${q}="",1,E${q})*IF(F${q}="",1,F${q})*IF(G${q}="",1,G${q})*IF(H${q}="",1,H${q}))`}]);w.eachCell(c=>{c.border=B;c.font={name:'Arial',size:9};c.alignment={wrapText:true,vertical:'top'}})});
const w=ge.addRow(['','TOTAL '+i.unidad,'','','','','','',{formula:`SUM(I${a}:I${ge.rowCount})`}]);w.eachCell(c=>{c.font={bold:true};c.fill=fl('FFFFF2A8')})});FIR(ge,ge.rowCount+3,RG);
/* CROQUIS Y FOTOS */
ev.columns=[45,45,45,14].map(w=>({width:w}));ev.addRow([]);HD(ev,[['A','A'],['B','B'],['C','C']],1);LG(ev,4,1);let y=3;
for(const i of S.items){for(const s of S.ev[i.id]||[]){ev.getCell(y,1).value=`${i.clave}  ${i.desc}`;ev.getCell(y,1).font={bold:true};const im=await new Promise(r=>{const o=new Image;o.onload=()=>r(o);o.src=s}),w=620,h=Math.round(w*im.height/im.width);
ev.addImage(wb.addImage({base64:s,extension:'jpeg'}),{tl:{col:0,row:y},ext:{width:w,height:h}});y+=Math.ceil(h/20)+3}}
FIR(ev,y+1,[['A','A'],['B','B'],['C','C']]);
/* RF CANALIZACION: 2 fotografías por clave, con encabezado y firmas repetidos en cada bloque */
rf.columns=[45,45,45,14].map(w=>({width:w}));rf.addRow([]);HD(rf,[['A','A'],['B','B'],['C','C']],1);LG(rf,4,1);let yr=3,anyRF=false;
for(const i of S.items){if(i.isHead)continue;const im=(S.rf[i.id]||[]).slice(0,2);if(!im.length)continue;anyRF=true;
const hr=rf.getRow(yr);hr.getCell(1).value='CLAVE';hr.getCell(2).value='CONCEPTO';hr.getCell(3).value='UNIDAD';H(hr);
const vr=rf.getRow(yr+1);vr.getCell(1).value=i.clave;vr.getCell(2).value=i.desc;vr.getCell(3).value=i.unidad;
vr.eachCell(c=>{c.border=B;c.font={name:'Arial',size:9};c.alignment={wrapText:true,vertical:'middle'}});vr.height=Math.max(32,Math.ceil(String(i.desc||'').length/52)*11.5+6);
yr+=3;let maxH=0;
for(let j=0;j<im.length;j++){const s=im[j],imEl=await new Promise(r=>{const o=new Image;o.onload=()=>r(o);o.src=s}),w=300,h=Math.round(w*imEl.height/imEl.width);maxH=Math.max(maxH,h);
rf.addImage(wb.addImage({base64:s,extension:'jpeg'}),{tl:{col:j*1.03,row:yr-1},ext:{width:w,height:h}})}
yr+=Math.ceil(maxH/20)+2;FIR(rf,yr,[['A','A'],['B','B'],['C','C']]);yr+=5}
if(!anyRF)FIR(rf,yr+1,[['A','A'],['B','B'],['C','C']]);
dl(new Blob([await wb.xlsx.writeBuffer()]),fname('xlsx'))}
/* ---- PDF (todas las páginas A4 horizontal) ---- */
async function pdf(){const t=C(),g=S.g,d=new jspdf.jsPDF({orientation:'landscape',unit:'pt',format:'a4'}),W=d.internal.pageSize.getWidth(),Hh=d.internal.pageSize.getHeight(),bw=(W-80)/3,cutT=(s,w)=>d.splitTextToSize(String(s||''),w)[0]||'';
const firmasBox=y=>{[['Realizó','r'],['Revisó','v'],['Autorizó','a']].forEach(([l,k],i)=>{const x=30+i*(bw+10);d.setDrawColor(120).rect(x,y,bw,66);d.setFont('helvetica','normal').setFontSize(7).setTextColor(60).text(l,x+bw/2,y+9,{align:'center'});d.text(cutT(g[k+'Emp'],bw-8),x+bw/2,y+18,{align:'center'});d.setFont('helvetica','bold').text(cutT(g[k+'Nom'],bw-8),x+bw/2,y+61,{align:'center'});
const s=g['s'+k];if(s){const p=d.getImageProperties(s),r=Math.min(100/p.width,32/p.height);d.addImage(s,s.includes('png')?'PNG':'JPEG',x+bw/2-p.width*r/2,y+22,p.width*r,p.height*r)}});d.setTextColor(20)};
const pg=(tt,f,noFirmas)=>{d.setFont('helvetica','bold').setFontSize(13).setTextColor(20).text(tt,W/2,24,{align:'center'});
if(g.logo){try{const p=d.getImageProperties(g.logo),r=Math.min(90/p.width,32/p.height);d.addImage(g.logo,'PNG',W-30-p.width*r,8,p.width*r,p.height*r)}catch(e){}}
(f?[[['CONTRATISTA',g.contratista],['OBRA',g.obra],['UBICACIÓN',g.ubic]],[['RFC',g.rfc],['CLIENTE',g.cliente],['CONTRATO',g.contrato]],[['FECHA DE ELABORACION DE ESTIMACION',dt(g.fecha)],['PERIODO DE LA ESTIMACION',g.periodo],['ESTIMACION No.',g.estNo]]]:[[['OBRA',g.obra],['UBICACIÓN',g.ubic]],[['CONTRATISTA',g.contratista],['CLIENTE',g.cliente]],[['ESTIMACION No.',g.estNo],['FECHA / PERIODO',dt(g.fecha)+'  '+(g.periodo||'')]]]).forEach((p,i)=>{const x=30+i*(bw+10);d.setDrawColor(120).rect(x,34,bw,f?66:46);p.forEach(([l,v],j)=>{d.setFont('helvetica','normal').setFontSize(6.5).setTextColor(110).text(l,x+4,44+j*20);d.setFont('helvetica','bold').setFontSize(8).setTextColor(20).text(cutT(v,bw-8),x+4,53+j*20)})});
if(!noFirmas)firmasBox(Hh-98)},
st={styles:{fontSize:7.5,cellPadding:3,lineColor:[200,205,215],lineWidth:.4,textColor:20},headStyles:{fillColor:[189,215,238],textColor:20},margin:{top:92,bottom:110,left:30,right:30}},
tb=(tt,o)=>d.autoTable({...st,startY:92,showFoot:'lastPage',...o,didDrawPage:()=>pg(tt,undefined,true)}),mv=v=>n(v)?money(v):'';
pg('CARATULA DE ESTIMACION',1);const hw=(W-70)/2,blk=(x,y0,tt,r,bd)=>{d.autoTable({...st,startY:y0,margin:{left:x,right:W-x-hw,top:112,bottom:110},theme:'grid',head:[[{content:tt,colSpan:2,styles:{halign:'center'}}]],body:r,columnStyles:{1:{halign:'right'}},didParseCell:h=>{if(h.section=='body'&&bd.includes(h.row.index))h.cell.styles.fontStyle='bold'}});return d.lastAutoTable.finalY};
const xr=W/2+5;let a=blk(30,112,'ESTADO DE CUENTA',[['IMPORTE TOTAL DEL CONTRATO',money(t.contrato)],['AJUSTES AL CONTRATO ORIGINAL',mv(g.aj1)],['AJUSTES AL CONTRATO ORIGINAL',mv(g.aj2)],['IMPORTE DEL CONTRATO ACTUALIZADO',money(t.act)],['ESTIMADO ANTERIOR',money(t.ant)],['IMPORTE DE ESTA ESTIMACION',money(t.est)],['ACUMULADO ESTIMADO',money(t.acum)],['SALDO POR EJERCER',money(t.saldo)]],[3,5]);
a=blk(30,a+12,'AMORTIZACION',[['PRIMER ANTICIPO',mv(g.an1)],['SEGUNDO ANTICIPO',mv(g.an2)],['TERCERO ANTICIPO',mv(g.an3)],['TOTAL DEL ANTICIPO',money(t.antTot)],['AMORTIZADO HASTA LA ESTIMACION ANTERIOR',money(g.amAnt)],[`AMORTIZADO EN ESTA ESTIMACION ${n(g.amPct)}%`,money(t.amEst)],['TOTAL ACUMULADO AMORTIZADO',money(t.amAc)],['SALDO POR AMORTIZAR',money(t.amSal)]],[3,5]);
let b=blk(xr,112,'AVANCES DE OBRA ESTIMADO',[['HASTA LA ESTIMACION ANTERIOR',pc(t.pAnt)],['EN ESTA ESTIMACION',pc(t.pEst)],['HASTA ESTA ESTIMACION',pc(t.pAc)],['SALDO POR ESTIMAR',pc(1-t.pAc)]],[]);
b=blk(xr,b+12,`ESTIMACION ${g.estNo||''} (${ordW()})`,[['IMPORTE DE ESTA ESTIMACION',money(t.est)],['AMORTIZADO EN ESTA ESTIMACION',money(t.amEst)],['TOTAL EN ESTIMACION SIN IVA',money(t.sinIva)]],[]);
b=blk(xr,b+12,'IMPORTES CON IVA',[['IMPORTE DE ESTA ESTIMACION',money(t.sinIva)],[`IVA ${n(g.iva)}%`,money(t.ivaI)],['IMPORTE LIQUIDO A COBRAR',money(t.liq)]],[]);
const y=Math.max(a,b)+16;d.setFillColor(189,215,238).rect(30,y,W-60,40,'F');d.setFont('helvetica','bold').setFontSize(9).text('IMPORTE LIQUIDO TOTAL',38,y+15).text('$ '+n(t.liq).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2}),W-38,y+15,{align:'right'}).text('CON LETRA',38,y+32).text(letras(t.liq),W-38,y+32,{align:'right'});
const detBody=[];
if(g.fracc)detBody.push([{content:g.fracc,colSpan:14,styles:{textColor:[31,78,121],fontStyle:'bold',halign:'left',fillColor:255}}]);
if(g.linea2)detBody.push([{content:g.linea2,colSpan:14,styles:{textColor:[31,78,121],fontStyle:'bold',halign:'left',fillColor:255}}]);
S.items.forEach(i=>{if(i.isHead){detBody.push([{content:i.text||'',colSpan:14,styles:{fillColor:[47,93,138],textColor:255,fontStyle:'bold',halign:'left'}}]);return}
const it=t.r.find(x=>x.id==i.id);if(!it)return;
detBody.push([it.clave,it.desc,it.unidad,n(it.cant).toFixed(2),money(it.pu),money(it.imp),n(it.ant).toFixed(2),n(it.est).toFixed(2),it.acQ.toFixed(2),n(it.dif).toFixed(2),money(it.aI),money(it.eI),money(it.acI),pc(it.av)])});
const ivaP2=n(g.iva),fTot=[v=>money(v),v=>money(v*ivaP2/100),v=>money(v*(1+ivaP2/100))],fLbl=['TOTALES','IVA '+ivaP2+'%','TOTAL CON IVA'];
const detFoot=fLbl.map((lb,r)=>['',lb,'','','',fTot[r](t.contrato),'','','','',fTot[r](t.ant),fTot[r](t.est),fTot[r](t.acum),r==0?pc(t.pAc):'']);
d.addPage();tb('DETALLE POR CONCEPTO',{theme:'grid',head:[[{content:'Clave',rowSpan:2},{content:'Descripción',rowSpan:2},{content:'Uni.',rowSpan:2},{content:'Cant.',rowSpan:2},{content:'P.U.',rowSpan:2},{content:'Importe total',rowSpan:2},{content:'VOLÚMENES',colSpan:4,styles:{halign:'center'}},{content:'IMPORTES',colSpan:3,styles:{halign:'center'}},{content:'Avance',rowSpan:2}],['Acum. anterior','Esta estimación','Acumulado','Diferencia','Importe anterior','Imp. esta est.','Importe acumulado']],body:detBody,foot:detFoot,footStyles:{fillColor:[228,237,247],textColor:20},columnStyles:{1:{cellWidth:160}},styles:{...st.styles,fontSize:6.8}});
firmasBox(d.lastAutoTable.finalY+10);
const vr=[];S.items.forEach(i=>(S.gen[i.id]||[]).forEach((r,x)=>vr.push([x?'':i.clave,x?'':i.desc,r.elem,r.eje,r.pzas,r.largo,r.alto,r.ancho,n(r.cant).toFixed(2)])));
if(vr.length){d.addPage();tb('GENERADOR DE VOLUMEN',{theme:'grid',head:[['Clave','Concepto','Elemento','Eje','Piezas','Largo','Alto','Ancho','Cantidad']],body:vr,columnStyles:{1:{cellWidth:260}}});firmasBox(d.lastAutoTable.finalY+10)}
for(const i of S.items){if(i.isHead)continue;const im=S.ev[i.id]||[];for(let k=0;k<im.length;k+=2){d.addPage();pg('CROQUIS Y FOTOS');d.setFontSize(8).setFont('helvetica','normal').text(`${i.clave}  ${(i.desc||'').slice(0,190)}`,30,92,{maxWidth:W-60});
im.slice(k,k+2).forEach((s,j)=>{const p=d.getImageProperties(s),bw2=(W-80)/2,bh=Hh-118-108,r=Math.min(bw2/p.width,bh/p.height);d.addImage(s,'JPEG',30+j*(bw2+20),108,p.width*r,p.height*r)})}}
for(const i of S.items){if(i.isHead)continue;const im=(S.rf[i.id]||[]).slice(0,2);if(!im.length)continue;
d.addPage();pg('RF CANALIZACION');
d.autoTable({styles:{fontSize:8,cellPadding:4,lineColor:[200,205,215],lineWidth:.4,textColor:20},headStyles:{fillColor:[189,215,238],textColor:20},startY:92,margin:{left:30,right:30},theme:'grid',head:[['Clave','Concepto','Unidad']],body:[[i.clave,i.desc,i.unidad]],columnStyles:{0:{cellWidth:60},2:{cellWidth:60}}});
const y0=d.lastAutoTable.finalY+10,ih=Hh-108-y0,bw2=(W-80)/2;
im.forEach((s,j)=>{const p=d.getImageProperties(s),r=Math.min(bw2/p.width,ih/p.height);d.addImage(s,'JPEG',30+j*(bw2+20),y0,p.width*r,p.height*r)})}
d.save(fname('pdf'))}

/* ==================================================================
   USUARIOS Y SESIÓN (autenticación local del navegador)
   Nota: por ahora la contraseña la asigna el administrador y se
   guarda cifrada (SHA-256) en este navegador. Cuando el sistema
   se suba a un servidor esto se reemplazará por un inicio de
   sesión real (por ejemplo Active Directory).
   ================================================================== */
var vista='login',page='home',AUTH=null,USERS=[],INVITES=[],LIB=[],UF=null,loginErr='',loginEmail='',setupErr='',PWERR='',PWOK='';
function initials(u){return(((u.nombre||'?')[0]||'?')+((u.apellido||'')[0]||'')).toUpperCase()}
function landingPage(u){if(u.rol=='admin')return'home';const p=u.perm||{};if(p.home!==false)return'home';if(p.mis!==false)return'library';return'settings'}
async function fetchProfile(id){const{data,error}=await supa.from('profiles').select('*').eq('id',id).maybeSingle();if(error)throw error;return data}
async function afterLoginLoad(){S=(await load())||blank();if(S.g&&S.g.anticipo&&!S.g.an1)S.g.an1=S.g.anticipo;S.rf=S.rf||{};LIB=await listaEstimaciones()}
/* Llamada justo después de un registro (signUp) exitoso: si es la primera persona
   en usar el sistema se vuelve administrador; si no, debe existir una invitación
   con ese mismo correo (creada por un admin desde "Usuarios"). */
async function afterAuthClaim(em,nom,ape){
const{count,error:ec}=await supa.from('profiles').select('*',{count:'exact',head:true});if(ec)throw ec;
let prof;
if(count===0){prof={id:AUTH_UID,email:em,nombre:nom,apellido:ape,celular:'',foto:'',rol:'admin',activo:true,perm:{home:true,nueva:true,mis:true}}}
else{const{data:inv}=await supa.from('invites').select('*').eq('email',em).maybeSingle();if(!inv)return null;
prof={id:AUTH_UID,email:em,nombre:inv.nombre||nom,apellido:inv.apellido||ape,celular:'',foto:'',rol:inv.rol,activo:true,perm:inv.perm||{home:true,nueva:true,mis:true}};
await supa.from('invites').delete().eq('email',em)}
const{error}=await supa.from('profiles').upsert(prof);if(error)throw error;return prof}
var AUTH_UID=null;
/* Si ya existe sesión de Supabase (correo confirmado) pero todavía no hay fila en
   'profiles' (porque la confirmación llegó después del signUp, por correo), la
   creamos aquí mismo, al primer boot/login — así no se queda "huérfana". */
async function claimIfMissing(em){let prof=await fetchProfile(AUTH_UID);
if(!prof)prof=await afterAuthClaim(em,'','');
return prof}
async function boot(){if(!supa){vista='noconfig';renderRoot();return}
try{
const{data:{session}}=await supa.auth.getSession();
if(!session){vista='login';renderRoot();return}
AUTH_UID=session.user.id;const prof=await claimIfMissing(session.user.email);
if(!prof||!prof.activo){await supa.auth.signOut();vista='login';loginErr=prof?'Tu cuenta está inactiva. Contacta a un administrador.':'';renderRoot();return}
AUTH=prof;await afterLoginLoad();vista='app';page=landingPage(AUTH);renderRoot()
}catch(e){console.error(e);vista='login';loginErr='No se pudo conectar con la base de datos: '+e.message;renderRoot()}}
async function doLogin(){const em=$('#lem').value.trim(),pw=$('#lpw').value;loginEmail=em;loginErr='';
try{
const{data,error}=await supa.auth.signInWithPassword({email:em,password:pw});
if(error){loginErr='Correo o contraseña incorrectos.';renderRoot();return}
AUTH_UID=data.user.id;const prof=await claimIfMissing(em);
if(!prof||!prof.activo){await supa.auth.signOut();loginErr=prof?'Tu cuenta está inactiva. Contacta a un administrador.':'Tu correo no ha sido invitado por un administrador. Pídele que te invite desde "Usuarios".';renderRoot();return}
AUTH=prof;await afterLoginLoad();vista='app';page=landingPage(AUTH);renderRoot()
}catch(e){console.error(e);loginErr='Ocurrió un error al conectar con la base de datos: '+e.message;renderRoot()}}
async function doRegister(){const nom=$('#snom').value.trim(),ape=$('#sape').value.trim(),em=$('#sem').value.trim(),pw=$('#spw').value,cf=$('#scf').value;setupErr='';
if(!nom||!em||!pw){setupErr='Completa nombre, correo y contraseña.';renderRoot();return}
if(!/^\S+@\S+\.\S+$/.test(em)){setupErr='Escribe un correo electrónico válido.';renderRoot();return}
if(pw!==cf){setupErr='Las contraseñas no coinciden.';renderRoot();return}
if(pw.length<6){setupErr='La contraseña debe tener al menos 6 caracteres.';renderRoot();return}
try{
const{data,error}=await supa.auth.signUp({email:em,password:pw});
if(error){setupErr=error.message;renderRoot();return}
/* Por seguridad, Supabase no marca error si el correo ya tiene cuenta: en ese caso
   regresa un usuario sin "identities" y no manda ningún correo nuevo. */
if(data.user&&Array.isArray(data.user.identities)&&data.user.identities.length===0){
setupErr='';loginErr='Este correo ya tiene una cuenta creada. Si ya la confirmaste, solo inicia sesión. Si no, revisa spam o espera unos minutos: Supabase limita cuántos correos de confirmación puede mandar.';vista='login';loginEmail=em;renderRoot();return}
if(!data.session){setupErr='';loginErr='Cuenta creada. Revisa tu correo para confirmarla y después inicia sesión aquí.';vista='login';loginEmail=em;renderRoot();return}
AUTH_UID=data.user.id;const prof=await afterAuthClaim(em,nom,ape);
if(!prof){setupErr='Tu correo no ha sido invitado por un administrador. Pídele que te invite desde "Usuarios".';await supa.auth.signOut();renderRoot();return}
AUTH=prof;await afterLoginLoad();vista='app';page=landingPage(AUTH);renderRoot()
}catch(e){console.error(e);setupErr='Ocurrió un error al conectar con la base de datos: '+e.message;renderRoot()}}
async function logout(){await supa.auth.signOut();AUTH=null;AUTH_UID=null;S=blank();vista='login';loginEmail='';loginErr='';renderRoot()}
async function goPage(p){
if(p=='library'&&AUTH.rol!='admin'&&AUTH.perm&&AUTH.perm.mis===false)return;
if(p=='home'||p=='library')LIB=await listaEstimaciones();
if(p=='users'){if(AUTH.rol!='admin')return;await loadUsuarios()}
UF=null;page=p;renderRoot()}
function irNueva(){if(AUTH.rol!='admin'&&AUTH.perm&&AUTH.perm.nueva===false)return;S=blank();page='editor';tab='g';save();renderRoot()}
/* ---- perfil / contraseña propios ---- */
let ptmr;function profSave(){clearTimeout(ptmr);ptmr=setTimeout(async()=>{await supa.from('profiles').update({nombre:AUTH.nombre,apellido:AUTH.apellido,celular:AUTH.celular,foto:AUTH.foto}).eq('id',AUTH.id)},400)}
function perfilFoto(i){const f=i.files[0];if(!f)return;const im=new Image;im.onload=()=>{const q=Math.min(1,240/im.width),c=document.createElement('canvas');c.width=im.width*q;c.height=im.height*q;c.getContext('2d').drawImage(im,0,0,c.width,c.height);AUTH.foto=c.toDataURL('image/jpeg',.85);profSave();renderRoot()};im.src=URL.createObjectURL(f)}
async function cambiarPw(){const a=$('#pwa').value,nw=$('#pwn').value,cf=$('#pwc').value;PWOK='';PWERR='';
if(!a||!nw){PWERR='Completa todos los campos.';renderRoot();return}
if(nw!==cf){PWERR='La nueva contraseña no coincide con la confirmación.';renderRoot();return}
if(nw.length<6){PWERR='La nueva contraseña debe tener al menos 6 caracteres.';renderRoot();return}
const{error:e1}=await supa.auth.signInWithPassword({email:AUTH.email,password:a});
if(e1){PWERR='La contraseña actual no es correcta.';renderRoot();return}
const{error:e2}=await supa.auth.updateUser({password:nw});
if(e2){PWERR='No se pudo actualizar: '+e2.message;renderRoot();return}
PWOK='Contraseña actualizada.';renderRoot()}
/* ---- administración de usuarios (solo admin): se invita por correo,
   la persona crea su propia contraseña al registrarse ---- */
function newUserForm(){UF={id:null,email:'',nombre:'',apellido:'',celular:'',rol:'usuario',perm:{home:true,nueva:true,mis:true},err:''};renderRoot()}
function editUserForm(id){const u=USERS.find(x=>x.id==id);UF={id:u.id,email:u.email,nombre:u.nombre,apellido:u.apellido||'',celular:u.celular||'',rol:u.rol,perm:Object.assign({home:true,nueva:true,mis:true},u.perm||{}),err:''};renderRoot()}
function cancelUserForm(){UF=null;renderRoot()}
async function saveUserForm(){const f=UF,em=(f.email||'').trim();
if(!em||!f.nombre){f.err='Completa al menos correo y nombre.';renderRoot();return}
if(!/^\S+@\S+\.\S+$/.test(em)){f.err='Escribe un correo electrónico válido.';renderRoot();return}
if(!f.id){
if(USERS.some(u=>u.email.toLowerCase()==em.toLowerCase())||INVITES.some(u=>u.email.toLowerCase()==em.toLowerCase())){f.err='Ya existe un usuario o una invitación con ese correo.';renderRoot();return}
const{error}=await supa.from('invites').insert({email:em,nombre:f.nombre,apellido:f.apellido,rol:f.rol,perm:f.rol=='usuario'?f.perm:{home:true,nueva:true,mis:true},invited_by:AUTH.email});
if(error){f.err=error.message;renderRoot();return}
}else{
if(f.rol!='admin'){const otros=USERS.filter(u=>u.id!=f.id&&u.rol=='admin');if(!otros.length){f.err='Debe existir al menos un administrador; cambia el rol de otro usuario antes.';renderRoot();return}}
const{error}=await supa.from('profiles').update({nombre:f.nombre,apellido:f.apellido,celular:f.celular,rol:f.rol,perm:f.rol=='usuario'?f.perm:{home:true,nueva:true,mis:true}}).eq('id',f.id);
if(error){f.err=error.message;renderRoot();return}}
await loadUsuarios();UF=null;renderRoot()}
async function delInvite(email){if(!confirm('¿Cancelar esta invitación?'))return;await supa.from('invites').delete().eq('email',email);await loadUsuarios();renderRoot()}
async function toggleActivo(id){const u=USERS.find(x=>x.id==id);if(!u)return;
if(u.id==AUTH.id){alert('No puedes desactivar tu propia cuenta.');return}
if(u.activo&&u.rol=='admin'){const otros=USERS.filter(x=>x.id!=id&&x.rol=='admin'&&x.activo);if(!otros.length){alert('Debe quedar al menos un administrador activo.');return}}
await supa.from('profiles').update({activo:!u.activo}).eq('id',id);await loadUsuarios();renderRoot()}
async function delUser(id){if(id==AUTH.id){alert('No puedes eliminar tu propia cuenta.');return}
const u=USERS.find(x=>x.id==id);if(u&&u.rol=='admin'){const otros=USERS.filter(x=>x.id!=id&&x.rol=='admin');if(!otros.length){alert('Debe existir al menos un administrador.');return}}
if(!confirm('¿Eliminar este usuario? Pierde acceso al sistema (su cuenta de acceso en sí se elimina desde el panel de Supabase, si hace falta). Sus estimaciones guardadas no se borrarán.'))return;
await supa.from('profiles').delete().eq('id',id);await loadUsuarios();renderRoot()}
/* ---- render de pantallas ---- */
function loginHTML(){return`<div class="authwrap"><div class="authcard">
<h2>Estimaciones de obra</h2><p class="mut">Inicia sesión con tu correo electrónico</p>
<label>Correo electrónico<input id="lem" type="email" value="${esc(loginEmail)}"></label>
<label>Contraseña<input id="lpw" type="password" onkeydown="if(event.key=='Enter')doLogin()"></label>
${loginErr?`<div class="err">${esc(loginErr)}</div>`:''}
<button class="p" onclick="doLogin()">Iniciar sesión</button>
<p class="mut" style="margin-top:14px">¿No tienes cuenta? <a onclick="vista='register';setupErr='';renderRoot()" style="cursor:pointer;color:var(--blue)">Regístrate aquí</a> — funciona si eres la primera persona en usar el sistema, o si un administrador ya te invitó con este correo.</p>
</div></div>`}
function registerHTML(){return`<div class="authwrap"><div class="authcard" style="max-width:400px">
<h2>Crear cuenta</h2><p class="mut">Si eres la primera persona en usar este sistema, tu cuenta será de administrador. Si no, usa el mismo correo con el que un administrador ya te invitó desde "Usuarios".</p>
<label>Nombre<input id="snom"></label><label>Apellido<input id="sape"></label>
<label>Correo electrónico<input id="sem" type="email"></label>
<label>Contraseña<input id="spw" type="password"></label>
<label>Confirmar contraseña<input id="scf" type="password"></label>
${setupErr?`<div class="err">${esc(setupErr)}</div>`:''}
<button class="p" onclick="doRegister()">Crear cuenta</button>
<p class="mut" style="margin-top:14px">¿Ya tienes cuenta? <a onclick="vista='login';loginErr='';renderRoot()" style="cursor:pointer;color:var(--blue)">Inicia sesión</a></p>
</div></div>`}
function noConfigHTML(){return`<div class="authwrap"><div class="authcard" style="max-width:460px">
<h2>Falta configurar la base de datos</h2>
<p class="mut">Este sistema usa una base de datos compartida (Supabase) para que varias personas vean la misma información. Abre este archivo HTML con un editor de texto, busca cerca del inicio de la etiqueta &lt;script&gt; estas dos líneas:</p>
<pre style="background:#f4f6f9;padding:10px;border-radius:6px;font-size:12px;overflow:auto">const SUPA_URL='https://nczsjqeooclqtvuegluu.supabase.co';
const SUPA_KEY='TU_SUPABASE_ANON_KEY';</pre>
<p class="mut">y sustitúyelas por la URL y la "anon key" de tu proyecto de Supabase (Project Settings → API). Guarda el archivo y vuelve a abrirlo.</p>
</div></div>`}
function sidebarHTML(){const u=AUTH,item=(p,label,show)=>show===false?'':`<button class="${page==p?'on':''}" onclick="goPage('${p}')">${label}</button>`;
const showNueva=u.rol=='admin'||!u.perm||u.perm.nueva!==false,showMis=u.rol=='admin'||!u.perm||u.perm.mis!==false;
return`<div class="sidebar"><div class="who">${u.foto?`<img src="${u.foto}">`:`<div class="ini">${initials(u)}</div>`}<div><b>${esc(u.nombre)} ${esc(u.apellido||'')}</b><small>${esc(u.email)}</small><br><span class="badge ${u.rol=='admin'?'adm':''}">${u.rol=='admin'?'Administrador':'Usuario'}</span></div></div>
<nav>${item('home','⌂  Inicio')}${showNueva?'<button onclick="irNueva()">＋ Nueva Estimación</button>':''}${item('library','🗂  Mis estimaciones',showMis)}${u.rol=='admin'?item('users','👤  Usuarios'):''}${item('settings','⚙  Configuración')}</nav>
<div class="sp"></div><button class="out" onclick="logout()">⏻ Cerrar sesión</button></div>`}
function topbarHTML(){if(page=='editor')return`<div class="topbar"><h1>${esc(S.g.obra||'Nueva estimación')}<small style="opacity:.85;font-weight:400;display:block;font-size:11px">Estimación ${esc(S.g.estNo||'')}</small></h1>
<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="p" onclick="guardarLib()">Guardar en Mis Estimaciones</button><button class="p" onclick="xlsx()">Exportar Excel</button><button class="p" onclick="pdf()">Exportar PDF</button></div></div>
<div class="subbar"><a onclick="nueva()">Estimación siguiente (mismo contrato)</a><a onclick="bk()">Guardar respaldo .json</a><label>Abrir respaldo<input type="file" accept=".json" hidden onchange="rs(this)"></label><a onclick="borrar()" style="color:#f3c9c9">Borrar todo y empezar de cero</a></div>`;
const titles={home:'Inicio',library:'Mis estimaciones',users:'Usuarios',settings:'Configuración'};
return`<div class="topbar"><h1>${titles[page]||''}</h1></div>`}
function homeHTML(){const u=AUTH,tiene=S.items.length||S.g.obra;
return`<div class="stats"><div class="stat"><b>${LIB.length}</b>Estimaciones guardadas${u.rol=='admin'?' (todas)':''}</div><div class="stat"><b>${new Set(LIB.map(r=>r.meta.obra).filter(Boolean)).size}</b>Obras distintas</div></div>
<div class="card"><b>Hola, ${esc(u.nombre)} 👋</b><p class="mut">Bienvenido al sistema de estimaciones de obra.</p><p><button class="p" onclick="irNueva()">＋ Nueva estimación</button> <button onclick="goPage('library')">Ver mis estimaciones</button></p></div>
${tiene?`<div class="card"><b>Tienes un borrador sin guardar</b><p class="mut">${esc(S.g.obra||'(sin nombre de obra)')} — Estimación ${esc(S.g.estNo||'')}</p><button class="p" onclick="page='editor';renderRoot()">Continuar editando</button></div>`:''}
${LIB.length?`<div class="card"><b>Últimas estimaciones</b><div class="lib">${LIB.slice(0,5).map(libRow).join('')}</div></div>`:''}`}
function libraryHTML(){return`<div class="card"><b>Mis estimaciones guardadas</b><p class="mut">${LIB.length} estimación(es) guardada(s). Desde aquí puedes abrir/editar, eliminar y descargar cada una en Excel o PDF.</p></div>
${LIB.length?`<div class="lib">${LIB.map(libRow).join('')}</div>`:'<p class="mut">Aún no has guardado ninguna estimación. Ábrela desde “Nueva Estimación” y usa el botón “Guardar en Mis Estimaciones”.</p>'}`}
function usersHTML(){if(UF)return userFormHTML();
return`<div class="card"><button class="p" onclick="newUserForm()">＋ Invitar usuario</button></div>
${INVITES.length?`<div class="card tw"><b>Invitaciones pendientes</b><p class="mut">Esa persona debe registrarse con este mismo correo (pantalla de inicio de sesión → "Regístrate aquí") para crear su propia contraseña.</p><table class="utable"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th></th></tr></thead><tbody>
${INVITES.map(i=>`<tr><td>${esc(i.nombre)} ${esc(i.apellido||'')}</td><td>${esc(i.email)}</td><td><span class="badge ${i.rol=='admin'?'adm':''}">${i.rol=='admin'?'Administrador':'Usuario'}</span></td><td><button onclick="delInvite('${i.email}')" style="color:#a4353f">Cancelar</button></td></tr>`).join('')}
</tbody></table></div>`:''}
<div class="card tw"><b>Usuarios registrados</b><table class="utable"><thead><tr><th></th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Ventanas permitidas</th><th></th></tr></thead><tbody>
${USERS.map(u=>`<tr><td>${u.foto?`<img src="${u.foto}" class="ava" style="width:32px;height:32px;font-size:11px">`:`<div class="ava" style="width:32px;height:32px;font-size:11px">${initials(u)}</div>`}</td><td>${esc(u.nombre)} ${esc(u.apellido||'')}</td><td>${esc(u.email)}</td><td><span class="badge ${u.rol=='admin'?'adm':''}">${u.rol=='admin'?'Administrador':'Usuario'}</span></td><td>${u.activo?'Activo':'<span style="color:#a4353f">Inactivo</span>'}</td><td class="mut">${u.rol=='admin'?'Todas':['home','nueva','mis'].filter(k=>u.perm&&u.perm[k]).map(k=>({home:'Inicio',nueva:'Nueva est.',mis:'Mis est.'}[k])).join(', ')||'—'}</td>
<td style="white-space:nowrap"><button onclick="editUserForm('${u.id}')">Editar</button> <button onclick="toggleActivo('${u.id}')">${u.activo?'Desactivar':'Activar'}</button> ${u.id!=AUTH.id?`<button onclick="delUser('${u.id}')" style="color:#a4353f">Eliminar</button>`:''}</td></tr>`).join('')}
</tbody></table></div>`}
function userFormHTML(){const f=UF;return`<div class="card" style="max-width:520px"><b>${f.id?'Editar usuario':'Invitar usuario'}</b>
${!f.id?`<p class="mut">La persona invitada deberá registrarse con este correo desde la pantalla de inicio de sesión ("Regístrate aquí") y ahí creará su propia contraseña.</p>`:''}
<label>Correo electrónico<input data-u="email" ${f.id?'disabled':''} value="${esc(f.email)}"></label>
<div class="grid"><label>Nombre<input data-u="nombre" value="${esc(f.nombre)}"></label><label>Apellido<input data-u="apellido" value="${esc(f.apellido)}"></label></div>
${f.id?`<label>Celular<input data-u="celular" value="${esc(f.celular)}"></label>`:''}
<label>Rol<select data-u="rol"><option value="usuario" ${f.rol=='usuario'?'selected':''}>Usuario</option><option value="admin" ${f.rol=='admin'?'selected':''}>Administrador</option></select></label>
${f.rol=='usuario'?`<div style="margin-top:8px"><small style="color:#55647a">Ventanas visibles para este usuario</small><div class="grid" style="margin-top:4px">
<label class="chk"><input type="checkbox" data-up="home" ${f.perm.home?'checked':''}> Inicio</label>
<label class="chk"><input type="checkbox" data-up="nueva" ${f.perm.nueva?'checked':''}> Nueva estimación</label>
<label class="chk"><input type="checkbox" data-up="mis" ${f.perm.mis?'checked':''}> Mis estimaciones</label>
</div></div>`:'<p class="mut">El administrador tiene acceso a todas las ventanas, incluida Usuarios.</p>'}
${f.err?`<div class="err">${esc(f.err)}</div>`:''}
<p><button class="p" onclick="saveUserForm()">Guardar</button> <button onclick="cancelUserForm()">Cancelar</button></p></div>`}
function settingsHTML(){const u=AUTH;return`<div class="two">
<div class="card"><b>Mi perfil</b><div class="grid" style="margin-top:8px">
<label>Nombre<input data-p="nombre" value="${esc(u.nombre)}"></label><label>Apellido<input data-p="apellido" value="${esc(u.apellido||'')}"></label>
<label>Celular<input data-p="celular" value="${esc(u.celular||'')}"></label><label>Correo (no editable)<input value="${esc(u.email)}" disabled></label></div>
<p><label class="btn" style="display:inline-block">Foto de perfil<input type="file" accept="image/*" hidden onchange="perfilFoto(this)"></label> ${u.foto?`<img src="${u.foto}" class="ava" style="width:38px;height:38px;vertical-align:middle;margin-left:8px"> <button onclick="AUTH.foto='';profSave();renderRoot()">Quitar</button>`:''}</p>
<p class="mut">Los cambios de nombre, apellido, celular y foto se guardan solos.</p></div>
<div class="card"><b>Cambiar contraseña</b>
<label>Contraseña actual<input type="password" id="pwa"></label><label>Nueva contraseña<input type="password" id="pwn"></label><label>Confirmar nueva contraseña<input type="password" id="pwc"></label>
${PWERR?`<div class="err">${esc(PWERR)}</div>`:''}${PWOK?`<div class="ok">${esc(PWOK)}</div>`:''}
<p><button class="p" onclick="cambiarPw()">Actualizar contraseña</button></p></div></div>`}
function pageHTML(){if(page=='home')return homeHTML();if(page=='library')return libraryHTML();if(page=='users')return AUTH.rol=='admin'?usersHTML():homeHTML();if(page=='settings')return settingsHTML();return''}
function renderRoot(){const root=$('#root');
if(vista=='noconfig'){root.innerHTML=noConfigHTML();return}
if(vista=='register'){root.innerHTML=registerHTML();return}
if(vista=='login'){root.innerHTML=loginHTML();const e=$('#lem');if(e&&loginEmail)e.focus();return}
root.innerHTML=`<div class="shell">${sidebarHTML()}<div class="main">${topbarHTML()}<div class="content">${page=='editor'?'<nav id="nav"></nav><main id="m"></main>':pageHTML()}</div></div></div>`;
if(page=='editor'){nav();draw()}}
boot();