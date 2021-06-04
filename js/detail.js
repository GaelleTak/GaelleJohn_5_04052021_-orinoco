(async () => {
    /* Chercher l'identifation avec get depuis l'URL */
    const teddyId = getTeddyId() 
    const teddyData = await getTeddyData(teddyId)
    displayTeddy(teddyData)
    
    /* Au téléchargement de la page, le bouton va être prêt avant les autres*/
    if (document.readyState == 'loading') { 
        document.addEventListener('DOMContentLoaded', ready)
    } else {
        ready(teddyData)
    }
})()

function getTeddyId() {
    /* L'extraction de l'ID pour identifier quel lien on a cliqué et pour afficher après le bon API */
    return (new URL(document.location)).searchParams.get('id')
}

function getTeddyData(teddyId) { 
    /* Fetch permet la récupération des données l'API pour afficher la donnée avec le bon ID*/
    return fetch(`http://localhost:3000/api/teddies/${teddyId}`)
        .then((responseHttp) => responseHttp.json())
}
/* Affichage de la donnée cliquée par l'utilisateur*/
function displayTeddy(teddyData) { 
    document.getElementById('blog__image').src = teddyData.imageUrl
    document.getElementById('blog__title').textContent = teddyData.name
    document.getElementById('blog__description').textContent = teddyData.description
    document.getElementById('blog__price').textContent = teddyData.price / 100 + " €"
}

function ready(teddyData) {
    /* Evénement pour ajouter le produit au panier au clique d'ajout au panier*/

    const buttonAjout = document.getElementById('buttonAdd')
    buttonAjout.addEventListener('click', (event) => {
        event.preventDefault()
        getAjoutTeddy(teddyData)
        goToRedirectionToPanier(teddyData.name)
    })
    /* Nécéssité de choisir au moins 1 produit */
    let quantityInput = document.getElementById('quantity')
    quantityInput.addEventListener("change", quantityChanged)
}

function quantityChanged(event) { 
    /* Lier l'input value au bouton pour que si on choisi plus qu'un seul produit dans le panier, ce nombre vas aller au localStorage et le prix se mutiplie en rapport avec le nombre choisi sur l'input value */
    let input = event.target
    let quantity = parseInt(input.value)
    if (isNaN(quantity) || quantity <= 0) {
        quantity = 1
    } else if (quantity > 100) {
        quantity = 100
    }

    input.value = quantity
     /* Une fois la quantité validée, on la réinjecte dans l'input value */
    return quantity
}

function getAjoutTeddy(teddyData) {
    if (localStorage.getItem("userPanier")) {

    } else {
        console.log("Administration : Le panier n'existe pas, il va être créer et l'envoyer dans le localStorage");
        /*Le panier est un tableau de produits*/
        let panierInit = [];
        localStorage.setItem("userPanier", JSON.stringify(panierInit));
    };

    /*L'utilisateur a maintenant un panier*/
    let userPanier = JSON.parse(localStorage.getItem("userPanier"))
    let panierVide = '[]'

    let quantityElement = document.getElementById('quantity').value 
    /*On récupère la quantité de value input*/
    let quantityElementParsed = parseInt(quantityElement)

    /* Toutes les données pusher dans le localStorage, sont sauvegardées ici */
    const structTeddy = 
    {
        name:teddyData.name,
        id:teddyData._id,
        quantity:quantityElementParsed,
        price:teddyData.price,
        imageUrl:teddyData.imageUrl
    }

    let produitFiltre = userPanier.filter(teddy => teddy.id === structTeddy.id && teddy.color === structTeddy.color)
    /* Si le localStorage est vide on n'envoie rien */

    if(!userPanier)
    {
        panierVide.push(panierVide)
    }
    /* Si il n'y a rien dans le panier, on envoie toutes les données */
    else
    {
        if(produitFiltre.length === 0){
            userPanier.push(structTeddy)
        }
        else
        {   
            userPanier.find(element => { 
            if(element === produitFiltre[0]){
                element.quantity += structTeddy.quantity
            }
            })
        }
    }

    localStorage.setItem("userPanier", JSON.stringify(userPanier))
    /*L'utilisateur a maintenant un panier*/
}

function goToRedirectionToPanier(teddyDataNname){
    window.location.href = `checkout.html`
    /*L'utilisateur est envoyé à son panier*/
}