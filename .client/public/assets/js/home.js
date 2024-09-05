let productId = null;

// Função para criar e retornar o badge com base nos critérios
const getBadge = (product) => {
    let badge = '';

    const createdAt = new Date(product.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Diferença em dias

    // Verifica se o produto é novo (nos últimos 30 dias)
    if (diffDays <= 30) {
        badge = '<div class="product__badge light-pink">Novo</div>';
    } 
    // Verifica se o produto é destaque (se não é "Novo" e tem um desconto acima de 50% ou pertence a categorias específicas)
    else if (!badge && (Number(product.savePrice) >= 50 || ['Eletrônicos', 'Moda'].includes(product.category))) {
        badge = '<div class="product__badge light-blue">Destaque</div>';
    } 
    // Verifica se o produto é popular (se não é "Novo" ou "Destaque" e atende ao critério de popularidade)
    else if (!badge && product.salesCount > 10) {
        badge = '<div class="product__badge light-green">Popular</div>';
    }

    return badge;
};

const getProducts = (tag) => {
    return fetch('/get-products', {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({ tag: tag })
    })
    .then(res => res.json())
    .then(data => {
        console.log('API Data:', data); // Verificação de dados
        if (Array.isArray(data)) {
            return data;
        } else {
            console.error('Unexpected data format:', data);
            return [];
        }
    })
    .catch(error => {
        console.error('Error fetching products:', error);
        return [];
    });
}

const createProductCards = (data, title, ele) => {
    if (Array.isArray(data) && data.length) {
        let container = document.querySelector(ele);
        container.innerHTML += `
            <h1 class="section-title">${title}</h1>
            <h3 class="search__subtitle" id="search-subtitle"></h3>
            <div class="product-container grid">
                ${createCards(data)}
            </div>
        `;
    } else {
        console.error('No valid data to create product cards:', data);
        let container = document.querySelector(ele);
        container.innerHTML += `
            <h1 class="section-title">${title}</h1>
            <p>Sem produtos disponíveis</p>
        `;
    }
}

const createCards = data => {
    let cards = '';

    data.forEach(item => {
        if(item.id != productId){
            const category = (item.tags && item.tags.length > 0 && item.tags[0].length > 0) ? item.tags[0] : 'Sem categoria';
            
            cards += `
            <div class="product__item swiper-slide">
                <div class="product__banner">
                    <a class="product__images">
                        <img
                            src="${item.image}"
                            alt=""
                            class="product__img default"
                            onclick="location.href='/products/${item.id}'"
                        />
                        <img
                            src="${item.image}"
                            alt=""
                            class="product__img hover"
                        /> 
                    </a>
                   ${getBadge(item)} <!-- Insere o badge correto aqui -->
                </div>
                <div class="product__content">
                    <span class="product__category">${category}</span>
                    <a href="/products/${item.id}">
                        <h3 class="product__title">${item.name}</h3>
                    </a>
                    <div class="product__rating">
                        <i class="fi fi-rs-star"></i>
                        <i class="fi fi-rs-star"></i>
                        <i class="fi fi-rs-star"></i>
                        <i class="fi fi-rs-star"></i>
                        <i class="fi fi-rs-star"></i>
                    </div>
                    <div class="product__price flex">
                        <span class="new__price">R$${item.price}</span>
                        <span class="old__price">R$${item.oldPrice}</span>
                    </div>
                    <a
                    class="add-cart action__btn cart__btn"
                    aria-label="Adicionar ao carrinho"
                    data-id="${item.id}"
                    onclick="addCartClicked(event)"
                  >
                    <i class="fi fi-rs-shopping-bag-add"></i>
                  </a>
                </div>
            </div>
            `;
        }
    });

    return cards;
};

// function addCartClickedFromProductPage() {
//     if (productId) {
//         const product = getProductById(productId); // Função para obter o produto pelo ID
//         console.log('Adding to cart from product page:', product); // Log de verificação
//         if (product) {
//             // Verifica se o produto já está no carrinho
//             if (isProductInCart(product.name)) {
//                 alert("Você já adicionou esse item ao carrinho");
//                 return;
//             }
//             addProductToCart(product);
//             addProductToCartDOM(product);
//             updateTotal();
//             saveCartItems();
//             updateCartIcon();
//         }
//     }
//     event.preventDefault();
// }


/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');

/*===== Menu Show =====*/
/* Validate if constant exists */
if (navToggle) {
    navToggle.addEventListener('click', (event) => {
        event.preventDefault();
        navMenu.classList.add('show-menu');
    });
}

/*===== Hide Show =====*/
/* Validate if constant exists */
if (navClose) {
    navClose.addEventListener('click', (event) => {
        event.preventDefault();
        navMenu.classList.remove('show-menu');
    });
}

/*=============== CART OPEN CLOSE ================*/
let cartIcon = document.querySelector("#cart-icon");
let cart = document.querySelector(".cart");
let closeCart = document.querySelector("#close-cart");

// Abrir ou fechar o carrinho ao clicar no ícone do carrinho
cartIcon.onclick = () => {
    cart.classList.add("active");
    document.addEventListener("click", closeCartIfClickedOutside);
};

// Fechar Carrinho ao clicar no botão de fechar
closeCart.onclick = () => {
    cart.classList.remove("active");
    document.removeEventListener("click", closeCartIfClickedOutside);
};

// Função para fechar o carrinho se clicar fora dele
const closeCartIfClickedOutside = (event) => {
    // Verifica se o clique foi fora do carrinho e do ícone do carrinho
    if (!cart.contains(event.target) && !cartIcon.contains(event.target) && event.target !== closeCart) {
        cart.classList.remove("active");
        document.removeEventListener("click", closeCartIfClickedOutside);
    }
};


// Seleciona o botão "Finalizar Pedido"
let btnBuy = document.querySelector('.btn-buy');

// Adiciona um evento de clique ao botão
btnBuy.addEventListener('click', () => {
    // Redireciona para a página cart.html
    window.location.href = '/cart';
});


// Verificar se o documento está carregado
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
} else {
    ready();
}



// Making Function 
function ready() {
    // Remove Item From Cart
    var removeCartButtons = document.getElementsByClassName("cart-remove");
    for (var i = 0; i < removeCartButtons.length; i++) {
        var button = removeCartButtons[i];
        button.addEventListener('click', removeCartItem);
    }
    // Quantity Change 
    var quantityInputs = document.getElementsByClassName("cart-quantity");
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i];
        input.addEventListener("change", quantityChanged);
    }
    // Add to cart 
    var addCart = document.getElementsByClassName("add-cart");
    for (var i = 0; i < addCart.length; i++) {
        var button = addCart[i];
        button.addEventListener("click", addCartClicked);
    }
    loadCartItems();
    updateTotal();
}

// Remove Cart Item 
function removeCartItem(event) {
    var buttonClicked = event.target;
    buttonClicked.parentElement.remove();
    updateTotal();
    saveCartItems();
    updateCartIcon();
}

// Quantity Change
function quantityChanged(event) {
    var input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    }
    updateTotal();
    saveCartItems();
    updateCartIcon();
}

// Função para buscar o produto pelo ID (exemplo)
const getProductById = (productId) => {
    return products.find(product => product.id === productId);
};

const isProductInCart = (productId) => {
    if (!productId) return false; // Verifica se o ID é válido

    // Obtém os itens do carrinho do localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Verifica se o produto está no carrinho
    return cartItems.some(item => item.id === productId);
};



function addCartClicked(event) {
    event.preventDefault(); // Evita o comportamento padrão de um link
    var button = event.target.closest('.add-cart'); // Encontra o botão mais próximo com a classe 'add-cart'
    if (!button) return; // Retorna se o botão não for encontrado

    var productId = button.getAttribute("data-id"); // Obtém o ID do produto
    if (!productId) return; // Retorna se o ID do produto não for encontrado

    var productNameElement = button.closest('.product__item').querySelector('.product__title'); // Obtém o elemento do nome do produto
    if (!productNameElement) return; // Retorna se o elemento do nome do produto não for encontrado

    var productName = productNameElement.innerText.trim(); // Obtém o nome do produto

    console.log("Product ID clicked:", productId);

    // Verifica se o produto já está no carrinho usando o ID padronizado
    if (isProductInCart(productId)) {
        alert("Você já adicionou esse item ao carrinho");
    } else {
        // Adiciona o produto ao carrinho
        var product = {
            id: productId,
            name: productName,
            image: button.closest('.product__item').querySelector('.product__img').src,
            price: button.closest('.product__item').querySelector('.new__price').innerText.replace('R$', '').trim(),
        };

        console.log("Product to be added:", product);

        addProductToCart(product);
    }
}


const addProductToCart = (product) => {
    var cartItems = document.getElementsByClassName("cart-content")[0];
    var cartShopBox = document.createElement("div");
    cartShopBox.classList.add("cart-box");
    cartShopBox.setAttribute("data-id", product.id);

    const cartBoxContent = `
        <a href="/products/${product.id}">
            <img src="${product.image}" alt="" class="cart-img" />
        </a>
        <div class="detail-box">
            <a href="/products/${product.id}" class="cart-product-link">
                <div class="cart-product-title">${product.name}</div>
            </a>
            <div class="cart-price">R$${product.price}</div>
            <input type="number" value="1" class="cart-quantity" id="cart-quantity">
        </div>
        <i class="bx bx-trash-alt cart-remove"></i>`;
        
    cartShopBox.innerHTML = cartBoxContent;
    cartItems.append(cartShopBox);

    // Adicionando eventos de remoção e mudança de quantidade
    cartShopBox.getElementsByClassName("cart-remove")[0].addEventListener("click", removeCartItem);
    cartShopBox.getElementsByClassName("cart-quantity")[0].addEventListener("change", quantityChanged);

    console.log(`Product ${product.name} added to cart successfully!`);
    saveCartItems();
    updateTotal();
    updateCartIcon();
};


// Update Total
function updateTotal() {
    var cartContent = document.getElementsByClassName("cart-content")[0];
    var cartBoxes = cartContent.getElementsByClassName("cart-box");
    var total = 0;
    for (var i = 0; i < cartBoxes.length; i++) {
        var cartBox = cartBoxes[i];
        var priceElement = cartBox.getElementsByClassName("cart-price")[0];
        var quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];
        var price = parseFloat(priceElement.innerText.replace("R$", ""));
        var quantity = quantityElement.value;
        total += price * quantity;
    }
    total = Math.round(total * 100) / 100;
    document.getElementsByClassName("total-price")[0].innerText = "R$" + total;

    localStorage.setItem("cartTotal", total);
}

function saveCartItems() {
    var cartContent = document.getElementsByClassName("cart-content")[0];
    var cartBoxes = cartContent.getElementsByClassName("cart-box");
    var cartItems = [];

    for (var i = 0; i < cartBoxes.length; i++) {
        var cartBox = cartBoxes[i];
        var id = cartBox.getAttribute("data-id");
        var titleElement = cartBox.getElementsByClassName("cart-product-title")[0];
        var priceElement = cartBox.getElementsByClassName("cart-price")[0];
        var quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];
        var productImg = cartBox.getElementsByClassName("cart-img")[0].src;

        var item = {
            id: id,
            title: titleElement.innerText,
            price: priceElement.innerText,
            quantity: quantityElement.value,
            productImg: productImg,
        };
        cartItems.push(item);
    }
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function loadCartItems() {
    var cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

    cartItems.forEach(item => {
        addProductToCartDOM(item);
    });

    var cartTotal = localStorage.getItem("cartTotal");
    if (cartTotal) {
        document.getElementsByClassName("total-price")[0].innerText = "R$" + cartTotal;
    }
    updateCartIcon();
}


function addProductToCartDOM(product) {
    var cartItems = document.getElementsByClassName("cart-content")[0];

    var cartShopBox = document.createElement("div");
    cartShopBox.classList.add("cart-box");
    cartShopBox.setAttribute("data-id", product.id);

    const cartBoxContent = `
        <a href="/products/${product.id}" class="cart-product-link">
            <img src="${product.productImg}" alt="" class="cart-img" />
        </a>
        <div class="detail-box">
            <a href="/products/${product.id}" class="cart-product-link">
                <div class="cart-product-title">${product.title}</div>
            </a>
            <div class="cart-price">${product.price}</div>
            <input type="number" value="${product.quantity}" class="cart-quantity" >
        </div>
        <i class="bx bx-trash-alt cart-remove"></i>`;
    
    cartShopBox.innerHTML = cartBoxContent;
    cartItems.append(cartShopBox);

    // Adicionando eventos de remoção e mudança de quantidade
    cartShopBox.getElementsByClassName("cart-remove")[0].addEventListener("click", removeCartItem);
    cartShopBox.getElementsByClassName("cart-quantity")[0].addEventListener("change", quantityChanged);
}



// Quantity In Cart Icon
function updateCartIcon() {
    var cartBoxes = document.getElementsByClassName("cart-box");
    var quantity = 0;

    for (var i = 0; i < cartBoxes.length; i++) {
        var cartBox = cartBoxes[i];
        var quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];
        quantity += parseInt(quantityElement.value);
    }

    var cartIcon = document.querySelector("#cart-icon");
    if (cartIcon) {
        cartIcon.setAttribute("data-quantity", quantity);
    }
}



// Clear Cart Item After Successful Payment
function clearCart() {
    var cartContent = document.getElementsByClassName("cart-content")[0];
    cartContent.innerHTML = "";
    updateTotal();
    localStorage.removeItem("cartItems");
}


/*=============== IMAGE GALLERY ===============*/
function imgGallery() {
    const mainImg = document.querySelector('.details__img');
    const firstPrice = document.querySelector('.price-1');
    const secondPrice = document.querySelector('.price-2');
    const smallImgs = document.querySelectorAll('.details__small-img');
    const kitLinks = document.querySelectorAll('.size__link');

    function updateMainImageAndPrices(img) {
        mainImg.src = img.src;

        const newPrice = img.getAttribute('data-price');
        const oldPrice = img.getAttribute('data-old-price');
        const savePrice = img.getAttribute('data-save-price');

        if (img.classList.contains('details__small-img-1')) {
            firstPrice.querySelector('.new__price').textContent = newPrice;
            firstPrice.querySelector('.old__price').textContent = oldPrice;
            firstPrice.querySelector('.save__price').textContent = savePrice;
            firstPrice.style.display = 'block';
            secondPrice.style.display = 'none';

            kitLinks.forEach(link => link.classList.remove('size-active'));
            const kit1Link = document.querySelector('[data-kit="1"]');
            if (kit1Link) kit1Link.classList.add('size-active');
        } else if (img.classList.contains('details__small-img-2')) {
            secondPrice.querySelector('.new__price').textContent = newPrice;
            secondPrice.querySelector('.old__price').textContent = oldPrice;
            secondPrice.querySelector('.save__price').textContent = savePrice;
            secondPrice.style.display = 'block';
            firstPrice.style.display = 'none';

            kitLinks.forEach(link => link.classList.remove('size-active'));
            const kit2Link = document.querySelector('[data-kit="2"]');
            if (kit2Link) kit2Link.classList.add('size-active');
        } else if (img.classList.contains('details__small-img-3')) {
            firstPrice.querySelector('.new__price').textContent = newPrice;
            firstPrice.querySelector('.old__price').textContent = oldPrice;
            firstPrice.querySelector('.save__price').textContent = savePrice;

            secondPrice.querySelector('.new__price').textContent = newPrice;
            secondPrice.querySelector('.old__price').textContent = oldPrice;
            secondPrice.querySelector('.save__price').textContent = savePrice;

            firstPrice.style.display = 'block';
            secondPrice.style.display = 'block';

            kitLinks.forEach(link => link.classList.remove('size-active'));
            const kit3Link = document.querySelector('[data-kit="3"]');
            if (kit3Link) kit3Link.classList.add('size-active');
        }
    }

    smallImgs.forEach((img) => {
        img.addEventListener('click', function () {
            updateMainImageAndPrices(this);
        });
    });

    kitLinks.forEach((link) => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const kit = this.getAttribute('data-kit');

            smallImgs.forEach((img) => {
                if (img.classList.contains(`details__small-img-${kit}`)) {
                    updateMainImageAndPrices(img);
                }
            });

            kitLinks.forEach((link) => link.classList.remove('size-active'));
            this.classList.add('size-active');
        });
    });
}

imgGallery();

/*=============== SWIPER CATEGORIES ===============*/
var swiperCategories = new Swiper('.categories__container', {
    spaceBetween: 24,
    loop: true,

    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    breakpoints: {
        350: {
            slidesPerView: 2,
            spaceBetween: 24,
        },
        768: {
            slidesPerView: 3,
            spaceBetween: 24,
        },
        992: {
            slidesPerView: 4,
            spaceBetween: 24,
        },
        1200: {
            slidesPerView: 5,
            spaceBetween: 24,
        },
        1400: {
            slidesPerView: 6,
            spaceBetween: 24,
        },
    }
});

/*=============== SWIPER PRODUCTS ===============*/
var swiperProducts = new Swiper('.new__container', {
    spaceBetween: 24,
    loop: true,

    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    breakpoints: {
        768: {
            slidesPerView: 2,
            spaceBetween: 24,
        },
        992: {
            slidesPerView: 3,
            spaceBetween: 24,
        },
        1400: {
            slidesPerView: 4,
            spaceBetween: 24,
        },
    }
});

/*=============== PRODUCTS TABS ===============*/
const tabs = document.querySelectorAll('[data-target]');
const tabContents = document.querySelectorAll('[content]');

tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.target);
        tabContents.forEach((tabContent) => {
            tabContent.classList.remove('active-tab');
        });

        target.classList.add('active-tab');

        tabs.forEach((tab) => {
            tab.classList.remove('active-tab');
        });

        tab.classList.add('active-tab');
    });
});
