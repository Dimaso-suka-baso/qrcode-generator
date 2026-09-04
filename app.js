const formArea = document.getElementById("formArea");
const charCount = document.getElementById("charCount");
const qrBox = document.getElementById("qrBox");
const statusEl = document.getElementById("status");
const fg = document.getElementById("fgColor");
const bg = document.getElementById("bgColor");
const size = document.getElementById("size");
const margin = document.getElementById("margin");
const transparent = document.getElementById("transparent");
const downloadPng = document.getElementById("downloadPng");
const downloadSvg = document.getElementById("downloadSvg");

let currentType = "url";
let currentData = "";
let currentCanvas = null;
let currentSvg = "";

const forms = {
  url: `
    <label class="field"><span>Website / URL</span>
      <input id="content" type="url" placeholder="https://example.com" autocomplete="off">
      <div class="hint">Paste any web address. https:// will be added automatically.</div>
    </label>`,
  text: `
    <label class="field"><span>Your text</span>
      <textarea id="content" placeholder="Write anything you want to encode..."></textarea>
    </label>`,
  wifi: `
    <div class="two">
      <label class="field"><span>Network name (SSID)</span><input id="ssid" type="text" placeholder="My WiFi"></label>
      <label class="field"><span>Password</span><input id="password" type="text" placeholder="••••••••"></label>
    </div>
    <label class="field"><span>Security</span>
      <select id="security"><option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP</option><option value="nopass">No password</option></select>
    </label>
    <label class="check"><input id="hidden" type="checkbox"> Hidden network</label>`,
  contact: `
    <div class="two">
      <label class="field"><span>Name</span><input id="name" type="text" placeholder="Dimas Bagus"></label>
      <label class="field"><span>Phone</span><input id="phone" type="text" placeholder="+62 812..."></label>
    </div>
    <label class="field"><span>Email</span><input id="email" type="text" placeholder="hello@example.com"></label>
    <label class="field"><span>Organization</span><input id="org" type="text" placeholder="Company / School"></label>`
};

function renderForm() {
  formArea.innerHTML = forms[currentType];
  formArea.querySelectorAll("input, textarea, select").forEach(el => {
    el.addEventListener("input", updateCount);
    el.addEventListener("change", updateCount);
  });
  updateCount();
}
function val(id){ return document.getElementById(id)?.value.trim() || ""; }
function esc(s){ return String(s).replace(/([\\;,:"])/g, "\\$1"); }

function getData() {
  if (currentType === "url") {
    let v = val("content");
    if (v && !/^https?:\/\//i.test(v)) v = "https://" + v;
    return v;
  }
  if (currentType === "text") return val("content");
  if (currentType === "wifi") {
    const sec = val("security");
    return `WIFI:T:${sec};S:${esc(val("ssid"))};P:${sec === "nopass" ? "" : esc(val("password"))};H:${document.getElementById("hidden")?.checked ? "true" : "false"};;`;
  }
  return `BEGIN:VCARD
VERSION:3.0
FN:${val("name")}
TEL:${val("phone")}
EMAIL:${val("email")}
ORG:${val("org")}
END:VCARD`;
}

function updateCount(){
  const data = getData();
  const raw = currentType === "url" ? val("content") : data;
  charCount.textContent = `${raw.length} chars`;
}

async function generate() {
  const data = getData();
  if (!data || (currentType === "url" && data === "https://")) {
    statusEl.textContent = "Add content";
    return;
  }
  

  if (typeof QRCode === "undefined") {
    statusEl.textContent = "Library error";
    alert("Library QRCode belum terisi, periksa koneksi/script tag.");
    return;
  }

  currentData = data;
  statusEl.textContent = "Generating…";

  try {
    qrBox.innerHTML = ""; 
    const qrcode = new QRCode(qrBox, {
      text: data,
      width: Number(size.value),
      height: Number(size.value),
      colorDark: fg.value,
      colorLight: transparent.checked ? "transparent" : bg.value,
      correctLevel: QRCode.CorrectLevel.M
    });

    setTimeout(() => {
      const canvas = qrBox.querySelector("canvas");
      if (canvas) {
        currentCanvas = canvas;
        downloadPng.disabled = false;
        downloadSvg.disabled = false;
        statusEl.textContent = "Generated";
      }
    }, 50);

  } catch (e) {
    statusEl.textContent = "Could not generate";
    console.error(e);
  }
}

function downloadBlob(blob, name){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

function safeName(){
  return "qr-forge-" + new Date().toISOString().slice(0,10);
}

document.querySelectorAll(".tab").forEach(tab=>{
  tab.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
    currentType = tab.dataset.type;
    renderForm();
    statusEl.textContent = "Ready";
  });
});
document.getElementById("generate").addEventListener("click", generate);
[fg,bg,size,margin,transparent].forEach(el=>el.addEventListener("change",()=>{ if(currentData) generate(); }));

downloadPng.addEventListener("click",()=>{
  if(!currentCanvas) return;
  currentCanvas.toBlob(blob=>downloadBlob(blob, safeName()+".png"),"image/png");
});
downloadSvg.addEventListener("click",()=>{
  if(!currentSvg) return;
  downloadBlob(new Blob([currentSvg],{type:"image/svg+xml;charset=utf-8"}), safeName()+".svg");
});

renderForm();