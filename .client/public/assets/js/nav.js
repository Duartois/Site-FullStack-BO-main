// navbar

const navbar = document.getElementById('navbar')
window.addEventListener('scroll', () => {
    
    if(scrollY >= 60){
        navbar.classList.add('bg');
    } else {
        navbar.classList.remove('bg');
    }
})

const createNavbar = () => {
    let navbar = document.querySelector('.navbar');

    navbar.innerHTML += ` <nav class="nav container" id="navbar">
    <a href="/" class="nav__logo">
      <img src="assets/img/logo.svg" alt="" class="nav__logo-img" />
    </a>

    <div class="nav__menu" id="nav-menu">
      <div class="nav__menu-top">
        <a href="/" class="nav__menu-logo">
          <img src="assets/img/logo.svg" alt="" />
        </a>

        <div class="nav__close" id="nav-close">
          <i class="fi fi-rs-cross-small"></i>
        </div>
      </div>
      <ul class="nav__list">
        <li class="nav__item">
          <a href="/" class="nav__link active-link">Inicio</a>
        </li>

        <li class="nav__item">
          <a href="/category" class="nav__link">Catálogo</a>
        </li>

        <li class="nav__item">
          <a href="/dashboard" class="nav__link">Minha Conta</a>
        </li>

        <li class="nav__item">
          <a href="/login" class="nav__link">Login</a>
        </li>
      </ul>

      <div class="header__search">
        <input
          type="text"
          placeholder="Buscar item..."
          class="form__input"
        />

        <button class="search__btn">
          <img src="assets/img/search.png" alt="" />
        </button>
      </div>
    </div>

    <div class="header__user-actions">
      <a href="" class="header__action-btn">
        <img src="assets/img/person-circle-outline.svg" id ="user-icon" alt="" />
        <div class="user-icon-popup">
          <p>Entre ou cadastre-se</p>
          <s> Entrar</s>
        </div>
        
      </a>

      <!--============ CART =============-->
      <a class="header__action-btn" id="cart-icon" data-quantity="0">
        <img src="assets/img/icon-cart.svg"alt="" />
      </a>
      <div class="cart">
        <h2 class="cart-title">Seu Carrinho</h2>
        <!--content-->
        <div class="cart-content"></div>
        <!--price-->
        <div class="total">
          <div class="total-title">Total</div>
          <div class="total-price">R$0</div>
        </div>
        <!-- buy button -->
        <button type="button" class="btn-buy">Finalizar Pedido</button>
        <!-- Close Cart -->
        <i class="fi fi-rs-cross-small" id="close-cart"></i>
      </div>
      <div class="header__action-btn nav__toggle" id="nav-toggle">
        <img src="assets/img/menu-burger.svg" alt="" />
      </div>
    </div>
  </nav>`
}


let userIcon = document.querySelector('#user-icon');
let userPopupIcon = document.querySelector('.user-icon-popup');

userIcon.addEventListener('click', (event) => {
    event.preventDefault();  // Previna a recarga da página
    userPopupIcon.classList.toggle('active');
    console.log('User icon clicked, toggling popup');
});

let text = userPopupIcon.querySelector('p');
let actionBtn = userPopupIcon.querySelector('s');  // Suponha que o botão tenha a classe 'action-btn'
let user = JSON.parse(sessionStorage.getItem('user') || 'null');

if (user != null) { // user is logged in
    text.innerHTML = `bem vindo(a) ${user.name}`;
    actionBtn.innerHTML = 'sair';
    actionBtn.addEventListener('click', () => {
        console.log('Logout button clicked');
        logout();
    });
} else {
    text.innerHTML = 'entrar na sua conta';
    actionBtn.innerHTML = 'entrar';
    actionBtn.addEventListener('click', (event) => {
        console.log('Login button clicked');
        event.preventDefault();
        location.href = '/login';
    });
}

const logout = () => {
    console.log('Logging out');
    sessionStorage.clear();
    location.reload();
};

let searchBtn = document.querySelector('.search__btn')
let searchBox = document.querySelector('.form__input')

searchBtn.addEventListener('click', () => {
    if(searchBox.value.length){
        location.href = `/search/${searchBox.value}`;
    }
})
