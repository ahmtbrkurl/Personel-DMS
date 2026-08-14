const API_URL="https://script.google.com/macros/s/AKfycbwPMm6sjG_viMpjyW9zhNsGfDA9PKjckV47pvMplonGOqS-FNOnDxbl47EYF67Lmk4/exec";

const demo={
  groups:[
    {id:"GRP-FORMEN",name:"FORMEN",description:"Formen personel grubu",people:0,docs:0},
    {id:"GRP-ISCI",name:"İŞÇİ",description:"Saha işçileri",people:0,docs:0},
    {id:"GRP-MUH",name:"MÜHENDİS",description:"Mühendisler",people:0,docs:0}
  ],
  links:[],
  fields:[]
};

let selectedField=null;

const $=id=>document.getElementById(id);

async function post(data){
  if(!API_URL) throw new Error("Google Apps Script API URL tanımlı değil.");
  const response=await fetch(API_URL,{
    method:"POST",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify(data)
  });
  const text=await response.text();
  let result;
  try{ result=JSON.parse(text); }
  catch(e){ throw new Error(text||"Backend geçerli JSON döndürmedi."); }
  if(!result.success) throw new Error(result.error||"Backend işlemi başarısız.");
  return result;
}
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

const typeNames={
  text:"Metin",
  date:"Tarih",
  phone:"Telefon",
  email:"E-posta",
  national_id:"Kimlik No",
  passport:"Pasaport No",
  document:"Belge",
  photo:"Fotoğraf",
  select:"Açılır Liste",
  checkbox:"Onay"
};

const defaultLabels={
  text:"Metin",
  date:"Tarih",
  phone:"Telefon",
  email:"E-posta",
  national_id:"Kimlik No",
  passport:"Pasaport No",
  document:"Belge",
  photo:"Fotoğraf",
  select:"Açılır Liste",
  checkbox:"Onay"
};

document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelectorAll("[data-goto]").forEach(b=>b.onclick=()=>showPage(b.dataset.goto));

// ============================================================
// STS HR SESSION
// ============================================================

const SESSION_KEY = "STS_HR_SESSION";
const LANGUAGE_KEY = "STS_HR_LANGUAGE";

function saveSession(username){
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      loggedIn: true,
      username: username,
      createdAt: Date.now()
    })
  );
}

function getSession(){
  try{
    return JSON.parse(
      localStorage.getItem(SESSION_KEY) || "null"
    );
  }catch(e){
    return null;
  }
}

function clearSession(){
  localStorage.removeItem(SESSION_KEY);
}

function restoreSession(){

  const session = getSession();

  if(
    session &&
    session.loggedIn === true
  ){

    $("loginView").classList.add("hidden");
    $("appView").classList.remove("hidden");

    load();

    return true;
  }

  return false;
}


// ============================================================
// LOGIN
// ============================================================

$("loginBtn").onclick=()=>{

  const username =
    $("username").value.trim();

  const password =
    $("password").value;

  if(!username || !password){

    $("loginMsg").textContent =
      "Kullanıcı adı ve şifre girin.";

    return;
  }

  $("loginMsg").textContent="";

  // Oturumu kaydet
  saveSession(username);

  $("loginView").classList.add("hidden");
  $("appView").classList.remove("hidden");

  load();
};


// ============================================================
// LOGOUT
// ============================================================

$("logoutBtn").onclick=()=>{

  clearSession();

  $("appView").classList.add("hidden");
  $("loginView").classList.remove("hidden");

  $("password").value="";
};


// ============================================================
// SAYFA AÇILDIĞINDA OTURUMU GERİ YÜKLE
// ============================================================

restoreSession();

async function load(){
  $("statGroups").textContent=demo.groups.length;
  $("statPersonnel").textContent=0;
  $("statPending").textContent=0;
  $("statChanges").textContent=0;

  try{
    const result=await post({action:"getApplicationLinkOptions"});
    if(result.groups && result.groups.length){
      demo.groups=result.groups.map(g=>({
        id:g.id,
        name:g.name,
        description:"",
        people:0,
        docs:0
      }));
    }
  }catch(error){
    console.error("Backend grup okuma hatası:",error);
  }

  renderGroups();
  populateGroups();
}

function showPage(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  $(page).classList.remove("hidden");

  document.querySelectorAll(".nav-item").forEach(b=>{
    b.classList.toggle("active",b.dataset.page===page);
  });

  $("pageTitle").textContent={
    dashboard:"Dashboard",
    groups:"Personel Grupları",
    forms:"Form Tasarımı",
    links:"Başvuru Linkleri",
    personnel:"Personeller",
    logs:"İşlem Logları",
    settings:"Ayarlar"
  }[page];

  if(page==="groups") renderGroups();
  if(page==="forms") renderBuilder();
  if(page==="links") renderLinks();

  if(page==="personnel"){
    $("personnelTable").innerHTML=
      '<div class="empty">Backend bağlantısından sonra gerçek personel kayıtları burada gösterilecek.</div>';
  }

  if(page==="logs"){
    $("logsTable").innerHTML=
      '<div class="empty">Backend bağlantısından sonra gerçek DOCUMENT_LOG kayıtları burada listelenecek.</div>';
  }
}

function renderGroups(){
  $("groupsTable").innerHTML=
    '<table class="table"><thead><tr><th>Grup</th><th>Açıklama</th><th>Personel</th><th>Belge</th><th>Durum</th></tr></thead><tbody>'+
    demo.groups.map(g=>
      `<tr>
        <td><strong>${esc(g.name)}</strong></td>
        <td>${esc(g.description)}</td>
        <td>${g.people}</td>
        <td>${g.docs}</td>
        <td><span class="pill ok">Aktif</span></td>
      </tr>`
    ).join("")+
    '</tbody></table>';
}

$("newGroupBtn").onclick=()=>{
  const n=prompt("Grup adı:");
  if(!n)return;

  demo.groups.push({
    id:"GRP-"+Date.now(),
    name:n.toUpperCase(),
    description:"Yeni personel grubu",
    people:0,
    docs:0
  });

  load();
  showPage("groups");
};

function populateGroups(){
  $("formGroup").innerHTML=
    demo.groups.map(g=>`<option value="${g.id}">${esc(g.name)}</option>`).join("");
}

// ============================================================
// FORM BUILDER - PALETTE
// Event delegation kullanılır. Böylece Form Tasarımı sayfası
// yeniden çizilse veya i18n scripti DOM'u güncellese bile
// alan ekleme butonları çalışmaya devam eder.
// ============================================================

function addFormField(type){

  if(!type || !defaultLabels[type]){
    console.error("Geçersiz form alanı tipi:", type);
    return;
  }

  const f={
    id:"FLD-"+Date.now()+"-"+Math.random().toString(16).slice(2),
    type:type,
    label:defaultLabels[type],
    required:false,
    helpText:"",
    placeholder:"",
    fileTypes:
      type==="document"
        ? ["PDF"]
        : type==="photo"
          ? ["JPG","JPEG","PNG"]
          : [],
    maxMB:
      type==="document" || type==="photo"
        ? 10
        : null,
    replaceAllowed:true,
    hrApproval:false,
    cameraAllowed:type==="photo",
    galleryAllowed:type==="photo",
    options:
      type==="select"
        ? ["Seçenek 1","Seçenek 2"]
        : [],
    code:
      type==="document" || type==="photo"
        ? type.toUpperCase()
        : ""
  };

  demo.fields.push(f);
  selectedField=f.id;

  renderBuilder();
}

document.addEventListener("click",function(e){

  const paletteButton=e.target.closest(
    ".palette button[data-type]"
  );

  if(!paletteButton) return;

  e.preventDefault();
  e.stopPropagation();

  addFormField(
    paletteButton.getAttribute("data-type")
  );
});

function renderBuilder(){
  populateGroups();

  $("canvasTitle").textContent=
    $("formName").value || "Personel Başvuru Formu";

  $("emptyFields").classList.toggle("hidden",demo.fields.length>0);

  $("fieldList").innerHTML=demo.fields.map(f=>`
    <div class="field-row ${selectedField===f.id?"selected":""}" data-id="${f.id}">
      <span>☰</span>
      <div class="field-main">
        <strong>${esc(f.label)}</strong>
        <small>
          ${typeNames[f.type]}
          ${f.required?" • Zorunlu":""}
          ${f.type==="document"&&f.fileTypes?.length?" • "+f.fileTypes.join(", "):""}
        </small>
      </div>
      <button class="remove" data-remove="${f.id}">Sil</button>
    </div>
  `).join("");

  renderProperties();
}

// ============================================================
// FORM BUILDER - FIELD SELECTION / REMOVE
// ============================================================

document.addEventListener("click",function(e){

  const removeButton=e.target.closest(
    "#fieldList [data-remove]"
  );

  if(removeButton){

    e.preventDefault();
    e.stopPropagation();

    const id=removeButton.getAttribute("data-remove");

    demo.fields=demo.fields.filter(
      f=>f.id!==id
    );

    selectedField=null;
    renderBuilder();

    return;
  }

  const row=e.target.closest(
    "#fieldList .field-row"
  );

  if(row){

    selectedField=row.getAttribute("data-id");
    renderBuilder();
  }

});

function renderProperties(){
  const f=demo.fields.find(x=>x.id===selectedField);

  if(!f){
    $("propertiesBody").innerHTML=
      '<div class="empty">Düzenlemek için bir alan seçin.</div>';
    return;
  }

  let html=`
    <div class="property">
      <label>Alan Tipi</label>
      <input value="${esc(typeNames[f.type])}" disabled>
    </div>

    <div class="property">
      <label>Etiket</label>
      <input id="propLabel" value="${esc(f.label)}">
    </div>

    <div class="property">
      <label>Yardım / Açıklama Metni</label>
      <input id="propHelp" value="${esc(f.helpText||"")}" placeholder="Personelin göreceği açıklama">
    </div>

    <div class="property">
      <label>Yer Tutucu Metin</label>
      <input id="propPlaceholder" value="${esc(f.placeholder||"")}" placeholder="Örn. Adınızı girin">
    </div>

    <div class="property check">
      <input id="propReq" type="checkbox" ${f.required?"checked":""}>
      <label for="propReq">Zorunlu alan</label>
    </div>
  `;

  if(f.type==="document"){
    html+=`
      <div class="property">
        <label>Belge Kodu</label>
        <input id="propCode" value="${esc(f.code||"BELGE")}">
      </div>

      <div class="property">
        <label>İzin Verilen Dosya Türleri</label>
        <div class="checks">
          ${["PDF","JPG","JPEG","PNG"].map(t=>`
            <label class="check">
              <input class="fileTypeCheck" type="checkbox" value="${t}" ${f.fileTypes.includes(t)?"checked":""}>
              ${t}
            </label>
          `).join("")}
        </div>
      </div>

      <div class="property">
        <label>Maksimum Dosya Boyutu (MB)</label>
        <input id="propMax" type="number" min="1" max="50" value="${f.maxMB||10}">
      </div>

      <div class="property check">
        <input id="propReplace" type="checkbox" ${f.replaceAllowed!==false?"checked":""}>
        <label for="propReplace">Personel sonradan değiştirebilir</label>
      </div>

      <div class="property check">
        <input id="propApproval" type="checkbox" ${f.hrApproval?"checked":""}>
        <label for="propApproval">Değişiklikte HR onayı gerekli</label>
      </div>
    `;
  }

  if(f.type==="photo"){
    html+=`
      <div class="property">
        <label>İzin Verilen Dosya Türleri</label>
        <div class="checks">
          ${["JPG","JPEG","PNG"].map(t=>`
            <label class="check">
              <input class="fileTypeCheck" type="checkbox" value="${t}" ${f.fileTypes.includes(t)?"checked":""}>
              ${t}
            </label>
          `).join("")}
        </div>
      </div>

      <div class="property">
        <label>Maksimum Dosya Boyutu (MB)</label>
        <input id="propMax" type="number" min="1" max="20" value="${f.maxMB||10}">
      </div>

      <div class="property check">
        <input id="propCamera" type="checkbox" ${f.cameraAllowed!==false?"checked":""}>
        <label for="propCamera">Kameradan çekmeye izin ver</label>
      </div>

      <div class="property check">
        <input id="propGallery" type="checkbox" ${f.galleryAllowed!==false?"checked":""}>
        <label for="propGallery">Galeriden/dosyadan seçmeye izin ver</label>
      </div>

      <div class="property check">
        <input id="propReplace" type="checkbox" ${f.replaceAllowed!==false?"checked":""}>
        <label for="propReplace">Personel sonradan değiştirebilir</label>
      </div>

      <div class="property check">
        <input id="propApproval" type="checkbox" ${f.hrApproval?"checked":""}>
        <label for="propApproval">Değişiklikte HR onayı gerekli</label>
      </div>
    `;
  }

  if(f.type==="select"){
    html+=`
      <div class="property">
        <label>Seçenekler</label>
        <textarea id="propOptions" rows="5" placeholder="Her satıra bir seçenek">${esc((f.options||[]).join("\n"))}</textarea>
        <small>Örneğin: Formen, Mühendis, İşçi</small>
      </div>
    `;
  }

  $("propertiesBody").innerHTML=html;

  $("propLabel").oninput=e=>{
    f.label=e.target.value;

    const row=document.querySelector(
      '#fieldList .field-row[data-id="'+CSS.escape(f.id)+'"]'
    );

    if(row){
      const title=row.querySelector(".field-main strong");
      if(title) title.textContent=f.label || defaultLabels[f.type];
    }

    if($("canvasTitle")){
      $("canvasTitle").textContent =
        $("formName").value || "Personel Başvuru Formu";
    }
  };

  $("propHelp").oninput=e=>f.helpText=e.target.value;
  $("propPlaceholder").oninput=e=>f.placeholder=e.target.value;
  $("propReq").onchange=e=>{
    f.required=e.target.checked;
    renderBuilder();
  };

  document.querySelectorAll(".fileTypeCheck").forEach(c=>{
    c.onchange=()=>{
      f.fileTypes=[...document.querySelectorAll(".fileTypeCheck:checked")].map(x=>x.value);
      renderBuilder();
    };
  });

  if($("propCode"))$("propCode").oninput=e=>f.code=e.target.value;

  if($("propMax"))$("propMax").oninput=e=>{
    f.maxMB=Math.max(1,Math.min(Number(e.target.value)||10,50));
  };

  if($("propReplace"))$("propReplace").onchange=e=>f.replaceAllowed=e.target.checked;
  if($("propApproval"))$("propApproval").onchange=e=>f.hrApproval=e.target.checked;
  if($("propCamera"))$("propCamera").onchange=e=>f.cameraAllowed=e.target.checked;
  if($("propGallery"))$("propGallery").onchange=e=>f.galleryAllowed=e.target.checked;

  if($("propOptions"))$("propOptions").oninput=e=>{
    f.options=e.target.value.split("\n").map(x=>x.trim()).filter(Boolean);
  };
}

if($("formName")){
  $("formName").oninput=()=>{
    if($("canvasTitle")){
      $("canvasTitle").textContent =
        $("formName").value || "Personel Başvuru Formu";
    }
  };
}

$("saveFormBtn").onclick=async()=>{
  const formName=String($("formName").value||"").trim();
  const groupId=String($("formGroup").value||"").trim();

  if(!formName){
    alert("Form adı zorunludur.");
    $("formName").focus();
    return;
  }

  if(!groupId){
    alert("Personel grubu seçilmelidir.");
    return;
  }

  if(!demo.fields.length){
    alert("Önce en az bir alan ekleyin.");
    return;
  }

  const fields=demo.fields.map((f,index)=>({
    field_id:f.id,
    type:f.type,
    label:String(f.label||"").trim(),
    code:String(f.code||"").trim().toUpperCase(),
    required:f.required===true,
    helpText:String(f.helpText||"").trim(),
    placeholder:String(f.placeholder||"").trim(),
    fileTypes:Array.isArray(f.fileTypes)?f.fileTypes:[],
    maxMB:f.maxMB||null,
    replaceAllowed:f.replaceAllowed!==false,
    hrApproval:f.hrApproval===true,
    cameraAllowed:f.cameraAllowed!==false,
    galleryAllowed:f.galleryAllowed!==false,
    options:Array.isArray(f.options)?f.options:[]
  }));

  const invalid=fields.some(f=>!f.label);
  if(invalid){
    alert("Tüm alanların etiketi doldurulmalıdır.");
    return;
  }

  const button=$("saveFormBtn");
  const originalText=button.textContent;
  button.disabled=true;
  button.textContent="Kaydediliyor...";

  try{
    const result=await post({
      action:"createForm",
      group_id:groupId,
      form_name:formName,
      version:"1.0",
      created_by:"HR",
      fields:fields
    });

    alert(
      "Form başarıyla oluşturuldu.\\n\\n" +
      "Form ID: " + result.form_id
    );

    demo.fields=[];
    selectedField=null;
    $("formName").value="";
    renderBuilder();
  }catch(error){
    console.error(error);
    alert("Form oluşturulamadı:\\n" + error.message);
  }finally{
    button.disabled=false;
    button.textContent=originalText;
  }
};

$("previewBtn").onclick=()=>{
  alert(
    "Önizleme motoru bir sonraki aşamada bu form tanımını kullanarak " +
    "personelin göreceği gerçek formu oluşturacak."
  );
};

$("newLinkBtn").onclick=()=>{
  const g=demo.groups[0];
  const token=Math.random().toString(36).slice(2,10).toUpperCase();

  demo.links.push({
    group:g.name,
    token,
    date:new Date().toLocaleString("tr-TR")
  });

  renderLinks();
};

function renderLinks(){
  if(!demo.links.length){
    $("linksTable").innerHTML=
      '<div class="empty">Henüz başvuru linki oluşturulmadı.</div>';
    return;
  }

  $("linksTable").innerHTML=
    '<table class="table"><thead><tr><th>Grup</th><th>Token</th><th>Oluşturulma</th><th>Durum</th></tr></thead><tbody>'+
    demo.links.map(x=>`
      <tr>
        <td>${esc(x.group)}</td>
        <td><code>${esc(x.token)}</code></td>
        <td>${esc(x.date)}</td>
        <td><span class="pill ok">Aktif</span></td>
      </tr>
    `).join("")+
    '</tbody></table>';
}
