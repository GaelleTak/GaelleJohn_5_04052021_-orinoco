(async function() {
    const teddies = await getTeddies()
    for (teddy of teddies) {
        displayTeddy(teddy)
    }
  })()
  
  function getTeddies() {
    return fetch("http://localhost:3000/api/teddies")//ou xmlhttprequest ou axios
        .then((responseHttp) => responseHttp.json())
        //.then((teddies) => teddies)
        .catch((error) => {
            alert(error) + document.getElementById(`Error :(`)
        })
        
  }
  
  function displayTeddy(teddy) {
    const templateElt = document.getElementById("templateArticle")
    const cloneElt = document.importNode(templateElt.content, true)
  
    cloneElt.getElementById("blog__image").src = teddy.imageUrl
    cloneElt.getElementById("blog__title").textContent = teddy.name
    cloneElt.getElementById("blog__price").textContent = teddy.price / 100 + (' €')
  
    cloneElt.getElementById("blog__lien").href = "produit.html?id=" + teddy._id
  
    document.getElementById("produits").appendChild(cloneElt)
  }