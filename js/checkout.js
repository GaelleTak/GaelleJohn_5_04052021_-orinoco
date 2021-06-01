(() => {
    let cliqueLocalStorageData = getCliqueLocalStorageData()
    console.log(cliqueLocalStorageData)
    displayData(cliqueLocalStorageData)
    updateTotalPrice(cliqueLocalStorageData)
    checkForm()
    console.log(checkForm)

    if (document.readyState == 'loading') { //Une fois que la page se télécharge le bouton va être pret aant les autres car si les boutons fonctionne après les autres, cela peut apporter des prpblèmes aux utilisateurs
        document.addEventListener('DOMContentLoaded', ready)
    } else {
        ready(cliqueLocalStorageData)
    }
})()

function ready(cliqueLocalStorageData) {
    document.addEventListener("DOMContentLoaded", () => {
        let removeCartItemButtons = document.getElementsByClassName("danger-btn") //On récupère la classe button, j'utilie getElementByClassName au lieu de ById car ID est unique donc 1 fois alors j'aimerais plus tard pouvoir effacer plusieurs achats.
        console.log(removeCartItemButtons)
        for (let i = 0; i < removeCartItemButtons.length; i++) { // On boucle tous les buttons à l'interieur de la carte, donc on peut effacer ce qui se trouve dans la carte column
            let button = removeCartItemButtons[i]
            button.addEventListener("click", (event) => {
                //e.data=i
                effacerElementCart(event, cliqueLocalStorageData)
                // pour afficher un message "panier vide" si le panier est egal à 
            }) // l'event à un property target qui va permetttre de remonter à tous les elements pour les effacer
        }
        let formId = document.getElementById("myForm")
        formId.addEventListener("submit", async (e) => {
            e.preventDefault()
            let o = await getCreateAndSendFormData(cliqueLocalStorageData)// on prends l'identification pour aller à la page du confirmation
            console.log(o)
            checkForm()
        })
    })
}
async function getCreateAndSendFormData(cliqueLocalStorageData) { // Recuperation de value de la form en JSON pour pouvoir les envoyer au back end et à la page confirmation pour pouvoir afficher 
    //l'ID produit acheté et le nom de l'acheteur pour lui remercier
    //checkForm() // recuperation du fonction checkForm et ses variables
    //const arrayForm = '[]'
    let formNom = document.getElementById("name").value
    let formPrenom = document.getElementById("prenom").value
    let formAdresse = document.getElementById("adresse").value
    let formVille = document.getElementById("ville").value
    let formMail = document.getElementById("email").value

    //On prépare les ID du produit
    let products = []
    //On crée un boucle pour pouvoir pusher sois un id sois plus de un id
    for (let i = 0; i < cliqueLocalStorageData.length; i++) {
        const product = cliqueLocalStorageData[i];
        //je fais un booucle pour pusher un id par quantité
        for (let j = 0; j < product.quantity; j++) {
            products.push(product.id)
        }
    }

    let postData = { //JSON du formulaire
        contact : {
            firstName: formPrenom,
            lastName: formNom,
            address: formAdresse,
            city: formVille,
            email: formMail
        },
        //products: cliqueLocalStorageData.map((item) => {return item.id}) //ajout Id des tous les produits, pour chaque element on retourner l'id du produit, orderId
        products : products //Avec la nouvelle norme, on peut laisser uniquement products
    }
    console.log(postData)

    //creation du header pour pouvoir header avec le content JSON et peut lire JSON
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/JSON'
    }
    console.log(headers)

    //Appeller l'URL de l'API BACK END pour puvoir l'envoyer au backend et creation de la methode post avec le headers qui accept format JSON et utilise le mode cors qui permet kles requêtes cross origin pour acceder à divers API 
    const myRequest = new Request('http://localhost:3000/api/furniture/order', {
        method: 'POST',
        redirect: 'follow',
        headers: headers,
        mode: 'cors',
        body : JSON.stringify(postData),
    })
    console.log(myRequest)

    // Creation du fetch qui va recevoir le API back end appelé requestHeader et le JSON avec la variable postData
    return fetch(myRequest)
        //Quand la réponse reviens, on va faire un log au console pour dire retourner le JSON
        //Si la réponse est ok, on retourne le JSON de la réponse et on utilise son orderId de la réponse
        .then(async response => {
            if(response.ok) { 
                return response.json()
                .then((json) =>{
                    console.log(json)
                    /*let orderId = goToConfirmationPage(json.orderId) //ici on récupère le orderId du back end
                    console.log(orderId)*/
                    let confirmOrder = sessionStorage.setItem("order", JSON.stringify(json))
                    console.log(confirmOrder)
                    let orderId = goToConfirmationPage(json.orderId, confirmOrder) //ici on récupère le orderId du back end
                    console.log(orderId)
                })
            } else {
                return Promise.reject(response.status)
            }
            //Une fois qu'on a le JSON, on va faire un console log du JSON
        }).then(response => {
            console.log(response)
            //si jamais il y aun problème on catch une erreur qu'on log
        }).catch(err => {
            console.error(err)
        })
}
//on envoie le total, l'id et le nom de la personne//cette function est pour dire si il n'y a rien dans le sessionStorage produit, on ne peut pas aller sur la page confirmation, à linverse si
function goToConfirmationPage(orderId) {
    let recevoirSessionStorage = sessionStorage.getItem("order")//sessionStorage
    console.log(recevoirSessionStorage)
    let parsedSessionStorage = JSON.parse(recevoirSessionStorage)
    console.log(parsedSessionStorage)

    // si le produit qui se trouve à l'intérieur de products.array est egal à 0 alors on ne peut pas aller sur la page confirmationb à l'inverse oui
    if(parsedSessionStorage.products == 0){
        confirm("Erreur, retournez à l'index ou ajoutez un produit!")
        document.location.href = "index.html"
    }else{
        window.location.href = `${window.location.origin}/confirmation.html?ID:=${orderId}`// L'url pour aller à la page confirmation
    }
}

function effacerElementCart(event) { //j'ajoute cliqueLocalStorageData pour pouvoir faire une confition pour montrer le message panier vide si il n'y a plus de produit sur le panier
    let buttonEffacer = event.target // tous les buttons qu'on clique, on peut effacer
    effacerLogique(event)
    setTimeout(() => {
        buttonEffacer.remove() //
    }, 300)
}

function effacerLogique(event) {
    let donnéeEffacer = event.data // declencheur de l'évenement
    console.log(donnéeEffacer)
    let localStorageData = getCliqueLocalStorageData() // la function de récuperation de données button "ajouter au panier"
    localStorageData.splice(donnéeEffacer, 1)
    localStorage.setItem("userPanier", JSON.stringify(localStorageData))
    window.location.reload()
}

function updateTotalPrice(cliqueLocalStorageData) { //le parametre cliqueLocalStorageData est le variable d'une fonction qui permet de récuperer les données du localStorage
    let total = 0
    for (let i = 0; i < cliqueLocalStorageData.length; i++) { // Ici, je récupère le prix et la quantité input directeent du localstorage et je multiplie les deux pour avoir le résultat
        const element = cliqueLocalStorageData[i];
        let elementQuantity = element.quantity
        let elementPrix = element.price / 100
        total = total + (elementQuantity * elementPrix)
        document.getElementById("prix__total").textContent = total + " €"
    }
}

function getCliqueLocalStorageData() {

    // Je réucpere les données de localStorage
    let panierGetStorageData = localStorage.getItem('userPanier')

    console.log(panierGetStorageData)

    // Verification qu'il ne soit pas vide
    if (!panierGetStorageData) {
        console.log("Oups, le panier est vide")
    }

    let parseStructTeddyJSON = JSON.parse(panierGetStorageData)
    return parseStructTeddyJSON
}

//create data ici

function displayData(cliqueLocalStorageData) { // ici pour cloner le produit dans le panier et les affihcer
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
    console.log(stringTest)
    const numberTest = /[0-9]/
    console.log(numberTest)
    //ici, test de mail
    const emailTest = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/y;
    console.log(emailTest)
    const specialCharTest = /[$-/:-?{-~!"^_`\[\]]/
    console.log(specialCharTest)
    //message pour dire si le formulaire ne corresponds pas 
    let messageTest = []
    //Recuperation de chaque form
    let formNom = document.getElementById("name").value.trim() //La méthode trim() permet de retirer les blancs en début et fin de chaîne
    console.log(formNom)
    let formPrenom = document.getElementById("prenom").value.trim()
    let formAdresse = document.getElementById("adresse").value.trim()
    let formVille = document.getElementById("ville").value.trim()
    let formMail = document.getElementById("email").value.trim()

    //valid and invalid nom
    const validNom = document.querySelector(".validNom")
    const invalidNom = document.querySelector(".invalidNom")
    console.log(validNom, invalidNom)
    //valid and invalid preom
    const validPrenom = document.querySelector(".validPrenom")
    const invalidPrenom = document.querySelector(".invalidPrenom")
    console.log(validPrenom, invalidPrenom)
    //valid and invalid Nom
    const validAdresse = document.querySelector(".validAdresse")
    const invalidAdresse = document.querySelector(".invalidAdresse")
    console.log(validAdresse, invalidAdresse)
    //valid and invalid Nom
    const validVille = document.querySelector(".validVille")
    const invalidVille = document.querySelector(".invalidVille")
    console.log(validVille, invalidVille)
    //valid and invalid Nom
    const validMail = document.querySelector(".validMail")
    const invalidMail = document.querySelector(".invalidMail")
    console.log(validMail, invalidMail)

    if (stringTest.test(formNom) === false) {
        //messageTest = messageTest + "\n" + "Vérifiez/renseigner votre nom"
        invalidNom.textContent = messageTest + "\n" + ""
    } else {
        //if(numberTest.test(formPrenom) == true || emailTest.test(formPrenom) == true || specialCharTest.test(formPrenom) == true || messageTest == "")
        //validNom.textContent = messageTest + "\n" + "Le nom est ok"
        console.log("Le nom est OK")
    }

    if (stringTest.test(formPrenom) === false) {
        //messageTest = messageTest + "\n" + "Vérifiez/renseigner votre nom"
        invalidPrenom.textContent = messageTest + "\n" + ""
    } else {
        console.log("Le prenom est OK")
    }

    //Check adresse si c'est ok et pas de numéro spéciale
    if (specialCharTest.test(formAdresse) == true || emailTest.test(formAdresse) === false || messageTest === "") {
        invalidAdresse.textContent = messageTest + "\n" + ""
    } else {
        console.log("L'adresse est OK")
    }
    //check la ville
    if (specialCharTest.test(formVille) == true || emailTest.test(formVille) == true || numberTest.test(formVille) == true || formVille == "") {
        invalidVille.textContent = messageTest + "\n" + ""
    } else {
        console.log("La ville est ok")
    }
    //check email
    if (emailTest.test(formMail) == false) {
        invalidMail.textContent = messageTest + "\n" + ""
    } else {
        console.log("La mail est ok")

    }

    // si l'un de ces champs n'est pas bon; on montre le message d'alert plus la raison
    if (messageTest != "") {
        alert("il est necessaire de " + "\n" + messageTest)
    }
}