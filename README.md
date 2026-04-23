No deberian de tener que instalar nada ya que el encargado de eso es Docker.

Al momento de clonar el repo ejecuten el comando:

-- docker compose up --build -d

Esto les va a cargar todo el proyecto (postgres, react y express).

Luego cada vez que quieran trabajar en el codigo para levantar la API y base de datos utilicen la guia de abajo.

Guía rápida para arrancar el proyecto:

    Levantar todo: docker compose up (Agreguen --build si hay cambios en las librerías o el Dockerfile).

    Bajar los servicios: docker compose down (Esto apaga los contenedores y libera la memoria).

**TIENEN QUE ESTAR PARADOS EN /pedidos-ahora para poder ejecutar estos comandos**