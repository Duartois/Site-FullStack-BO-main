const createProduct = (data) => {
    let productContainer = document.querySelector('.product-container');
    let badge = '';

    const createdAt = new Date(data.createdAt); // Assumindo que você tenha a data de criação armazenada
    const today = new Date();
    const diffTime = Math.abs(today - createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Diferença em dias

    // Verifica se o produto é novo (nos últimos 30 dias)
    if (diffDays <= 30) {
        badge = '<div class="product__badge light-pink">Novo</div>';
    } 
    // Verifica se o produto é destaque (se não é "Novo" e tem um desconto acima de 10% ou pertence a categorias específicas)
    else if (!badge && (Number(data.savePrice) >= 50 || ['Eletrônicos', 'Moda'].includes(data.category))) {
        badge = '<div class="product__badge light-blue">Destaque</div>';
    } 
    // Verifica se o produto é popular (se não é "Novo" ou "Destaque" e atende ao critério de popularidade)
    else if (!badge && data.salesCount > 10) {
        badge = '<div class="product__badge light-green">Popular</div>';
    }

    productContainer.innerHTML += `
    <div class="product__item swiper-slide">
        <div class="product__banner">
            <a class="product__images">
                <img
                    src="${data.image}"
                    alt=""
                    class="product__img default"
                />

                <img
                    src="${data.image}"
                    alt=""
                    class="product__img hover"
                /> 
            </a>

            <div class="product__actions">
                <a class="action__btn open-btn" onclick="location.href = '/products/${data.id}'" aria-label="Abrir">
                    <i class="fi fi-rs-share"></i>
                </a>

                <a class="action__btn edit-btn" onclick="location.href = '/add-product/${data.id}'" aria-label="Editar">
                    <i class="fi fi-rs-pencil"></i>
                </a>

                <a class="action__btn delete-btn" onclick="deleteItem('${data.id}')" aria-label="Deletar">
                    <i class="fi fi-rs-trash"></i>
                </a>
            </div>

            ${badge} <!-- Inserir o badge correto aqui -->
        </div>

        <div class="product__content">
            <span class="product__category">${data.tags}</span>
            <a href="details-1.html">
                <h3 class="product__title">${data.name}</h3>
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
                <span class="new__price">R$${data.price}</span>
                <span class="old__price">R$${data.oldPrice}</span>
            </div>
        </div>
    </div>
    `;
}
const deleteItem = (id) => {
    fetch('/delete-product', {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({id: id})
    }).then(res => res.json())
    .then(data => {
        // process data
        if(data == 'success'){
            location.reload();
        } else{
            showAlert('some error occured');
        }
    })
}
