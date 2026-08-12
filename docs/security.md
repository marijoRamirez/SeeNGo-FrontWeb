# Auditoría de seguridad — SeeNGo Web (frontend)

Fecha: 2026-08-12
Alcance: `src/` del proyecto Angular (SSR, `outputMode: server`).

## 1. Problemas reportados y resuelto

### 1.1 Admin que pierde su rol al navegar
**Síntoma**: si un admin da "Regresar" (→ landing `/`) y luego entra a su perfil, se veía como cliente.

**Causa**: el menú de usuario de la landing tenía enlaces fijos a `/client/profile` y `/client/purchases` sin importar el rol, y no existían guardas de ruta.

**Solución**:
- `src/app/public/landing/landing.ts` / `landing.html`: el menú ahora es consciente del rol. Admin ve "Panel de administración" (`/admin/dashboard`); cliente ve "Mi perfil" y "Mis compras". El CTA del hero también se adapta (`/admin/dashboard` vs `/client/store`).
- `src/app/core/guards/auth.guard.ts`: `roleGuard` redirige a `/admin/dashboard` a un admin que intente rutas de cliente, y viceversa.

### 1.2 Volver con el botón "atrás" tras cerrar sesión
**Síntoma**: tras `logout`, el botón "atrás" del navegador devolvía al dashboard de cliente.

**Causa**: las rutas protegidas no tenían guardas; al navegar hacia atrás la ruta se renderizaba sin sesión.

**Solución**: `authGuard` en rutas `/admin/*` y `/client/*`. Sin sesión, cualquier navegación (incluida la del botón atrás/del historial) se redirige a `/login`.

## 2. Cambios aplicados en este frontend

| Archivo | Cambio |
| --- | --- |
| `src/app/core/services/auth.ts` | Parsing seguro de `user` del `localStorage` (try/catch + validación de forma, descarta JSON corrupto o incompleto). Nuevos métodos `isAuthenticated()`, `getUser()`, `clearSession()`, `handleSessionExpired()`. |
| `src/app/core/guards/auth.guard.ts` | Guardas funcionales `authGuard` y `roleGuard(...)`. En SSR devuelven `true` (la validación real ocurre en el cliente; el HTML servido no contiene datos sensibles). |
| `src/app/app.routes.ts` | `canActivate: [authGuard, roleGuard(['admin'])]` en `/admin` y `[authGuard, roleGuard(['client'])]` en `/client`. |
| `src/app/core/interceptors/auth.interceptor.ts` | Ante una respuesta HTTP `401` se limpia la sesión y se redirige a `/login` (inyección diferida de `AuthService` vía `Injector` para evitar dependencia circular). |
| `src/app/public/landing/*` | Menú de usuario y CTA con rol dinámico. |

## 3. Mejoras de rigor aplicadas
- Tests unitarios para `AuthService` (6) y para `authGuard`/`roleGuard` (5): casos autenticado, sin sesión, JSON corrupto, cruce de roles admin↔cliente. (También se repararon 2 tests preexistentes rotos: `app.spec.ts` y `login.spec.ts`).
- `npm test` → 25/25 exitosos; `npm run build` → OK, siguen prerenderizándose las 21 rutas estáticas.

## 4. Limitaciones del frontend (no se tocaron: dependen del backend)

Estos puntos **no pueden resolverse desde el frontend**. El backend (`apiUrl` en `src/environments/`) es la línea de confianza real.

1. **`localStorage` para el token y el rol** — almacenamiento vulnerable a XSS y **manipulable por el usuario** (puede editar `user.role` a `admin`). Los guards son barrera de UX; el backend **debe** autorizar cada endpoint leyendo el rol del JWT firmado y **rechazar con 403** a clientes que intenten rutas `/admin/*`. No confiar en nada que venga del cliente.
2. **Verificación de la sesión en cada petición** — el token se manda tal cual; si expiró, ahora el frontend limpia la sesión con el 401, pero la expiración/renovación de tokens debe estar bien configurada del lado servidor (expiración, `refresh token` opcional).
3. **`getMyProfile(userId)`/`updateProfile(userId)`/`cambiarPassword`** — el frontend manda el `id` del usuario. El backend no debe confiar en ese `id` para autorizar; debe usar el `id`/`sub` del token.
4. **`PATCH/PUT /users/{id}` con rol y datos** — confirmar que el rol no sea modificable por el propio usuario.
5. **`logout` no invalida el token** — no hay endpoint de revocación; el token sigue válido hasta su expiración. Considerar una lista negra o tiempo de expiración corto.
6. **Headers de seguridad / CSP** — servir con `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, CSP que no permita inyectar scripts (mitiga el XSS que comprometería el `localStorage`). Hay un `nginx.conf` y un `Dockerfile` en el repo: aplicar ahí los headers es el lugar correcto.
7. **Rate limiting, control de fuerza bruta en `/login`** y **validación/sanitización de inputs** — responsabilidad del backend (los formularios del front solo validan de forma básica).
8. **CORS** — configurar orígenes permitidos y credenciales explícitas; no usar `*`.
9. **HTTPS** — la URL de producción ya es HTTPS; mantener TLS para todo el tráfico.
10. **No exponer secretos** — confirmar que el token de producción y credenciales no queden en bundles ni logs.

## 5. Recomendaciones a futuro
- Migrar la sesión a cookie `httpOnly` + `Secure` (o `refresh token` en cookie) para sacar el token de `localStorage`.
- Añadir un `guestGuard` para que usuarios logueados no vean `/login` ni `/register`.
- Verificar con un escaneo estático (ZAP/Burp) los flujos de compra, cotización y reseñas (`crearVenta`, `crearResena`, `crearCotizacion`) para confirmar que el backend valida autorización por recurso.