const defaultProducts = [
    {id:1,name:"Sony Alpha A7 III",category:"Kamera",price:18500000,stock:5,badge:"BEST SELLER"},
    {id:2,name:"Canon EOS R10",category:"Kamera",price:11900000,stock:7,badge:"POPULAR"},
    {id:3,name:"Fujifilm X-S20",category:"Kamera",price:15900000,stock:4,badge:"NEW"},
    {id:4,name:"Sony FE 35mm F1.8",category:"Lensa",price:9800000,stock:6,badge:"FAVORITE"},
    {id:5,name:"Sigma 18-50mm F2.8",category:"Lensa",price:8500000,stock:5,badge:"VALUE"},
    {id:6,name:"DJI Mic 2",category:"Audio",price:5900000,stock:8,badge:"CREATOR"},
    {id:7,name:"Peak Design Tripod",category:"Aksesori",price:7800000,stock:3,badge:"PRO"},
    {id:8,name:"SanDisk Extreme Pro 128GB",category:"Aksesori",price:650000,stock:12,badge:"ESSENTIAL"},
    {id:9,name:"Godox V1 Flash",category:"Aksesori",price:4300000,stock:6,badge:"LIGHTING"},
    {id:10,name:"Rode VideoMic GO II",category:"Audio",price:1800000,stock:9,badge:"AUDIO"}
];

let products = JSON.parse(localStorage.getItem("lux_products") || "null") || defaultProducts;

const paymentMethods = {
    ewallet:["DANA","OVO","GoPay","ShopeePay","LinkAja"],
    bank:["BCA","BRI","BNI","Mandiri","BSI"],
    debit:["Visa Debit","Mastercard Debit","JCB Debit"],
    cod:["Bayar di Tempat (COD)"]
};

let user = JSON.parse(localStorage.getItem("lux_user") || "null");
let cart = JSON.parse(localStorage.getItem("lux_cart") || "[]");
let orders = JSON.parse(localStorage.getItem("lux_orders") || "[]");
let stock = JSON.parse(localStorage.getItem("lux_stock") || "null");
let suppliers = JSON.parse(localStorage.getItem("lux_suppliers") || "[]");
let purchases = JSON.parse(localStorage.getItem("lux_purchases") || "[]");

products.forEach(p => {
    if (p.buyPrice == null) p.buyPrice = Math.round(p.price * 0.8);
    if (!p.supplier) p.supplier = "LUXCAM Supplier";
});

if (!stock) {
    stock = {};
    products.forEach(p => stock[p.id] = p.stock);
}

let category = "Semua";
let selectedPayment = "DANA";
let selectedGroup = "ewallet";


function rupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style:"currency",
        currency:"IDR",
        maximumFractionDigits:0
    }).format(number);
}


function save() {
    localStorage.setItem("lux_user",JSON.stringify(user));
    localStorage.setItem("lux_cart",JSON.stringify(cart));
    localStorage.setItem("lux_orders",JSON.stringify(orders));
    localStorage.setItem("lux_stock",JSON.stringify(stock));
    localStorage.setItem("lux_products",JSON.stringify(products));
    localStorage.setItem("lux_suppliers",JSON.stringify(suppliers));
    localStorage.setItem("lux_purchases",JSON.stringify(purchases));
}


function product(id) {
    return products.find(p => p.id === id);
}


function toast(text) {
    let t = document.getElementById("toast");

    if (!t) {
        t = document.createElement("div");
        t.id = "toast";
        document.body.appendChild(t);
    }

    t.textContent = text;
    t.classList.add("show");

    setTimeout(() => t.classList.remove("show"),2500);
}


function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("hidden");
}


function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
}


/* LOGIN CUSTOMER */

function openCustomerLogin() {

    const form = document.getElementById("loginForm");

    form.dataset.role = "customer";

    document.getElementById("loginEyebrow").textContent =
        "CUSTOMER LOGIN";

    document.getElementById("loginTitle").textContent =
        "Login untuk belanja";

    document.getElementById("customerFields").style.display =
        "block";

    document.getElementById("loginUser").placeholder =
        "email@example.com";

    openModal("loginModal");
}


/* LOGIN ADMIN */

function openAdminLogin() {

    const form = document.getElementById("loginForm");

    form.dataset.role = "admin";

    document.getElementById("loginEyebrow").textContent =
        "ADMIN LOGIN";

    document.getElementById("loginTitle").textContent =
        "Login Admin";

    document.getElementById("customerFields").style.display =
        "none";

    document.getElementById("loginUser").placeholder =
        "admin";

    openModal("loginModal");
}


/* LOGIN SUBMIT */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    if (form) {

        form.addEventListener("submit", e => {

            e.preventDefault();

            const role = form.dataset.role;

            const username =
                document.getElementById("loginUser").value.trim();

            const password =
                document.getElementById("loginPass").value;

            if (role === "admin") {

                if (
                    username !== "admin" ||
                    password !== "admin123"
                ) {
                    toast("Admin: admin / admin123");
                    return;
                }

                user = {
                    role:"admin",
                    name:"Administrator",
                    email:"admin@luxcam.demo",
                    phone:"-"
                };

                save();
                closeModal("loginModal");
                showAdmin();

                return;
            }


            if (!username || !password) {
                toast("Email dan password wajib diisi.");
                return;
            }

            user = {
                role:"customer",
                name:
                    document.getElementById("customerName").value ||
                    username,
                email:username,
                phone:
                    document.getElementById("customerPhone").value ||
                    "08xxxxxxxxxx"
            };

            save();

            closeModal("loginModal");
            showCustomer();

            toast("Login berhasil ✓");

        });

    }


    if (user?.role === "admin") {
        showAdmin();
    } else if (user?.role === "customer") {
        showCustomer();
    }

    renderProducts();
});


/* CUSTOMER */

function showCustomer() {

    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    document.getElementById("customerPage").classList.remove("hidden");
    document.getElementById("adminPage").classList.add("hidden");

    document.getElementById("userLabel").textContent =
        user?.name || "Guest";

    renderProducts();
    updateCart();
}


/* ADMIN */

function showAdmin() {

    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    document.getElementById("customerPage").classList.add("hidden");
    document.getElementById("adminPage").classList.remove("hidden");

    document.getElementById("userLabel").textContent = "Admin";

    renderAdmin();
}


/* HOME */

function showHome() {

    if (!user) {
        openCustomerLogin();
        return;
    }

    if (user.role === "admin") {
        showAdmin();
    } else {
        showCustomer();
        window.scrollTo({top:0,behavior:"smooth"});
    }
}


/* SEARCH */

function focusSearch() {

    if (!user) {
        openCustomerLogin();
        return;
    }

    const search = document.getElementById("searchInput");

    if (search) {
        search.focus();
        document.getElementById("products")
            .scrollIntoView({behavior:"smooth"});
    }
}


/* CATEGORY */

function filterCategory(value) {

    category = value;

    renderProducts();

    document.getElementById("products")
        ?.scrollIntoView({behavior:"smooth"});
}


/* PRODUCTS */

function renderProducts() {

    const grid = document.getElementById("productGrid");

    if (!grid) return;

    const search =
        document.getElementById("searchInput")
        ?.value
        .toLowerCase() || "";

    const list = products.filter(p => {

        const cat =
            category === "Semua" ||
            p.category === category;

        const find =
            p.name.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search);

        return cat && find;
    });


    grid.innerHTML = list.map(p => {

        const s = stock[p.id] ?? 0;

        return `
        <article class="product-card">

            <div class="product-image">
                <span class="product-badge">${p.badge}</span>
                <div class="mini-camera"></div>
            </div>

            <div class="product-info">

                <h3>${p.name}</h3>

                <div class="product-meta">
                    ${p.category} • ${s} unit
                </div>

                <div class="price">
                    ${rupiah(p.price)}
                </div>

                <div class="product-actions">

                    <button onclick="showProduct(${p.id})">
                        Detail
                    </button>

                    <button
                        class="buy"
                        ${s <= 0 ? "disabled" : ""}
                        onclick="addToCart(${p.id})"
                    >
                        ${s <= 0 ? "Habis" : "+ Bag"}
                    </button>

                </div>

            </div>

        </article>`;
    }).join("");
}


/* DETAIL */

function showProduct(id) {

    const p = product(id);

    if (!p) return;

    const s = stock[id] ?? 0;

    document.getElementById("productDetailContent").innerHTML = `

        <div class="product-detail">

            <div class="detail-image">
                <div class="mini-camera"></div>
            </div>

            <div class="detail-info">

                <p class="label">${p.category}</p>

                <h2>${p.name}</h2>

                <div class="price">
                    ${rupiah(p.price)}
                </div>

                <p>
                    Kamera dan gear pilihan LUXCAM
                    untuk kebutuhan foto, video dan creator.
                </p>

                <p>
                    Stok tersedia:
                    <strong>${s}</strong>
                </p>

                <button
                    class="primary-button full"
                    onclick="addToCart(${p.id});closeModal('productModal')"
                    ${s <= 0 ? "disabled" : ""}
                >
                    ${s <= 0 ? "Stok Habis" : "Tambah ke Bag"}
                </button>

            </div>

        </div>
    `;

    openModal("productModal");
}


/* CART */

function addToCart(id) {

    if (!user || user.role !== "customer") {
        openCustomerLogin();
        toast("Login dulu sebelum membeli.");
        return;
    }

    const item = cart.find(x => x.id === id);
    const current = item ? item.qty : 0;

    if (current >= stock[id]) {
        toast("Stok tidak mencukupi.");
        return;
    }

    if (item) {
        item.qty++;
    } else {
        cart.push({id:id,qty:1});
    }

    save();
    updateCart();

    toast("Produk masuk ke Bag ✓");
}


/* CART COUNT */

function updateCart() {

    const count = cart.reduce(
        (sum,item) => sum + item.qty,
        0
    );

    const el = document.getElementById("cartCount");

    if (el) el.textContent = count;
}


/* OPEN CART */

function openCart() {

    if (!user) {
        openCustomerLogin();
        return;
    }

    if (user.role !== "customer") {
        toast("Admin tidak mempunyai Shopping Bag.");
        return;
    }

    const container =
        document.getElementById("cartItems");

    if (!cart.length) {

        container.innerHTML = `
            <div class="empty-cart">
                Bag masih kosong.
            </div>
        `;

    } else {

        container.innerHTML = cart.map(item => {

            const p = product(item.id);

            return `
            <div class="cart-row">

                <div>
                    <h4>${p.name}</h4>
                    <small>${rupiah(p.price)}</small>
                </div>

                <div class="qty">

                    <button onclick="changeQty(${p.id},-1)">
                        −
                    </button>

                    ${item.qty}

                    <button onclick="changeQty(${p.id},1)">
                        +
                    </button>

                </div>

                <strong>
                    ${rupiah(p.price * item.qty)}
                </strong>

            </div>
            `;

        }).join("");
    }

    document.getElementById("cartTotal").textContent =
        rupiah(totalCart());

    openModal("cartModal");
}


/* TOTAL */

function totalCart() {

    return cart.reduce((sum,item) => {

        const p = product(item.id);

        return sum + p.price * item.qty;

    },0);
}


/* QUANTITY */

function changeQty(id,amount) {

    const item = cart.find(x => x.id === id);

    if (!item) return;

    item.qty += amount;

    if (item.qty <= 0) {
        cart = cart.filter(x => x.id !== id);
    }

    if (item.qty > (stock[id] ?? 0)) {
        item.qty = stock[id];
    }

    save();
    updateCart();
    openCart();
}


/* CHECKOUT */

function startCheckout() {

    if (!cart.length) {
        toast("Bag masih kosong.");
        return;
    }

    if (!user || user.role !== "customer") {
        closeModal("cartModal");
        openCustomerLogin();
        return;
    }

    const summary =
        document.getElementById("checkoutSummary");

    summary.innerHTML = cart.map(item => {

        const p = product(item.id);

        return `
        <div class="summary-line">

            <span>
                ${p.name} × ${item.qty}
            </span>

            <strong>
                ${rupiah(p.price * item.qty)}
            </strong>

        </div>
        `;

    }).join("") + `

        <div class="summary-line">

            <strong>TOTAL</strong>

            <strong>
                ${rupiah(totalCart())}
            </strong>

        </div>
    `;

    closeModal("cartModal");

    selectPayGroup("ewallet");

    openModal("paymentModal");
}


/* PAYMENT GROUP */

function selectPayGroup(group,button) {

    selectedGroup = group;

    const buttons =
        document.querySelectorAll(".payment-tabs button");

    buttons.forEach(b => b.classList.remove("active"));

    if (button) button.classList.add("active");

    const container =
        document.getElementById("paymentOptions");

    container.innerHTML =
        paymentMethods[group].map((method,i) => `
            <button
                class="payment-option ${i === 0 ? "active" : ""}"
                onclick="selectPayment(this,'${method}')"
            >
                ${method}
            </button>
        `).join("");

    selectedPayment =
        paymentMethods[group][0];
}


/* PAYMENT */

function selectPayment(el,method) {

    document
        .querySelectorAll(".payment-option")
        .forEach(x => x.classList.remove("active"));

    el.classList.add("active");

    selectedPayment = method;
}


/* VERIFY */

function requestVerification() {

    if (!selectedPayment) {
        toast("Pilih metode pembayaran.");
        return;
    }

    closeModal("paymentModal");

    document.getElementById("verifyCode").value = "";

    openModal("verifyModal");
}


/* COMPLETE */

function completePayment() {

    const code =
        document.getElementById("verifyCode").value.trim();

    if (code !== "123456") {
        toast("Kode salah. Gunakan 123456.");
        return;
    }


    for (const item of cart) {

        if (item.qty > stock[item.id]) {
            toast("Stok tidak mencukupi.");
            return;
        }
    }


    const order = {

        id:
            "LXC-" +
            Date.now().toString().slice(-7),

        customer:user.name,

        items:cart.map(x => ({
            id:x.id,
            qty:x.qty
        })),

        total:totalCart(),

        payment:selectedPayment,

        status:"PAID",

        date:new Date().toISOString()
    };


    cart.forEach(item => {
        stock[item.id] -= item.qty;
    });


    orders.unshift(order);

    cart = [];

    save();

    updateCart();

    renderProducts();

    closeModal("verifyModal");

    showReceipt(order);

    toast("Pembayaran berhasil ✓");
}


/* RECEIPT */

function showReceipt(order) {

    const date =
        new Date(order.date)
        .toLocaleString("id-ID");


    document.getElementById("receipt").innerHTML = `

        <div class="receipt">

            <h3>LUXCAM</h3>

            <p>
                CAMERA EQUIPMENT STORE
            </p>

            <hr>

            <div class="receipt-line">
                <span>Order</span>
                <strong>${order.id}</strong>
            </div>

            <div class="receipt-line">
                <span>Tanggal</span>
                <span>${date}</span>
            </div>

            <div class="receipt-line">
                <span>Customer</span>
                <span>${order.customer}</span>
            </div>

            <div class="receipt-line">
                <span>Payment</span>
                <span>${order.payment}</span>
            </div>

            <hr>

            ${order.items.map(item => {

                const p = product(item.id);

                return `
                    <div class="receipt-line">
                        <span>
                            ${p.name} × ${item.qty}
                        </span>
                        <span>
                            ${rupiah(p.price * item.qty)}
                        </span>
                    </div>
                `;

            }).join("")}

            <hr>

            <div class="receipt-line receipt-total">

                <strong>TOTAL</strong>

                <strong>
                    ${rupiah(order.total)}
                </strong>

            </div>

            <div class="receipt-success">
                PAYMENT STATUS: PAID ✓
            </div>

        </div>
    `;

    openModal("receiptModal");
}


/* PRINT */

function printReceipt() {
    window.print();
}


/* PROFILE */

function openProfile() {

    if (!user) {
        openCustomerLogin();
        return;
    }

    document.getElementById("profileTitle").textContent =
        user.role === "admin"
        ? "Admin Profile"
        : "Customer Profile";


    document.getElementById("profileContent").innerHTML = `

        <div class="spec-list">

            <div class="spec-row">
                <span>Nama</span>
                <strong>${user.name}</strong>
            </div>

            <div class="spec-row">
                <span>Email</span>
                <strong>${user.email}</strong>
            </div>

            <div class="spec-row">
                <span>WhatsApp</span>
                <strong>${user.phone}</strong>
            </div>

            <div class="spec-row">
                <span>Role</span>
                <strong>${user.role.toUpperCase()}</strong>
            </div>

        </div>
    `;

    openModal("profileModal");
}


/* LOGOUT */

function logout() {

    user = null;

    save();

    closeModal("profileModal");

    document.getElementById("app").classList.add("hidden");
    document.getElementById("authScreen").classList.remove("hidden");
}


/* ADMIN */

function renderAdmin() {

    const sales =
        orders.reduce((sum,o) => sum + o.total,0);

    const totalStock =
        products.reduce(
            (sum,p) => sum + (stock[p.id] ?? 0),
            0
        );


    document.getElementById("statSales").textContent =
        rupiah(sales);

    document.getElementById("statOrders").textContent =
        orders.length;

    document.getElementById("statProducts").textContent =
        products.length;

    document.getElementById("statStock").textContent =
        totalStock;


    renderChart();
    renderStock();
    renderOrders();
    renderAdminProducts();
    renderSuppliers();
    renderPurchases();
    updateAdminSelects();
}


/* GRAPH */

function renderChart() {

    const chart =
        document.getElementById("salesChart");

    if (!chart) return;

    const values = [0,0,0,0,0,0,0];

    orders.forEach(order => {

        const day =
            (new Date(order.date).getDay() + 6) % 7;

        values[day] += order.total;
    });

    const max = Math.max(...values,1);

    chart.innerHTML =
        values.map((value,i) => {

            const height =
                Math.max(5,(value/max)*90);

            return `
                <div class="chart-column">

                    <div
                        class="chart-bar"
                        style="height:${height}%"
                    ></div>

                    <span class="chart-label">
                        ${["Sen","Sel","Rab","Kam","Jum","Sab","Min"][i]}
                    </span>

                </div>
            `;

        }).join("");
}


/* STOCK */

function renderStock() {

    const list =
        document.getElementById("stockList");

    if (!list) return;

    list.innerHTML = products.map(p => {

        const s = stock[p.id] ?? 0;

        const percent =
            Math.max(
                0,
                Math.min(
                    100,
                    (s / p.stock) * 100
                )
            );

        return `
            <div class="stock-item">

                <div class="stock-top">

                    <span>${p.name}</span>

                    <strong>${s}</strong>

                </div>

                <div class="stock-progress">

                    <span
                        style="width:${percent}%"
                    ></span>

                </div>

            </div>
        `;

    }).join("");
}


/* ORDERS */

function renderOrders() {

    const table =
        document.getElementById("ordersTable");

    if (!table) return;

    if (!orders.length) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Belum ada transaksi.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML =
        orders.slice(0,15).map(order => {

            const items =
                order.items.map(item => {

                    const p = product(item.id);

                    return `${p.name} ×${item.qty}`;

                }).join(", ");

            return `
                <tr>

                    <td>${order.id}</td>

                    <td>${order.customer}</td>

                    <td>${items}</td>

                    <td>${rupiah(order.total)}</td>

                    <td class="status-paid">
                        ● ${order.status}
                    </td>

                </tr>
            `;

        }).join("");
}


/* RESET */

function resetDemo() {

    if (!confirm("Reset semua data demo?")) return;

    orders = [];
    cart = [];
    suppliers = [];
    purchases = [];

    stock = {};

    products.forEach(p => {
        stock[p.id] = p.stock;
    });

    save();

    updateCart();
    renderAdmin();
    renderProducts();

    toast("Data demo direset.");
}


/* MODAL CLICK */

document.addEventListener("click",e => {

    if (e.target.classList.contains("modal")) {
        e.target.classList.add("hidden");
    }

});


/* ESC */

document.addEventListener("keydown",e => {

    if (e.key === "Escape") {

        document
            .querySelectorAll(".modal")
            .forEach(m => m.classList.add("hidden"));

    }

});

/* =====================================================
   ADMIN INVENTORY / SUPPLIER / PURCHASE MANAGEMENT
===================================================== */

function adminProductSubmit(e) {
    e.preventDefault();

    const editId = Number(document.getElementById("adminProductId").value || 0);
    const name = document.getElementById("adminProductName").value.trim();
    const categoryValue = document.getElementById("adminProductCategory").value;
    const buyPrice = Number(document.getElementById("adminProductBuyPrice").value);
    const sellPrice = Number(document.getElementById("adminProductSellPrice").value);
    const stockValue = Number(document.getElementById("adminProductStock").value);
    const supplier = document.getElementById("adminProductSupplier").value.trim();
    const badge = document.getElementById("adminProductBadge").value.trim() || "NEW";
    const image = document.getElementById("adminProductImage").value.trim();

    if (!name || !categoryValue || buyPrice < 0 || sellPrice < 0 || stockValue < 0) {
        toast("Data barang belum lengkap.");
        return;
    }

    if (editId) {
        const p = product(editId);
        if (!p) return;
        p.name = name;
        p.category = categoryValue;
        p.buyPrice = buyPrice;
        p.price = sellPrice;
        p.supplier = supplier;
        p.badge = badge;
        p.image = image;
        stock[editId] = stockValue;
        toast("Barang berhasil diperbarui ✓");
    } else {
        const id = products.length
            ? Math.max(...products.map(p => Number(p.id))) + 1
            : 1;

        products.push({
            id,
            name,
            category: categoryValue,
            price: sellPrice,
            buyPrice,
            stock: stockValue,
            badge,
            supplier,
            image
        });

        stock[id] = stockValue;
        toast("Barang berhasil ditambahkan ✓");
    }

    save();
    resetAdminProductForm();
    renderAdmin();
    renderProducts();
}

function editAdminProduct(id) {
    const p = product(id);
    if (!p) return;

    document.getElementById("adminProductId").value = p.id;
    document.getElementById("adminProductName").value = p.name;
    document.getElementById("adminProductCategory").value = p.category;
    document.getElementById("adminProductBuyPrice").value = p.buyPrice ?? 0;
    document.getElementById("adminProductSellPrice").value = p.price;
    document.getElementById("adminProductStock").value = stock[p.id] ?? 0;
    document.getElementById("adminProductSupplier").value = p.supplier || "";
    document.getElementById("adminProductBadge").value = p.badge || "";
    document.getElementById("adminProductImage").value = p.image || "";
    document.getElementById("adminProductFormTitle").textContent = "Edit Barang";
    document.getElementById("adminProductSubmit").textContent = "Simpan Perubahan";
    document.getElementById("adminProductForm").scrollIntoView({behavior:"smooth", block:"center"});
}

function deleteAdminProduct(id) {
    const p = product(id);
    if (!p) return;
    if (!confirm(`Hapus ${p.name}?`)) return;

    products = products.filter(x => x.id !== id);
    delete stock[id];
    save();
    renderAdmin();
    renderProducts();
    toast("Barang dihapus.");
}

function resetAdminProductForm() {
    const form = document.getElementById("adminProductForm");
    if (!form) return;
    form.reset();
    document.getElementById("adminProductId").value = "";
    document.getElementById("adminProductFormTitle").textContent = "Input Barang";
    document.getElementById("adminProductSubmit").textContent = "Tambah Barang";
}

function renderAdminProducts() {
    const table = document.getElementById("adminProductsTable");
    if (!table) return;

    table.innerHTML = products.map(p => {
        const s = stock[p.id] ?? 0;
        const buy = p.buyPrice ?? 0;
        const margin = p.price - buy;
        return `
            <tr>
                <td><strong>${p.name}</strong><small>${p.category}</small></td>
                <td>${rupiah(buy)}</td>
                <td class="admin-price">${rupiah(p.price)}</td>
                <td>${rupiah(margin)}</td>
                <td>${s}</td>
                <td>${p.supplier || "-"}</td>
                <td class="admin-actions">
                    <button onclick="editAdminProduct(${p.id})">Edit</button>
                    <button class="danger-btn" onclick="deleteAdminProduct(${p.id})">Hapus</button>
                </td>
            </tr>
        `;
    }).join("");
}

function addSupplier(e) {
    e.preventDefault();
    const name = document.getElementById("supplierName").value.trim();
    const phone = document.getElementById("supplierPhone").value.trim();
    const address = document.getElementById("supplierAddress").value.trim();
    if (!name) return toast("Nama supplier wajib diisi.");

    suppliers.unshift({
        id: "SUP-" + Date.now().toString().slice(-6),
        name, phone, address,
        date: new Date().toISOString()
    });
    save();
    document.getElementById("supplierForm").reset();
    updateAdminSelects();
    renderSuppliers();
    toast("Supplier ditambahkan ✓");
}

function deleteSupplier(id) {
    if (!confirm("Hapus supplier ini?")) return;
    suppliers = suppliers.filter(s => s.id !== id);
    save();
    updateAdminSelects();
    renderSuppliers();
}

function renderSuppliers() {
    const table = document.getElementById("suppliersTable");
    if (!table) return;
    if (!suppliers.length) {
        table.innerHTML = `<tr><td colspan="4">Belum ada supplier.</td></tr>`;
        return;
    }
    table.innerHTML = suppliers.map(s => `
        <tr>
            <td><strong>${s.name}</strong></td>
            <td>${s.phone || "-"}</td>
            <td>${s.address || "-"}</td>
            <td><button class="danger-btn" onclick="deleteSupplier('${s.id}')">Hapus</button></td>
        </tr>
    `).join("");
}

function updateAdminSelects() {
    const supplierSelect = document.getElementById("purchaseSupplier");
    if (supplierSelect) {
        supplierSelect.innerHTML = `<option value="">Pilih supplier</option>` +
            suppliers.map(s => `<option value="${s.name}">${s.name}</option>`).join("");
    }

    const productSelect = document.getElementById("purchaseProduct");
    if (productSelect) {
        productSelect.innerHTML = `<option value="">Pilih barang</option>` +
            products.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
    }

    const count = document.getElementById("supplierCount");
    if (count) count.textContent = `${suppliers.length} supplier`;
}

function recordPurchase(e) {
    e.preventDefault();
    const productId = Number(document.getElementById("purchaseProduct").value);
    const supplier = document.getElementById("purchaseSupplier").value;
    const qty = Number(document.getElementById("purchaseQty").value);
    const unitPrice = Number(document.getElementById("purchaseUnitPrice").value);
    if (!productId || !supplier || qty <= 0 || unitPrice < 0) {
        return toast("Data pembelian belum lengkap.");
    }

    const p = product(productId);
    if (!p) return;

    stock[productId] = (stock[productId] ?? 0) + qty;
    p.buyPrice = unitPrice;
    p.supplier = supplier;

    purchases.unshift({
        id: "PUR-" + Date.now().toString().slice(-7),
        productId,
        productName: p.name,
        supplier,
        qty,
        unitPrice,
        total: qty * unitPrice,
        date: new Date().toISOString()
    });

    save();
    document.getElementById("purchaseForm").reset();
    renderAdmin();
    renderProducts();
    toast("Pembelian supplier dicatat ✓");
}

function renderPurchases() {
    const table = document.getElementById("purchasesTable");
    if (!table) return;
    if (!purchases.length) {
        table.innerHTML = `<tr><td colspan="7">Belum ada pembelian supplier.</td></tr>`;
        return;
    }
    table.innerHTML = purchases.slice(0,30).map(x => `
        <tr>
            <td>${x.id}</td>
            <td>${new Date(x.date).toLocaleDateString("id-ID")}</td>
            <td>${x.productName}</td>
            <td>${x.supplier}</td>
            <td>${x.qty}</td>
            <td>${rupiah(x.unitPrice)}</td>
            <td>${rupiah(x.total)}</td>
        </tr>
    `).join("");
}
