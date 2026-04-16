<?php
/**
 * Endpoint personalizado para agregar múltiples productos al carrito de WooCommerce
 * 
 * INSTRUCCIONES:
 * 1. Copia este código al archivo functions.php de tu tema de WordPress
 * 2. O créalo como un plugin personalizado
 */

// Agregar endpoint personalizado para recibir productos del carrito de Astro
add_action('rest_api_init', function () {
    register_rest_route('ramsy/v1', '/add-to-cart', array(
        'methods' => 'POST',
        'callback' => 'ramsy_add_multiple_to_cart',
        'permission_callback' => '__return_true' // Permitir acceso público
    ));
});

function ramsy_add_multiple_to_cart($request) {
    // Verificar que WooCommerce esté activo
    if (!function_exists('WC')) {
        return new WP_Error('woocommerce_not_active', 'WooCommerce no está activo', array('status' => 500));
    }

    // Obtener los productos del request
    $products = $request->get_json_params();
    
    if (empty($products) || !is_array($products)) {
        return new WP_Error('invalid_data', 'Datos inválidos', array('status' => 400));
    }

    // Asegurarse de que la sesión de WooCommerce esté inicializada
    if (is_null(WC()->session)) {
        WC()->session = new WC_Session_Handler();
        WC()->session->init();
    }

    // Asegurarse de que el carrito esté inicializado
    if (is_null(WC()->cart)) {
        WC()->cart = new WC_Cart();
    }

    // Limpiar el carrito actual
    WC()->cart->empty_cart();

    // Agregar cada producto al carrito
    $added = 0;
    $errors = array();
    
    foreach ($products as $product) {
        if (isset($product['id']) && isset($product['quantity'])) {
            $product_id = intval($product['id']);
            $quantity = intval($product['quantity']);
            
            // Verificar que el producto exista
            $product_obj = wc_get_product($product_id);
            if (!$product_obj) {
                $errors[] = "Producto ID {$product_id} no encontrado";
                continue;
            }
            
            // Agregar al carrito
            try {
                $result = WC()->cart->add_to_cart($product_id, $quantity);
                
                if ($result) {
                    $added++;
                }
            } catch (Exception $e) {
                $errors[] = $e->getMessage();
            }
        }
    }

    // Retornar respuesta
    return array(
        'success' => $added > 0,
        'added' => $added,
        'errors' => $errors,
        'cart_url' => wc_get_cart_url(),
        'checkout_url' => wc_get_checkout_url()
    );
}

// Permitir CORS para desarrollo local
add_action('init', function() {
    // Permitir peticiones desde cualquier origen (desarrollo)
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    } else {
        header('Access-Control-Allow-Origin: *');
    }
    
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    
    // Manejar peticiones OPTIONS (preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
});

// También agregar CORS específico para la API REST
add_filter('rest_pre_serve_request', function($value) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    return $value;
}, 15);
