const cfg = window.AHARAM_CONFIG;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function safeLink(value, fallback="#") { return value && value.trim() ? value.trim() : fallback; }
function whatsappLink(message="Hello Aharam, I would like to place an order.") {
  return `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

$("#navWhatsapp").href = whatsappLink();
$("#aboutWhatsapp").href = whatsappLink("Hello Aharam, what are today's specials?");
$("#floatWhatsapp").href = whatsappLink();
$("#phoneText").textContent = cfg.phone;
$("#phoneLink").href = `tel:+91${cfg.phone}`;
$("#floatCall").href = `tel:+91${cfg.phone}`;
$("#addressText").textContent = cfg.address;
$("#hoursText").textContent = cfg.openingHours;
$("#mapsLink").href = safeLink(cfg.googleMapsLink);
$("#floatMaps").href = safeLink(cfg.googleMapsLink);
$("#swiggyLink").href = safeLink(cfg.swiggyLink);
$("#floatSwiggy").href = safeLink(cfg.swiggyLink);
$("#year").textContent = new Date().getFullYear();

["mapsLink","floatMaps","swiggyLink","floatSwiggy"].forEach(id => {
  const el = document.getElementById(id);
  if (el.getAttribute("href") === "#") el.addEventListener("click", e => {
    e.preventDefault(); alert("Add this link in config.js first.");
  });
});

$("#menuButton").onclick = () => {
  const open = $("#nav").classList.toggle("open");
  $("#menuButton").setAttribute("aria-expanded", open);
};
$$(".nav a").forEach(a => a.addEventListener("click",()=>$("#nav").classList.remove("open")));

$("#themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("aharam-theme", document.body.classList.contains("dark") ? "dark":"light");
};
if(localStorage.getItem("aharam-theme")==="dark") document.body.classList.add("dark");

let currentSlide=0;
const slides=$$(".hero-slide"), dots=$$(".dot");
function setSlide(i){slides.forEach((s,n)=>s.classList.toggle("active",n===i));dots.forEach((d,n)=>d.classList.toggle("active",n===i));currentSlide=i}
dots.forEach(d=>d.onclick=()=>setSlide(Number(d.dataset.slide)));
setInterval(()=>setSlide((currentSlide+1)%slides.length),5500);

const categoryImages = {
  "Burgers":"assets/burger.png","Pancakes":"assets/pancakes.png",
  "Waffles":"assets/pancakes.png","Sandwiches":"assets/burger.png",
  "Fried Momos":"assets/burger.png","Fries":"assets/burger.png"
};
let menu=[], activeCategory="All", query="";
fetch("data/menu.json").then(r=>r.json()).then(data=>{
  menu=data.filter(x=>x.available);
  buildFilters(); renderMenu();
}).catch(()=>{$("#featuredMenu").innerHTML="<p>Menu could not load. Run the website with Live Server or start.bat.</p>"});

function buildFilters(){
  const cats=["All",...new Set(menu.map(x=>x.category))];
  $("#categoryFilters").innerHTML=cats.slice(0,12).map(c=>`<button class="filter ${c==="All"?"active":""}" data-cat="${c}">${c}</button>`).join("");
  $$(".filter").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;$$(".filter").forEach(x=>x.classList.toggle("active",x===b));renderMenu()});
}
$("#menuSearch").addEventListener("input",e=>{query=e.target.value.toLowerCase();renderMenu()});

function matches(x){return (activeCategory==="All"||x.category===activeCategory)&&(`${x.name} ${x.category}`.toLowerCase().includes(query))}
function renderMenu(){
  const visible=menu.filter(matches);
  let featured=visible.filter(x=>x.featured);
  if(featured.length<4) featured=visible.slice(0,4);
  $("#featuredMenu").innerHTML=featured.slice(0,4).map(x=>`
    <article class="food-card">
      <img src="${categoryImages[x.category]||'assets/pancakes.png'}" alt="${x.name}">
      <div class="food-card-body"><h3>${x.name}</h3><span class="price">₹${x.price}</span><br>
      <a class="order-mini" href="${whatsappLink(`Hello Aharam, I would like to order ${x.name}.`)}" target="_blank">Order on WhatsApp</a></div>
    </article>`).join("") || "<p>No matching items.</p>";

  const groups={}; visible.forEach(x=>(groups[x.category]??=[]).push(x));
  $("#menuList").innerHTML=Object.entries(groups).map(([cat,items])=>`
    <section class="category-block"><h3>${cat}</h3>${items.map(x=>`<div class="menu-row"><span>${x.name}</span><strong>₹${x.price}</strong></div>`).join("")}</section>`).join("");
}
$("#showMore").onclick=()=>{
  $("#menuList").classList.toggle("open");
  $("#showMore").textContent=$("#menuList").classList.contains("open")?"Hide Full Menu":"Show Full Menu";
};

const uploadGrid=$("#uploadGrid");
for(let i=0;i<4;i++){
  const box=document.createElement("label");box.className="upload-box";
  box.innerHTML=`<input type="file" accept="image/png,image/jpeg,image/webp" data-slot="${i}">
    <div class="upload-label">☁<br><strong>Upload Cafe Image</strong><br><small>JPG / PNG / WEBP</small></div>`;
  uploadGrid.appendChild(box);
  const saved=localStorage.getItem(`aharam-gallery-${i}`);
  if(saved){const img=document.createElement("img");img.src=saved;box.appendChild(img)}
}
$$(".upload-box input").forEach(input=>input.onchange=e=>{
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();reader.onload=()=>{
    localStorage.setItem(`aharam-gallery-${input.dataset.slot}`,reader.result);
    let img=input.parentElement.querySelector("img");if(!img){img=document.createElement("img");input.parentElement.appendChild(img)}
    img.src=reader.result;
  };reader.readAsDataURL(file);
});
$("#clearGallery").onclick=()=>{for(let i=0;i<4;i++)localStorage.removeItem(`aharam-gallery-${i}`);location.reload()};
