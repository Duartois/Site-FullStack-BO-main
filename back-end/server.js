import express from "express";
import bcrypt from 'bcryptjs';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, setDoc, getDoc, updateDoc, getDocs, query, where, deleteDoc, limit } from "firebase/firestore";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";
import Stripe from 'stripe';
import correios from 'correios-brasil';
import { Client } from "@googlemaps/google-maps-services-js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA-mVyy_yJsJx7TgKAoLb8KADo6583FxI4",
  authDomain: "site-fullstack-bo.firebaseapp.com",
  projectId: "site-fullstack-bo",
  storageBucket: "site-fullstack-bo.appspot.com",
  messagingSenderId: "1015423296355",
  appId: "1:1015423296355:web:cf8088cfd57388128fe956"
};

// Inicializar Firebase
const firebase = initializeApp(firebaseConfig);
const db = getFirestore();

// Iniciar o servidor
const app = express();

// Middlewares
app.use(express.static("../front-end/public"));
app.use(express.json());

// Configuração da AWS
const region = "sa-east-1";
const bucketName = "site-fullstack";
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

// Inicialize o S3Client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

// Função para gerar a URL da imagem
async function generateURL() {
  let date = new Date();
  const imageName = `${date.getTime()}.jpeg`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageName,
    ContentType: "image/png"
  });

  const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return uploadURL;
}




// Rota para obter a URL do S3
app.get('/s3url', (req, res) => {
  generateURL().then(url => res.json(url));
});

// Home route
app.get('/', (req, res) => {
  res.sendFile("index.html", { root: "../front-end/public" });
});

// Signup
app.get('/signup', (req, res) => {
  res.sendFile("register.html", { root: "../front-end/public" });
});

app.post('/signup', (req, res) => {
  const { name, email, password, number, tac } = req.body;

  // Validações do formulário
  if (name.length < 3) {
    res.json({ 'alert': 'O nome precisa de pelo menos 3 letras.' });
  } else if (!email.length) {
    res.json({ 'alert': 'Não está faltando nada não?' });
  } else if (password.length < 8) {
    res.json({ 'alert': 'A senha precisa de pelo menos 8 letras.' });
  } else if (!Number(number) || number.length < 10) {
    res.json({ 'alert': 'Número inválido. Digite um número válido.' });
  } else if (!tac) {
    res.json({ 'alert': 'Você precisa concordar com os termos de uso' });
  } else {
    // Armazenar os dados no banco de dados
    const users = collection(db, "users");

    getDoc(doc(users, email)).then(user => {
      if (user.exists()) {
        return res.json({ 'alert': 'email já existe' });
      } else {
        // Criptografar a senha
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            req.body.password = hash;
            req.body.seller = false;

            // Configurar o documento
            setDoc(doc(users, email), req.body).then(data => {
              res.json({
                name: req.body.name,
                email: req.body.email,
                seller: req.body.seller,
              });
            });
          });
        });
      }
    });
  }
});
// Category
app.get('/Category', (req, res) => {
  res.sendFile("category.html", { root: "../front-end/public" });
});

// Login
app.get('/login', (req, res) => {
  res.sendFile("login.html", { root: "../front-end/public" });
});

app.post('/login', (req, res) => {
    let { email, password } = req.body;

    if (!email.length || !password.length) {
        return res.json({ 'alert': 'Preencha todos os campos' });
    }

    const users = collection(db, "users");

    getDoc(doc(users, email)).then(user => {
        if (!user.exists()) {
            return res.json({ 'alert': 'Esse email não existe' });
        } else {
            bcrypt.compare(password, user.data().password, (err, result) => {
                if (result) {
                    let data = user.data();
                    let afterPage = req.query.after_page ? decodeURIComponent(req.query.after_page) : '/';
                    return res.json({
                        name: data.name,
                        email: data.email,
                        seller: data.seller,
                        redirect: afterPage // Adicionar a URL de redirecionamento
                    });
                } else {
                    return res.json({ 'alert': 'Senha incorreta' });
                }
            });
        }
    });
});

// Rota para vendedores
app.get('/seller', (req, res) => {
  res.sendFile('seller.html', { root: "../front-end/public" });
});

app.post('/seller', (req, res) => {
  let { name, address, about, number, email } = req.body;

  if (!name.length || !address.length || !about.length || number.length < 10 || !Number(number)) {
    return res.json({ 'alert': 'Informações Incorretas' });
  } else {
    // Atualizar o status do vendedor
    const sellers = collection(db, "sellers");
    setDoc(doc(sellers, email), req.body)
      .then(data => {
        const users = collection(db, "users");
        updateDoc(doc(users, email), {
          seller: true
        })
          .then(data => {
            res.json({ 'seller': true });
          });
      });
  }
});

// Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile('dashboard.html', { root: "../front-end/public" });
});

// Adicionar produto
app.get('/add-product', (req, res) => {
  res.sendFile('add-product.html', { root: "../front-end/public" });
});

app.get('/add-product/:id', (req, res) => {
  res.sendFile('add-product.html', { root: "../front-end/public" });
});
// Funções para calcular badges
const isNewProduct = (createdDate) => {
    const currentDate = new Date();
    const productDate = new Date(createdDate);
    const daysDifference = Math.floor((currentDate - productDate) / (1000 * 60 * 60 * 24));
    return daysDifference <= 30; // Considera "novo" se o produto foi criado nos últimos 30 dias
};

const isFeaturedProduct = (product) => {
    const discountThreshold = 50; // Exemplo: Desconto acima de 50% marca como destaque
    const featuredCategories = ['Eletrônicos', 'Moda']; // Exemplo: Categorias específicas que são destaque
    return (Number(product.savePrice) >= discountThreshold) || featuredCategories.includes(product.category);
};

const isPopularProduct = (salesCount) => {
    const popularThreshold = 10; // Exemplo: Produtos com mais de 10 vendas são populares
    return salesCount > popularThreshold;
};

app.post('/add-product', (req, res) => {
    let { name, shortDes, detail, price, image, tags, email, draft, oldPrice, savePrice, id, createdAt, salesCount } = req.body;

    if (!draft) {
        if (!name.length) {
            res.json({ 'alert': 'Precisa adicionar um nome ao produto' });
        } else if (!price.length || isNaN(Number(price))) {
            res.json({ 'alert': 'Adicione um preço válido' });
        } else if (oldPrice !== undefined && (isNaN(Number(oldPrice)) || !oldPrice.length)) {
            res.json({ 'alert': 'Adicione um valor antigo válido' });
        } else if (savePrice !== undefined && !savePrice.length) {
            res.json({ 'alert': 'Adicione um desconto' });
        } else if (!shortDes.length) {
            res.json({ 'alert': 'Precisa adicionar uma curta descrição' });
        } else if (!tags.length) {
            res.json({ 'alert': 'Adicione uma tag' });
        } else if (!detail.length) {
            res.json({ 'alert': 'Precisa adicionar uma descrição' });
        }
    }

    // Adicionar o produto ao banco de dados com badges
    let docName = id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random() * 50000)}` : id;

    let productWithBadges = {
        ...req.body,
        badges: {
            new: isNewProduct(createdAt),
            featured: isFeaturedProduct(req.body),
            popular: isPopularProduct(salesCount)
        }
    };

    let products = collection(db, "products");
    setDoc(doc(products, docName), productWithBadges)
        .then(() => {
            res.json({ 'product': name });
        })
        .catch(err => {
            res.status(500).json({ 'alert': 'Ocorreu algum erro no servidor' });
        });
});
const generateTagVariants = (tag) => {
    const lowercaseTag = tag.toLowerCase();
    const uppercaseTag = tag.toUpperCase();
    const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
    
    const pluralTag = pluralize(lowercaseTag);
    const pluralCapitalizedTag = pluralize(capitalizedTag);
    const pluralUppercaseTag = pluralize(uppercaseTag);

    return [lowercaseTag, uppercaseTag, capitalizedTag, pluralTag, pluralCapitalizedTag, pluralUppercaseTag];
};

// Função básica de pluralização
const pluralize = (word) => {
    if (word.endsWith('s')) {
        return word;
    } else if (word.endsWith('y') && !/[aeiou]y$/.test(word)) {
        return word.slice(0, -1) + 'ies';
    } else if (word.endsWith('ch') || word.endsWith('sh') || word.endsWith('x') || word.endsWith('z') || word.endsWith('o')) {
        return word + 'es';
    } else {
        return word + 's';
    }
};

app.post('/get-products', (req, res) => {
  let { email, id, tag, badge } = req.body;

  console.log('Received get-products request with:');
  console.log('Email:', email);
  console.log('ID:', id);
  console.log('Tag:', tag);
  console.log('Badge:', badge);

  let products = collection(db, "products");
  let queryRef;

  if (badge) {
    // Filtrar produtos com base no badge
    queryRef = getDocs(query(products, where(`badges.${badge}`, '==', true)));
  } else if (id) {
    queryRef = getDoc(doc(products, id));
  } else if (tag) {
    const tagVariants = generateTagVariants(tag);
    queryRef = getDocs(query(products, where("tags", "array-contains-any", tagVariants)));
  } else {
    queryRef = getDocs(query(products, where("email", "==", email)));
  }

  queryRef
      .then(productsSnapshot => {
          if (productsSnapshot.exists) {
              // Handle single product
              console.log('Product found:', productsSnapshot.data());
              return res.json(productsSnapshot.data());
          } else if (!productsSnapshot.empty) {
              // Handle multiple products
              let productArr = [];
              productsSnapshot.forEach(item => {
                  let data = item.data();
                  data.id = item.id;
                  productArr.push(data);
              });
              console.log('Products found:', productArr);
              return res.json(productArr);
          } else {
              console.log('No products found');
              return res.json([]); // Return an empty array if no products are found
          }
      })
      .catch(error => {
          console.error('Error fetching products:', error);
          res.status(500).json({ error: 'Internal server error' });
      });
});



// Rota para produtos
app.get('/products/:id', (req, res) => {
res.sendFile("product.html", { root: "../front-end/public" });
});

// Rota de busca
app.get('/search/:key', (req, res) => {
res.sendFile("search.html", { root: "../front-end/public" });
});

// Rota para deletar produtos
app.post('/delete-product', (req, res) => {
  const { id } = req.body;

  const products = collection(db, "products");

  deleteDoc(doc(products, id)).then(() => {
    res.json('success');
  }).catch((error) => {
    res.status(500).json({ error: error.message });
  });
});
app.post('/add-review', (req, res) => {
  let { headline, review, rate, email, product } = req.body;

  // Validação dos dados
  if (!headline || !review || !rate || !email || !product) {
    return res.json({ 'alert': 'Preencha todos os campos corretamente' });
  }

  // Objeto de revisão a ser adicionado ao Firestore
  const reviewData = {
    headline,
    review,
    rate,
    email,
    product,
    timestamp: new Date() // Adicione um timestamp se desejar
  };

  // Referência à coleção de revisões no Firestore
  const reviewsCollection = collection(db, "reviews");

  // Adicionar a revisão ao Firestore
  setDoc(doc(reviewsCollection, `review-${email}-${product}`), reviewData)
    .then(() => {
      res.json({ 'success': 'Review adicionada com sucesso' });
    })
    .catch(error => {
      console.error('Erro ao adicionar revisão:', error);
      res.status(500).json({ 'alert': 'Erro ao processar a revisão. Tente novamente mais tarde.' });
    });
});

app.post('/get-reviews', (req, res) => {
let { product, email } = req.body;
let reviews = collection(db, "reviews");

getDocs(query(reviews, where("product", "==", product)), limit(4))
.then(review => {
    let reviewArr = [];

    if(review.empty){
        return res.json(reviewArr);
    }

    let userEmail = false;

    review.forEach((item, i) => {
        let reivewEmail = item.data().email;
        if(reivewEmail == email){
            userEmail = true;
        }
        reviewArr.push(item.data());
    });

    if(!userEmail){
        getDoc(doc(reviews, `review-${email}-${product}`))
        .then(data => reviewArr.push(data.data()));
    }

    return res.json(reviewArr);
})
.catch(error => {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
});
});


app.get('/cart', (req, res) => {
  res.sendFile("cart.html", { root : "../front-end/public" })
})

app.get('/checkout', (req, res) => {
  res.sendFile("checkout.html", { root : "../front-end/public" })
})

const googleMapsClient = new Client({});

app.post('/calculate-distance', async (req, res) => {
  const { origin, destination } = req.body;

  try {
      const response = await googleMapsClient.distancematrix({
          params: {
              origins: [origin],
              destinations: [destination],
              key: process.env.GOOGLE_MAPS_API_KEY,
          },
          timeout: 5000, // Aumentar o tempo limite para 5 segundos
      });

      console.log('Google Maps API Response:', response.data); // Adicionar log da resposta

      if (response.data.rows[0].elements[0].status === 'OK') {
          const distanceInMeters = response.data.rows[0].elements[0].distance.value;
          const distanceInKm = distanceInMeters / 1000;
          
          res.json({ distance: distanceInKm });
      } else {
          throw new Error(`Google Maps API Error: ${response.data.rows[0].elements[0].status}`);
      }
  } catch (error) {
      console.error('Erro ao calcular a distância:', error.message); // Mensagem de erro mais detalhada
      res.status(500).json({ error: "Erro ao calcular a distância." });
  }
});

//stripe payment
const stripe = Stripe(process.env.STRIPE_KEY);

let DOMAIN = process.env.DOMAIN;

app.post('/stripe-checkout', async (req, res) => {
  try {
      const { items, address, email } = req.body;

      console.log('Dados recebidos:', { items, address, email });

      // Verifique se 'items' está definido e é um array
      if (!items || !Array.isArray(items)) {
          throw new Error('Itens inválidos recebidos.');
      }

      // Preparando os itens para a sessão de checkout do Stripe
      const lineItems = items.map(item => ({
          price_data: {
              currency: 'brl',
              product_data: {
                  name: item.price_data.product_data.name,
                  images: item.price_data.product_data.images || [],  // Certifique-se de que cada item tenha uma URL de imagem
              },
              unit_amount: item.price_data.unit_amount, // Preço em centavos
          },
          quantity: item.quantity,
      }));

      // Criação da sessão de checkout no Stripe
      const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}&order=${encodeURIComponent(JSON.stringify(req.body.order))}`,
          cancel_url: `${DOMAIN}/checkout`,
          line_items: lineItems,  // Use o array 'lineItems' corretamente
          customer_email: email // Adiciona o email do cliente à sessão
      });

      res.json({ url: session.url });
  } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error.message);
      res.status(500).json({ error: "Falha ao criar sessão de checkout", message: error.message });
  }
});




// Rota 404
app.get('/404', (req, res) => {
  res.sendFile("404.html", { root: "../front-end/public" });
});

// Rota padrão para 404
app.use((req, res) => {
  res.redirect('/404');
});

// Iniciar o servidor
app.listen(3000, () => {
  console.log('listening on port 3000');
});
