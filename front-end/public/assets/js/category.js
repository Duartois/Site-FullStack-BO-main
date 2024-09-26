document.getElementById('search-btn').addEventListener('click', function () {
    const searchKey = document.getElementById('search-input').value.trim();

    if (searchKey) {
        // Exibe o loader enquanto busca os produtos
        document.querySelector('.loader').style.display = 'block';

        // Atualiza o título da pesquisa
        document.getElementById('search-subtitle').textContent = `Resultados para "${searchKey}"`;

        // Busca produtos relacionados à tag usando a função getProducts
        getProducts(searchKey).then(products => {
            // Esconde o loader após receber os produtos
            document.querySelector('.loader').style.display = 'none';

            const productList = document.getElementById('product-list');
            productList.innerHTML = ''; // Limpa a lista de produtos

            if (products.length > 0) {
                // Cria os cartões de produto usando a função createCards do home.js
                const productCardsHTML = createCards(products);
                productList.innerHTML = productCardsHTML;
            } else {
                productList.innerHTML = '<p>Nenhum produto encontrado para a pesquisa.</p>';
            }
        }).catch(error => {
            console.error('Erro ao buscar produtos:', error);
            document.querySelector('.loader').style.display = 'none';
            document.getElementById('product-list').innerHTML = '<p>Erro ao buscar produtos. Tente novamente mais tarde.</p>';
        });
    }
});
