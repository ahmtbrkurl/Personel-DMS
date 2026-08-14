/* STS Personnel DMS - HR Application Links UI
 * GITHUB -> admin/links-vnext.js
 * STEP: HR Başvuru Linkleri UI
 *
 * Bu aşamada backend mantığı değiştirilmez.
 * UI mevcut Apps Script action'larını kullanır:
 * - getApplicationLinkOptions
 * - getApplicationLinks
 * - createApplicationGroup
 * - createApplicationLink
 * - setApplicationLinkStatus
 */
(function () {
  "use strict";

  const API_URL = "https://script.google.com/macros/s/AKfycbwPMm6sjG_viMpjyW9zhNsGfDA9PKjckV47pvMplonGOqS-FNOnDxbl47EYF67Lmk4/exec";
  const PAGE_URL = "https://ahmtbrkurl.github.io/Personel-DMS/";

  let lang = localStorage.getItem("sts_dms_lang") || "tr";
  let options = { groups: [], forms: [], campaigns: [] };
  let links = [];

  const T = {
    tr: {
      title: "Başvuru Linkleri",
      desc: "HR tarafından oluşturulan başvuru kampanyalarını ve bağlantılarını yönetin.",
      newLink: "Yeni Başvuru Linki",
      createLink: "Başvuru Linki Oluştur",
      campaign: "Kampanya / Program",
      group: "Personel Grubu",
      form: "Başvuru Formu",
      max: "Maksimum Katılım",
      start: "Başlangıç",
      end: "Bitiş",
      create: "Oluştur",
      clear: "Temizle",
      newCampaign: "Yeni Kampanya / Program",
      campaignName: "Kampanya Adı",
      month: "Kampanya Ayı",
      description: "Açıklama",
      saveCampaign: "Kampanyayı Oluştur",
      code: "Başvuru Kodu",
      used: "Kullanım",
      remaining: "Kalan",
      status: "Durum",
      actions: "İşlem",
      active: "Aktif",
      inactive: "Pasif",
      activate: "Aktifleştir",
      deactivate: "Pasifleştir",
      copy: "Linki Kopyala",
      copied: "Kopyalandı",
      open: "Aç",
      url: "Bağlantı",
      noLinks: "Henüz başvuru linki oluşturulmadı.",
      noOptions: "Başvuru linki oluşturmak için aktif grup ve form bulunmalıdır.",
      required: "Lütfen zorunlu alanları doldurun.",
      invalidDates: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır.",
      invalidMax: "Maksimum katılım en az 1 olmalıdır.",
      success: "Başvuru linki oluşturuldu.",
      campaignSuccess: "Kampanya oluşturuldu.",
      statusSuccess: "Link durumu güncellendi.",
      error: "İşlem başarısız.",
      loading: "Yükleniyor...",
      driveFolder: "Drive Klasörü",
      notAvailable: "—",
      note: "Bir kampanya altında birden fazla başvuru linki oluşturabilirsiniz. Her link kendi benzersiz koduna ve Drive klasörüne sahip olacaktır."
    },
    ru: {
      title: "Ссылки на заявки",
      desc: "Управляйте кампаниями и ссылками на заявки, создаваемыми HR.",
      newLink: "Новая ссылка",
      createLink: "Создать ссылку",
      campaign: "Кампания / программа",
      group: "Группа персонала",
      form: "Форма заявки",
      max: "Максимум участников",
      start: "Начало",
      end: "Окончание",
      create: "Создать",
      clear: "Очистить",
      newCampaign: "Новая кампания / программа",
      campaignName: "Название кампании",
      month: "Месяц кампании",
      description: "Описание",
      saveCampaign: "Создать кампанию",
      code: "Код заявки",
      used: "Использовано",
      remaining: "Осталось",
      status: "Статус",
      actions: "Действия",
      active: "Активна",
      inactive: "Неактивна",
      activate: "Активировать",
      deactivate: "Деактивировать",
      copy: "Копировать ссылку",
      copied: "Скопировано",
      open: "Открыть",
      url: "Ссылка",
      noLinks: "Ссылки на заявки пока не созданы.",
      noOptions: "Для создания ссылки должны быть доступны активные группы и формы.",
      required: "Заполните обязательные поля.",
      invalidDates: "Дата окончания должна быть позже даты начала.",
      invalidMax: "Максимальное количество участников должно быть не менее 1.",
      success: "Ссылка на заявку создана.",
      campaignSuccess: "Кампания создана.",
      statusSuccess: "Статус ссылки обновлён.",
      error: "Операция не выполнена.",
      loading: "Загрузка...",
      driveFolder: "Папка Drive",
      notAvailable: "—",
      note: "В одной кампании можно создать несколько ссылок. Каждая ссылка получает собственный уникальный код и папку Drive."
    },
    en: {
      title: "Application Links",
      desc: "Manage application campaigns and links created by HR.",
      newLink: "New Application Link",
      createLink: "Create Application Link",
      campaign: "Campaign / Program",
      group: "Personnel Group",
      form: "Application Form",
      max: "Maximum Participants",
      start: "Start",
      end: "End",
      create: "Create",
      clear: "Clear",
      newCampaign: "New Campaign / Program",
      campaignName: "Campaign Name",
      month: "Campaign Month",
      description: "Description",
      saveCampaign: "Create Campaign",
      code: "Application Code",
      used: "Used",
      remaining: "Remaining",
      status: "Status",
      actions: "Actions",
      active: "Active",
      inactive: "Inactive",
      activate: "Activate",
      deactivate: "Deactivate",
      copy: "Copy Link",
      copied: "Copied",
      open: "Open",
      url: "Link",
      noLinks: "No application links have been created yet.",
      noOptions: "Active groups and forms are required before creating an application link.",
      required: "Please fill in the required fields.",
      invalidDates: "The end date must be later than the start date.",
      invalidMax: "Maximum participants must be at least 1.",
      success: "Application link created.",
      campaignSuccess: "Campaign created.",
      statusSuccess: "Link status updated.",
      error: "Operation failed.",
      loading: "Loading...",
      driveFolder: "Drive Folder",
      notAvailable: "—",
      note: "You can create multiple application links under one campaign. Each link receives its own unique code and Drive folder."
    }
  };

  const t = () => T[lang] || T.tr;
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));

  async function post(data) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      throw new Error(text || t().error);
    }

    if (!result.success) {
      throw new Error(result.error || t().error);
    }

    return result;
  }

  function formatDate(value) {
    if (!value) return t().notAvailable;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return esc(value);
    return d.toLocaleString(lang === "tr" ? "tr-TR" : lang === "ru" ? "ru-RU" : "en-GB");
  }

  function getCampaignName(id) {
    return (options.campaigns.find(x => x.id === id) || {}).name || id || t().notAvailable;
  }

  function getGroupName(id) {
    return (options.groups.find(x => x.id === id) || {}).name || id || t().notAvailable;
  }

  function getFormName(id) {
    return (options.forms.find(x => x.id === id) || {}).name || id || t().notAvailable;
  }

  function inject() {
    const page = document.getElementById("links");
    if (!page || document.getElementById("vnextLinksRoot")) return;

    const panel = page.querySelector(".panel");
    if (!panel) return;

    panel.innerHTML = `
      <div class="panel-head">
        <div>
          <h3 id="vnextTitle"></h3>
          <p id="vnextDesc"></p>
        </div>
        <div class="vnext-lang" aria-label="Language">
          <button type="button" data-l="tr">TR</button>
          <button type="button" data-l="ru">RU</button>
          <button type="button" data-l="en">EN</button>
        </div>
      </div>
      <div id="vnextLinksRoot"></div>
    `;

    render();
    load();
  }

  function render() {
    const root = $("vnextLinksRoot");
    if (!root) return;

    $("vnextTitle").textContent = t().title;
    $("vnextDesc").textContent = t().desc;

    document.querySelectorAll("#links .vnext-lang button").forEach((button) => {
      button.classList.toggle("active", button.dataset.l === lang);
    });

    root.innerHTML = `
      <div class="vnext-link-tools">

        <div class="vnext-box">
          <div class="vnext-box-head">
            <div>
              <h4>${t().newLink}</h4>
              <p>${t().note}</p>
            </div>
          </div>

          <div class="vnext-grid">
            <label class="full">
              ${t().campaign}
              <select id="vCampaign">
                <option value="">—</option>
                ${options.campaigns.map(x =>
                  `<option value="${esc(x.id)}">${esc(x.name)}${x.month ? " — " + esc(x.month) : ""}</option>`
                ).join("")}
              </select>
            </label>

            <label>
              ${t().group}
              <select id="vGroup">
                <option value="">—</option>
                ${options.groups.map(x =>
                  `<option value="${esc(x.id)}">${esc(x.name)}</option>`
                ).join("")}
              </select>
            </label>

            <label>
              ${t().form}
              <select id="vForm">
                <option value="">—</option>
                ${options.forms.map(x =>
                  `<option value="${esc(x.id)}">${esc(x.name)}</option>`
                ).join("")}
              </select>
            </label>

            <label>
              ${t().max}
              <input id="vMax" type="number" min="1" step="1" value="30">
            </label>

            <label>
              ${t().start}
              <input id="vStart" type="datetime-local">
            </label>

            <label>
              ${t().end}
              <input id="vEnd" type="datetime-local">
            </label>
          </div>

          <div class="vnext-actions">
            <button type="button" class="secondary" id="vReload">${t().clear}</button>
            <button type="button" class="primary" id="vCreate">${t().create}</button>
          </div>

          <div id="vResult"></div>
        </div>

        <div class="vnext-box">
          <div class="vnext-box-head">
            <div>
              <h4>${t().newCampaign}</h4>
              <p>${t().note}</p>
            </div>
          </div>

          <div class="vnext-grid">
            <label class="full">
              ${t().campaignName}
              <input id="vCampaignName">
            </label>

            <label>
              ${t().month}
              <input id="vCampaignMonth" type="month">
            </label>

            <label>
              ${t().description}
              <input id="vCampaignDesc">
            </label>
          </div>

          <div class="vnext-actions">
            <button type="button" class="primary" id="vCampaignCreate">${t().saveCampaign}</button>
          </div>

          <div class="vnext-muted">${t().note}</div>
        </div>
      </div>

      <div class="vnext-box">
        <div class="vnext-box-head">
          <div>
            <h4>${t().title}</h4>
          </div>
          <span class="vnext-count">${links.length}</span>
        </div>
        <div id="vLinksList" class="vnext-table-wrap"></div>
      </div>
    `;

    bind();
    renderList();
  }

  function bind() {
    document.querySelectorAll("#links .vnext-lang button").forEach((button) => {
      button.onclick = () => {
        lang = button.dataset.l;
        localStorage.setItem("sts_dms_lang", lang);
        render();
      };
    });

    $("vReload").onclick = () => {
      $("vCampaign").value = "";
      $("vGroup").value = "";
      $("vForm").value = "";
      $("vMax").value = "30";
      $("vStart").value = "";
      $("vEnd").value = "";
      $("vResult").innerHTML = "";
    };

    $("vCampaignCreate").onclick = createCampaign;
    $("vCreate").onclick = createLink;
  }

  async function load() {
    const list = $("vLinksList");
    if (list) list.innerHTML = `<div class="vnext-loading">${t().loading}</div>`;

    try {
      const optionResult = await post({ action: "getApplicationLinkOptions" });
      options = {
        groups: optionResult.groups || [],
        forms: optionResult.forms || [],
        campaigns: optionResult.campaigns || []
      };

      const linkResult = await post({ action: "getApplicationLinks" });
      links = linkResult.links || [];

      render();
    } catch (error) {
      if (list) {
        list.innerHTML = `<div class="vnext-error">${esc(error.message)}</div>`;
      }
    }
  }

  async function createCampaign() {
    const name = $("vCampaignName").value.trim();
    const month = $("vCampaignMonth").value;
    const description = $("vCampaignDesc").value.trim();

    if (!name || !month) {
      alert(t().required);
      return;
    }

    try {
      await post({
        action: "createApplicationGroup",
        campaign_name: name,
        campaign_month: month,
        description: description,
        created_by: "HR"
      });

      alert(t().campaignSuccess);
      await load();
    } catch (error) {
      alert(error.message);
    }
  }

  async function createLink() {
    const campaign_id = $("vCampaign").value;
    const group_id = $("vGroup").value;
    const form_id = $("vForm").value;
    const max_uses = Number($("vMax").value || 0);
    const start_at = $("vStart").value;
    const end_at = $("vEnd").value;

    if (!campaign_id || !group_id || !form_id || !start_at || !end_at) {
      alert(t().required);
      return;
    }

    if (!Number.isInteger(max_uses) || max_uses < 1) {
      alert(t().invalidMax);
      return;
    }

    if (new Date(end_at) <= new Date(start_at)) {
      alert(t().invalidDates);
      return;
    }

    try {
      const result = await post({
        action: "createApplicationLink",
        campaign_id,
        group_id,
        form_id,
        max_uses,
        start_at,
        end_at,
        created_by: "HR"
      });

      $("vResult").innerHTML = `
        <div class="vnext-result">
          <div class="vnext-success">${t().success}</div>
          <div class="vnext-code">${esc(result.application_code || t().notAvailable)}</div>
          <div class="vnext-url">${esc(result.url || t().notAvailable)}</div>
          <div class="vnext-result-actions">
            <button type="button" class="secondary" id="copyGenerated">${t().copy}</button>
            ${result.url ? `<a class="secondary vnext-open" target="_blank" rel="noopener" href="${esc(result.url)}">${t().open}</a>` : ""}
          </div>
        </div>
      `;

      const copyButton = $("copyGenerated");
      if (copyButton && result.url) {
        copyButton.onclick = async () => {
          await navigator.clipboard.writeText(result.url);
          copyButton.textContent = t().copied;
        };
      }

      await load();
    } catch (error) {
      $("vResult").innerHTML = `<div class="vnext-error">${esc(error.message)}</div>`;
    }
  }

  async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await post({
        action: "setApplicationLinkStatus",
        application_link_id: id,
        status: newStatus
      });

      alert(t().statusSuccess);
      await load();
    } catch (error) {
      alert(error.message);
    }
  }

  function renderList() {
    const box = $("vLinksList");
    if (!box) return;

    if (!links.length) {
      box.innerHTML = `<div class="empty">${t().noLinks}</div>`;
      return;
    }

    box.innerHTML = `
      <table class="vnext-table">
        <thead>
          <tr>
            <th>${t().code}</th>
            <th>${t().campaign}</th>
            <th>${t().group}</th>
            <th>${t().form}</th>
            <th>${t().used}</th>
            <th>${t().remaining}</th>
            <th>${t().start}</th>
            <th>${t().end}</th>
            <th>${t().status}</th>
            <th>${t().actions}</th>
          </tr>
        </thead>
        <tbody>
          ${links.map((item) => {
            const active = String(item.status || "").toUpperCase() === "ACTIVE";
            const remaining = Math.max(0, Number(item.max_uses || 0) - Number(item.used_count || 0));
            const toggleLabel = active ? t().deactivate : t().activate;

            return `
              <tr>
                <td>
                  <strong>${esc(item.application_code || t().notAvailable)}</strong>
                  ${item.url ? `<div class="vnext-mini-url">${esc(item.url)}</div>` : ""}
                </td>
                <td>${esc(getCampaignName(item.campaign_id))}</td>
                <td>${esc(getGroupName(item.group_id))}</td>
                <td>${esc(getFormName(item.form_id))}</td>
                <td>${Number(item.used_count || 0)} / ${Number(item.max_uses || 0)}</td>
                <td>${remaining}</td>
                <td>${formatDate(item.start_at)}</td>
                <td>${formatDate(item.end_at)}</td>
                <td>
                  ${active
                    ? `<span class="pill ok">${t().active}</span>`
                    : `<span class="pill warn">${t().inactive}</span>`}
                </td>
                <td>
                  <div class="vnext-row-actions">
                    ${item.url ? `<button type="button" class="secondary vcopy" data-url="${esc(item.url)}">${t().copy}</button>` : ""}
                    ${item.url ? `<a class="secondary" target="_blank" rel="noopener" href="${esc(item.url)}">${t().open}</a>` : ""}
                    <button type="button" class="secondary vtoggle" data-id="${esc(item.application_link_id)}" data-status="${active ? "ACTIVE" : "INACTIVE"}">${toggleLabel}</button>
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;

    document.querySelectorAll(".vcopy").forEach((button) => {
      button.onclick = async () => {
        await navigator.clipboard.writeText(button.dataset.url);
        button.textContent = t().copied;
      };
    });

    document.querySelectorAll(".vtoggle").forEach((button) => {
      button.onclick = () => toggleStatus(button.dataset.id, button.dataset.status);
    });
  }

  const observer = new MutationObserver(() => {
    if (document.getElementById("links") && !document.getElementById("vnextLinksRoot")) {
      inject();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(inject, 100);
  });
})();
