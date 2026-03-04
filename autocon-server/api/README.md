# Endpoints de la API

El `DefaultRouter` definido en `api/urls.py` registra uno o dos *viewsets*.
Todos los URIs van bajo el prefijo que uses al incluir las URLs en el proyecto
(p. ej. `/api/forms/…`).

---

## Formularios

- `GET  /forms/`  
  devuelve la lista completa de formularios en la base de datos.

- `POST /forms/`  
  crea un formulario nuevo. En el cuerpo se deben enviar `name`,
  `description`, `list_of_questions` (array de cadenas) y `status`.

- `GET  /forms/{id}/`  
  obtiene un formulario específico por su clave primaria.

- `PUT  /forms/{id}/`  
  actualiza un formulario existente: se envía el objeto completo.

- `PATCH /forms/{id}/`  
  actualización parcial de un formulario.

- `DELETE /forms/{id}/`  
  borra un formulario.

Usa estos endpoints siempre que necesites leer o modificar el conjunto de
formularios que mostrará/rellenará el frontend.

---

## Preguntas

*(sólo si se mantiene el modelo `Question` y su viewset)*

- `GET  /questions/`  
  lista todas las preguntas; útil si las preguntas se reutilizan o se
  gestionan de forma independiente.

- `POST /questions/`  
  añade una nueva pregunta (texto).

- `GET  /questions/{id}/`  
  obtiene una pregunta concreta.

- `PUT/PATCH /questions/{id}/`  
  edita el texto u otros campos de una pregunta.

- `DELETE /questions/{id}/`  
  elimina una pregunta.

Estos endpoints permiten manipular directamente la tabla `Question`. Si las
preguntas son sólo cadenas dentro de un formulario, puedes eliminar este
viewset y esas rutas y tratarlas como parte del payload del formulario.

---

El router crea automáticamente esos caminos basándose en las clases
`ModelViewSet` de `api/views.py`; no se necesita otra configuración de URLs.
Asegúrate de haber hecho `path('api/', include('api.urls'))` en el
`urls.py` del proyecto para activarlos.