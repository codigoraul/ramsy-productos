<?php
/**
 * Plugin Name: Ramsy — Servicios CPT
 * Description: Custom Post Type "Servicios" con campos ACF expuestos en REST API para el frontend Astro.
 * Version: 1.0.0
 * Author: Ramsy
 *
 * INSTALACIÓN:
 * 1. Copiar este archivo a wp-content/plugins/ramsy-servicios/ramsy-servicios.php
 * 2. Activar el plugin desde el admin de WordPress
 *
 * 3. En ACF crear un grupo de campos "Servicios" con:
 *    - descripcion_corta (Área de texto) → se usa en las cards
 *    Asignar el grupo al Post Type = servicio
 *
 * 4. Al crear cada servicio en WP usar:
 *    - Título nativo        → nombre del servicio
 *    - Imagen destacada     → foto del servicio
 *    - descripcion_corta    → texto corto para las cards
 *
 * ENDPOINT REST API:
 *    GET /wp-json/wp/v2/servicios
 *    GET /wp-json/wp/v2/servicios?slug=tableros-de-faena
 *    GET /wp-json/wp/v2/servicios?per_page=4&orderby=menu_order&order=asc
 */

// Seguridad: no permitir acceso directo
if (!defined('ABSPATH')) {
    exit;
}

// ==========================================================================
// 1. REGISTRAR EL CPT
// ==========================================================================
add_action('init', function () {
    register_post_type('servicio', [
        'labels' => [
            'name'               => 'Servicios',
            'singular_name'      => 'Servicio',
            'add_new'            => 'Agregar servicio',
            'add_new_item'       => 'Agregar nuevo servicio',
            'edit_item'          => 'Editar servicio',
            'new_item'           => 'Nuevo servicio',
            'view_item'          => 'Ver servicio',
            'search_items'       => 'Buscar servicios',
            'not_found'          => 'No se encontraron servicios',
            'not_found_in_trash' => 'No hay servicios en la papelera',
            'menu_name'          => 'Servicios',
        ],
        'public'              => true,
        'show_in_rest'        => true,   // ← IMPORTANTE: habilita REST API
        'rest_base'           => 'servicios',
        'menu_icon'           => 'dashicons-hammer',
        'menu_position'       => 5,
        'supports'            => ['title', 'thumbnail', 'page-attributes'], // page-attributes da menu_order para ordenar
        'has_archive'         => false,
        'rewrite'             => ['slug' => 'servicios'],
    ]);
});

// ==========================================================================
// 2. EXPONER CAMPOS ACF EN LA REST API
// ==========================================================================
add_action('rest_api_init', function () {
    // Descripción corta
    register_rest_field('servicio', 'descripcion_corta', [
        'get_callback' => function ($post) {
            return get_field('descripcion_corta', $post['id']) ?: '';
        },
        'schema' => [
            'type'        => 'string',
            'description' => 'Descripción corta del servicio',
        ],
    ]);

    // Imagen destacada → URL directa (para no tener que hacer otro request)
    register_rest_field('servicio', 'imagen_url', [
        'get_callback' => function ($post) {
            $thumb_id = get_post_thumbnail_id($post['id']);
            if (!$thumb_id) return '';
            $img = wp_get_attachment_image_src($thumb_id, 'large');
            return $img ? $img[0] : '';
        },
        'schema' => [
            'type'        => 'string',
            'description' => 'URL de la imagen destacada en tamaño large',
        ],
    ]);
});

// ==========================================================================
// 3. CREAR SERVICIOS DE RELLENO AL ACTIVAR EL PLUGIN
// ==========================================================================
register_activation_hook(__FILE__, 'ramsy_servicios_seed');

function ramsy_servicios_seed() {
    // Registrar el CPT primero (necesario durante la activación)
    register_post_type('servicio', [
        'public'       => true,
        'show_in_rest' => true,
        'rest_base'    => 'servicios',
        'supports'     => ['title', 'thumbnail', 'page-attributes'],
    ]);

    $servicios = [
        [
            'titulo'      => 'Servicios e instalaciones',
            'descripcion' => 'Diseño y armado de tableros eléctricos. Armado de cables automotriz y de instrumentación y control.',
            'orden'       => 1,
        ],
        [
            'titulo'      => 'Tableros de faena',
            'descripcion' => 'Tableros de faena metálica y tableros de faena externos para operaciones industriales exigentes.',
            'orden'       => 2,
        ],
        [
            'titulo'      => 'Tableros neumáticos',
            'descripcion' => 'Diseño, armado e instalación de tableros electroneumáticos para sistemas de control industrial.',
            'orden'       => 3,
        ],
        [
            'titulo'      => 'Armado de cables',
            'descripcion' => 'Armado de cables automotriz para maquinaria. Armado de cables de instrumentación y señales.',
            'orden'       => 4,
        ],
    ];

    foreach ($servicios as $servicio) {
        // No duplicar si ya existe
        $existe = get_posts([
            'post_type'  => 'servicio',
            'title'      => $servicio['titulo'],
            'numberposts' => 1,
        ]);

        if (!empty($existe)) continue;

        $post_id = wp_insert_post([
            'post_type'   => 'servicio',
            'post_title'  => $servicio['titulo'],
            'post_status' => 'publish',
            'menu_order'  => $servicio['orden'],
        ]);

        if ($post_id && !is_wp_error($post_id)) {
            // Usar update_post_meta directamente (no depende de ACF en activación)
            update_post_meta($post_id, 'descripcion_corta', $servicio['descripcion']);
        }
    }
}
