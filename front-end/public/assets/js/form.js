window.onload = () => {
    if (sessionStorage.user) {
        console.log("Usuário encontrado na sessão");
        user = JSON.parse(sessionStorage.user);
        if (user.email) {
            console.log("Redirecionando para a página inicial");
            location.replace('/');
        }
    }
}

// form
let formBtn = document.querySelector('.submit-btn');
let loader = document.querySelector('.loader');

formBtn.addEventListener('click', () => {
    let fullname = document.querySelector('#name') || null;
    let email = document.querySelector('#email');
    let password = document.querySelector('#password');
    let number = document.querySelector('#number') || null;
    let tac = document.querySelector('#tc') || null;

    if(fullname != null){// signup page
        // Validação do formulário
    if (fullname.value.length < 3) {
        showFormError('O nome precisa de pelo menos 3 letras.');
    } else if (!email.value.length) {
        showFormError('Não está faltando nada não?');
    } else if (password.value.length < 8) {
        showFormError('A senha precisa de pelo menos 8 letras.');
    } else if (isNaN(number.value) || number.value.length < 10) {
        showFormError('Número inválido. Digite um número válido.');
    } else if (!tac.checked) {
        showFormError('Você precisa concordar com os termos de uso.');
    } else {
        // Enviar formulário
        loader.style.display = 'block';
        sendData('/signup', {
            name: fullname.value,
            email: email.value,
            password: password.value,
            number: number.value,
            tac: tac.checked
        })
    }
   } else {// login page
        if(!email.value.length || !password.value.length){
            showFormError('Preencha todos os campos.')
        } else {
             loader.style.display = 'block';
              sendData('/login', {
              email: email.value,
              password: password.value
        })
      }
   }
})