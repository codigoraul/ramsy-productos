<?php
/**
 * VERSIÓN SIMPLIFICADA CON REDIRECCIÓN DIRECTA
 */

// Endpoint para recibir productos
add_action('rest_api_init', function () {
    register_rest_route('ramsy/v1', '/add-to-cart', array(
        'methods' => 'POST',
        'callback' => 'ramsy_prepare_cart_simple',
        'permission_callback' => '__return_true'
    ));
});

function ramsy_prepare_cart_simple($request) {
    try {
        if (!function_exists('wc_get_checkout_url')) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'WooCommerce no está activo'
            ), 500);
        }

        $products = $request->get_json_params();
        
        if (empty($products)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No se enviaron productos'
            ), 400);
        }

        // Guardar productos en una opción temporal
        $session_id = 'ramsy_cart_' . uniqid();
        set_transient($session_id, $products, 300); // 5 minutos

        // URL de redirección
        $redirect_url = add_query_arg(
            'ramsy_session',
            $session_id,
            home_url('/ramsy-checkout/')
        );

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

// Crear regla de reescritura
add_action('init', function() {
    add_rewrite_rule('^ramsy-checkout/?', 'index.php?ramsy_checkout=1', 'top');
});

add_filter('query_vars', function($vars) {
    $vars[] = 'ramsy_checkout';
    $vars[] = 'ramsy_session';
    return $vars;
});

// Procesar el checkout
add_action('template_redirect', function() {
    if (get_query_var('ramsy_checkout') == '1') {
        $session_id = get_query_var('ramsy_session');
        
        if (empty($session_id)) {
            wp_redirect(wc_get_cart_url());
            exit;
        }

        $products = get_transient($session_id);
        delete_transient($session_id);
        
        if (!$products || !is_array($products)) {
            wp_redirect(wc_get_cart_url());
            exit;
        }

        // IMPORTANTE: Forzar inicialización de sesión de WooCommerce
        if (!WC()->session || !WC()->session->has_session()) {
            WC()->session->set_customer_session_cookie(true);
        }

        // Limpiar carrito
        WC()->cart->empty_cart();

        // Agregar productos
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
