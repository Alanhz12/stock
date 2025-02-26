document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registerForm').addEventListener('submit', function(event) {
        event.preventDefault();
        registerUser();
    });

    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        loginUser();
    });

    document.getElementById('logoutButton').addEventListener('click', function() {
        logoutUser();
    });

    document.getElementById('articleForm').addEventListener('submit', function(event) {
        event.preventDefault();
        addArticle();
    });

    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault();
        searchArticle();
    });

    function registerUser() {
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            console.log('User registered:', data);
            alert('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function loginUser() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Inicio de sesión exitoso") {
                document.getElementById('registerContainer').style.display = 'none';
                document.getElementById('loginContainer').style.display = 'none';
                document.getElementById('mainContainer').style.display = 'block';
                document.getElementById('searchContainer').style.display = 'block';
                document.getElementById('logoutContainer').style.display = 'block';
                updateArticleList();
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function logoutUser() {
        fetch('/logout', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('mainContainer').style.display = 'none';
            document.getElementById('searchContainer').style.display = 'none';
            document.getElementById('logoutContainer').style.display = 'none';
            document.getElementById('registerContainer').style.display = 'block';
            document.getElementById('loginContainer').style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

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
            console.log('Server response:', data);
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

        // Limpiar resultados anteriores
        searchResult.innerHTML = '';

        fetch(`/articles?searchCode=${searchCode}`)
            .then(response => response.json())
            .then(data => {
                const articles = data.articles;

                if (articles.length > 0) {
                    articles.forEach(article => {
                        const p = document.createElement('p');
                        p.textContent = `Código: ${article.id} - Código de barras: ${article.barcode} - Artículo: ${article.name} - Cantidad: ${article.quantity}`;
                        
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Eliminar';
                        deleteButton.onclick = () => deleteArticle(article.id);
                        
                        const reduceButton = document.createElement('button');
                        reduceButton.textContent = 'Reducir cantidad';
                        reduceButton.onclick = () => {
                            const quantityToReduce = prompt('Introduce la cantidad a reducir:', 1);
                            if (quantityToReduce != null) {
                                reduceQuantity(article.id, parseInt(quantityToReduce, 10));
                            }
                        };

                        p.appendChild(deleteButton);
                        p.appendChild(reduceButton);
                        searchResult.appendChild(p);
                    });
                } else {
                    searchResult.textContent = 'Artículo no encontrado';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

        // Limpiar el campo de búsqueda
        document.getElementById('searchCode').value = '';
    }

    function deleteArticle(id) {
        fetch(`/delete-article/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Article deleted:', data);
            updateArticleList();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function reduceQuantity(id, quantity) {
        fetch('/reduce-quantity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, quantity })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Quantity reduced:', data);
            updateArticleList();
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
                    
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Eliminar';
                    deleteButton.onclick = () => deleteArticle(article.id);
                    
                    const reduceButton = document.createElement('button');
                    reduceButton.textContent = 'Reducir cantidad';
                    reduceButton.onclick = () => {
                        const quantityToReduce = prompt('Introduce la cantidad a reducir:', 1);
                        if (quantityToReduce != null) {
                            reduceQuantity(article.id, parseInt(quantityToReduce, 10));
                        }
                    };

                    li.appendChild(deleteButton);
                    li.appendChild(reduceButton);
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

