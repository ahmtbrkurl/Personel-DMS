const API_URL=""; // Sonraki aşamada Google Apps Script Web App URL'si bağlanacak.

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

$("loginBtn").onclick=()=>{
  if(!$("username").value.trim()||!$("password").value){
    $("loginMsg").textContent="Kullanıcı adı ve şifre girin.";
    return;
  }
  $("loginMsg").textContent="";
  $("loginView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  load();
};

$("logoutBtn").onclick=()=>{
  $("appView").classList.add("hidden");
  $("loginView").classList.remove("hidden");
  $("password").value="";
};

function load(){
  $("statGroups").textContent=demo.groups.length;
  $("statPersonnel").textContent=0;
  $("statPending").textContent=0;
  $("statChanges").textContent=0;
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

document.querySelectorAll(".palette button").forEach(b=>{
  b.onclick=()=>{
    const type=b.dataset.type;

    const f={
      id:"FLD-"+Date.now()+Math.random().toString(16).slice(2),
      type,
      label:defaultLabels[type],
      required:false,
      helpText:"",
      placeholder:"",
      fileTypes:type==="document"?["PDF"]:type==="photo"?["JPG","JPEG","PNG"]:[],
      maxMB:type==="document"||type==="photo"?10:null,
      replaceAllowed:true,
      hrApproval:false,
      cameraAllowed:type==="photo",
      galleryAllowed:type==="photo",
      options:type==="select"?["Seçenek 1","Seçenek 2"]:[],
      code:type==="document"||type==="photo"?type.toUpperCase():""
    };

    demo.fields.push(f);
    selectedField=f.id;
    renderBuilder();
  };
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

  document.querySelectorAll(".field-row").forEach(r=>{
    r.onclick=e=>{
      if(e.target.dataset.remove)return;
      selectedField=r.dataset.id;
      renderBuilder();
    };
  });

  document.querySelectorAll("[data-remove]").forEach(b=>{
    b.onclick=e=>{
      e.stopPropagation();
      demo.fields=demo.fields.filter(f=>f.id!==b.dataset.remove);
      selectedField=null;
      renderBuilder();
    };
  });

  renderProperties();
}

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

  $("propLabel").oninput=e=>f.label=e.target.value;
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

$("formName").oninput=()=>{
  $("canvasTitle").textContent=$("formName").value||"Personel Başvuru Formu";
};

$("saveFormBtn").onclick=()=>{
  if(!demo.fields.length){
    alert("Önce en az bir alan ekleyin.");
    return;
  }

  alert(
    "Form tasarımı hazırlandı. " +
    "Bir sonraki aşamada bu yapı Google Sheets + Apps Script backend'e kaydedilecek."
  );
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
