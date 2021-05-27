(async function() {
    const meubles = await getMeubles()
    for (meuble of meubles) {
        displayMeuble(meuble)
    }
  })()
  
  function getMeubles() {
    return fetch("http://localhost:3000/api/teddies")//ou xmlhttprequest ou axios
        .then((responseHttp) => responseHttp.json())
        //.then((meubles) => meubles)
        .catch((error) => {
            alert(error) + document.getElementById(`Error :(`)
        })
        
  }
  
  function displayMeuble(meuble) {
    const templateElt = document.getElementById("templateArticle")
    const cloneElt = document.importNode(templateElt.content, true)
  
    cloneElt.getElementById("blog__image").src = meuble.imageUrl
    cloneElt.getElementById("blog__title").textContent = meuble.name
    cloneElt.getElementById("blog__price").textContent = meuble.price / 100 + (' €')
  
    cloneElt.getElementById("blog__lien").href = "produit.html?id=" + meuble._id
  
    document.getElementById("produits").appendChild(cloneElt)
  }