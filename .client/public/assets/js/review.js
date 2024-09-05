let ratingStarInput = [...document.querySelectorAll('.rating-star')];
let rate = 0;

ratingStarInput.map((star, index) => {
    star.addEventListener('click', () => {
        rate = `${index + 1}.0`;
        for(let i = 0; i < 5; i++){
            if(i <= index){
                ratingStarInput[i].src = `../assets/img/bxs-star.svg`;
            } else{
                ratingStarInput[i].src = `../assets/img/bx-star.svg`;
            }
        }
    });
});

// Adicionar revisão
let reviewHeadline = document.querySelector('.review-headline');
let review = document.querySelector('.review-field');
let loader = document.querySelector('.loader');
let addReviewBtn = document.querySelector('.add-review-btn');

addReviewBtn.addEventListener('click', () => {
    // Validação do formulário
    if (!user || !user.email) { 
        const currentUrl = encodeURIComponent(location.pathname);
        console.log('User not logged in, redirecting to login with current URL:', currentUrl);
        sessionStorage.setItem('redirectAfterLogin', currentUrl);
        location.href = `/login?after_page=${currentUrl}`;
    } else {
        if (!reviewHeadline.value.length || !review.value.length || rate == 0) {
            showFormError('Preencha todos os campos');
        } else if (reviewHeadline.value.length > 50) { // Supondo um limite de 50 caracteres para o título
            showFormError('O título deve ter no máximo 50 caracteres');
        } else if (review.value.length < 30) {
            showFormError('O comentário precisa ter pelo menos 30 caracteres');
        } else {
            // Enviar dados para o backend
            loader.style.display = "block";
            
            // Recuperar productId do sessionStorage
            const productId = sessionStorage.getItem('currentProductId');
            console.log('Sending review with productId:', productId);

            sendData('/add-review', {
                headline: reviewHeadline.value,
                review: review.value,
                rate: rate,
                email: user.email,
                product: productId
            });
        }
    }
});

// Buscar revisões
const getReviews = () => {
    if(user == null){
        user = {
            email: undefined
        };
    }

    const productId = sessionStorage.getItem('currentProductId'); // Recuperar productId

    fetch('/get-reviews', {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({
            email: user.email,
            product: productId
        })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if(data.length){
            createReviewSection(data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showFormError('Erro ao buscar reviews, por favor tente novamente mais tarde.');
    });
}

const createReviewSection = (data) => {
    let section = document.querySelector('.review-section');
    section.innerHTML = ''; // Limpar a seção antes de adicionar novos reviews
    section.innerHTML += `
        <h1 class="section-title">Reviews</h1>
        <div class="review-container">
            ${createReviewCard(data)}
        </div>
    `;
}

const createReviewCard = data => {
    let cards = '';
    for(let i = 0; i < data.length; i++){
        if(data[i]){
            cards += `
            <div class="review-card">
                <div class="user-dp" data-rating="${data[i].rate}"><img src="../assets/img/user-icon.png" alt=""></div>
                <h2 class="review-title">${data[i].headline}</h2>
                <p class="review">${data[i].review}</p>
            </div>
            `;
        }
    }
    return cards;
}

getReviews();
