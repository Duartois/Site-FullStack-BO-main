document.addEventListener('DOMContentLoaded', () => {
    // Verifica se estamos na página do carrinho
    if (window.location.pathname.includes('/cart')) {
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            // Desativa o evento de clique no ícone do carrinho
            cartIcon.style.pointerEvents = 'none';
            cartIcon.style.opacity = '0'; // Opcional: Altera a opacidade para indicar que está desativado
        }
    }
});

// Função para criar uma linha de produto na tabela do carrinho
const createCartRow = (product) => {
    return `
        <tr>
            <td><img src="${product.productImg}" alt="" class="table__img" /></td>
            <td>
                <h3 class="table__title">${product.title}</h3>
                <p class="table__description">${product.description || 'Descrição não disponível'}</p>
            </td>
            <td><span class="table__price">${product.price}</span></td>
            <td>
                <input type="number" class="table__quantity" data-id="${product.id}" value="${product.quantity || 1}" min="1">
            </td>
            <td><i class="fi fi-rs-trash table__trash" data-id="${product.id}"></i></td>
        </tr>
    `;
};

// Função para carregar produtos do carrinho
const loadCartPageItems = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const tableBody = document.querySelector('.table tbody');

    // Limpa o conteúdo da tabela
    tableBody.innerHTML = '';

    // Adiciona cada item do carrinho à tabela
    cartItems.forEach(item => {
        console.log(`Carregando item: ${item.title}, Imagem: ${item.productImg}`); // Log de depuração
        const row = createCartRow(item);
        tableBody.innerHTML += row;
    });

    // Adiciona eventos de clique aos ícones de remoção
    document.querySelectorAll('.table__trash').forEach(icon => {
        icon.addEventListener('click', removeCartItemFromTable);
    });

    // Adiciona eventos de mudança na quantidade
    document.querySelectorAll('.table__quantity').forEach(input => {
        input.addEventListener('change', updateQuantity);
    });

    // Atualiza o total do carrinho
    updateCartPageTotal();
};

// Função para atualizar a quantidade no localStorage e recalcular o total
const updateQuantity = (event) => {
    const productId = event.target.getAttribute('data-id');
    const newQuantity = parseInt(event.target.value);
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    // Atualiza a quantidade do item no localStorage
    cartItems = cartItems.map(item => {
        if (item.id === productId) {
            item.quantity = newQuantity;
        }
        return item;
    });

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartPageTotal(); // Atualiza o total após alterar a quantidade
};

// Função para remover um item da tabela do carrinho
const removeCartItemFromTable = (event) => {
    const productId = event.target.getAttribute('data-id');
    if (productId) {
        // Remove o item da tabela
        event.target.closest('tr').remove();
        // Remove o item do localStorage
        removeProductFromCart(productId);
        // Atualiza o total do carrinho
        updateCartPageTotal();
    }
};

// Função para remover um produto do localStorage
const removeProductFromCart = (productId) => {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    cartItems = cartItems.filter(item => item.id !== productId);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
};

// Função para calcular e atualizar o total do carrinho
const updateCartPageTotal = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    let total = 0;

    // Soma os preços dos produtos multiplicando pela quantidade
    cartItems.forEach(item => {
        const price = parseFloat(item.price.replace('R$', '').replace(',', '.')); // Remove o 'R$' e converte para número
        const quantity = parseInt(item.quantity); // Converte a quantidade para número inteiro
        if (!isNaN(price) && !isNaN(quantity)) {
            total += price * quantity;
        } else {
            console.error(`Preço ou quantidade inválidos para o item: ${item.title}`);
        }
    });
    
    // Atualiza o valor total na página
    const totalElement = document.querySelector('.total-price');
    if (totalElement) {
        totalElement.textContent = `R$${total.toFixed(2).replace('.', ',')}`;
    } else {
        console.error("Elemento '.total-price' não encontrado!");
    }
};

// Executar ao carregar o documento
document.addEventListener('DOMContentLoaded', () => {
    loadCartPageItems();

    // Evento para finalizar a compra
    document.querySelector('.btn-checkout').addEventListener('click', () => {
        window.location.href = '/checkout';
    });
});
