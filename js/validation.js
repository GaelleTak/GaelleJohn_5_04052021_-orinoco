(() => {
    let confirmDatas = getConfirmData()
    displayData(confirmDatas)

    /* Au téléchargement de la page, le bouton va être prêt avant les autres*/
    getData()
    if (document.readyState == 'loading') { 
        document.addEventListener('DOMContentLoaded', ready)
    } else {
        ready()
    }
})()
/* Récuperation du localStorage */
function getData(){
        /* On récupère les données de localStorage */
        let panierGetStorageData = localStorage.getItem('userPanier')

        
        /* Vérification qu'il ne soit pas vide */
        if (!panierGetStorageData) {
        }
    
        return JSON.parse(panierGetStorageData)
}

/* Au clic pour revenir à index.html, on efface le localStorage du panier */
function ready(){
    document.addEventListener("DOMContentLoaded", () => {
        let btn = document.getElementById("accueil__btn")
        btn.addEventListener("click", () => {
            window.localStorage.removeItem('userPanier');
        })
    })
}



function getConfirmData(){
    let recevoirLocalStorage =  localStorage.getItem("order")
    let parsedLocalStorage = JSON.parse(recevoirLocalStorage)

    /* Si il n'y a rien dans la page confirmation, on se dirige vers l'index automatiquement */
    if(!recevoirLocalStorage){
        document.location.href = "index.html"
        alert("error")
    }else{
        parsedLocalStorage
        console.log(parsedLocalStorage)
        localStorage.removeItem('order')
    }

    return parsedLocalStorage
}

function displayData(confirmDatas){
    const templateAdd = document.getElementById("confirmTemplate")
    const cloneAdd = document.importNode(templateAdd.content, true)
    cloneAdd.getElementById("blog__prenom").textContent = `${confirmDatas.contact.firstName} !` 
    let parsedNumber = confirmDatas.products.reduce((sum, item) => sum += item.price, 0)
    cloneAdd.getElementById("blog__price").textContent = `${(parsedNumber / 100)} €`
    cloneAdd.getElementById("blog__order__id").textContent = confirmDatas.orderId
    document.getElementById("sectionTemplate").appendChild(cloneAdd)
}