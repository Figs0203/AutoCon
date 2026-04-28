import json

class DebugFullRequestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print("\n" + "="*60)
        print(f"DEBUGGER COMPLETO - {request.method} en {request.path}")
        
        # 1. Atributos de Identificación y Seguridad
        print(f"\n[IDENTIDAD]")
        print(f"  request.user: {request.user}")
        print(f"  request.user.is_authenticated: {request.user.is_authenticated}")
        print(f"  request.scheme (HTTP/S): {request.scheme}")
        print(f"  request.META.get('REMOTE_ADDR') (ip cliente): {request.META.get('REMOTE_ADDR')}")

        # 2. Atributos de URL y Parámetros
        print(f"\n[RUTAS Y PARÁMETROS]")
        print(f"  request.get_full_path(): {request.get_full_path()}")
        print(f"  request.GET (Query Params): {dict(request.GET)}")

        # 3. Atributos de Contenido (Headers y Body)
        print(f"\n[CONTENIDO]")
        print(f"  request.content_type: {request.content_type}")
        print(f"  request.headers (Principales):")
        print(f"    - Auth: {request.headers.get('Authorization', 'N/A')}")
        print(f"    - User-Agent: {request.headers.get('User-Agent')}")
        
        # 4. Archivos (Importante para tus reportes con fotos)
        if request.FILES:
            print(f"\n[ARCHIVOS DETECTADOS] request.FILES")
            for name, file in request.FILES.items():
                print(f"  - Campo: {name}, Nombre: {file.name}, Tamaño: {file.size} bytes")

        # 5. Cuerpo (Body)
        if request.content_type == 'application/json' and request.body:
            try:
                print(f"\n[BODY JSON] request.body:")
                print(json.dumps(json.loads(request.body), indent=2))
            except:
                print(f"\n[BODY RAW] request.body: {request.body[:200]}...")

        print("\n" + "="*60 + "\n")

        return self.get_response(request)