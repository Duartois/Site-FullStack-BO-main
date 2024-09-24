const createMainPageProductCard = (product) => {
    let badge = '';

    // Assumindo que você tenha a data de criação armazenada
    const createdAt = new Date(product.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Verifica se o produto é novo (nos últimos 30 dias)
    if (diffDays <= 30) {
        badge = '<div class="product__badge light-pink">Novo</div>';
    } 
    // Verifica se o produto é destaque
    else if (!badge && (Number(product.savePrice) >= 50 || ['Eletrônicos', 'Moda'].includes(product.category))) {
        badge = '<div class="product__badge light-blue">Destaque</div>';
    } 
    // Verifica se o produto é popular
    else if (!badge && product.salesCount > 10) {
        badge = '<div class="product__badge light-green">Popular</div>';
    }

    return `
        <div class="product__item swiper-slide">
            <div class="product__banner">
                <a class="product__images" href="/products/${product.id}">
                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        class="product__img default"
                    />
                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        class="product__img hover"
                    /> 
                </a>
                ${badge}
            </div>

            <div class="product__content">
                <span class="product__category">${product.tags}</span>
                <a href="/products/${product.id}">
                    <h3 class="product__title">${product.name}</h3>
                </a>
                <div class="product__rating">
                    <i class="fi fi-rs-star"></i>
                    <i class="fi fi-rs-star"></i>
                    <i class="fi fi-rs-star"></i>
                    <i class="fi fi-rs-star"></i>
                    <i class="fi fi-rs-star"></i>
                    <i class="fi fi-rs-star"></i>
                </div>
                <div class="product__price flex">
                    <span class="new__price">R$${product.price}</span>
                    <span class="old__price">R$${product.oldPrice}</span>
                </div>
                 <a
                    class="add-cart action__btn cart__btn"
                    aria-label="Adicionar ao carrinho"
                    data-id="${product.id}"
                    onclick="addCartClicked(event)"
                  >
                    <i class="fi fi-rs-shopping-bag-add"></i>
                  </a>
            </div>
        </div>
    `;
};
const fetchProductsByBadge = async (badge) => {
    try {
        const response = await fetch('/get-products', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ badge })
        });

        const contentType = response.headers.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Expected JSON, but got ${text}`);
        }

        const products = await response.json();
        console.log(`Produtos para ${badge}:`, products);
        return products;
    } catch (error) {
        console.error(`Erro ao buscar produtos com o badge ${badge}:`, error);
        return [];
    }
};

const updateTabContent = async (badge) => {
    const mainFeaturedContainer = document.getElementById('featured-products');
    const mainPopularContainer = document.getElementById('popular-products');
    const mainNewContainer = document.getElementById('new-products');

    // Verifica se os containers existem
    if (!mainFeaturedContainer || !mainPopularContainer || !mainNewContainer) {
        console.error('Um ou mais containers não foram encontrados.');
        return;
    }

    // Limpar os containers
    mainFeaturedContainer.innerHTML = '';
    mainPopularContainer.innerHTML = '';
    mainNewContainer.innerHTML = '';

    // Buscar produtos por badge
    const [featuredProducts, popularProducts, newProducts] = await Promise.all([
        fetchProductsByBadge('featured'),
        fetchProductsByBadge('popular'),
        fetchProductsByBadge('new')
    ]);

    // Função para adicionar produtos a um container
    const addProductsToContainer = (container, products, message) => {
        if (products.length > 0) {
            container.innerHTML = products.map(createMainPageProductCard).join('');
        } else {
            container.innerHTML = `<p>${message}</p>`;
        }
    };

    // Atualiza o conteúdo do container com base no badge selecionado
    switch (badge) {
        case 'featured':
            addProductsToContainer(mainFeaturedContainer, featuredProducts, 'Sem produtos em destaque disponíveis');
            break;
        case 'popular':
            addProductsToContainer(mainPopularContainer, popularProducts, 'Sem produtos populares disponíveis');
            break;
        case 'new':
            addProductsToContainer(mainNewContainer, newProducts, 'Sem produtos novos disponíveis');
            break;
        default:
            console.error(`Badge desconhecido: ${badge}`);
    }
};

// Adiciona event listeners para as abas
document.querySelectorAll('.tab__btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove a classe active de todas as abas
        document.querySelectorAll('.tab__btn').forEach(tab => tab.classList.remove('active-tab'));
        document.querySelectorAll('.tab__item').forEach(item => item.classList.remove('active-tab'));

        // Adiciona a classe active à aba clicada
        this.classList.add('active-tab');
        document.querySelector(this.dataset.target).classList.add('active-tab');

        // Atualiza o conteúdo da aba ativa
        const badge = this.dataset.target.substring(1); // Remove o prefixo '#'
        updateTabContent(badge);
    });
});

// Inicializa a aba ativa
document.querySelector('.tab__btn.active-tab').click(); // Simula um clique na aba ativa para carregar os produtos

const createShowcaseProductCard = (product) => {
    return `
        <div class="showcase__item">
            <a href="/products/${product.id}" class="showcase__img-box">
                <img src="${product.image}" alt="${product.name}" class="showcase__img"/>
            </a>
            <div class="showcase__content">
                <a href="/products/${product.id}">
                    <h4 class="showcase__title">${product.name}</h4>
                </a>
                <div class="showcase__price flex">
                    <span class="new__price">R$${product.price}</span>
                    <span class="old__price">R$${product.oldPrice}</span>
                </div>
            </div>
        </div>
    `;
};

const loadShowcaseProducts = async () => {
    try {
        const [newProducts, featuredProducts, popularProducts] = await Promise.all([
            fetchProductsByBadge('new'),
            fetchProductsByBadge('featured'),
            fetchProductsByBadge('popular')
        ]);

        const newShowcaseContainer = document.getElementById('new-showcase');
        const featuredShowcaseContainer = document.getElementById('featured-showcase');
        const popularShowcaseContainer = document.getElementById('popular-showcase');

        // Ordena e exibe produtos novos: o primeiro deve ser o mais recente
        const sortedNewProducts = newProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
        if (sortedNewProducts.length > 0) {
            newShowcaseContainer.innerHTML = sortedNewProducts.map(createShowcaseProductCard).join('');
        } else {
            newShowcaseContainer.innerHTML = '<p>Sem produtos novos disponíveis</p>';
        }

        // Ordena e exibe produtos em destaque: o primeiro deve ter o maior desconto
        const sortedFeaturedProducts = featuredProducts.sort((a, b) => b.savePrice - a.savePrice).slice(0, 3);
        if (sortedFeaturedProducts.length > 0) {
            featuredShowcaseContainer.innerHTML = sortedFeaturedProducts.map(createShowcaseProductCard).join('');
        } else {
            featuredShowcaseContainer.innerHTML = '<p>Sem produtos em destaque disponíveis</p>';
        }

        // Ordena e exibe produtos populares: o terceiro deve ter o maior número de vendas
        const sortedPopularProducts = popularProducts.sort((a, b) => b.salesCount - a.salesCount).slice(0, 3);
        if (sortedPopularProducts.length > 0) {
            popularShowcaseContainer.innerHTML = sortedPopularProducts.map(createShowcaseProductCard).join('');
        } else {
            popularShowcaseContainer.innerHTML = '<p>Sem produtos populares disponíveis</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar os produtos da showcase:', error);
    }
};

// Chama a função para carregar os produtos na showcase quando a página for carregada
document.addEventListener('DOMContentLoaded', loadShowcaseProducts);
