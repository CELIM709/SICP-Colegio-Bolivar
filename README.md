# 🏫 SICP — Sistema Integral de Control de Pagos e Inscripciones Escolares

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-Flash_3.6_OCR-8E75B2?style=for-the-badge&logo=google)
![Docker](https://img.shields.io/badge/Docker-n8n_Automation-2496ED?style=for-the-badge&logo=docker)

**Carrera:** Ingeniería en Informática  
**Asignatura:** Ingeniería de Software I  
**Institución:** U.E. Colegio Simón Bolívar (Estado Bolívar, Venezuela)  
**Alumna:** Celimar Rojas  
**Profesora:** Dubraska Roca  
**Metodología de Desarrollo:** Ágil (Scrum) — Sprints 1, 2 y 3  

---

## 📌 Descripción del Proyecto

El **SICP** es una plataforma tecnológica integral desarrollada para automatizar, blindar y agilizar la gestión de matrícula y cobranza bimonetaria en la **Unidad Educativa Colegio Simón Bolívar**. 

El sistema resuelve la complejidad del contexto económico venezolano al sincronizarse en tiempo real con la tasa oficial del **Banco Central de Venezuela (BCV)**, procesar comprobantes bancarios mediante **Inteligencia Artificial (Gemini Flash OCR)**, permitir la **imputación de pagos 1 a N**, gestionar el **desistimiento y devolución de matrícula**, y emitir **constancias oficiales en PDF con membrete ministerial del MPPE, sellos y firmas institucionales**.

---

## ✨ Funcionalidades Principales por Sprints

### 🚀 Sprint 1: Arquitectura Base, Cédula Escolar MPPE y Tasa BCV
*   **Autenticación Bimonetaria y Roles:** Vistas diferenciadas para Representantes y Administradores con selector de Modo Claro / Modo Oscuro.
*   **Generador Oficial de Cédula Escolar MPPE:** Algoritmo ministerial automático [Año Nac 2 dígitos]-[Cédula Representante]-[Correlativo 01..N].
*   **Cotizador Oficial BCV en Vivo:** Consumo de la API oficial del Banco Central de Venezuela con caché inteligente y conmutación a modo de contingencia manual.
*   **Recuperación Segura de Contraseña:** Generación de tokens OTP de 6 dígitos con expiración automática de 10 minutos.

### 🧠 Sprint 2: IA Gemini Flash OCR, Conciliación 1:N y Mock Bancario
*   **Extractor OCR con IA Gemini Flash:** Lectura automática y ultra-rápida de captures de Pago Móvil y Transferencias (detecta Banco, Referencia, Fecha y Monto en Bs.).
*   **Conciliación e Imputación 1 a N:** Capacidad de abonar o liquidar aranceles de múltiples estudiantes con un único comprobante bancario.
*   **Simulador / Mock Bancario:** Validación automática e instantánea contra extractos bancarios simulados (Banco de Venezuela / Banesco).
*   **Webhooks n8n:** Disparo de eventos y notificaciones transaccionales por correo electrónico.

### 🏛️ Sprint 3: Módulo de Devoluciones y Documentos Oficiales en PDF
*   **Gestión de Desistimiento y Devoluciones:** Cancelación formal de cupos y solicitud de reintegro bancario (Pago Móvil o Transferencia de 20 dígitos).
*   **Panel Administrativo de Liquidación:** Auditoría, aprobación, registro de transferencia emitida y cierre contable de reintegros.
*   **Motor de Generación PDF (1 Página Exacta):**
    *   *Constancia de Inscripción y Solvencia*.
    *   *Acta Oficial de Desistimiento y Devolución*.
    *   *Acta de Liquidación y Finiquito Contable*.
    *   Todas con Escudo Institucional, Membrete MPPE Estado Bolívar, Número de Control correlativo, Sello Húmedo y Firma de la Prof. Celimar Rojas.

---

## 👥 Credenciales de Acceso Demo

La pantalla de inicio de sesión (/login) incluye botones de carga rápida con un solo clic:

| Rol | Correo Electrónico | Contraseña | Perfil y Alcance |
| :--- | :--- | :--- | :--- |
| **👨‍👩‍👧 Representante** | maria.delgado@gmail.com | demo1234 | Portal de pagos, 2 representados, solvencias y devoluciones. |
| **👨‍👩‍👧 Representante** | celimrrojas@gmail.com | demo1234 | Portal de pagos con representado Lucas Valentino Rojas. |
| **🛡️ Administrador** | dmin@colegiobolivar.edu.ve | dmin1234 | **Prof. Celimar Rojas** (Control de Estudios, Auditoría y Devoluciones). |

---

## 📂 Estructura del Código Fuente

`	ext
sicp-app/
├── app/                           # Arquitectura Next.js 14 App Router
│   ├── page.tsx                   # Landing Page con Cotizador Oficial en Vivo
│   ├── login/                     # Autenticación con accesos rápidos Demo
│   ├── registro/                  # Registro de representantes
│   ├── recuperar-password/        # Recuperación de contraseña por código OTP
│   ├── portal/                    # Portal del Representante
│   │   ├── page.tsx               # Dashboard financiero bimonetario
│   │   ├── pagar/                 # Imputación 1:N y lectura OCR Gemini Flash
│   │   ├── preinscripcion/        # Preinscripción y Cédula Escolar MPPE
│   │   └── representados/         # Directorio de estudiantes y solvencias
│   ├── admin/                     # Panel de Control Administrativo
│   │   ├── page.tsx               # Dashboard de tesorería y KPIs en vivo
│   │   ├── pagos/                 # Bandeja de conciliación bancaria y auditoría
│   │   ├── devoluciones/          # Auditoría y liquidación de reintegros
│   │   ├── estudiantes/           # Fichas escolares y control de cupos
│   │   └── configuracion/         # Control de período escolar y tasa de contingencia
│   └── api/                       # Route Handlers y endpoints del backend
│       ├── tasa/                  # Consulta y caché de tasa oficial BCV
│       ├── extraer-comprobante/   # Servicio OCR con Google Gemini 3.6 Flash
│       ├── banco/conciliar/       # Mock API de conciliación bancaria
│       ├── webhook/n8n/           # Disparador de eventos hacia n8n
│       └── auth/recuperar/        # Generador de códigos OTP de recuperación
├── components/                    # Componentes modulares reutilizables
│   ├── ConstanciaModal.tsx        # Generador PDF de Constancia de Inscripción
│   └── DevolucionModal.tsx        # Formulario y Acta Oficial de Devolución
├── lib/                           # Lógica de negocio y utilidades
│   ├── tasa-cambio.ts             # Cliente de tasa BCV y contingencia
│   └── validaciones.ts            # Validaciones de cédula, correo y teléfonos
├── docker-compose.yml             # Despliegue en contenedor Docker para n8n
├── n8n/                           # Documentación y workflows de automatización
├── supabase/                      # Script DDL oficial de PostgreSQL (schema.sql)
└── package.json                   # Dependencias y scripts del proyecto
`

---

## 🛠️ Tecnologías y Arquitectura

*   **Frontend & Backend:** Next.js 14 (React 18, TypeScript, App Router).
*   **Estilos y UI:** Tailwind CSS, Lucide Icons, Canvas HTML5 interactivo.
*   **Inteligencia Artificial:** Google Gemini 3.6 Flash Vision (Extracción estructurada en JSON de comprobantes bancarios).
*   **Automatización:** n8n desplegado en contenedor **Docker**.
*   **Base de Datos:** PostgreSQL Relacional (Supabase) con integridad referencial e índices.
*   **Integración Financiera:** API del Banco Central de Venezuela (BCV).
*   **Impresión y Exportación:** Plantillas CSS Puras optimizadas para PDF en 1 página.

---

## 🚀 Guía de Instalación y Ejecución Local

### 1. Clonar el Repositorio
\\\ash
git clone https://github.com/celimrrojas/sicp-colegio-bolivar.git
cd sicp-colegio-bolivar
\\\

### 2. Instalar Dependencias
\\\ash
npm install
\\\

### 3. Configurar Variables de Entorno
Crea un archivo .env.local en la raíz con tus llaves:
\\\nv
# API de Google Gemini para OCR
GEMINI_API_KEY=tu_api_key_aqui

# URL de Webhook n8n (Opcional para correos)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/sicp-notificaciones
\\\

### 4. (Opcional) Levantar Contenedor de n8n con Docker
\\\ash
docker-compose up -d
\\\

### 5. Iniciar la Aplicación en Modo Desarrollo
\\\ash
npm run dev
\\\
Abre tu navegador en: 👉 **[http://localhost:3000](http://localhost:3000)**

---

> **U.E. Colegio Simón Bolívar** • *Excelencia Educativa y Vanguardia Tecnológica*
