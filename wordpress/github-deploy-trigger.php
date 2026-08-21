<?php
/**
 * Ramsy — Disparador de deploy en GitHub Actions
 *
 * Avisa a GitHub cada vez que se edita un producto o contenido, para que
 * reconstruya y publique el sitio estatico de /prueba sin esperar el cron horario.
 *
 * INSTALACION
 * 1. Pega el token en wp-config.php (ANTES de la linea "That's all, stop editing"):
 *
 *      define( 'RAMSY_GITHUB_TOKEN', 'ghp_tu_token_aqui' );
 *
 * 2. Sube este archivo a wp-content/mu-plugins/github-deploy-trigger.php
 *
 * El token NUNCA debe ir en este archivo ni subirse al repositorio.
 *
 * IMPORTANTE: el workflow deploy.yml debe tener este disparador agregado:
 *
 *   repository_dispatch:
 *     types: [wp-content-updated]
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'RAMSY_GITHUB_REPO' ) ) {
	define( 'RAMSY_GITHUB_REPO', 'codigoraul/ramsy-productos' );
}

if ( ! defined( 'RAMSY_GITHUB_EVENT' ) ) {
	define( 'RAMSY_GITHUB_EVENT', 'wp-content-updated' );
}

/**
 * Envia el repository_dispatch a GitHub.
 */
function ramsy_github_dispatch_now() {
	if ( ! defined( 'RAMSY_GITHUB_TOKEN' ) || ! RAMSY_GITHUB_TOKEN ) {
		error_log( '[Ramsy deploy] Falta RAMSY_GITHUB_TOKEN en wp-config.php — no se disparo el deploy.' );
		return;
	}

	$response = wp_remote_post(
		'https://api.github.com/repos/' . RAMSY_GITHUB_REPO . '/dispatches',
		array(
			'timeout'  => 20,
			'blocking' => false, // No hacer esperar al usuario a que WordPress termine de cargar.
			'headers'  => array(
				'Accept'               => 'application/vnd.github+json',
				'Authorization'        => 'Bearer ' . RAMSY_GITHUB_TOKEN,
				'X-GitHub-Api-Version' => '2022-11-28',
				'Content-Type'         => 'application/json',
				'User-Agent'           => 'ramsy-wp-webhook',
			),
			'body'     => wp_json_encode(
				array(
					'event_type'     => RAMSY_GITHUB_EVENT,
					'client_payload' => array(
						'source' => 'wordpress',
						'time'   => current_time( 'mysql' ),
					),
				)
			),
		)
	);

	if ( is_wp_error( $response ) ) {
		error_log( '[Ramsy deploy] Error de conexion: ' . $response->get_error_message() );
		return;
	}

	$code = wp_remote_retrieve_response_code( $response );

	// GitHub responde 204 No Content cuando acepta el dispatch (o vacio si 'blocking' => false).
	if ( 204 === $code || '' === $code ) {
		error_log( '[Ramsy deploy] Deploy lanzado correctamente en GitHub Actions.' );
	} else {
		error_log( '[Ramsy deploy] GitHub respondio ' . $code . ': ' . wp_remote_retrieve_body( $response ) );
	}
}
add_action( 'ramsy_github_deploy_event', 'ramsy_github_dispatch_now' );

/**
 * Marca que hay un deploy pendiente para esta peticion. El envio real ocurre
 * en 'shutdown', que corre siempre al final de la peticion en la que guardas,
 * sin depender de WP-Cron ni de que alguien visite el sitio despues.
 */
function ramsy_github_schedule_deploy() {
	if ( get_transient( 'ramsy_github_deploy_sent_recently' ) ) {
		return; // Evita disparar 5 veces si guardas varias cosas seguidas en segundos.
	}
	set_transient( 'ramsy_github_deploy_sent_recently', 1, 30 );
	$GLOBALS['ramsy_github_deploy_needed'] = true;
}

add_action(
	'shutdown',
	function () {
		if ( ! empty( $GLOBALS['ramsy_github_deploy_needed'] ) ) {
			ramsy_github_dispatch_now();
		}
	}
);

/**
 * Decide si el guardado de un post merece reconstruir el sitio.
 */
function ramsy_github_on_save_post( $post_id, $post = null ) {
	if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	$post_type = $post ? $post->post_type : get_post_type( $post_id );

	$tipos = array( 'product', 'product_variation', 'page', 'post', 'servicio' );

	if ( ! in_array( $post_type, $tipos, true ) ) {
		return;
	}

	ramsy_github_schedule_deploy();
}

// Productos de WooCommerce.
add_action( 'woocommerce_update_product', 'ramsy_github_schedule_deploy' );
add_action( 'woocommerce_new_product', 'ramsy_github_schedule_deploy' );
add_action( 'woocommerce_product_set_stock', 'ramsy_github_schedule_deploy' );
add_action( 'woocommerce_variation_set_stock', 'ramsy_github_schedule_deploy' );

// Contenido general y papelera.
add_action( 'save_post', 'ramsy_github_on_save_post', 10, 2 );
add_action( 'trashed_post', 'ramsy_github_on_save_post' );
add_action( 'untrashed_post', 'ramsy_github_on_save_post' );

/**
 * Boton manual: WooCommerce → Publicar sitio.
 * Util para forzar un deploy sin editar nada.
 */
function ramsy_github_admin_menu() {
	add_submenu_page(
		'woocommerce',
		'Publicar sitio',
		'Publicar sitio',
		'manage_woocommerce',
		'ramsy-publicar-sitio',
		'ramsy_github_admin_page'
	);
}
add_action( 'admin_menu', 'ramsy_github_admin_menu' );

function ramsy_github_admin_page() {
	if ( isset( $_POST['ramsy_deploy'] ) && check_admin_referer( 'ramsy_deploy_now' ) ) {
		ramsy_github_dispatch_now();
		echo '<div class="notice notice-success"><p>Deploy solicitado. El sitio se actualiza en unos minutos.</p></div>';
	}

	echo '<div class="wrap"><h1>Publicar sitio</h1>';
	echo '<p>Lanza manualmente la reconstruccion del sitio estatico en GitHub Actions.</p>';
	echo '<form method="post">';
	wp_nonce_field( 'ramsy_deploy_now' );
	echo '<p><button type="submit" name="ramsy_deploy" class="button button-primary">Publicar ahora</button></p>';
	echo '</form></div>';
}
