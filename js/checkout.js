(() => {
    let cliqueLocalStorageData = getCliqueLocalStorageData()
    displayData(cliqueLocalStorageData)
    updateTotalPrice(cliqueLocalStorageData)
    checkForm()

    /* Au téléchargement de la page, le bouton va être prêt avant les autres*/
    if (document.readyState == 'loading') { 
        document.addEventListener('DOMContentLoaded', ready)
    } else {
        ready(cliqueLocalStorageData)
    }
})()

function ready(cliqueLocalStorageData) {
    document.addEventListener("DOMContentLoaded", () => {
        /*On récupère la classe button, et utilise getElementByClassName au lieu de ById pour pouvoir l'utiliser plusieurs fois*/
        let removeCartItemButtons = document.getElementsByClassName("danger-btn") 
        /* On boucle tous les buttons à l'intérieur de la carte, donc on peut effacer ce qui se trouve dans la carte column*/
        for (let i = 0; i < removeCartItemButtons.length; i++) { 
            let button = removeCartItemButtons[i]
            button.addEventListener("click", (event) => {
                effacerElementCart(event, cliqueLocalStorageData)
            }) 
            /* l'Event à un property target permettant de remonter tous les elements pour les effacer */
        }
        /* On prends l'identification pour aller à la page de confirmation */
        let formId = document.getElementById("myForm")
        formId.addEventListener("submit", async (e) => {
            e.preventDefault()
            await getCreateAndSendFormData(cliqueLocalStorageData)
            checkForm()
        })
    })
}
/* Récupération de value de la form en JSON pour pouvoir les envoyer au back end et à la page confirmation pour pouvoir afficher */
async function getCreateAndSendFormData(cliqueLocalStorageData) { 
    let formNom = document.getElementById("name").value
    let formPrenom = document.getElementById("prenom").value
    let formAdresse = document.getElementById("adresse").value
    let formVille = document.getElementById("ville").value
    let formMail = document.getElementById("email").value

    /*ID du produit*/
    let products = []
    /*On crée une boucle pour pouvoir pusher un ou plusieurs id */
    for (let i = 0; i < cliqueLocalStorageData.length; i++) {
        const product = cliqueLocalStorageData[i];
        /*On crée une boucle pour pouvoir pusher un ou plusieurs id par quantité*/
        for (let j = 0; j < product.quantity; j++) {
            products.push(product.id)
        }
    }
    /*JSON du formulaire */
    let postData = { 
        contact : {
            firstName: formPrenom,
            lastName: formNom,
            address: formAdresse,
            city: formVille,
            email: formMail
        },
        products : products 
    }

    /*Création du header pour pouvoir informer du content JSON et lui permettre de le lire */
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/JSON'
    }

    /*Appeller l'URL de l'API BACK END pour l'envoyer au backend et création de la methode post avec le headers acceptant format JSON */
    const myRequest = new Request('http://localhost:3000/api/teddies/order', {
        method: 'POST',
        redirect: 'follow',
        headers: headers,
        mode: 'cors',
        body : JSON.stringify(postData),
    })

    /*Creation du fetch qui va recevoir le API back end appelé requestHeader et le JSON avec la variable postData*/
    return fetch(myRequest)
        /*Quand la réponse reviens, on va faire un log au console pour retourner le JSON*/
        /*Si la réponse est ok, on retourne le JSON de la réponse et on utilise son orderId de la réponse*/
        .then(async response => {
            if(response.ok) { 
                return response.json()
                .then((json) =>{
                    let confirmOrder = localStorage.setItem("order", JSON.stringify(json))
                    let orderId = goToConfirmationPage(json.orderId, confirmOrder) 
                })
            } else {
                return Promise.reject(response.status)
            }
            /*Une fois qu'on a le JSON, on va faire un console log du JSON*/
        }).then(response => {
        })
}

/*On envoie le total, l'id et le nom de la personne */
/* Cette function permet d'indiquer que si il n'y a rien dans le localStorage produit, on ne peut pas aller sur la page confirmation*/
function goToConfirmationPage(orderId) {
    let recevoirLocalStorage = localStorage.getItem("order")
    let parsedLocalStorage = JSON.parse(recevoirLocalStorage)
    
    if(parsedLocalStorage.products == 0){
        confirm("Erreur, retournez à l'index ou ajoutez un produit!")
        document.location.href = "index.html"
    }else{
        window.location.href = `validation.html`
        /*l'url pour aller à la page confirmation*/
    }
}
/* cliqueLocalStorageData indiquer le message panier vide si il n'y a plus de produit dans le panier */
function effacerElementCart(event) {
    let buttonEffacer = event.target
    effacerLogique(event)
    setTimeout(() => {
        buttonEffacer.remove()
    }, 300)
}

function effacerLogique(event) {
    let donneeEffacer = event.data 
    let localStorageData = getCliqueLocalStorageData() 
    localStorageData.splice(donneeEffacer, 1)
    localStorage.setItem("userPanier", JSON.stringify(localStorageData))
    window.location.reload()
}

/* Le paramètre cliqueLocalStorageData permet de récuperer les données du localStorage */
function updateTotalPrice(cliqueLocalStorageData) {
    let total = 0
    /* On récupère le prix et la quantité directement du localstorage et multiplie les deux pour avoir le total */
    for (let i = 0; i < cliqueLocalStorageData.length; i++) { 
        const element = cliqueLocalStorageData[i];
        let elementQuantity = element.quantity
        let elementPrix = element.price / 100
        total = total + (elementQuantity * elementPrix)
        document.getElementById("prix__total").textContent = total + " €"
    }
}

function getCliqueLocalStorageData() {

    /* On récupère les données de localStorage */
    let panierGetStorageData = localStorage.getItem('userPanier')


    /* Verification qu'il ne soit pas vide */
    if (!panierGetStorageData) {
    }

    return JSON.parse(panierGetStorageData)
}

/* Cloner le produit dans le panier et l'afficher */
function displayData(cliqueLocalStorageData) { 
    for (let i = 0; i < cliqueLocalStorageData.length; i++) {
        const localStorageClick = cliqueLocalStorageData[i];
        const templateAdd = document.querySelector(".templateAdd")
        const cloneAdd = document.importNode(templateAdd.content, true)
        cloneAdd.getElementById("blog__quantity").textContent = localStorageClick.quantity
        cloneAdd.getElementById("price__blog").textContent = localStorageClick.price / 100 + " €"
        cloneAdd.getElementById("blog__title").textContent = localStorageClick.name
        document.getElementById("productsAddCenter").appendChild(cloneAdd)
    }
}

function checkForm() {
    const stringTest = /[a-zA-Z]/
    const numberTest = /[0-9]/
    /* Test de mail*/
    const emailTest = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/y;
    const specialCharTest = /[$-/:-?{-~!"^_`\[\]]/

    /* Message pour dire si le formulaire ne corresponds pas */
    let messageTest = []

    /* Récupération de chaque form */
    let formNom = document.getElementById("name").value.trim() 
    /* La méthode trim() permet de retirer les blancs en début et fin de chaîne*/
    let formPrenom = document.getElementById("prenom").value.trim()
    let formAdresse = document.getElementById("adresse").value.trim()
    let formVille = document.getElementById("ville").value.trim()
    let formMail = document.getElementById("email").value.trim()

    /* Nom valide et invalide */
    const validNom = document.querySelector(".validNom")
    const invalidNom = document.querySelector(".invalidNom")
    /* Prénom valide et invalide */
    const validPrenom = document.querySelector(".validPrenom")
    const invalidPrenom = document.querySelector(".invalidPrenom")
    /* Adresse valide et invalide */
    const validAdresse = document.querySelector(".validAdresse")
    const invalidAdresse = document.querySelector(".invalidAdresse")
    /* Ville valide et invalide */
    const validVille = document.querySelector(".validVille")
    const invalidVille = document.querySelector(".invalidVille")
    /* Email valide et invalide */
    const validMail = document.querySelector(".validMail")
    const invalidMail = document.querySelector(".invalidMail")
}

