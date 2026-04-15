# Configuración de WordPress/WooCommerce para integración con Astro

## 1. Plugins necesarios

### Instalar y activar:
1. **WooCommerce** - Plugin principal de e-commerce
2. **Transbank Webpay Plus** - Plugin oficial de Transbank para Chile
   - Descargar desde: https://wordpress.org/plugins/transbank-webpay-plus-rest/
   - O buscar "Transbank Webpay Plus" en el directorio de plugins de WordPress

### Configuración de Transbank WebPay Plus:

1. Ve a **WooCommerce → Ajustes → Pagos**
2. Activa **Transbank Webpay Plus**
3. Haz clic en **Administrar** para configurar:
   - **Entorno**: Selecciona "Integración" para pruebas o "Producción" para ambiente real
   - **Código de comercio**: Ingresa tu código de comercio (proporcionado por Transbank)
   - **API Key**: Ingresa tu API Key (proporcionada por Transbank)
   - **Habilitar pago**: Marca la casilla para activar el método de pago

#### Credenciales de prueba (Integración):
```
Código de comercio: 597055555532
API Key: 579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
```

## 2. Configuración de WooCommerce

### Páginas necesarias:
Asegúrate de que WooCommerce haya creado estas páginas:
- **Tienda** (`/tienda` o `/shop`)
- **Carrito** (`/carrito` o `/cart`)
- **Finalizar compra** (`/checkout`)
- **Mi cuenta** (`/mi-cuenta` o `/my-account`)

### Configuración de checkout:
1. Ve a **WooCommerce → Ajustes → Avanzado → Checkout**
2. Asegúrate de que la página de checkout esté configurada correctamente

## 3. Configuración de productos

### Cada producto debe tener:
- **ID del producto** (se usa para agregar al carrito)
- **Precio** configurado
- **Stock** habilitado y con cantidad disponible
- **Estado**: Publicado

## 4. Flujo de integración Astro → WooCommerce

### Opción actual implementada (Más simple):

1. **Usuario agrega productos en Astro** → Se guardan en localStorage
2. **Usuario hace clic en "Pagar con WebPay Plus"** → Se redirige a `/checkout` de WordPress
3. **WordPress recibe los productos vía URL** → Los agrega al carrito de WooCommerce
4. **Usuario completa datos de envío/facturación** → En el checkout de WooCommerce
5. **Usuario selecciona WebPay Plus** → Como método de pago
6. **Transbank procesa el pago** → Redirige a su pasarela
7. **Usuario completa el pago** → En la pasarela de Transbank
8. **Transbank confirma** → Redirige de vuelta a WooCommerce
9. **WooCommerce confirma la orden** → Envía email de confirmación

### Alternativa avanzada (Requiere más configuración):

Si quieres crear la orden directamente desde Astro usando la API de WooCommerce:

1. Usa el archivo `src/lib/checkout.js` que se creó
2. Implementa un formulario de datos del cliente en Astro
3. Crea la orden vía API REST de WooCommerce
4. Redirige al usuario a la URL de pago de la orden creada

## 5. URLs importantes

### Desarrollo local:
```
WordPress: http://localhost:10033
Checkout: http://localhost:10033/checkout
Admin: http://localhost:10033/wp-admin
```

### Producción:
```
WordPress: https://tudominio.cl
Checkout: https://tudominio.cl/checkout
Admin: https://tudominio.cl/wp-admin
```

## 6. Testing del flujo de pago

### Para probar en ambiente de integración:

1. Agrega productos al carrito en Astro
2. Haz clic en "Pagar con WebPay Plus"
3. Completa los datos de envío en WooCommerce
4. Selecciona "Transbank Webpay Plus" como método de pago
5. Haz clic en "Realizar pedido"
6. Serás redirigido a la pasarela de prueba de Transbank

### Tarjetas de prueba de Transbank:

**Tarjeta de débito exitosa:**
```
Número: 4051885600446623
CVV: 123
Fecha de vencimiento: Cualquier fecha futura
RUT: 11.111.111-1
Clave: 123
```

**Tarjeta de crédito exitosa:**
```
Número: 4051885600446623
CVV: 123
Fecha de vencimiento: Cualquier fecha futura
```

## 7. Configuración de CORS (si es necesario)

Si Astro y WordPress están en dominios diferentes, necesitarás configurar CORS en WordPress.

Agrega esto a tu `functions.php`:

```php
// Permitir CORS para Astro
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $value;
    });
}, 15);
```

## 8. Seguridad en producción

### Importante:
1. **Usa HTTPS** en producción (obligatorio para Transbank)
2. **Protege tus credenciales** de Transbank (nunca las expongas en el frontend)
3. **Valida las transacciones** en el backend antes de confirmar órdenes
4. **Configura webhooks** de Transbank para recibir confirmaciones de pago

## 9. Troubleshooting

### Problema: Los productos no se agregan al carrito de WooCommerce
**Solución**: Verifica que los IDs de productos sean correctos y que los productos estén publicados

### Problema: Error 401 en la API de WooCommerce
**Solución**: Verifica las credenciales de la API REST en el archivo `.env`

### Problema: Transbank no aparece como opción de pago
**Solución**: 
- Verifica que el plugin esté activado
- Verifica que esté habilitado en WooCommerce → Ajustes → Pagos
- Verifica que las credenciales estén configuradas correctamente

### Problema: El pago se rechaza en Transbank
**Solución**: 
- Verifica que estés usando las tarjetas de prueba correctas
- Verifica que el ambiente esté en "Integración" para pruebas
- Revisa los logs de Transbank en WooCommerce → Estado → Registros

## 10. Próximos pasos recomendados

1. **Implementar sincronización de stock** entre Astro y WooCommerce
2. **Agregar tracking de órdenes** para que los usuarios vean el estado de sus pedidos
3. **Implementar emails personalizados** para confirmaciones de pago
4. **Agregar cálculo de envío** basado en ubicación del cliente
5. **Implementar sistema de cupones** de descuento
