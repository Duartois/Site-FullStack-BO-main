const searchKey = decodeURI(location.pathname.split('/').pop());
getProducts(searchKey).then(data => {
    console.log('Fetched Data:', data); // Verificação de dados
    createProductCards(data, searchKey, '.search-listing');
    // Atualiza o título da pesquisa
document.getElementById('search-subtitle').textContent = `Resultados para "${searchKey}"`;
});

