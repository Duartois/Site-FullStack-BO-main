// Configuração da página do produto
const productImage = document.querySelector('.product__img');
const productName = document.querySelector('.details__title');
const shortDes = document.querySelector('.short__description');
const price = document.querySelector('.new__price');
const oldPrice = document.querySelector('.old__price');
const savePrice = document.querySelector('.save__price');
const detail = document.querySelector('.des');
const title = document.querySelector('.title');
const tags = document.querySelector('.details__meta');

let cartBtn = document.querySelector('.cart__btn', 'btn-sm');

const setData = (data) => {
    if (productImage) productImage.src = data.image;
    if (productName) productName.innerHTML = data.name;
    if (title) title.innerHTML = data.name;
    if (shortDes) shortDes.innerHTML = data.shortDes;
    if (detail) detail.innerHTML = data.detail;
    if (price) price.innerHTML = `R$${data.price}`;
    if (oldPrice) oldPrice.innerHTML = `R$${data.oldPrice}`;
    if (savePrice) savePrice.innerHTML = `%${data.savePrice} off`;
    if (tags) tags.innerHTML = data.tags;

    // Armazene productId no próprio objeto de dados para facilitar o acesso
    data.productId = sessionStorage.getItem('currentProductId');

    cartBtn.addEventListener('click', () => {
        console.log('Adding to cart:', data);
        
        // Verifica se o produto já está no carrinho
        if (isProductInCart(data.productId)) {
            alert("Você já adicionou esse item ao carrinho");
        } else {
            const message = addProductToCart(data); // Chama a função addProductToCart definida em home.js
        }
    });
};

// product.js

const fetchProductData = (productId) => {
    fetch('/get-products', {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({ id: productId })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.text();
    })
    .then(text => {
        if (!text) {
            throw new Error('Empty response from server');
        }
        try {
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
                if (data.length === 0) {
                    throw new Error('No products found');
                }
                const product = data[0];
                setData(product);
                if (product.tags && product.tags.length > 0) {
                    getProducts(product.tags[0])
                    .then(res => {
                        // Filtrar o produto atual dos produtos similares
                        const similarProducts = res.filter(item => item.id !== productId);
                        createProductCards(similarProducts, 'similar products', '.products-container');
                    })
                    .catch(err => {
                        console.error('Error fetching similar products:', err);
                    });
                }
            } else {
                setData(data);
                if (data.tags && data.tags.length > 0) {
                    getProducts(data.tags[0])
                    .then(res => {
                        // Filtrar o produto atual dos produtos similares
                        const similarProducts = res.filter(item => item.id !== productId);
                        createProductCards(similarProducts, 'similar products', '.products-container');
                    })
                    .catch(err => {
                        console.error('Error fetching similar products:', err);
                    });
                }
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    })
    .catch(err => {
        console.error('Error fetching product data:', err);
    });
};

// Verifique se a página não é a página de adicionar produto
if (location.pathname !== '/add-product') {
    const pathParts = location.pathname.split('/');
    const productId = decodeURIComponent(pathParts[pathParts.length - 1]);
    console.log('Extracted productId:', productId);
    
    // Armazene productId no sessionStorage
    sessionStorage.setItem('currentProductId', productId);
    
    fetchProductData(productId);
}
