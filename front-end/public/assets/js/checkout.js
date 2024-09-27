window.onload = () => {
    if (!sessionStorage.user) {
        location.replace('/login');
    }
}

const calculateShippingBtn = document.querySelector('#calculate-shipping');
const freteValor = document.querySelector('#frete-valor');

// Função para calcular frete como no iFood
const calcularFrete = (cepDestino) => {
    const precosFrete = {
        "01000-000": 600, // Exemplo de frete fixo para um CEP específico (em centavos)
        "02000-000": 800, // Você pode adicionar mais casos ou definir uma lógica
        default: 1000  // Frete padrão de R$10,00
    };

    return precosFrete[cepDestino] || precosFrete.default;
};

// Função para obter o endereço do formulário
const getAddress = () => {
    const address = document.querySelector('#address').value;
    const street = document.querySelector('#street').value;
    const city = document.querySelector('#city').value;
    const state = document.querySelector('#state').value;
    const pincode = document.querySelector('#pincode').value;

    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!address || !street || !city || !state || !pincode) {
        showFormError('Preencha todos os campos de endereço.');
        return null;
    }

    return { address, street, city, state, pincode };
};

// Atualiza o valor do frete na página
const storeAddress = "Rua Exemplo, Tatuapé, São Paulo"; // Endereço fixo da loja

const calcularFretePorDistancia = async (cepDestino) => {
    const cepFormatado = cepDestino.replace(/\D/g, ''); // Remove tudo que não é dígito

    const clienteEndereco = `${cepFormatado}, Brasil`;

    try {
        const response = await fetch('/calculate-distance', {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                origin: storeAddress,
                destination: clienteEndereco
            })
        });
        
        const data = await response.json();
        
        if (data.distance) {
            // Arredonda o valor do frete para garantir que seja um inteiro
            const valorFrete = Math.round(Math.max(1100, Math.min(5500, data.distance * 150))); // Aumentado em R$5 no mínimo e máximo
            return valorFrete;
        } else {
            console.error('Erro ao calcular distância:', data.error);
            return 1500; // Frete padrão em caso de erro, aumentado para R$15,00
        }
    } catch (error) {
        console.error('Erro ao calcular o frete:', error);
        return 1500; // Frete padrão em caso de erro, aumentado para R$15,00
    }
};


// Modifique a função updateFreteValue para usar a nova função de cálculo de frete
const updateFreteValue = async () => {
    const pincode = document.querySelector('#pincode').value;
    
    if (!pincode.length) {
        showFormError('Preencha todos os campos de endereço.');
        return;
    }

    const frete = await calcularFretePorDistancia(pincode);
    freteValor.textContent = `R$ ${(frete / 100).toFixed(2)}`;
};

// Evento para calcular e exibir o frete automaticamente
calculateShippingBtn.addEventListener('click', updateFreteValue);

// Adicionar o frete no checkout da Stripe
const placeOrderBtn = document.querySelector('.btn-checkout');

placeOrderBtn.addEventListener('click', async () => {
    let address = getAddress();
    if (!address) {
        return;  // Se o endereço não for válido, interrompe o processo de finalização
    }

    let cartItems = JSON.parse(localStorage.getItem('cartItems'));

    let items = cartItems.map(item => {
        let priceStr = item.price ? item.price.replace('R$', '').replace(',', '').trim() : '0';
        let priceInCents = parseInt(priceStr) * 100;
    
        if (isNaN(priceInCents)) {
            console.error('Preço inválido:', priceStr);
        }

        // Usando a propriedade productImg para pegar a URL da imagem
        let imageUrl = item.productImg && item.productImg.startsWith('http') ? item.productImg : null;

        // Log de depuração para verificar se a URL da imagem é válida
        console.log(`Item: ${item.title}, Imagem: ${imageUrl}`);

        let productData = {
            currency: 'brl',
            product_data: {
                name: item.title,
                // Adiciona a imagem se a URL estiver presente e for válida
                images: imageUrl ? [imageUrl] : [] // Corrigido para sempre passar um array
            },
            unit_amount: priceInCents
        };
    
        return {
            price_data: productData,
            quantity: parseInt(item.quantity)
        };
    });

    // Obter o valor do frete
    const frete = await calcularFretePorDistancia(address.pincode);

    // Adicionar o frete como um item no checkout
    items.push({
        price_data: {
            currency: 'brl',
            product_data: {
                name: "Frete",
                images: [] // Adicione a imagem do frete aqui se desejar
            },
            unit_amount: frete
        },
        quantity: 1
    });

    try {
        const response = await fetch('/stripe-checkout', {
            method: 'post',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                items: items,
                address: address,
                email: JSON.parse(sessionStorage.user).email
            })
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            console.error('Erro ao obter a URL de checkout:', data.error);
        }
    } catch (error) {
        console.error('Erro ao enviar dados para o backend:', error);
    }
});




