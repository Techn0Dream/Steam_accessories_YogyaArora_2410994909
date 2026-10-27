// Product details for the store
const products = [
  { id: 1, name: "Nova Gaming Headset", category: "Headsets", price: 2499, rating: 4.8, icon: "🎧" },
  { id: 2, name: "Mechanical Keyboard", category: "Keyboards", price: 3299, rating: 4.9, icon: "⌨️" },
  { id: 3, name: "Phantom Gaming Mouse", category: "Mice", price: 1299, rating: 4.7, icon: "🖱️" },
  { id: 4, name: "Wireless Controller", category: "Controllers", price: 1899, rating: 4.6, icon: "🎮" },
  { id: 5, name: "Gaming Console", category: "Controllers", price: 24999, rating: 4.9, icon: "🕹️" },
  { id: 6, name: "RGB Mouse Pad", category: "Accessories", price: 799, rating: 4.4, icon: "🗒️" },
  { id: 7, name: "Basic Gaming Headset", category: "Headsets", price: 1799, rating: 4.5, icon: "🎧" },
  { id: 8, name: "Compact Keyboard", category: "Keyboards", price: 2199, rating: 4.6, icon: "⌨️" }
];

let cart = {};
let coupon = "";

try {
  cart = JSON.parse(localStorage.getItem("royalLootCart")) || {};
} catch (error) {
  cart = {};
}

function money(price) {
  return "₹" + price.toLocaleString("en-IN");
}

function getSubtotal() {
  let amount = 0;
  products.forEach(function(product) {
    amount += product.price * (cart[product.id] || 0);
  });
  return amount;
}

function getDiscount() {
  if (coupon === "ROYAL10") return getSubtotal() * 0.10;
  if (coupon === "ROYAL20" && getSubtotal() >= 5000) return getSubtotal() * 0.20;
  return 0;
}

function getDelivery() {
  if (getSubtotal() === 0 || getSubtotal() >= 3000) return 0;
  return 149;
}

function getTotal() {
  return getSubtotal() - getDiscount() + getDelivery();
}

function saveCart() {
  localStorage.setItem("royalLootCart", JSON.stringify(cart));
}

function showProducts() {
  let list = products.slice();
  const category = document.getElementById("category").value;

  list = list.filter(function(product) {
    return category === "all" || product.category === category;
  });

  document.getElementById("product-list").innerHTML = list.map(function(product) {
    return `
      <div class="product">
        <div class="product-picture">${product.icon}</div>
        <p class="category-name">${product.category}</p>
        <h3>${product.name}</h3>
        <div class="rating">★ ${product.rating} / 5</div>
        <div class="product-bottom">
          <span class="price">${money(product.price)}</span>
          <button class="add-button" data-add="${product.id}">Add</button>
        </div>
      </div>`;
  }).join("");

  document.getElementById("no-products").hidden = list.length > 0;
}

function showCart() {
  const cartList = document.getElementById("cart-list");
  let html = "";
  let itemCount = 0;

  products.forEach(function(product) {
    const quantity = cart[product.id] || 0;
    itemCount += quantity;

    if (quantity > 0) {
      html += `
        <div class="cart-item">
          <div class="cart-icon">${product.icon}</div>
          <div>
            <div class="cart-name">${product.name}</div>
            <div class="cart-small">${money(product.price)} each</div>
            <div class="quantity">
              <button data-id="${product.id}" data-change="-1">−</button>
              <span>${quantity}</span>
              <button data-id="${product.id}" data-change="1">+</button>
            </div>
            <button class="remove-button" data-remove="${product.id}">Remove</button>
          </div>
          <div class="item-total">${money(product.price * quantity)}</div>
        </div>`;
    }
  });

  cartList.innerHTML = html || '<p class="message">Your cart is empty. Add something from the shop!</p>';
  document.getElementById("cart-count").textContent = itemCount;
  document.getElementById("subtotal").textContent = money(getSubtotal());
  document.getElementById("discount").textContent = "−" + money(getDiscount());
  document.getElementById("delivery").textContent = getDelivery() ? money(getDelivery()) : "FREE";
  document.getElementById("total").textContent = money(getTotal());
  document.getElementById("checkout-button").disabled = itemCount === 0;
  showProducts();
}

function showCheckoutSummary() {
  let html = "";
  products.forEach(function(product) {
    if (cart[product.id]) {
      html += `<p>${product.name} * ${cart[product.id]} <strong>${money(product.price * cart[product.id])}</strong></p>`;
    }
  });
  document.getElementById("checkout-items").innerHTML = html;
  document.getElementById("check-subtotal").textContent = money(getSubtotal());
  document.getElementById("check-discount").textContent = "−" + money(getDiscount());
  document.getElementById("check-delivery").textContent = getDelivery() ? money(getDelivery()) : "FREE";
  document.getElementById("check-total").textContent = money(getTotal());
}

document.getElementById("product-list").addEventListener("click", function(event) {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = Number(button.dataset.add);
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  showCart();
});

document.getElementById("cart-list").addEventListener("click", function(event) {
  const quantityButton = event.target.closest("[data-id]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    const id = Number(quantityButton.dataset.id);
    cart[id] = (cart[id] || 0) + Number(quantityButton.dataset.change);
    if (cart[id] <= 0) delete cart[id];
    saveCart();
    showCart();
  }

  if (removeButton) {
    delete cart[Number(removeButton.dataset.remove)];
    saveCart();
    showCart();
  }
});

document.getElementById("category").addEventListener("change", showProducts);

document.getElementById("clear-cart").addEventListener("click", function() {
  cart = {};
  coupon = "";
  document.getElementById("coupon").value = "";
  document.getElementById("coupon-message").textContent = "Use ROYAL10 or ROYAL20.";
  saveCart();
  showCart();
});

document.getElementById("apply-coupon").addEventListener("click", function() {
  const code = document.getElementById("coupon").value.trim().toUpperCase();
  const message = document.getElementById("coupon-message");
  message.className = "";

  if (getSubtotal() === 0) {
    coupon = "";
    message.textContent = "Add a product before using a coupon.";
  } else if (code === "ROYAL10") {
    coupon = code;
    message.textContent = "ROYAL10 applied: 10% discount!";
    message.classList.add("ok");
  } else if (code === "ROYAL20" && getSubtotal() >= 5000) {
    coupon = code;
    message.textContent = "ROYAL20 applied: 20% discount!";
    message.classList.add("ok");
  } else if (code === "ROYAL20") {
    coupon = "";
    message.textContent = "Your subtotal needs to be at least ₹5,000.";
    message.classList.add("error");
  } else {
    coupon = "";
    message.textContent = "Invalid code. Try ROYAL10 or ROYAL20.";
    message.classList.add("error");
  }
  showCart();
});

document.getElementById("checkout-button").addEventListener("click", function() {
  document.getElementById("checkout").hidden = false;
  showCheckoutSummary();
  document.getElementById("checkout").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("back-button").addEventListener("click", function() {
  document.getElementById("checkout").hidden = true;
  document.getElementById("cart").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("checkout-form").addEventListener("submit", function(event) {
  event.preventDefault();
  if (!event.target.reportValidity() || getSubtotal() === 0) return;

  const details = new FormData(event.target);
  const orderNumber = "RL" + Date.now().toString().slice(-6);
  document.getElementById("success-message").textContent =
    "Thanks, " + details.get("name") + "! Your demo order has been placed. No real payment was taken.";
  document.getElementById("order-details").innerHTML =
    "<p><b>Order number:</b> " + orderNumber + "</p>" +
    "<p><b>Total:</b> " + money(getTotal()) + "</p>" +
    "<p><b>Payment:</b> " + details.get("payment") + "</p>" +
    "<p><b>Delivery city:</b> " + details.get("city") + "</p>";

  cart = {};
  coupon = "";
  saveCart();
  document.getElementById("shop").hidden = true;
  document.getElementById("cart").hidden = true;
  document.getElementById("checkout").hidden = true;
  document.getElementById("success").hidden = false;
  document.getElementById("cart-count").textContent = "0";
  window.scrollTo(0, 0);
});

document.getElementById("shop-again").addEventListener("click", function() {
  document.getElementById("success").hidden = true;
  document.getElementById("shop").hidden = false;
  document.getElementById("cart").hidden = false;
  document.getElementById("checkout-form").reset();
  document.getElementById("coupon").value = "";
  document.getElementById("coupon-message").textContent = "Use ROYAL10 or ROYAL20.";
  showCart();
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
});

showCart();
