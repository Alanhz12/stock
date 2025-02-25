document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('articleForm').addEventListener('submit', function(event) {
        event.preventDefault();
        addArticle();
    });

    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault();
        searchArticle();
    });

    function addArticle() {
        const barcode = document.getElementById('barcode').value;
        const name = document.getElementById('name').value;
        const quantity = parseInt(document.getElementById('quantity').value, 10);

        fetch('/add-article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ barcode, name, quantity })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            updateArticleList();
        })
        .catch(error => {
            console.error('Error:', error);
        });

        // Limpiar el formulario
        document.getElementById('barcode').value = '';
        document.getElementById('name').value = '';
        document.getElementById('quantity').value = '';
    }

    function searchArticle() {
        const searchCode = document.getElementById('searchCode').value;
        const searchResult = document.getElementById('searchResult');

        fetch('/articles')
            .then(response => response.json())
            .then(data => {
                const articles = data.articles;
                const article = articles.find(article => article.barcode === searchCode || article.name === searchCode);

                if (article) {
                    searchResult.textContent = `Código: ${article.id} - Código de barras: ${article.barcode} - Artículo: ${article.name} - Cantidad: ${article.quantity}`;
                } else {
                    searchResult.textContent = 'Artículo no encontrado';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function updateArticleList() {
        fetch('/articles')
            .then(response => response.json())
            .then(data => {
                const articleList = document.getElementById('articleList');
                articleList.innerHTML = '';
                data.articles.forEach(article => {
                    const li = document.createElement('li');
                    li.textContent = `Código: ${article.id} - Código de barras: ${article.barcode} - Artículo: ${article.name} - Cantidad: ${article.quantity}`;
                    articleList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // Inicializar la lista de artículos
    updateArticleList();
});
