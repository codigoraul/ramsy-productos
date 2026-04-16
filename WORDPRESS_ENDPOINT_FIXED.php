<?php
/**
 * VERSIÓN MEJORADA - Reemplaza el código en functions.php con este
 */

// Endpoint para agregar productos al carrito
add_action('rest_api_init', function () {
    register_rest_route('ramsy/v1', '/add-to-cart', array(
        'methods' => 'POST',
        'callback' => 'ramsy_add_to_cart_fixed',
        'permission_callback' => '__return_true'
    ));
});

function ramsy_add_to_cart_fixed($request) {
    try {
        // Verificar WooCommerce
        if (!function_exists('WC')) {
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

        // Inicializar sesión y carrito de WooCommerce
        if (!WC()->session) {
            WC()->session = new WC_Session_Handler();
            WC()->session->init();
        }
        
        if (!WC()->cart) {
            wc_load_cart();
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
                $cart_item_key = WC()->cart->add_to_cart($product_id, $quantity);
                
                if ($cart_item_key) {
                    $added++;
                }
            }
        }

        // Guardar el carrito
        WC()->cart->calculate_totals();
        WC()->cart->maybe_set_cart_cookies();

        // Retornar respuesta
        return new WP_REST_Response(array(
            'success' => $added > 0,
            'added' => $added,
            'errors' => $errors,
            'checkout_url' => wc_get_checkout_url(),
            'cart_url' => wc_get_cart_url()
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
