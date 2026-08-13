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

let state = {token:null, form:demoForm, page:0, values:{}, files:{}, submitting:false};

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

async function apiPost(data){

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(data)
  });

  const text = await response.text();

  let result;

  try {
    result = JSON.parse(text);
  } catch(e) {
    throw new Error("Backend geçerli JSON döndürmedi: " + text);
  }

  if(!result.success){
    throw new Error(result.error || "Backend işlemi başarısız.");
  }

  return result;
}


function fileToBase64(file){

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => {

      const result = reader.result;

      // data:application/pdf;base64,XXXX
      // kısmından sadece XXXX bölümünü alıyoruz.

      const base64 = String(result).split(",")[1];

      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error("Dosya okunamadı: " + file.name));
    };

    reader.readAsDataURL(file);
   
  });
}



function showUploadProgress(){

  if(document.getElementById("uploadProgressOverlay")){
    return;
  }

  const overlay = document.createElement("div");

  overlay.id = "uploadProgressOverlay";

  overlay.innerHTML = `
    <div style="
      position:fixed;
      inset:0;
      background:rgba(15,23,42,0.72);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:99999;
      padding:20px;
    ">

      <div style="
        background:#ffffff;
        width:380px;
        max-width:95%;
        padding:32px 28px;
        border-radius:18px;
        text-align:center;
        box-shadow:0 20px 60px rgba(0,0,0,0.30);
      ">

        <div
          id="uploadProgressCircle"
          style="
            width:150px;
            height:150px;
            margin:0 auto 22px;
            border-radius:50%;
            background:conic-gradient(#2563eb 0%, #e5e7eb 0%);
            display:flex;
            align-items:center;
            justify-content:center;
            transition:background 0.35s ease;
          "
        >
          <div style="
            width:122px;
            height:122px;
            border-radius:50%;
            background:#ffffff;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <div
              id="uploadProgressPercent"
              style="
                font-size:30px;
                font-weight:700;
                color:#2563eb;
              "
            >
              0%
            </div>
          </div>
        </div>

        <h3 style="
          margin:0 0 10px;
          font-size:20px;
          color:#111827;
        ">
          Başvurunuz işleniyor
        </h3>

        <p
          id="uploadProgressText"
          style="
            margin:0;
            color:#4b5563;
            font-size:14px;
            line-height:1.5;
            min-height:42px;
          "
        >
          Lütfen bekleyiniz...
        </p>

        <div style="
          margin-top:20px;
          padding-top:16px;
          border-top:1px solid #e5e7eb;
          color:#6b7280;
          font-size:13px;
        ">
          Lütfen sayfayı kapatmayın ve işlem tamamlanana kadar bekleyin.
        </div>

      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  updateUploadProgress(0, "Başvuru hazırlanıyor...");
}


function updateUploadProgress(percent, text){

  const safePercent = Math.max(
    0,
    Math.min(100, Math.round(percent))
  );

  const circle =
    document.getElementById(
      "uploadProgressCircle"
    );

  const percentEl =
    document.getElementById(
      "uploadProgressPercent"
    );

  const textEl =
    document.getElementById(
      "uploadProgressText"
    );

  if(circle){
    circle.style.background =
      `conic-gradient(
        #2563eb ${safePercent}%,
        #e5e7eb ${safePercent}%
      )`;
  }

  if(percentEl){
    percentEl.textContent =
      safePercent + "%";
  }

  if(textEl){
    textEl.textContent =
      text || "Lütfen bekleyiniz...";
  }
}


function hideUploadProgress(){

  const overlay =
    document.getElementById(
      "uploadProgressOverlay"
    );

  if(overlay){
    overlay.remove();
  }

}


async function submitApplication(){

  // --------------------------------------------------
  // ÇİFT TIKLAMA KORUMASI
  // --------------------------------------------------

  if (state.submitting) {
    return;
  }

  state.submitting = true;


  // --------------------------------------------------
  // İŞLEM EKRANINI AÇ
  // --------------------------------------------------

  showUploadProgress();


  try {

    // --------------------------------------------------
    // GÖNDERİLECEK BELGELER
    // --------------------------------------------------

    const documentFields =
      state.form.fields.filter(
        f =>
          f.type === "document" ||
          f.type === "photo"
      );


    const uploadedDocuments =
      documentFields.filter(
        f => state.files[f.id]
      );


    const totalSteps =
      1 + uploadedDocuments.length;

    let completedSteps = 0;


    // --------------------------------------------------
    // 0%
    // --------------------------------------------------

    updateUploadProgress(
      2,
      "Başvuru hazırlanıyor..."
    );


    // --------------------------------------------------
    // 1. PERSONEL OLUŞTUR
    // --------------------------------------------------

    updateUploadProgress(
      8,
      "Personel kaydı oluşturuluyor..."
    );


    const personnelResult =
      await apiPost({

        action:
          "createPersonnel",

        first_name:
          state.values.firstName,

        last_name:
          state.values.lastName,

        national_id:
          state.values.nationalId,

        passport_no:
          state.values.passport || "",

        group_id:
          "GRP-FORMEN",

        phone:
          state.values.phone || "",

        email:
          state.values.email || ""

      });


    if (
      !personnelResult.personnel_id
    ) {

      throw new Error(
        "Personel oluşturuldu ancak personnel_id alınamadı."
      );

    }


    const personnelId =
      personnelResult.personnel_id;


    completedSteps++;


    updateUploadProgress(
      Math.round(
        (completedSteps /
          totalSteps) * 100
      ),
      "Personel kaydı oluşturuldu."
    );


    // --------------------------------------------------
    // 2. BELGELER
    // --------------------------------------------------

    for (
      let i = 0;
      i < uploadedDocuments.length;
      i++
    ) {

      const field =
        uploadedDocuments[i];

      const file =
        state.files[field.id];


      const progressBefore =
        Math.round(
          (completedSteps /
            totalSteps) * 100
        );


      updateUploadProgress(
        Math.max(
          progressBefore,
          10
        ),
        field.label +
        " hazırlanıyor..."
      );


      // ------------------------------------------------
      // DOSYAYI BASE64'E ÇEVİR
      // ------------------------------------------------

      updateUploadProgress(
        Math.max(
          progressBefore,
          10
        ),
        field.label +
        " okunuyor..."
      );


      const base64 =
        await fileToBase64(
          file
        );


      // ------------------------------------------------
      // DOSYA YÜKLE
      // ------------------------------------------------

      updateUploadProgress(
        Math.max(
          progressBefore,
          10
        ),
        field.label +
        " Google Drive'a yükleniyor..."
      );


      const documentResult =
        await apiPost({

          action:
            "uploadDocument",

          personnel_id:
            personnelId,

          document_code:
            field.code,

          file_name:
            file.name,

          mime_type:
            file.type,

          file_base64:
            base64

        });


      if (
        !documentResult.success
      ) {

        throw new Error(
          field.label +
          " yüklenirken hata oluştu."
        );

      }


      completedSteps++;


      const currentProgress =
        Math.round(
          (completedSteps /
            totalSteps) * 100
        );


      updateUploadProgress(
        currentProgress,
        field.label +
        " başarıyla yüklendi."
      );

    }


    // --------------------------------------------------
    // %100
    // --------------------------------------------------

    updateUploadProgress(
      100,
      "Başvurunuz başarıyla tamamlandı."
    );


    // Küçük bir bekleme:
    // kullanıcı %100'ü görebilsin.

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          800
        )
    );


    // --------------------------------------------------
    // BAŞARI EKRANI
    // --------------------------------------------------

    hideUploadProgress();


    showSuccess(
      personnelId,
      personnelResult.token || ""
    );


  }

  catch(error) {

    console.error(error);


    hideUploadProgress();


    alert(
      "Başvuru sırasında hata oluştu:\n\n" +
      error.message
    );

  }

  finally {

    state.submitting =
      false;

  }

}

function showSuccess(personId,manageToken){
  document.getElementById("formView").classList.add("hidden");
  const s=document.getElementById("successView");
  s.classList.remove("hidden");
  document.getElementById("successText").textContent=`Personel kayıt numaranız: ${personId}`;
  document.getElementById("manageLink").value=`${location.origin}${location.pathname}?manage=${manageToken}`;
  document.getElementById("copyLink").onclick=()=>navigator.clipboard.writeText(document.getElementById("manageLink").value);
}
