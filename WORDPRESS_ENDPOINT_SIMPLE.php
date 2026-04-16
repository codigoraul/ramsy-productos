<?php
/**
 * VERSIÓN SIMPLIFICADA - Copia este código completo al functions.php
 */

// Endpoint para agregar productos al carrito
add_action('rest_api_init', function () {
    register_rest_route('ramsy/v1', '/add-to-cart', array(
        'methods' => 'POST',
        'callback' => 'ramsy_add_to_cart_simple',
        'permission_callback' => '__return_true'
    ));
});

function ramsy_add_to_cart_simple($request) {
    try {
        // Verificar WooCommerce
        if (!class_exists('WooCommerce')) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'WooCommerce no está activo'
            ), 500);
        }

        // Obtener productos
        $products = $request->get_json_params();
        
        if (empty($products)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No se enviaron productos'
            ), 400);
        }

        // Construir URL con productos para agregar al carrito
        $cart_url = wc_get_cart_url();
        $params = array();
        
        foreach ($products as $product) {
            if (isset($product['id']) && isset($product['quantity'])) {
                $params[] = 'add-to-cart=' . intval($product['id']);
                $params[] = 'quantity=' . intval($product['quantity']);
            }
        }
        
        $redirect_url = $cart_url . '?' . implode('&', $params);
        
        // Retornar URL de redirección
        return new WP_REST_Response(array(
            'success' => true,
            'checkout_url' => wc_get_checkout_url(),
            'cart_url' => $redirect_url
        ), 200);
        
    } catch (Exception $e) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => $e->getMessage()
        ), 500);
    }
}

// CORS
add_action('init', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
});
