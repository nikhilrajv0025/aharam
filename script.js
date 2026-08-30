const cfg = window.AHARAM_CONFIG;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function safeLink(value, fallback = "#") {
  return value && value.trim() ? value.trim() : fallback;
}

function whatsappLink(message = "Hello Aharam, I would like to place an order.") {
  return `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

["mapsLink", "floatMaps", "swiggyLink", "floatSwiggy"].forEach((id) => {
  const el = document.getElementById(id);
  if (el.getAttribute("href") === "#") {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      alert("Add this link in config.js first.");
    });
  }
});

$("#menuButton").onclick = () => {
  const open = $("#nav").classList.toggle("open");
  $("#menuButton").setAttribute("aria-expanded", open);
};
$$('.nav a').forEach((link) => link.addEventListener("click", () => $("#nav").classList.remove("open")));

$("#themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("aharam-theme", document.body.classList.contains("dark") ? "dark" : "light");
};
if (localStorage.getItem("aharam-theme") === "dark") document.body.classList.add("dark");

let currentSlide = 0;
const slides = $$(".hero-slide");
const dots = $$(".dot");
function setSlide(index) {
  slides.forEach((slide, number) => slide.classList.toggle("active", number === index));
  dots.forEach((dot, number) => dot.classList.toggle("active", number === index));
  currentSlide = index;
}
dots.forEach((dot) => (dot.onclick = () => setSlide(Number(dot.dataset.slide))));
setInterval(() => setSlide((currentSlide + 1) % slides.length), 5500);

const categoryImages = {
  Burgers: "assets/burger.png",
  Pancakes: "assets/pancakes.png",
  Waffles: "assets/waffles.png",
  Sandwiches: "assets/burger.png",
  "Fried Momos": "assets/burger.png",
  Fries: "assets/burger.png",
};

let menu = [];
let activeCategory = "All";
let query = "";
let cart = JSON.parse(localStorage.getItem("aharam-cart") || "[]");

function saveCart() {
  localStorage.setItem("aharam-cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(item) {
  const existing = cart.find((cartItem) => cartItem.name === item.name);
  if (existing) existing.quantity += 1;
  else cart.push({ name: item.name, price: Number(item.price), quantity: 1 });
  saveCart();
  openCart();
}

function changeQuantity(name, change) {
  const item = cart.find((cartItem) => cartItem.name === name);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter((cartItem) => cartItem.name !== name);
  saveCart();
}

function removeFromCart(name) {
  cart = cart.filter((item) => item.name !== name);
  saveCart();
}

function renderCart() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $("#cartCount").textContent = totalQuantity;
  $("#floatingCartCount").textContent = totalQuantity;
  $("#cartTotal").textContent = `₹${totalPrice}`;
  $("#cartEmpty").hidden = cart.length > 0;
  $("#cartItems").hidden = cart.length === 0;
  $("#checkoutWhatsapp").disabled = cart.length === 0;
  $("#clearCart").disabled = cart.length === 0;

  $("#cartItems").innerHTML = cart
    .map(
      (item) => `
      <article class="cart-item">
        <div class="cart-item-info">
          <h3>${escapeHtml(item.name)}</h3>
          <p>₹${item.price} each</p>
          <button class="remove-item" data-remove="${escapeHtml(item.name)}" type="button">Remove</button>
        </div>
        <div class="cart-item-side">
          <strong>₹${item.price * item.quantity}</strong>
          <div class="quantity-control">
            <button data-change="-1" data-name="${escapeHtml(item.name)}" type="button" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button data-change="1" data-name="${escapeHtml(item.name)}" type="button" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </article>`
    )
    .join("");

  $$("[data-change]").forEach((button) => {
    button.onclick = () => changeQuantity(button.dataset.name, Number(button.dataset.change));
  });
  $$("[data-remove]").forEach((button) => {
    button.onclick = () => removeFromCart(button.dataset.remove);
  });
}

function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#cartOverlay").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  $("#cartOverlay").setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#cartOverlay").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  $("#cartOverlay").setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
}

$("#openCart").onclick = openCart;
$("#floatingCart").onclick = openCart;
$("#closeCart").onclick = closeCart;
$("#cartOverlay").onclick = closeCart;
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

$("#clearCart").onclick = () => {
  if (cart.length && confirm("Remove all items from your cart?")) {
    cart = [];
    saveCart();
  }
};

$("#checkoutWhatsapp").onclick = () => {
  if (!cart.length) return;
  const lines = cart.map((item, index) => `${index + 1}. ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const note = $("#orderNote").value.trim();
  const message = [
    `Hello ${cfg.cafeName}, I would like to place this order:`,
    "",
    ...lines,
    "",
    `Total: ₹${total}`,
    note ? `Note: ${note}` : "",
    "",
    "Please confirm availability and pickup/delivery details.",
  ]
    .filter(Boolean)
    .join("\n");
  window.open(whatsappLink(message), "_blank", "noopener");
};

fetch("data/menu.json")
  .then((response) => {
    if (!response.ok) throw new Error("Menu file not found");
    return response.json();
  })
  .then((data) => {
    menu = data.filter((item) => item.available);
    buildFilters();
    renderMenu();
  })
  .catch(() => {
    $("#featuredMenu").innerHTML = "<p>Menu could not load. Run the website with Live Server or start.bat.</p>";
  });

function buildFilters() {
  const categories = ["All", ...new Set(menu.map((item) => item.category))];
  $("#categoryFilters").innerHTML = categories
    .slice(0, 12)
    .map((category) => `<button class="filter ${category === "All" ? "active" : ""}" data-cat="${escapeHtml(category)}">${escapeHtml(category)}</button>`)
    .join("");
  $$(".filter").forEach((button) => {
    button.onclick = () => {
      activeCategory = button.dataset.cat;
      $$(".filter").forEach((filter) => filter.classList.toggle("active", filter === button));
      renderMenu();
    };
  });
}

$("#menuSearch").addEventListener("input", (event) => {
  query = event.target.value.toLowerCase();
  renderMenu();
});

function matches(item) {
  return (activeCategory === "All" || item.category === activeCategory) && `${item.name} ${item.category}`.toLowerCase().includes(query);
}

function renderMenu() {
  const visible = menu.filter(matches);
  let featured = visible.filter((item) => item.featured);
  if (featured.length < 4) featured = visible.slice(0, 4);

  $("#featuredMenu").innerHTML =
    featured
      .slice(0, 4)
      .map(
        (item) => `
        <article class="food-card">
          <img src="${categoryImages[item.category] || "assets/pancakes.png"}" alt="${escapeHtml(item.name)}">
          <div class="food-card-body">
            <h3>${escapeHtml(item.name)}</h3>
            <span class="price">₹${item.price}</span><br>
            <button class="order-mini add-cart-button" data-add="${escapeHtml(item.name)}" type="button">+ Add to Cart</button>
          </div>
        </article>`
      )
      .join("") || "<p>No matching items.</p>";

  const groups = {};
  visible.forEach((item) => (groups[item.category] ??= []).push(item));
  $("#menuList").innerHTML = Object.entries(groups)
    .map(
      ([category, items]) => `
      <section class="category-block">
        <h3>${escapeHtml(category)}</h3>
        ${items
          .map(
            (item) => `<div class="menu-row">
              <span>${escapeHtml(item.name)}</span>
              <div class="menu-row-actions"><strong>₹${item.price}</strong><button data-add="${escapeHtml(item.name)}" type="button">Add</button></div>
            </div>`
          )
          .join("")}
      </section>`
    )
    .join("");

  $$("[data-add]").forEach((button) => {
    button.onclick = () => {
      const item = menu.find((menuItem) => menuItem.name === button.dataset.add);
      if (item) addToCart(item);
    };
  });
}

$("#showMore").onclick = () => {
  $("#menuList").classList.toggle("open");
  $("#showMore").textContent = $("#menuList").classList.contains("open") ? "Hide Full Menu" : "Show Full Menu";
};

const uploadGrid = $("#uploadGrid");
for (let index = 0; index < 4; index += 1) {
  const box = document.createElement("label");
  box.className = "upload-box";
  box.innerHTML = `<input type="file" accept="image/png,image/jpeg,image/webp" data-slot="${index}">
    <div class="upload-label">☁<br><strong>Upload Cafe Image</strong><br><small>JPG / PNG / WEBP</small></div>`;
  uploadGrid.appendChild(box);
  const saved = localStorage.getItem(`aharam-gallery-${index}`);
  if (saved) {
    const image = document.createElement("img");
    image.src = saved;
    box.appendChild(image);
  }
}

$$(".upload-box input").forEach((input) => {
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(`aharam-gallery-${input.dataset.slot}`, reader.result);
      let image = input.parentElement.querySelector("img");
      if (!image) {
        image = document.createElement("img");
        input.parentElement.appendChild(image);
      }
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };
});

$("#clearGallery").onclick = () => {
  for (let index = 0; index < 4; index += 1) localStorage.removeItem(`aharam-gallery-${index}`);
  location.reload();
};

renderCart();
