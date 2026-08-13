/*
 * Demo frontend.
 * For production, set API_URL to the deployed Google Apps Script Web App URL.
 */
const API_URL = "https://script.google.com/macros/s/AKfycbwPMm6sjG_viMpjyW9zhNsGfDA9PKjckV47pvMplonGOqS-FNOnDxbl47EYF67Lmk4/exec";

const demoForm = {
  group: "FORMEN",
  title: "Formen Personel Başvuru Formu",
  version: "1.0",
  fields: [
    {id:"firstName", type:"text", label:"Ad", required:true},
    {id:"lastName", type:"text", label:"Soyad", required:true},
    {id:"nationalId", type:"national_id", label:"T.C. Kimlik Numarası", required:true},
    {id:"passport", type:"passport", label:"Pasaport Numarası", required:false},
    {id:"phone", type:"phone", label:"Telefon", required:true},
    {id:"identityDoc", type:"document", code:"KIMLIK", label:"Kimlik Belgesi", required:true, accept:["image/*","application/pdf"], maxMB:10},
    {id:"passportDoc", type:"document", code:"PASAPORT", label:"Pasaport", required:false, accept:["application/pdf","image/*"], maxMB:10},
    {id:"myk", type:"document", code:"MYK", label:"MYK Belgesi", required:true, accept:["application/pdf","image/*"], maxMB:10},
    {id:"photo", type:"photo", code:"FOTOGRAF", label:"Vesikalık Fotoğraf", required:true, accept:["image/*"], maxMB:5}
  ]
};

let state = {token:null, form:demoForm, page:0, values:{}, files:{}};

function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

document.getElementById("startBtn").addEventListener("click", async ()=>{
  state.token = document.getElementById("tokenInput").value.trim() || "DEMO-FORMEN";
  // In production: fetchFormDefinition(state.token)
  renderForm();
});

function renderForm(){
  document.getElementById("landing").classList.add("hidden");
  const view=document.getElementById("formView");
  view.classList.remove("hidden");
  const perPage=3;
  const pages=Math.ceil(state.form.fields.length/perPage);
  const start=state.page*perPage;
  const fields=state.form.fields.slice(start,start+perPage);

  view.innerHTML=`<div class="card">
    <div class="step">Adım ${state.page+1} / ${pages}</div>
    <h2>${esc(state.form.title)}</h2>
    <div class="preview"><strong>Grup:</strong> ${esc(state.form.group)} &nbsp; <strong>Form:</strong> v${esc(state.form.version)}</div>
    ${fields.map(renderField).join("")}
    <div class="actions">
      ${state.page>0?'<button class="secondary" id="prevBtn">Geri</button>':'<span></span>'}
      ${state.page<pages-1?'<button class="primary" id="nextBtn">Devam</button>':'<button class="primary" id="finishBtn">Başvuruyu Tamamla</button>'}
    </div>
  </div>`;

  fields.forEach(f=>{
    const el=document.getElementById("field_"+f.id);
    if(!el) return;
    if(f.type==="document"||f.type==="photo"){
      el.addEventListener("change",e=>{
        const file=e.target.files[0];
        if(file){
          if(file.size>f.maxMB*1024*1024){alert(`Dosya ${f.maxMB} MB sınırını aşamaz.`); e.target.value=""; return;}
          state.files[f.id]=file;
          const name=document.getElementById("name_"+f.id);
          if(name) name.textContent=file.name;
        }
      });
    }else{
      el.addEventListener("input",e=>state.values[f.id]=e.target.value);
    }
  });
  document.getElementById("nextBtn")?.addEventListener("click",()=>{if(validate(fields)){state.page++;renderForm();}});
  document.getElementById("prevBtn")?.addEventListener("click",()=>{state.page--;renderForm();});
  document.getElementById("finishBtn")?.addEventListener("click",async()=>{if(validate(fields)) await submitApplication();});
}

function renderField(f){
  const req=f.required?'<span class="required">*</span>':"";
  if(f.type==="document"||f.type==="photo"){
    return `<div class="field">
      <label>${esc(f.label)} ${req}</label>
      <div class="upload">
        <input id="field_${f.id}" type="file" accept="${esc((f.accept||[]).join(","))}">
        <div id="name_${f.id}" class="file-name">${state.files[f.id]?esc(state.files[f.id].name):"Dosya seçilmedi"}</div>
      </div>
    </div>`;
  }
  const type=f.type==="national_id"||f.type==="passport"?"text":f.type;
  return `<div class="field"><label>${esc(f.label)} ${req}</label><input id="field_${f.id}" type="${esc(type)}" value="${esc(state.values[f.id]||"")}" ${f.type==="national_id"?'inputmode="numeric" maxlength="11"':''}></div>`;
}

function validate(fields){
  for(const f of fields){
    if(!f.required) continue;
    if((f.type==="document"||f.type==="photo") && !state.files[f.id]){alert(`${f.label} zorunludur.`);return false;}
    if(f.type!=="document"&&f.type!=="photo"&&!state.values[f.id]){alert(`${f.label} zorunludur.`);return false;}
  }
  if(state.values.nationalId && !/^\d{11}$/.test(state.values.nationalId)){alert("T.C. Kimlik No 11 haneli olmalıdır.");return false;}
  return true;
}

async function submitApplication(){
  if(!API_URL){
    const fakeId="PER-2026-"+String(Math.floor(Math.random()*999999)+1).padStart(6,"0");
    showSuccess(fakeId,"DEMO-PERSONAL-"+Math.random().toString(36).slice(2,10).toUpperCase());
    return;
  }
  // Production implementation: multipart upload is handled by the Apps Script endpoint.
  alert("Backend bağlantısı yapılandırılmamış.");
}

function showSuccess(personId,manageToken){
  document.getElementById("formView").classList.add("hidden");
  const s=document.getElementById("successView");
  s.classList.remove("hidden");
  document.getElementById("successText").textContent=`Personel kayıt numaranız: ${personId}`;
  document.getElementById("manageLink").value=`${location.origin}${location.pathname}?manage=${manageToken}`;
  document.getElementById("copyLink").onclick=()=>navigator.clipboard.writeText(document.getElementById("manageLink").value);
}
