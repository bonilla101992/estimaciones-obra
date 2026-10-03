const $=s=>document.querySelector(s),n=v=>parseFloat(v)||0;
const money=v=>'$'+n(v).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2});
const pc=v=>Math.round(n(v)*100)+'%';
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const uid=()=>Math.random().toString(36).slice(2,9);
const G=[['contratista','Contratista'],['rfc','RFC'],['obra','Obra'],['cliente','Cliente'],['ubic','Ubicación'],['contrato','Contrato'],['estNo','Estimación No.'],['periodo','Periodo de la estima[...]
const blank=()=>({id:null,g:{estNo:'01',amPct:20,iva:16,fecha:new Date().toISOString().slice(0,10)},items:[],gen:{},ev:{},rf:{},sel:''});
[...]
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
async function listaEstimaciones(){
  try {
    let q=supa.from('estimaciones').select('*').order('updated_at',{ascending:false});
    if(AUTH && AUTH.rol!='admin')q=q.eq('owner',AUTH.email);
    const{data,error}=await q;
    if(error){
      console.error('Error en listaEstimaciones:', error);
      return [];
    }
    return(data||[]).map(r=>r.payload);
  } catch(e) {
    console.error('Excepción en listaEstimaciones:', e);
    return [];
  }
}
async function loadUsuarios(){const[{data:p,error:e1},{data:iv,error:e2}]=await Promise.all([supa.from('profiles').select('*'),supa.from('invites').select('*')]);if(e1)throw e1;if(e2)throw e2;USER[...]
/* ---- cálculos ---- */
function C(){const r=S.items.filter(i=>!i.isHead).map(i=>{const q=n(i.cant),p=n(i.pu),a=n(i.ant),e=n(i.est);return{...i,imp:q*p,aI:a*p,eI:e*p,acQ:a+e,dif:q-(a+e),acI:(a+e)*p,av:q?(a+e)/q:0}});
const s=k=>r.reduce((t,x)=>t+x[k],0),g=S.g,t={r,contrato:s('imp'),ant:s('aI'),est:s('eI')};
t.act=t.contrato+n(g.aj1)+n(g.aj2);t.acum=t.ant+t.est;t.saldo=t.act-t.acum;const P=x=>t.act?x/t.act:0;t.pAnt=P(t.ant);t.pEst=P(t.est);t.pAc=t.pAnt+t.pEst;
t.antTot=n(g.an1)+n(g.an2)+n(g.an3);t.amEst=t.est*n(g.amPct)/100;t.amAc=n(g.amAnt)+t.amEst;t.amSal=t.antTot-t.amAc;
t.sinIva=t.est-t.amEst;t.ivaI=t.sinIva*n(g.iva)/100;t.liq=t.sinIva+t.ivaI;return t}
function letras(x){const u='_ UN DOS TRES CUATRO CINCO SEIS SIETE OCHO NUEVE DIEZ ONCE DOCE TRECE CATORCE QUINCE DIECISEIS DIECISIETE DIECIOCHO DIECINUEVE VEINTE VEINTIUN VEINTIDOS VEINTITRES VEIN[...]
d=',,,TREINTA,CUARENTA,CINCUENTA,SESENTA,SETENTA,OCHENTA,NOVENTA'.split(','),c=',CIENTO,DOSCIENTOS,TRESCIENTOS,CUATROCIENTOS,QUINIENTOS,SEISCIENTOS,SETECIENTOS,OCHOCIENTOS,NOVECIENTOS'.split(',');
const l=v=>{let s='';if(v>=100){s=v==100?'CIEN':c[v/100|0];v%=100;if(v)s+=' '}return s+(v<30?u[v]:d[v/10|0]+(v%10?' Y '+u[v%10]:''))};
x=Math.round(n(x)*100);const e=Math.floor(x/100),ct=String(x%100).padStart(2,'0'),mm=Math.floor(e/1e6),m=Math.floor(e/1e3)%1e3,r=e%1e3;
let s=(mm?(mm==1?'UN MILLON':l(mm)+' MILLONES')+' ':'')+(m?(m==1?'MIL':l(m)+' MIL')+' ':'')+(r?l(r):'');return(s.trim()||'CERO')+' '+ct+'/100 M.N'}
const dt=v=>v?String(v).split('-').reverse().join('/'):'',ordW=()=>letras(parseInt(S.g.estNo)||0).replace(/ \d\d\/100 M\.N$/,'').replace(/UN$/,'UNO');
function HDR(f){const g=S.g,b=(l,v)=>`<div><small>${l}</small><b>${esc(v)||'&nbsp;'}</b></div>`;return`<div class="hd" style="position:relative">${g.logo?`<img src="${g.logo}" style="position:abso[...]
function FIR(){const g=S.g;return`<div class="fr">${[['Realizó','r'],['Revisó','v'],['Autorizó','a']].map(([l,k])=>`<div><small>${l}</small><span>${esc(g[k+'Emp'])}</span><i>${g['s'+k]?`<img sr[...]
function sig(k,i){const f=i.files[0];if(!f)return;const im=new Image;im.onload=()=>{const q=Math.min(1,400/im.width),c=document.createElement('canvas');c.width=im.width*q;c.height=im.height*q;c.ge[...]
function logo(i){const f=i.files[0];if(!f)return;const im=new Image;im.onload=()=>{const q=Math.min(1,300/im.width),c=document.createElement('canvas');c.width=im.width*q;c.height=im.height*q;c.get[...]
function ej(){if(!confirm('Esto reemplaza los datos generales actuales. ¿Continuar?'))return;Object.assign(S.g,{contratista:'SIMAVER',rfc:'AAPJ740822JQ3',obra:'HACIENDA LA PARROQUIA',cliente:'ING[...]
/* ---- editor: pestañas Datos generales / Conceptos / Generador / Croquis / Carátula ---- */
const TABS=[['g','Datos generales'],['c','Conceptos'],['v','Generador de volumen'],['e','Croquis y fotos'],['f','RF Canalización'],['r','Carátula']];
function nav(){const e=$('#nav');if(e)e.innerHTML=TABS.map(([k,t])=>`<button class="${k==tab?'on':''}" onclick="go('${k}')">${t}</button>`).join('')}
function go(k){tab=k;nav();draw()}
const sel=()=>{if(!S.items.length)return'<p class="mut">Primero agrega conceptos en la pestaña Conceptos.</p>';if(!S.items.find(i=>i.id==S.sel))S.sel=S.items[0].id;
return`<label>Concepto<select onchange="S.sel=this.value;draw()">${S.items.map(i=>`<option value="${i.id}" ${i.id==S.sel?'selected':''}>${esc(i.clave)} — ${esc((i.desc||'').slice(0,80))}</option[...]
function draw(){const m=$('#m');if(!m)return;
[...]
const row=i=>i.isHead?`<tr><td colspan="14" style="background:var(--blue);padding:0"><input style="background:transparent;border:none;color:#fff;font-weight:700;width:100%;padding:7px 8px" placeholder[...]
:`<tr><td><input style="width:80px" data-i="${i.id}:clave" value="${esc(i.clave)}"></td><td><textarea data-i="${i.id}:desc">${esc(i.desc)}</textarea></td><td><input style="width:60px" data-i="${i.id}:[...]
[...]
if(tab=='r'){const t=C(),g=S.g,mv=v=>n(v)?money(v):'',T=(tt,rows)=>`<table class="cx"><thead><tr><th colspan="2">${tt}</th></tr></thead><tbody>${rows.map(([a,b,f])=>`<tr class="${f||''}"><td>${a}</td>[...]
[...]
refresh()}
function refresh(){const t=C();const A={};t.r.forEach(r=>A[r.id]=r);const rows=S.gen[S.sel]||[];const gv=r=>(n(r.pzas)||1)*(n(r.largo)||1)*(n(r.alto)||1)*(n(r.ancho)||1)*((r.pzas||r.largo||r.alto||r.a[...]
const MK={imp:x=>money(x.imp),av:x=>pc(x.av),acQ:x=>n(x.acQ).toFixed(2),dif:x=>n(x.dif).toFixed(2),aI:x=>money(x.aI),eI:x=>money(x.eI),acI:x=>money(x.acI)};
document.querySelectorAll('[data-c]').forEach(e=>{const[k,id]=e.dataset.c.split(':');e.textContent=MK[k]?(A[id]?MK[k](A[id]):''):k=='T'?(id=='pAc'?pc(t[id]):money(t[id])):k=='gv'?gv(rows[id]).toFixed([...]
[...]
function addI(o={}){S.items.push({id:uid(),clave:'',desc:'',unidad:'PZA',cant:'',pu:'',ant:0,est:0,...o});save();draw()}
function addHead(){S.items.push({id:uid(),isHead:true,text:''});save();draw()}
function moveI(id,dir){const i=S.items.findIndex(x=>x.id==id),j=i+dir;if(j<0||j>=S.items.length)return;[S.items[i],S.items[j]]=[S.items[j],S.items[i]];save();draw()}
function delI(id){if(confirm(S.items.find(i=>i.id==id)?.isHead?'¿Eliminar esta sección?':'¿Eliminar este concepto?')){S.items=S.items.filter(i=>i.id!=id);delete S.gen[id];delete S.ev[id];delet[...]
function paste(){$('#pst').value.split('\n').filter(l=>l.trim()).forEach(l=>{const c=l.split('\t');addI({clave:c[0]?.trim(),desc:c[1]?.trim(),unidad:c[2]?.trim()||'PZA',cant:n(String(c[3]).replac[...]
function addV(){(S.gen[S.sel]=S.gen[S.sel]||[]).push({elem:'',eje:'',pzas:'',largo:'',alto:'',ancho:'',cant:0});save();draw()}
function delV(x){S.gen[S.sel].splice(x,1);const it=S.items.find(i=>i.id==S.sel);it.est=+S.gen[S.sel].reduce((s,r)=>s+n(r.cant),0).toFixed(4);save();draw()}
function delE(x){S.ev[S.sel].splice(x,1);save();draw()}
async function imgs(inp){for(const f of inp.files){const u=await new Promise(r=>{const i=new Image;i.onload=()=>{const k=Math.min(1,1400/Math.max(i.width,i.height)),c=document.createElement('canv[...]
function delRF(x){S.rf[S.sel].splice(x,1);save();draw()}
async function imgsRF(inp){const cupo=2-(S.rf[S.sel]||[]).length;if(cupo<=0)return;const files=[...inp.files].slice(0,cupo);
if(inp.files.length>files.length)alert('Solo se tomaron las primeras '+files.length+' foto(s); el límite es 2 por clave.');
for(const f of files){const u=await new Promise(r=>{const i=new Image;i.onload=()=>{const k=Math.min(1,1400/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.heig[...]
[...]
const CL=/^[A-Za-z]{1,5}[-A-Za-z0-9.]*\d[A-Za-z0-9.-]*$/,UN=/^(PZAS?|PZ|ML|M2|M3|M|KG|LT|TON|LOTE|JGO|REG|SERV|HR|DIA|VIAJE)$/i,
num=v=>typeof v=='number'?v:parseFloat(String(v).replace(/[$,\s]/g,'')),isNum=v=>typeof v=='number'||/^[\s$]*-?[\d,]*\.?\d+\s*$/.test(String(v));
function rowItem(c){c=Array.from(c).map(v=>v&&v.result!==undefined?v.result:v&&v.richText?v.richText.map(t=>t.text).join(''):v==null||typeof v=='object'?'':v);
const k=c.findIndex(v=>typeof v=='string'&&CL.test(v.trim())),u=c.findIndex((v,x)=>k>=0&&x>k&&UN.test(String(v).trim()));if(k<0||u<0)return;
const q=c.slice(u+1).filter(v=>v!==''&&isNum(v)).map(num);if(q.length<2)return;
return{clave:String(c[k]).trim(),desc:c.slice(k+1,u).filter(v=>v!=='').join(' ').replace(/\s+/g,' ').trim(),unidad:String(c[u]).trim().toUpperCase(),cant:q[0],pu:q[1]}}
async function impX(b){const wb=new ExcelJS.Workbook();await wb.xlsx.load(b);const o=[];wb.eachSheet(w=>{if(w.state=='visible'&&!/GENERADOR|CROQUIS|CARATULA|FOTO/i.test(w.name))w.eachRow(r=>{cons[...]
async function pw(){pdfjsLib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([await(await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js')).text()],{ty[...]
async function impP(b){await pw();const pdf=await pdfjsLib.getDocument({data:b}).promise,o=[],SK=/^(IMPORTE .*|OBRA (CIVIL|ELECTROMECANICA)|MEDIA TENSION|BAJA TENSION|ALUMBRADO MANZANA|TR[ÁA]MIT[...]
[...]
A.forEach(a=>{a.it.desc=a.parts.sort((x,y)=>y[0]-x[0]).map(x=>x[1]).join(' ').replace(/\s+/g,' ').trim();o.push(a.it)})}return o}
async function imp(i){const f=i.files[0];if(!f)return;const m=$('#impm');m.textContent='Leyendo '+f.name+'…';
try{const b=await f.arrayBuffer(),l=/\.pdf$/i.test(f.name)?await impP(b):await impX(b);if(!l.length){m.textContent='No encontré conceptos con clave, unidad, cantidad y precio en ese archivo.';re[...]
let a=0,u=0;l.filter((x,k)=>l.findIndex(y=>y.clave==x.clave)==k).forEach(x=>{const e=S.items.find(i=>i.clave==x.clave);if(e){Object.assign(e,x);u++}else{S.items.push({id:uid(),ant:0,est:0,...x});[...]
catch(e){m.textContent='No pude leer el archivo: '+e.message}i.value=''}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click()}
const bk=()=>dl(new Blob([JSON.stringify(S)],{type:'application/json'}),`estimacion_${S.g.estNo||''}.json`);
function nueva(){if(!confirm('Se guardará un respaldo de esta estimación y se preparará la siguiente:\n• Se conservan datos generales, firmas, anticipos y conceptos.\n• Lo estimado ahora p[...]
S.g.amAnt=+(n(S.g.amAnt)+t.amEst).toFixed(2);S.items.forEach(i=>{i.ant=+(n(i.ant)+n(i.est)).toFixed(4);i.est=0});S.gen={};S.ev={};S.rf={};
S.g.estNo=String((parseInt(S.g.estNo)||0)+1).padStart(2,'0');S.g.periodo='';S.g.fecha=new Date().toISOString().slice(0,10);save();go('c')}
function borrar(){if(!confirm('Se borrarán TODOS los datos de este borrador (conceptos, firmas, fotos). Antes se descargará un respaldo. Tus estimaciones ya guardadas en la biblioteca no se ven[...]
function rs(i){const r=new FileReader;r.onload=()=>{S=JSON.parse(r.result);if(!S.id)S.id=null;S.rf=S.rf||{};save();page='editor';tab='g';renderRoot()};r.readAsText(i.files[0]);i.value=''}
[...]
const fname=e=>`Estimacion_${S.g.estNo||'01'}_${(S.g.obra||'obra').replace(/\W+/g,'_')}.${e}`;
[...]
async function guardarLib(){if(!S.items.length&&!S.g.obra){alert('Agrega al menos los datos generales o un concepto antes de guardar.');return}
if(!S.id)S.id=uid();
const rec={id:S.id,owner:AUTH.email,ownerNombre:(AUTH.nombre||'')+' '+(AUTH.apellido||''),savedAt:new Date().toISOString(),meta:{obra:S.g.obra||'',contratista:S.g.contratista||'',cliente:S.g.clie[...]
await idbPut('estimaciones',rec);save();alert('Estimación guardada en tu biblioteca (Mis estimaciones).')}
function libRow(r){const m=r.meta;return`<div class="libr"><div><b>Estimación ${esc(m.estNo)} — ${esc(m.obra||'(sin nombre de obra)')}</b><div class="mt">${esc(m.contratista||'—')} · Client[...]
function editLib(id){const r=LIB.find(x=>x.id==id);if(!r)return;S=JSON.parse(JSON.stringify(r.data));S.id=r.id;S.rf=S.rf||{};save();page='editor';tab='g';renderRoot()}
async function delLib(id){if(!confirm('¿Eliminar esta estimación de la biblioteca? No se puede deshacer.'))return;await idbDel('estimaciones',id);LIB=LIB.filter(x=>x.id!=id);renderRoot()}
async function withData(data,fn){const b=S;data.rf=data.rf||{};S=data;try{await fn()}finally{S=b}}
async function dlLibXlsx(id){const r=LIB.find(x=>x.id==id);if(r)await withData(r.data,xlsx)}
async function dlLibPdf(id){const r=LIB.find(x=>x.id==id);if(r)await withData(r.data,pdf)}
/* ---- Excel ---- */
async function xlsx(){const t=C(),g=S.g,wb=new ExcelJS.Workbook(),T1={style:'thin'},B={top:T1,left:T1,bottom:T1,right:T1},M='"$"#,##0.00',fl=a=>({type:'pattern',pattern:'solid',fgColor:{argb:a}})[...]
H=(row,c)=>row.eachCell(x=>{x.font={bold:true,name:'Arial',size:9};x.fill=fl(c||'FFBDD7EE');x.border=B;x.alignment={wrapText:true,vertical:'middle',horizontal:'center'}}),
P=w=>{w.pageSetup={orientation:'landscape',paperSize:9,fitToPage:true,fitToWidth:1,fitToHeight:0}},
BX=(w,rg,pr)=>{const[a,b=a]=rg.split(':'),ca=w.getCell(a),cb=w.getCell(b);if(a!=b)w.mergeCells(rg);ca.value={richText:pr.flatMap(([l,v])=>[{text:l+':\n',font:{size:8,color:{argb:'FF666666'},name:[...]
HD=(w,R,r)=>{w.getRow(r).height=62;[[['OBRA',g.obra],['UBICACIÓN',g.ubic]],[['CONTRATISTA',g.contratista],['CLIENTE',g.cliente]],[['ESTIMACION No.',g.estNo],['FECHA / PERIODO',dt(g.fecha)+'  '+([...]
LG=(w,col,row)=>{if(!g.logo)return;w.addImage(wb.addImage({base64:g.logo,extension:'png'}),{tl:{col:col-1+.15,row:(row||1)-1+.12},ext:{width:110,height:40}})},
FIR=(w,r,R)=>{[['Realizó','r'],['Revisó','v'],['Autorizó','a']].forEach(([l,k],i)=>{const[a,b]=R[i],c1=w.getColumn(a).number,c2=w.getColumn(b).number;[l,g[k+'Emp']||'','','',g[k+'Nom']||''].fo[...]
w.getRow(r+2).height=22;w.getRow(r+3).height=22;const s=g['s'+k];if(s)w.addImage(wb.addImage({base64:s,extension:s.includes('png')?'png':'jpeg'}),{tl:{col:c1-1+.25,row:r+1},ext:{width:130,height:[...]
[...]
const subt=(txt)=>{if(!txt)return;const w=cp.addRow([txt]);cp.mergeCells(w.number,1,w.number,14);const c=w.getCell(1);c.font={bold:true,size:10,color:{argb:'FF1F4E79'},name:'Arial'};c.alignment={[...]
[...]
const st=(c,bd,f)=>{c.font={name:'Arial',size:9,bold:!!bd};if(f)c.fill=fl(f);c.border=B},
TH=(r,a,b,x)=>{cu.mergeCells(`${a}${r}:${b}${r}`);[a,b].forEach(k=>st(cu.getCell(k+r),1,'FFBDD7EE'));const c=cu.getCell(a+r);c.value=x;c.alignment={horizontal:'center'}},
TR=(r,a,b,l,v,fm,bd,f)=>{const x=cu.getCell(a+r),y=cu.getCell(b+r);x.value=l;y.value=v;y.numFmt=fm||M;y.alignment={horizontal:'right'};st(x,bd,f);st(y,bd,f)},TN='FFDEEBF7',z=v=>n(v)?n(v):null;
[...]
for(const i of S.items){for(const s of S.ev[i.id]||[]){ev.getCell(y,1).value=`${i.clave}  ${i.desc}`;ev.getCell(y,1).font={bold:true};const im=await new Promise(r=>{const o=new Image;o.onload=()=[...]
[...]
for(let j=0;j<im.length;j++){const s=im[j],imEl=await new Promise(r=>{const o=new Image;o.onload=()=>r(o);o.src=s}),w=300,h=Math.round(w*imEl.height/imEl.width);maxH=Math.max(maxH,h);
[...]
dl(new Blob([await wb.xlsx.writeBuffer()]),fname('xlsx'))}
/* ---- PDF (todas las páginas A4 horizontal) ---- */
async function pdf(){const t=C(),g=S.g,d=new jspdf.jsPDF({orientation:'landscape',unit:'pt',format:'a4'}),W=d.internal.pageSize.getWidth(),Hh=d.internal.pageSize.getHeight(),bw=(W-80)/3,cutT=(s,w[...]
const firmasBox=y=>{[['Realizó','r'],['Revisó','v'],['Autorizó','a']].forEach(([l,k],i)=>{const x=30+i*(bw+10);d.setDrawColor(120).rect(x,y,bw,66);d.setFont('helvetica','normal').setFontSize(7[...]
const s=g['s'+k];if(s){const p=d.getImageProperties(s),r=Math.min(100/p.width,32/p.height);d.addImage(s,s.includes('png')?'PNG':'JPEG',x+bw/2-p.width*r/2,y+22,p.width*r,p.height*r)}});d.setTextCo[...]
const pg=(tt,f,noFirmas)=>{d.setFont('helvetica','bold').setFontSize(13).setTextColor(20).text(tt,W/2,24,{align:'center'});
if(g.logo){try{const p=d.getImageProperties(g.logo),r=Math.min(90/p.width,32/p.height);d.addImage(g.logo,'PNG',W-30-p.width*r,8,p.width*r,p.height*r)}catch(e){}}
(f?[[['CONTRATISTA',g.contratista],['OBRA',g.obra],['UBICACIÓN',g.ubic]],[['RFC',g.rfc],['CLIENTE',g.cliente],['CONTRATO',g.contrato]],[['FECHA DE ELABORACION DE ESTIMACION',dt(g.fecha)],['PERIO[...]
if(!noFirmas)firmasBox(Hh-98)},
st={styles:{fontSize:7.5,cellPadding:3,lineColor:[200,205,215],lineWidth:.4,textColor:20},headStyles:{fillColor:[189,215,238],textColor:20},margin:{top:92,bottom:110,left:30,right:30}},
tb=(tt,o)=>d.autoTable({...st,startY:92,showFoot:'lastPage',...o,didDrawPage:()=>pg(tt,undefined,true)}),mv=v=>n(v)?money(v):'';
pg('CARATULA DE ESTIMACION',1);const hw=(W-70)/2,blk=(x,y0,tt,r,bd)=>{d.autoTable({...st,startY:y0,margin:{left:x,right:W-x-hw,top:112,bottom:110},theme:'grid',head:[[{content:tt,colSpan:2,styles[...]
[...]
d.save(fname('pdf'))}
[...]
function initials(u){return(((u.nombre||'?')[0]||'?')+((u.apellido||'')[0]||'')).toUpperCase()}
function landingPage(u){if(u.rol=='admin')return'home';const p=u.perm||{};if(p.home!==false)return'home';if(p.mis!==false)return'library';return'settings'}
async function fetchProfile(id){const{data,error}=await supa.from('profiles').select('*').eq('id',id).maybeSingle();if(error)throw error;return data}
async function afterLoginLoad(){
  try {
    S=(await load())||blank();
    if(S.g&&S.g.anticipo&&!S.g.an1)S.g.an1=S.g.anticipo;
    S.rf=S.rf||{};
    LIB=await listaEstimaciones();
  } catch(e) {
    console.error('Error en afterLoginLoad:', e);
    S=(await load())||blank();
    S.rf=S.rf||{};
    LIB=[];
  }
}
[...]
async function afterAuthClaim(em,nom,ape){
[...]
await supa.from('invites').delete().eq('email',em)}
[...]
async function claimIfMissing(em){let prof=await fetchProfile(AUTH_UID);
if(!prof){try{prof=await afterAuthClaim(em,'','')}catch(e){}}
return prof}
async function boot(){if(!supa){vista='noconfig';renderRoot();return}
[...]
AUTH=prof;await afterLoginLoad();vista='app';page=landingPage(AUTH);renderRoot()}
async function doLogin(){const em=$('#lem').value.trim(),pw=$('#lpw').value;loginEmail=em;loginErr='';
[...]
AUTH=prof;await afterLoginLoad();vista='app';page=landingPage(AUTH);renderRoot()}
async function doRegister(){const nom=$('#snom').value.trim(),ape=$('#sape').value.trim(),em=$('#sem').value.trim(),pw=$('#spw').value,cf=$('#scf').value;setupErr='';
if(!nom||!em||!pw){setupErr='Completa nombre, correo y contraseña.';renderRoot();return}
[...]
AUTH=prof;await afterLoginLoad();vista='app';page=landingPage(AUTH);renderRoot()}
async function logout(){await supa.auth.signOut();AUTH=null;AUTH_UID=null;S=blank();vista='login';loginEmail='';loginErr='';renderRoot()}
async function goPage(p){
[...]
UF=null;page=p;renderRoot()}
function irNueva(){if(AUTH.rol!='admin'&&AUTH.perm&&AUTH.perm.nueva===false)return;S=blank();page='editor';tab='g';save();renderRoot()}
/* ---- perfil / contraseña propios ---- */
let ptmr;function profSave(){clearTimeout(ptmr);ptmr=setTimeout(async()=>{await supa.from('profiles').update({nombre:AUTH.nombre,apellido:AUTH.apellido,celular:AUTH.celular,foto:AUTH.foto}).eq('i[...]
function perfilFoto(i){const f=i.files[0];if(!f)return;const im=new Image;im.onload=()=>{const q=Math.min(1,240/im.width),c=document.createElement('canvas');c.width=im.width*q;c.height=im.height*[...]
async function cambiarPw(){const a=$('#pwa').value,nw=$('#pwn').value,cf=$('#pwc').value;PWOK='';PWERR='';
[...]
PWOK='Contraseña actualizada.';renderRoot()}
/* ---- administración de usuarios (solo admin): se invita por correo,
   la persona crea su propia contraseña al registrarse ---- */
function newUserForm(){UF={id:null,email:'',nombre:'',apellido:'',celular:'',rol:'usuario',perm:{home:true,nueva:true,mis:true},err:''};renderRoot()}
function editUserForm(id){const u=USERS.find(x=>x.id==id);UF={id:u.id,email:u.email,nombre:u.nombre,apellido:u.apellido||'',celular:u.celular||'',rol:u.rol,perm:Object.assign({home:true,nueva:tru[...]
function cancelUserForm(){UF=null;renderRoot()}
async function saveUserForm(){const f=UF,em=(f.email||'').trim();
if(!em||!f.nombre){f.err='Completa al menos correo y nombre.';renderRoot();return}
if(!/^\S+@\S+\.\S+$/.test(em)){f.err='Escribe un correo electrónico válido.';renderRoot();return}
[...]
async function delInvite(email){if(!confirm('¿Cancelar esta invitación?'))return;await supa.from('invites').delete().eq('email',email);await loadUsuarios();renderRoot()}
async function toggleActivo(id){const u=USERS.find(x=>x.id==id);if(!u)return;
if(u.id==AUTH.id){alert('No puedes desactivar tu propia cuenta.');return}
if(u.activo&&u.rol=='admin'){const otros=USERS.filter(x=>x.id!=id&&x.rol=='admin'&&x.activo);if(!otros.length){alert('Debe quedar al menos un administrador activo.');return}}
await supa.from('profiles').update({activo:!u.activo}).eq('id',id);await loadUsuarios();renderRoot()}
async function delUser(id){if(id==AUTH.id){alert('No puedes eliminar tu propia cuenta.');return}
const u=USERS.find(x=>x.id==id);if(u&&u.rol=='admin'){const otros=USERS.filter(x=>x.id!=id&&x.rol=='admin');if(!otros.length){alert('Debe existir al menos un administrador.');return}}
if(!confirm('¿Eliminar este usuario? Pierde acceso al sistema (su cuenta de acceso en sí se elimina desde el panel de Supabase, si hace falta). Sus estimaciones guardadas no se borrarán.'))ret[...]
await supa.from('profiles').delete().eq('id',id);await loadUsuarios();renderRoot()}
/* ---- render de pantallas ---- */
function loginHTML(){return`<div class="authwrap"><div class="authcard">
[...]
</div></div>`}
function registerHTML(){return`<div class="authwrap"><div class="authcard" style="max-width:400px">
[...]
</div></div>`}
function noConfigHTML(){return`<div class="authwrap"><div class="authcard" style="max-width:460px">
[...]
</div></div>`}
function sidebarHTML(){const u=AUTH,item=(p,label,show)=>show===false?'':`<button class="${page==p?'on':''}" onclick="goPage('${p}')">${label}</button>`;
[...]
<div class="sp"></div><button class="out" onclick="logout()">⏻ Cerrar sesión</button></div>`}
function topbarHTML(){if(page=='editor')return`<div class="topbar"><h1>${esc(S.g.obra||'Nueva estimación')}<small style="opacity:.85;font-weight:400;display:block;font-size:11px">Estimación ${e[...]
[...]
return`<div class="topbar"><h1>${titles[page]||''}</h1></div>`}
function homeHTML(){const u=AUTH,tiene=S.items.length||S.g.obra;
[...]
${LIB.length?`<div class="card"><b>Últimas estimaciones</b><div class="lib">${LIB.slice(0,5).map(libRow).join('')}</div></div>`:''}`}
function libraryHTML(){return`<div class="card"><b>Mis estimaciones guardadas</b><p class="mut">${LIB.length} estimación(es) guardada(s). Desde aquí puedes abrir/editar, eliminar y descargar ca[...]
${LIB.length?`<div class="lib">${LIB.map(libRow).join('')}</div>`:'<p class="mut">Aún no has guardado ninguna estimación. Ábrela desde "Nueva Estimación" y usa el botón "Guardar en Mis[...]
function usersHTML(){if(UF)return userFormHTML();
[...]
</tbody></table></div>`}
function userFormHTML(){const f=UF;return`<div class="card" style="max-width:520px"><b>${f.id?'Editar usuario':'Invitar usuario'}</b>
[...]
<p><button class="p" onclick="saveUserForm()">Guardar</button> <button onclick="cancelUserForm()">Cancelar</button></p></div>`}
function settingsHTML(){const u=AUTH;return`<div class="two">
[...]
<p><button class="p" onclick="cambiarPw()">Actualizar contraseña</button></p></div></div>`}
function pageHTML(){if(page=='home')return homeHTML();if(page=='library')return libraryHTML();if(page=='users')return AUTH.rol=='admin'?usersHTML():homeHTML();if(page=='settings')return settingsH[...]
function renderRoot(){const root=$('#root');
[...]
if(page=='editor'){nav();draw()}}
[...]
boot();
