# Y2K STREET HUB

Sistema de productividad personal: tareas, calendario, notas y configuración, con
estética Y2K/chrome. React + Vite + Tailwind 4, con **Supabase** (Postgres + Auth)
como backend y deploy en **Vercel**.

Antes los datos vivían en `localStorage`. Ahora cada persona tiene cuenta propia y sus
datos viajan con ella entre dispositivos.

---

## 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) → **New project** (el plan free alcanza).
2. Elegí una contraseña para la base y una región cercana. Tarda ~2 minutos en levantar.
3. Cuando esté listo, abrí **SQL Editor → New query**, pegá **todo** el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**.

Eso crea las tablas `tasks`, `events`, `notes` y `settings`, y activa **Row Level
Security** con políticas que atan cada fila a su dueño. El script es idempotente:
podés volver a correrlo sin romper nada.

> Sin RLS, cualquiera con la clave pública podría leer los datos de todos. No lo saltees.

## 2. Copiar las credenciales

En **Project Settings → Data API** está la **Project URL**, y en **Project Settings →
API Keys** la clave **anon / public**.

Creá un archivo `.env.local` en la raíz del proyecto (se ignora en git):

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

Hay una plantilla en [`.env.example`](.env.example).

> Las dos son públicas por diseño: quedan dentro del bundle que descarga el navegador.
> Lo que protege los datos es RLS, no el secreto de estas claves. La `service_role` key,
> en cambio, **nunca** va en el frontend.

## 3. Ajustar el login

En **Authentication → Providers → Email** decidís cómo entra la gente:

- **Confirm email activado** (por defecto): más seguro, pero hay que confirmar el mail
  antes del primer acceso. El plan free manda pocos mails por hora; para uso propio,
  conviene configurar SMTP o desactivarlo.
- **Confirm email desactivado**: la cuenta queda usable al instante. Cómodo para
  probar y para un hub personal.

En **Authentication → URL Configuration**, poné tu dominio de Vercel como **Site URL**
una vez que hayas desplegado. Si no, los links de confirmación apuntan a `localhost`.

## 4. Correr en local

```bash
npm install
npm run dev
```

La primera vez que entres con una cuenta nueva, la app siembra el contenido de ejemplo.
Si ese navegador ya tenía datos de la versión vieja en `localStorage`, los migra a tu
cuenta en lugar de sembrar.

## 5. Subir a GitHub

El repo ya está inicializado con el primer commit. Falta crear el remoto:

1. Creá un repositorio **vacío** en [github.com/new](https://github.com/new) (sin
   README, sin `.gitignore`).
2. Conectalo y publicá:

```bash
git remote add origin https://github.com/TU-USUARIO/y2k-street-hub.git
git branch -M main
git push -u origin main
```

Si el autor de los commits quedó mal, corregilo con:

```bash
git config user.name "Tu Nombre"
git config user.email "tu@mail.com"
```

## 6. Desplegar en Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new) y **importá** el repo de GitHub.
2. Vercel detecta Vite solo; la config ya está en [`vercel.json`](vercel.json)
   (build `npm run build`, salida `dist`, y rewrite de SPA para que las rutas no den 404).
3. En **Environment Variables** agregá las mismas dos de `.env.local`:

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | tu anon key |

   Marcalas para **Production, Preview y Development**.
4. **Deploy**.

> Vite inyecta las variables `VITE_*` **en tiempo de build**. Si las agregás o cambiás
> después, hay que **redeploy** para que tengan efecto.

Desde ahí, cada `git push` a `main` redespliega solo.

Último paso: volvé a Supabase → **Authentication → URL Configuration** y poné la URL de
Vercel como Site URL.

---

## Cómo está armado

| Archivo | Rol |
| --- | --- |
| `src/lib/supabase.ts` | Crea el cliente; detecta si faltan las variables de entorno. |
| `src/lib/auth.tsx` | Sesión, alta, login y logout. |
| `src/lib/remote.ts` | Mapea entre el modelo de la app y las filas de Postgres. |
| `src/lib/store.tsx` | Estado de la app: escribe optimista y persiste en Supabase. |
| `src/components/AuthGate.tsx` | Pantallas de login, arranque y setup faltante. |
| `supabase/schema.sql` | Tablas, índices y políticas RLS. |

Detalles que importan:

- **Escritura optimista.** La UI se actualiza al instante y la escritura sale en
  paralelo. Si falla, aparece un aviso abajo y el error queda en la consola.
- **Escrituras diferidas.** Escribir el cuerpo de una nota o el handle dispara un cambio
  por tecla; esas escrituras se agrupan cada 700 ms, y se fuerzan al cerrar la pestaña.
- **IDs del lado del cliente.** Se generan en el navegador, así la fila existe en la UI
  sin esperar al servidor. Por eso las tablas usan `text` como clave primaria.
- **`upsert` en vez de `update`** al guardar tareas y notas: si una escritura diferida
  llega antes que su insert, no se pierde el dato.

## Sobre SQLite

SQLite como archivo local **no funciona en Vercel**: el filesystem de las funciones
serverless es efímero, así que el `.db` se borraría en cada deploy y cada cold start, y
distintas requests pueden tocar instancias distintas. Si querés SQLite de verdad, la
alternativa alojada es [Turso](https://turso.tech) (libSQL), que sí persiste — pero no
trae auth incluida como Supabase.
