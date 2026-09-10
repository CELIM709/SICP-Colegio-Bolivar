# 🏫 SICP — Sistema Integral de Control de Pagos e Inscripciones Escolares

**Carrera:** Ingeniería en Informática  
**Asignatura:** Ingeniería de Software I  
**Institución:** U.E. Colegio Simón Bolívar  
**Alumna:** Celimar Rojas  
**Profesora:** Dubraska Roca  
**Metodología de Desarrollo:** Ágil (Scrum)  

---

## 📌 Descripción del Proyecto

El SICP es una plataforma web desarrollada para automatizar la gestión administrativa de la U.E. Colegio Simón Bolívar. El sistema permite a los representantes consultar estados de cuenta, cotizar aranceles a la tasa oficial del Banco Central de Venezuela (BCV) y reportar pagos bimonetarios (USD/VES) para múltiples estudiantes, mientras que el personal administrativo concilia y audita las transacciones bancarias de forma centralizada y eficiente.

---

## ✨ Funcionalidades Principales

*   **Portal del Representante:** Consulta de cuotas en USD con conversión automática a Bolívares (VES), imputación de un pago a varios estudiantes (1 a N), preinscripción en línea y descarga de solvencias en PDF.
*   **Panel de Administración:** Conciliación y validación de transferencias/pago móvil con visor de comprobante, directorio escolar y control de morosidad.
*   **Tasa BCV y Modo Contingencia:** Sincronización en tiempo real con la tasa oficial y activación automática de tasa de respaldo ante fallas de conexión.
*   **Seguridad y Recuperación:** Autenticación por roles con tokens temporales de recuperación de contraseña (expiración de 10 minutos).

---

## 👥 Credenciales de Demostración

La pantalla de inicio de sesión (`/login`) cuenta con botones de acceso rápido para pruebas:

| Rol | Correo Electrónico | Contraseña | Acceso / Funciones |
| :--- | :--- | :--- | :--- |
| **Representante** | `maria.delgado@email.com` | `demo1234` | Portal de pagos, preinscripciones y solvencias. |
| **Administrador** | `admin@colegiobolivar.edu.ve` | `admin1234` | Panel de conciliación de pagos y configuración. |

---

## 📂 Estructura del Proyecto

El código está organizado siguiendo la arquitectura modular de Next.js App Router:

```text
sicp-app/
├── app/                           # Páginas, rutas y vistas de la aplicación
│   ├── page.tsx                   # Página principal con cotizador rápido
│   ├── login/                     # Inicio de sesión con perfiles demo
│   ├── registro/                  # Registro de nuevos representantes
│   ├── recuperar-password/        # Formulario con temporizador de 10 min
│   ├── portal/                    # Módulo del Representante (Pagos, Alumnos, Preinscripción)
│   │   ├── page.tsx               # Dashboard con resumen de hijos y deudas
│   │   ├── pagar/                 # Reporte de pago e imputación 1 a N
│   │   ├── preinscripcion/        # Preinscripción y validación de cédula
│   │   └── representados/         # Directorio de estudiantes asociados
│   ├── admin/                     # Módulo de Administración (Conciliación, Auditoría)
│   │   ├── page.tsx               # Dashboard general de tesorería y KPIs
│   │   ├── pagos/                 # Bandeja de conciliación y auditoría
│   │   ├── estudiantes/           # Gestión y fichas del alumnado
│   │   └── configuracion/         # Control del año escolar y tasa de contingencia
│   └── api/                       # Rutas del servidor y autenticación
├── lib/                           # Utilidades, servicios y conexiones
│   ├── supabase/                  # Cliente y configuración de base de datos
│   └── tasa-cambio.ts             # Servicio de consulta BCV y contingencia
├── .env.local                     # Variables de entorno y llaves de conexión
└── package.json                   # Dependencias y scripts de ejecución
```

---

## 🛠️ Tecnologías Utilizadas

*   **Frontend & Backend:** Next.js (React) con TypeScript y App Router.
*   **Diseño e Interfaz:** Tailwind CSS con componentes responsivos y Lucide Icons.
*   **Base de Datos:** Supabase (PostgreSQL) con políticas de seguridad por fila (RLS).
*   **Seguridad:** Módulos Node.js Crypto y Nodemailer para gestión de credenciales.

---

## 🚀 Guía de Instalación y Ejecución

Sigue estos sencillos pasos para configurar y ejecutar el proyecto en tu computadora:

### 1. Requisitos Previos
*   **Node.js:** Versión 18.0.0 o superior (descargar [Node.js](https://nodejs.org/)).
*   **Editor de Código:** Visual Studio Code o similar.

### 2. Abrir la Carpeta del Proyecto
Abre tu terminal de comandos en la carpeta del proyecto:
```bash
cd sicp-app
```

### 3. Instalar Dependencias
Descarga e instala las librerías necesarias del proyecto:
```bash
npm install
```

### 4. Configurar Variables de Entorno
Asegúrate de tener el archivo `.env.local` en la raíz del proyecto con las credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 5. Iniciar el Servidor de Desarrollo
Ejecuta el comando para levantar la aplicación:
```bash
npm run dev
```

### 6. Abrir en el Navegador
Ingresa desde tu navegador a: 👉 [http://localhost:3000](http://localhost:3000)

---

> *"Automatizar los procesos administrativos no solo optimiza el tiempo, sino que permite a las instituciones enfocar sus recursos en lo verdaderamente importante: ofrecer una educación de calidad."* 💡
