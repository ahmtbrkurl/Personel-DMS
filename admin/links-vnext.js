/* STS Personnel DMS - VNext STEP 02
 * GitHub -> admin/links-vnext.js
 * This file is intentionally separate from admin.js to reduce risk to the existing UI.
 */
(function(){
  const API_URL = "https://script.google.com/macros/s/AKfycbwPMm6sjG_viMpjyW9zhNsGfDA9PKjckV47pvMplonGOqS-FNOnDxbl47EYF67Lmk4/exec";
  const PAGE_URL = "https://ahmtbrkurl.github.io/Personel-DMS/";
  let lang = localStorage.getItem("sts_dms_lang") || "tr";
  let options = {groups:[],forms:[],campaigns:[]};

  const T={
    tr:{title:"Başvuru Linkleri",desc:"HR tarafından oluşturulan başvuru kampanyalarını ve linklerini yönetin.",newCampaign:"Yeni Kampanya",createLink:"Başvuru Linki Oluştur",campaign:"Kampanya",group:"Personel Grubu",form:"Form",max:"Maksimum Katılım",start:"Başlangıç",end:"Bitiş",campaignName:"Kampanya Adı",month:"Kampanya Ayı",description:"Açıklama",save:"Kampanyayı Oluştur",cancel:"Temizle",active:"Aktif",inactive:"Pasif",used:"Kullanım",remaining:"Kalan",code:"Başvuru Kodu",url:"Başvuru Linki",copy:"Linki Kopyala",copied:"Kopyalandı",noLinks:"Henüz başvuru linki oluşturulmadı.",noOptions:"Önce grup ve form tanımlarının bulunması gerekir.",success:"Başvuru linki oluşturuldu.",campaignSuccess:"Kampanya oluşturuldu.",required:"Zorunlu alanları doldurun.",error:"İşlem başarısız."},
    ru:{title:"Ссылки на заявки",desc:"Управляйте кампаниями и ссылками на заявки, созданными HR.",newCampaign:"Новая кампания",createLink:"Создать ссылку",campaign:"Кампания",group:"Группа персонала",form:"Форма",max:"Максимум участников",start:"Начало",end:"Окончание",campaignName:"Название кампании",month:"Месяц кампании",description:"Описание",save:"Создать кампанию",cancel:"Очистить",active:"Активна",inactive:"Неактивна",used:"Использовано",remaining:"Осталось",code:"Код заявки",url:"Ссылка",copy:"Копировать",copied:"Скопировано",noLinks:"Ссылки на заявки пока не созданы.",noOptions:"Сначала должны быть доступны группы и формы.",success:"Ссылка создана.",campaignSuccess:"Кампания создана.",required:"Заполните обязательные поля.",error:"Операция не выполнена."},
    en:{title:"Application Links",desc:"Manage application campaigns and links created by HR.",newCampaign:"New Campaign",createLink:"Create Application Link",campaign:"Campaign",group:"Personnel Group",form:"Form",max:"Maximum Participants",start:"Start",end:"End",campaignName:"Campaign Name",month:"Campaign Month",description:"Description",save:"Create Campaign",cancel:"Clear",active:"Active",inactive:"Inactive",used:"Used",remaining:"Remaining",code:"Application Code",url:"Application Link",copy:"Copy Link",copied:"Copied",noLinks:"No application links have been created yet.",noOptions:"Groups and forms must be available first.",success:"Application link created.",campaignSuccess:"Campaign created.",required:"Please fill in the required fields.",error:"Operation failed."}
  };
  const t=()=>T[lang]||T.tr;
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const post=async data=>{const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(data)});const text=await r.text();let x;try{x=JSON.parse(text)}catch(e){throw new Error(text)}if(!x.success)throw new Error(x.error||t().error);return x};

  function inject(){
    const page=document.getElementById("links");
    if(!page||document.getElementById("vnextLinksRoot"))return;
    const panel=page.querySelector(".panel");
    panel.innerHTML=`<div class="panel-head"><div><h3 id="vnextTitle"></h3><p id="vnextDesc"></p></div><div class="vnext-lang"><button data-l="tr">TR</button><button data-l="ru">RU</button><button data-l="en">EN</button></div></div><div id="vnextLinksRoot"></div>`;
    render();
  }

  function render(){
    const root=document.getElementById("vnextLinksRoot"); if(!root)return;
    document.getElementById("vnextTitle").textContent=t().title;
    document.getElementById("vnextDesc").textContent=t().desc;
    document.querySelectorAll("#links .vnext-lang button").forEach(b=>b.classList.toggle("active",b.dataset.l===lang));
    root.innerHTML=`<div class="vnext-link-tools"><div class="vnext-box"><h4>${t().createLink}</h4><div class="vnext-grid"><label class="full">${t().campaign}<select id="vCampaign"><option value="">—</option>${options.campaigns.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}${x.month?" — "+esc(x.month):""}</option>`).join("")}</select></label><label>${t().group}<select id="vGroup"><option value="">—</option>${options.groups.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join("")}</select></label><label>${t().form}<select id="vForm"><option value="">—</option>${options.forms.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join("")}</select></label><label>${t().max}<input id="vMax" type="number" min="1" value="30"></label><label>${t().start}<input id="vStart" type="datetime-local"></label><label>${t().end}<input id="vEnd" type="datetime-local"></label></div><div class="vnext-actions"><button class="secondary" id="vReload">${t().cancel}</button><button class="primary" id="vCreate">${t().createLink}</button></div><div id="vResult"></div></div><div class="vnext-box"><h4>${t().newCampaign}</h4><div class="vnext-grid"><label class="full">${t().campaignName}<input id="vCampaignName"></label><label>${t().month}<input id="vCampaignMonth" type="month"></label><label>${t().description}<input id="vCampaignDesc"></label></div><div class="vnext-actions"><button class="primary" id="vCampaignCreate">${t().save}</button></div><div class="vnext-muted">Bir kampanya altında birden fazla başvuru linki oluşturabilirsiniz. Her link ayrı kod ve ayrı Drive klasörü alır.</div></div></div><div class="vnext-box"><h4>${t().title}</h4><div id="vLinksList" class="vnext-table-wrap"></div></div>`;
    bind();
    renderList();
  }

  function bind(){
    document.querySelectorAll("#links .vnext-lang button").forEach(b=>b.onclick=()=>{lang=b.dataset.l;localStorage.setItem("sts_dms_lang",lang);render()});
    document.getElementById("vReload").onclick=load;
    document.getElementById("vCampaignCreate").onclick=createCampaign;
    document.getElementById("vCreate").onclick=createLink;
  }

  async function load(){
    try{const x=await post({action:"getApplicationLinkOptions"});options=x;const y=await post({action:"getApplicationLinks"});window.__stsLinks=y.links||[];render()}
    catch(e){document.getElementById("vLinksList").innerHTML=`<div class="vnext-error">${esc(e.message)}</div>`}
  }

  async function createCampaign(){
    const name=document.getElementById("vCampaignName").value.trim(),month=document.getElementById("vCampaignMonth").value,desc=document.getElementById("vCampaignDesc").value.trim();
    if(!name||!month){alert(t().required);return}
    try{await post({action:"createApplicationGroup",campaign_name:name,campaign_month:month,description:desc,created_by:"HR"});alert(t().campaignSuccess);await load()}
    catch(e){alert(e.message)}
  }

  async function createLink(){
    const campaign_id=document.getElementById("vCampaign").value,group_id=document.getElementById("vGroup").value,form_id=document.getElementById("vForm").value,max_uses=Number(document.getElementById("vMax").value||0),start_at=document.getElementById("vStart").value,end_at=document.getElementById("vEnd").value;
    if(!campaign_id||!group_id||!form_id||!max_uses||!start_at||!end_at){alert(t().required);return}
    try{const x=await post({action:"createApplicationLink",campaign_id,group_id,form_id,max_uses,start_at,end_at,created_by:"HR"});document.getElementById("vResult").innerHTML=`<div class="vnext-result"><div><strong>${t().success}</strong></div><div class="vnext-code">${esc(x.application_code)}</div><div class="vnext-url">${esc(x.url)}</div><button class="secondary vnext-copy" id="copyGenerated">${t().copy}</button></div>`;document.getElementById("copyGenerated").onclick=async()=>{await navigator.clipboard.writeText(x.url);document.getElementById("copyGenerated").textContent=t().copied};await load()}
    catch(e){document.getElementById("vResult").innerHTML=`<div class="vnext-error">${esc(e.message)}</div>`}
  }

  function renderList(){
    const box=document.getElementById("vLinksList"); if(!box)return;const links=window.__stsLinks||[];
    if(!links.length){box.innerHTML=`<div class="empty">${t().noLinks}</div>`;return}
    const groupName=id=>(options.groups.find(x=>x.id===id)||{}).name||id;
    box.innerHTML=`<table class="vnext-table"><thead><tr><th>${t().code}</th><th>${t().group}</th><th>${t().used}</th><th>${t().remaining}</th><th>${t().start}</th><th>${t().end}</th><th>${t().active}</th></tr></thead><tbody>${links.map(x=>`<tr><td><strong>${esc(x.application_code)}</strong></td><td>${esc(groupName(x.group_id))}</td><td>${x.used_count}/${x.max_uses}</td><td>${Math.max(0,x.max_uses-x.used_count)}</td><td>${x.start_at?esc(new Date(x.start_at).toLocaleString()):"—"}</td><td>${x.end_at?esc(new Date(x.end_at).toLocaleString()):"—"}</td><td>${x.status==="ACTIVE"?`<span class="pill ok">${t().active}</span>`:`<span class="pill warn">${t().inactive}</span>`}</td></tr>`).join("")}</tbody></table>`;
  }

  const observer=new MutationObserver(()=>{if(document.getElementById("links")&&!document.getElementById("vnextLinksRoot")){inject();load()}});
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener("DOMContentLoaded",()=>{setTimeout(()=>{inject();load()},100)});
})();
