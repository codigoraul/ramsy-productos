<?php

declare(strict_types=1);

return [
  // Subcarpeta donde vive el sitio. Vacío si está en la raíz, '/prueba' en el entorno de pruebas.
  'BASE_PATH' => '',
  'SITE_URL' => 'https://www.ramsy.cl',

  // Destinatarios del formulario (separados por coma si son varios).
  // Correos de prueba: se agregan codigoraul@gmail.com y ramsyspa29@gmail.com
  // ademas de contacto@ramsy.cl mientras se valida el envio.
  'TO_EMAIL' => 'contacto@ramsy.cl, codigoraul@gmail.com, ramsyspa29@gmail.com',

  'FROM_EMAIL' => 'contacto@ramsy.cl',
  'FROM_NAME' => 'Ramsy',
  'BCC_EMAILS' => '',
];
