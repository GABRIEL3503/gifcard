document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('voucherForm');
    const productSelect = document.getElementById('productSelect');

    // Función para cargar los productos al inicio
    function fetchProducts() {
        fetch('/api/productos')
            .then(response => response.json())
            .then(products => {
                // Asegúrate de vaciar el select antes de añadir nuevas opciones
                productSelect.innerHTML = '';
                // Añade una opción por defecto
                productSelect.appendChild(new Option('Seleccione un producto', ''));
                // Carga todos los productos en el select
                products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.id;
                    option.textContent = product.nombre;
                    productSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar productos:', error));
    }

    // Evento que se dispara cuando se selecciona un producto
    productSelect.addEventListener('change', function() {
        // Actualiza el atributo 'data-selected-product-id' con el valor seleccionado
        form.dataset.selectedProductId = this.value;
    });

    // Manejo del evento de envío del formulario
    form.addEventListener('submit', function(event) {
        event.preventDefault();
    
        // Recopila los valores del formulario
        const from = form.from.value;
        const to = form.to.value;
        const message = form.gift.value;
        const productId = productSelect.value;
        const monto = document.getElementById('montoProducto').value;
    
        let product_id = null, montoValue = null;
        if (productId !== '' && !monto) {
            product_id = productId;
        } else if (monto && productId === '') {
            montoValue = monto;
        }
    
        // Construye el cuerpo de la petición
        const requestData = {
            from_text: from,
            to_text: to,
            message: message,
            product_id: product_id,
            monto: montoValue
        };
    
        // Asume que estás actualizando un voucher existente
        const voucherId = 'id_del_voucher'; // Sustituye esto con el ID real del voucher
    
        // Enviar la petición al servidor
        fetch(`/api/vouchers/${voucherId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Voucher actualizado:', data);
            alert('Voucher actualizado exitosamente!');
            form.reset(); // Limpiar el formulario después de la actualización exitosa
        })
        .catch(error => {
            console.error('Error al actualizar el voucher:', error);
            alert('Hubo un error al actualizar el voucher.');
        });
    });
    
    const montoProductoField = document.getElementById('montoProducto');

    // Evento que se dispara cuando se escribe en el campo de monto
    montoProductoField.addEventListener('input', function() {
        if (this.value !== '') {
            productSelect.disabled = true;
            productSelect.value = ''; // Resetea el selector de productos
        } else {
            productSelect.disabled = false;
        }
    });

    // Evento que se dispara cuando se selecciona un producto
    productSelect.addEventListener('change', function() {
        if (this.value !== '') {
            montoProductoField.disabled = true;
            montoProductoField.value = ''; // Resetea el campo de monto
        } else {
            montoProductoField.disabled = false;
        }
    });

    // Carga los productos cuando el DOM esté completamente cargado
    fetchProducts();
});

// Añade un listener al selector de productos
productSelect.addEventListener('change', updateProductField);

