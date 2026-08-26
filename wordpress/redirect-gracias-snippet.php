<?php
/**
 * Snippet para Code Snippets (WordPress) — "Ejecutar en todas partes".
 *
 * Redirige la página de "Pedido recibido" de WooCommerce hacia la página
 * de gracias del frontend headless (ramsy.cl/gracias), pasando el
 * número de pedido como ?pedido=ID.
 *
 * IMPORTANTE: desplegar primero el frontend (que exista /gracias)
 * ANTES de activar este snippet, o el cliente caerá en un 404.
 *
 * NO va al repo: se pega dentro de Code Snippets. Este archivo es solo
 * referencia/documentación.
 */
add_action('template_redirect', function () {
    if (function_exists('is_wc_endpoint_url') && is_wc_endpoint_url('order-received')) {
        global $wp;
        $order_id = isset($wp->query_vars['order-received']) ? absint($wp->query_vars['order-received']) : 0;
        $suffix   = $order_id ? ('?pedido=' . $order_id) : '';
        wp_redirect('https://ramsy.cl/gracias' . $suffix);
        exit;
    }
});
