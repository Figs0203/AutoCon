# AutoCon - Sistema de Control Automatizado

Aplicación full-stack con backend Django REST Framework y frontend React Native (Expo).

## 📁 Estructura del Proyecto

```
P2/
├── autocon-server/           # Backend Django
└── autocon-mobile/    # Frontend React Native
```

## Setup del Proyecto

### Prerrequisitos

- Python 3.8+
- Node.js 18+
- npm o yarn
- Git

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/autocon.git
cd autocon
```

### 2. Setup del Backend (Django)

```bash
cd autocon-server

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Iniciar servidor de desarrollo
python manage.py runserver
```

El backend estará disponible en `http://localhost:8000`

### 3. Setup del Frontend (React Native)

```bash
cd autocon-mobile

# Instalar dependencias
npm install

# Iniciar Expo
npx expo start
```

Opciones para ejecutar la app:
- Presiona `i` para iOS Simulator
- Presiona `a` para Android Emulator
- Escanea el QR con Expo Go en tu dispositivo móvil

## Configuración

### Backend

Edita [`AutoCon/backend/settings.py`](AutoCon/backend/settings.py) según necesites:

```python
# Configuración de CORS
CORS_ALLOW_ALL_ORIGINS = True  # Cambiar en producción

# Base de datos
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Frontend

La configuración de la app está en [`autocon-mobile/app.json`](autocon-mobile/app.json).

Para conectar con el backend, actualiza la URL del API en tu código:

```typescript
// Desarrollo local
const API_URL = 'http://localhost:8000';

// Usando dispositivo físico
const API_URL = 'http://TU_IP_LOCAL:8000';
```

## Endpoints Disponibles

### Backend API

- `GET /users/test/` - Endpoint de prueba
- `GET /admin/` - Panel de administración de Django

## Tecnologías

### Backend
- Django 6.0
- Django REST Framework
- SQLite
- CORS Headers

### Frontend
- React Native
- Expo SDK ~54.0
- React Navigation
- TypeScript
- Reanimated

## Scripts Disponibles

### Backend
```bash
python manage.py runserver    # Iniciar servidor
python manage.py migrate       # Ejecutar migraciones
python manage.py makemigrations  # Crear migraciones
python manage.py test          # Ejecutar tests
```

### Frontend
```bash
npm start                    # Iniciar Expo
npm run android             # Ejecutar en Android
npm run ios                 # Ejecutar en iOS
npm run web                 # Ejecutar en navegador
npm run lint                # Ejecutar linter
npm run reset-project       # Resetear proyecto
```

## Seguridad

**Importante:** Antes de subir a producción:

1. Cambia `SECRET_KEY` en [`backend/settings.py`](AutoCon/backend/settings.py)
2. Establece `DEBUG = False`
3. Configura `ALLOWED_HOSTS` apropiadamente
4. Actualiza `CORS_ALLOW_ALL_ORIGINS` a dominios específicos
5. Usa variables de entorno para información sensible

##  Licencia

[Especifica tu licencia aquí]

##  Contribuidores

[Tu nombre y contacto]