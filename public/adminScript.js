document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productForm');


    function loadProductOptions() {
        return fetch('http://localhost:3000/api/productos')
            .then(response => response.json())
            .then(products => {
                let optionsHtml = '<option value="">Seleccionar producto</option>'; // Opción predeterminada
                optionsHtml += products.map(product => `<option value="${product.id}">${product.nombre}</option>`).join('');
                return `<select id="swal-input-product" class="swal2-input">${optionsHtml}</select>`;
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
                return '';
            });
    }
    
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const productName = form.productName.value;

        fetch('http://localhost:3000/api/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre: productName })
        })
        .then(response => response.json())
        .then(data => {
            alert('Producto cargado exitosamente!');
            form.reset();
        })
        .catch(error => {
            console.error('Error al cargar el producto:', error);
            alert('Hubo un error al cargar el producto.');
        });
    });
    
    function fetchGiftCards() {
        fetch('http://localhost:3000/api/vouchers') // Cambia la URL aquí
            .then(response => response.json())
            .then(giftcards => {
                const list = document.getElementById('giftcardList');
                list.innerHTML = ''; // Limpiar lista existente
                giftcards.forEach(giftcard => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <span>ID: ${giftcard.id}</span>
                        <span>Fecha: ${new Date(giftcard.valid_until).toLocaleDateString()}</span>
                        <span>De: ${giftcard.from_text}</span>
                        <button onclick="showGiftCardDetails('${giftcard.id}')">Ver</button>
                    `;
                    list.appendChild(listItem);
                });
                
            })
            .catch(error => console.error('Error al cargar los gift cards:', error));
    }
    window.showGiftCardDetails = function(giftcardId) {
        // Primero, obtén los detalles del gift card del servidor
        fetch(`http://localhost:3000/api/vouchers/${giftcardId}`)
            .then(response => response.json())
            .then(giftcard => {
                loadProductOptions().then(productOptionsHtml => {
                    // Utiliza SweetAlert para mostrar un modal con los detalles del gift card
                    Swal.fire({
                        title: 'Detalles del Gift Card',
                        html: `
                            <label>ID: <input id="swal-input1" class="swal2-input" value="${giftcard.id}" disabled></label>
                            <label>Mensaje: <input id="swal-input2" class="swal2-input" value="${giftcard.message}"></label>
                            <label>De: <input id="swal-input3" class="swal2-input" value="${giftcard.from_text}"></label>
                            <label>Para: <input id="swal-input4" class="swal2-input" value="${giftcard.to_text}"></label>
                            <label>Válido Hasta: <input type="date" id="swal-input5" class="swal2-input" value="${giftcard.valid_until}"></label>
                            <label>URL: <input id="swal-input6" class="swal2-input" value="${giftcard.url}" disabled></label>
                            <div class="field-group">
                                <label for="swal-input-product">Producto:</label>
                                <div id="product-options-container">${productOptionsHtml}</div>
                            </div>
                            <div class="field-group">
                                <label for="swal-input-monto">Monto:</label>
                                <input id="swal-input-monto" class="swal2-input" type="number" placeholder="Ingrese el monto" value="${giftcard.monto ? giftcard.monto : ''}">
                            </div>
                        `,
                        focusConfirm: false,
                        preConfirm: () => {
                            const selectedProductId = document.getElementById('swal-input-product').value;
                            const monto = document.getElementById('swal-input-monto').value;
                            const productOrMonto = selectedProductId || monto;
                            
                            return [
                                document.getElementById('swal-input1').value,
                                document.getElementById('swal-input2').value,
                                document.getElementById('swal-input3').value,
                                document.getElementById('swal-input4').value,
                                document.getElementById('swal-input5').value,
                                productOrMonto
                            ];
                        }
                        
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const [id, message, from_text, to_text, valid_until, productOrMonto] = result.value;
                    
                            fetch(`http://localhost:3000/api/vouchers/${id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ 
                                    message, 
                                    from_text, 
                                    to_text, 
                                    valid_until, 
                                    productOrMonto
                                })
                            })
                            .then(response => response.json())
                            .then(data => {
                                console.log('Datos actualizados:', data);
                                Swal.fire('Actualizado', 'El gift card ha sido actualizado exitosamente.', 'success');
                            })
                            .catch(error => {
                                console.error('Error al actualizar el gift card:', error);
                                Swal.fire('Error', 'Hubo un error al actualizar el gift card.', 'error');
                            });
                        }
                    });
                    
    
                    // Agrega el código aquí, después de que el modal se haya mostrado
                    const montoInput = document.getElementById('swal-input-monto');
                    const productoSelect = document.getElementById('swal-input-product');
    
                    montoInput.addEventListener('input', () => {
                        if (montoInput.value.trim() !== '') {
                            productoSelect.disabled = true;
                        } else {
                            productoSelect.disabled = false;
                        }
                    });
    
                    productoSelect.addEventListener('change', () => {
                        if (productoSelect.value !== '') {
                            montoInput.disabled = true;
                        } else {
                            montoInput.disabled = false;
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Error al cargar los detalles del gift card:', error);
            });
    };
    

    // Cargar los gift cards al inicio
    fetchGiftCards();
});

