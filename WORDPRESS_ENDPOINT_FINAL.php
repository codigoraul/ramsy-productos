<?php
/**
 * VERSIÓN FINAL - Usa redirección con parámetros
 * Copia este código al functions.php
 */

// Endpoint para recibir productos y generar URL de redirección
add_action('rest_api_init', function () {
    register_rest_route('ramsy/v1', '/add-to-cart', array(
        'methods' => 'POST',
        'callback' => 'ramsy_prepare_cart_redirect',
        'permission_callback' => '__return_true'
    ));
});

function ramsy_prepare_cart_redirect($request) {
    try {
        // Verificar WooCommerce
        if (!function_exists('wc_get_checkout_url')) {
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

        // Crear URL personalizada para agregar productos
        $redirect_url = home_url('/ramsy-add-to-cart/');
        $product_data = base64_encode(json_encode($products));
        $redirect_url = add_query_arg('products', $product_data, $redirect_url);

        // Retornar URL de redirección
        return new WP_REST_Response(array(
            'success' => true,
            'redirect_url' => $redirect_url
        ), 200);
        
    } catch (Exception $e) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => $e->getMessage()
        ), 500);
    }
}

// Crear página virtual para agregar productos al carrito
add_action('init', function() {
    add_rewrite_rule('^ramsy-add-to-cart/?', 'index.php?ramsy_add_to_cart=1', 'top');
});

add_filter('query_vars', function($vars) {
    $vars[] = 'ramsy_add_to_cart';
    return $vars;
});

add_action('template_redirect', function() {
    if (get_query_var('ramsy_add_to_cart')) {
        // Obtener productos de la URL
        $product_data = isset($_GET['products']) ? $_GET['products'] : '';
        
        if (empty($product_data)) {
            wp_redirect(wc_get_cart_url());
            exit;
        }

        $products = json_decode(base64_decode($product_data), true);
        
        if (!is_array($products)) {
            wp_redirect(wc_get_cart_url());
            exit;
        }

        // Limpiar el carrito
        WC()->cart->empty_cart();

        // Agregar cada producto
        foreach ($products as $product) {
            if (isset($product['id']) && isset($product['quantity'])) {
                WC()->cart->add_to_cart(
                    intval($product['id']),
                    intval($product['quantity'])
                );
            }
        }

        // Redirigir al checkout
        wp_redirect(wc_get_checkout_url());
        exit;
    }
});

// CORS
add_action('init', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
}, 1);
