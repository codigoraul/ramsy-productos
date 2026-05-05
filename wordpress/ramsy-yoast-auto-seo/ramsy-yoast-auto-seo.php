<?php
/**
 * Plugin Name: Ramsy — Yoast SEO Auto-fill para Productos
 * Plugin URI:  https://ramsy.cl
 * Description: Rellena automáticamente los campos de Yoast SEO al guardar un producto WooCommerce. Solo actúa si el campo está vacío; nunca sobreescribe ediciones manuales.
 * Version:     1.3.0
 * Author:      Ramsy
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'RAMSY_SEO_SITE_NAME', 'RAMSY' );
define( 'RAMSY_SEO_SUFFIX',    'Instrumentación y Electrónica Industrial Chile' );
define( 'RAMSY_SEO_SEP',       ' | ' );
define( 'RAMSY_SEO_DESC_MAX',  155 );

/**
 * Prioridad 999 = corre MUY TARDE en save_post,
 * después de que Yoast ya guardó (o borró) los campos del formulario.
 * Así podemos rellenar los que quedaron vacíos.
 */
add_action( 'save_post', 'ramsy_yoast_auto_fill', 999, 2 );

function ramsy_yoast_auto_fill( $post_id, $post ) {

    // Solo productos
    if ( ! isset( $post->post_type ) || $post->post_type !== 'product' ) {
        return;
    }

    // Evitar auto-saves y revisiones
    if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
        return;
    }

    // Yoast debe estar activo
    if ( ! defined( 'WPSEO_VERSION' ) ) {
        return;
    }

    // Necesitamos WooCommerce
    if ( ! function_exists( 'wc_get_product' ) ) {
        return;
    }

    $product = wc_get_product( $post_id );
    if ( ! $product ) {
        return;
    }

    // ── Datos del producto ────────────────────────────────────────────────
    $nombre     = $product->get_name();
    $desc_corta = wp_strip_all_tags( $product->get_short_description() );
    $desc_larga = wp_strip_all_tags( $product->get_description() );
    $texto_desc = $desc_corta ?: $desc_larga;

    $terms       = get_the_terms( $post_id, 'product_cat' );
    $primera_cat = ( ! empty( $terms ) && ! is_wp_error( $terms ) ) ? $terms[0]->name : '';

    $imagen_id  = $product->get_image_id();
    $imagen_url = $imagen_id ? wp_get_attachment_url( $imagen_id ) : '';

    // ── Valores generados ─────────────────────────────────────────────────
    $titulo_seo = $primera_cat
        ? $nombre . RAMSY_SEO_SEP . $primera_cat . RAMSY_SEO_SEP . RAMSY_SEO_SITE_NAME
        : $nombre . RAMSY_SEO_SEP . RAMSY_SEO_SITE_NAME . ' — ' . RAMSY_SEO_SUFFIX;

    $meta_desc = '';
    if ( $texto_desc ) {
        $meta_desc = mb_strlen( $texto_desc ) <= RAMSY_SEO_DESC_MAX
            ? $texto_desc
            : mb_substr( $texto_desc, 0, mb_strrpos( mb_substr( $texto_desc, 0, RAMSY_SEO_DESC_MAX - 1 ), ' ' ) ) . '…';
    }

    $keyphrase = strtolower( $primera_cat ? "$nombre $primera_cat" : $nombre );
    $canonical = 'https://ramsy.cl/productos/' . $product->get_slug();

    // ── Guardar solo si vacío ─────────────────────────────────────────────
    $campos = [
        '_yoast_wpseo_focuskw'               => $keyphrase,
        '_yoast_wpseo_title'                 => $titulo_seo,
        '_yoast_wpseo_metadesc'              => $meta_desc,
        '_yoast_wpseo_canonical'             => $canonical,
        '_yoast_wpseo_opengraph-title'       => $titulo_seo,
        '_yoast_wpseo_opengraph-description' => $meta_desc,
        '_yoast_wpseo_twitter-title'         => $titulo_seo,
        '_yoast_wpseo_twitter-description'   => $meta_desc,
    ];

    if ( $imagen_url ) {
        $campos['_yoast_wpseo_opengraph-image'] = $imagen_url;
        $campos['_yoast_wpseo_twitter-image']   = $imagen_url;
    }

    foreach ( $campos as $meta_key => $valor ) {
        if ( empty( $valor ) ) {
            continue;
        }
        $actual = get_post_meta( $post_id, $meta_key, true );
        if ( empty( $actual ) ) {
            update_post_meta( $post_id, $meta_key, $valor );
        }
    }
}


// ── Exponer yoast_head en la API REST de WooCommerce ─────────────────────────

add_action( 'rest_api_init', function () {
    if ( ! function_exists( 'YoastSEO' ) ) {
        return;
    }

    register_rest_field( 'product', 'yoast_head', [
        'get_callback' => function ( $data ) {
            try {
                $surface = YoastSEO()->classes->get( \Yoast\WP\SEO\Surfaces\Meta_Surface::class );
                $meta    = $surface ? $surface->for_post( $data['id'] ) : null;
                return $meta ? $meta->get_head()->html : null;
            } catch ( \Exception $e ) {
                return null;
            }
        },
        'schema' => [ 'type' => 'string', 'context' => [ 'view' ], 'readonly' => true ],
    ] );

    register_rest_field( 'product', 'yoast_head_json', [
        'get_callback' => function ( $data ) {
            try {
                $surface = YoastSEO()->classes->get( \Yoast\WP\SEO\Surfaces\Meta_Surface::class );
                $meta    = $surface ? $surface->for_post( $data['id'] ) : null;
                return $meta ? ( $meta->get_head()->json ?? null ) : null;
            } catch ( \Exception $e ) {
                return null;
            }
        },
        'schema' => [ 'type' => 'object', 'context' => [ 'view' ], 'readonly' => true ],
    ] );
} );
