const sendData = (path, data) => {
    fetch(path, {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => processData(data))
    .catch(error => {
        console.error('Error fetching data:', error);
        showFormError('Error fetching data. Please try again later.');
    });
}

const processData = (data) => {
    loader.style.display = 'none'; // Esconder o loader após o processamento

    if (!data) {
        console.error('Empty response from server');
        showFormError('Empty response from server');
        return;
    }

    if (data.alert) {
        showFormError(data.alert);
    } else if (data.success === 'Review added successfully') {
        console.log('Review added successfully');
        // Atualize a lista de avaliações ou recarregue a página para mostrar a nova avaliação
        location.reload();
    } else if (data.email) {
        sessionStorage.user = JSON.stringify(data);
        const afterPage = new URLSearchParams(window.location.search).get('after_page');
        if (afterPage) {
            location.replace(decodeURIComponent(afterPage));
        } else {
            location.replace('/');
        }
    } else if (data.seller) {
        let user = JSON.parse(sessionStorage.user || '{}');
        user.seller = true;
        sessionStorage.user = JSON.stringify(user);
        location.replace('/dashboard');
    } else if (data.product) {
        location.replace('/dashboard');
    } else if (data === 'review') {
        location.reload();
    }
}



const showFormError = (err) => {
    let errorEle = document.querySelector('.error');
    errorEle.innerHTML = err;
    errorEle.classList.add('show');

    setTimeout(() => {
        errorEle.classList.remove('show');
    }, 2000);
}
