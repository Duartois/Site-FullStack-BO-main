let user = JSON.parse(sessionStorage.user || null);

window.onload = () => {
    if(user == null){
        location.replace('/login');
    }
}

let editables = [...document.querySelectorAll('*[contenteditable="true"]')];

editables.map((element) => {
    let placeholder = element.getAttribute('data-placeholder');
    element.innerHTML = placeholder;
    element.addEventListener('focus', () => {
        if(element.innerHTML === placeholder){
            element.innerHTML = '';
        }
    })
    element.addEventListener('focusout', () => {
        if(!element.innerHTML.length){
            element.innerHTML = placeholder;
        }
    })
});

document.addEventListener('DOMContentLoaded', () => {
    let uploadInputs = document.querySelectorAll('input[type="file"]');
    uploadInputs.forEach((uploadInput, index) => {
        uploadInput.addEventListener('change', () => {
            const file = uploadInput.files[0];
    
            if (!file) {
                console.error('Nenhum arquivo selecionado');
                return;
            }
    
            if (file.type.includes('image')) {
                console.log(`Arquivo selecionado: ${file.name}`);
                console.log('Arquivo é uma imagem, obtendo URL do S3');
    
                fetch('/s3url').then(res => res.json())
                .then(url => {
                    console.log(`URL do S3 obtida: ${url}`);
                    fetch(url, {
                        method: 'PUT',
                        headers: new Headers({'Content-Type': 'image/jpeg'}),
                        body: file
                    }).then(res => {
                        imagePath = url.split("?")[0];
                        console.log(`Imagem carregada para: ${imagePath}`);
    
                        let productImage;
                        if (index === 0) {
                            productImage = document.querySelector('.product__img');
                        } else if (index === 1) {
                            productImage = document.querySelector('.small__product__img img');
                        } else if (index === 2) {
                            productImage = document.querySelector('.small__product__img-2 img');
                        } else if (index === 3) {
                            productImage = document.querySelector('.small__product__img-3 img');
                        }
    
                        if (productImage) {
                            console.log(`Elemento imagem antes da atualização: ${productImage.src}`);
                            productImage.src = imagePath;
                            console.log(`Elemento imagem após a atualização: ${productImage.src}`);
                        } else {
                            console.error('Elemento imagem não encontrado');
                        }
                    });
                });
            } else {
                console.error('O arquivo selecionado não é uma imagem');
            }
        });
    });    
});

let addProductBtn = document.querySelector('.add-product-btn');
let loader = document.querySelector('.loader');

let productName = document.querySelector('.details__title');
let category = document.querySelector('.details__category');
let shortDes = document.querySelector('.short__description');
let price = document.querySelector('.new__price'); // Atualizado para selecionar o elemento de preço
let oldPrice = document.querySelector('.old__price'); // Seleciona o preço antigo
let savePrice = document.querySelector('.save__price'); // Seleciona o desconto
let detail = document.querySelector('.des');
let tags = document.querySelector('.details__meta');

addProductBtn.addEventListener('click', () => {
    // Verificação
    if (productName.innerText == productName.getAttribute('data-placeholder')) {
        showFormError('Precisa adicionar um nome ao produto');
    } else if (price.innerText == price.getAttribute('data-placeholder') || isNaN(Number(price.innerText))) {
        showFormError('Adicione um preço válido');
    } else if (oldPrice.innerText == oldPrice.getAttribute('data-placeholder') || isNaN(Number(oldPrice.innerText))) {
        showFormError('Adicione um valor antigo válido');
    } else if (savePrice.innerText == savePrice.getAttribute('data-placeholder') || isNaN(Number(savePrice.innerText))) {
        showFormError('Adicione um desconto');
    }else if (category.innerText == category.getAttribute('data-placeholder')) {
        showFormError('Precisa adiciona-lo a uma categoria');
    }else if (shortDes.innerText == shortDes.getAttribute('data-placeholder')) {
        showFormError('Precisa adicionar uma curta descrição');
    } else if (tags.innerText == tags.getAttribute('data-placeholder')) {
        showFormError('Adicione uma tag');
    } else if (detail.innerText == detail.getAttribute('data-placeholder')) {
        showFormError('Precisa adicionar uma descrição');
    } else {
        // Enviar dados para o servidor
        loader.style.display = 'block';
        let data = productData();
        if(productId){
            data.id = productId
        }
        sendData('/add-product', data);
    }
});
// Função para gerar tags com variações (singular e plural)
const generateTagVariations = (tag) => {
    const singular = tag.trim().toLowerCase();
    const plural = pluralize(singular); // Utilize a função de pluralização fornecida anteriormente
    return [singular, plural];
};

// Função de pluralização para palavras em português
const pluralize = (word) => {
    if (word.endsWith('r') || word.endsWith('z')) {
        return word + 'es';
    } else if (word.endsWith('m')) {
        return word.slice(0, -1) + 'ns';
    } else if (word.endsWith('ão')) {
        return word.slice(0, -2) + 'ões';
    } else if (word.endsWith('s')) {
        return word;
    } else if (word.endsWith('l')) {
        return word.slice(0, -1) + 'is';
    } else if (word.endsWith('il')) {
        return word.slice(0, -2) + 'is';
    } else {
        return word + 's';
    }
};

// Função para verificar se o produto é novo
const isNewProduct = (createdDate) => {
    const currentDate = new Date();
    const productDate = new Date(createdDate);
    const daysDifference = Math.floor((currentDate - productDate) / (1000 * 60 * 60 * 24));
    return daysDifference <= 30; // Considera "novo" se o produto foi criado nos últimos 30 dias
};

const isFeaturedProduct = (product) => {
    const discountThreshold = 50; // Exemplo: Desconto acima de 50% marca como destaque
    const featuredCategories = ['Eletrônicos', 'Moda']; // Exemplo: Categorias específicas que são destaque

    return (Number(product.savePrice) >= discountThreshold) || 
           (featuredCategories.includes(product.category));
};

const isPopularProduct = (salesCount) => {
    const popularThreshold = 10; // Exemplo: Produtos com mais de 10 vendas são populares
    return salesCount > popularThreshold;
};


// Função para processar os dados do produto
const productData = () => {
    let tagsArr = tags.innerText.split(",").map(tag => tag.trim()).filter(tag => tag !== '');
    let tagsWithVariations = [];

    tagsArr.forEach(tag => {
        tagsWithVariations.push(...generateTagVariations(tag));
    });

    // Exemplo de data de criação (você precisaria ter essa informação)
    const productCreationDate = new Date(); // Data atual para fins de exemplo

    // Calcular badges
    const isNew = isNewProduct(productCreationDate);
    const isFeatured = isFeaturedProduct({
        savePrice: savePrice.innerText,
        category: category.innerText
    });
    const isPopular = isPopularProduct(10); // Substitua 10 com a quantidade de vendas se disponível

    console.log('Is New:', isNew);
    console.log('Is Featured:', isFeatured);
    console.log('Is Popular:', isPopular);

    return {
        name: productName.innerText,
        shortDes: shortDes.innerText,
        category: category.innerText,
        price: price.innerText,
        oldPrice: oldPrice.innerText,
        savePrice: savePrice.innerText,
        detail: detail.innerText,
        tags: Array.from(new Set(tagsWithVariations)), // Remove duplicatas
        image: window.imagePath,
        email: JSON.parse(sessionStorage.user).email,
        draft: false,
        createdAt: productCreationDate, // Adiciona a data de criação
        badges: {
            new: isNew,
            featured: isFeatured,
            popular: isPopular
        }
    };
};



const fetchProductData = () => {
    addProductBtn.innerHTML = 'save product';
    fetch('/get-products', {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({id: productId})
    }).then(res => res.json())
    .then(data => {
       setFormData(data);
    })
    .catch(err => console.log(err))
}


const setFormData = (data) => {
    productName.innerHTML = data.name;
    price.innerHTML = data.price;
    oldPrice.innerHTML = data.oldPrice;
    savePrice.innerHTML = data.savePrice;
    shortDes.innerHTML = data.shortDes;
    category.innerHTML = data.category;
    tags.innerHTML = data.tags;
    detail.innerHTML = data.detail;

    let productImg = document.querySelector('.product__img');
    productImg.src = imagePath = data.image;

   
}



// Botão de rascunho
let draftBtn = document.querySelector('.draft-btn');

draftBtn.addEventListener('click', () => {
    if (!productName.innerHTML.length || productName.innerHTML == productName.getAttribute('data-placeholder')) {
        showFormError('Adicione um nome ao produto');
    } else { // don't validate the form
        let data = productData();
        loader.style.display = 'block';
        data.draft = true;
        if (productId) {
            data.id = productId;
        }
        sendData('/add-product', data);
    }
})

// Página de edição
let productId = null;
if (location.pathname !== '/add-product') {
    productId = decodeURI(location.pathname.split('/').pop());
    fetchProductData();
}
