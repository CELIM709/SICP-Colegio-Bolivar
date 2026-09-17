# Módulo de Automatización y Notificaciones con n8n (Docker)

Este directorio contiene la arquitectura y el flujo exportado de automatizaciones para el **SICP** (Sistema Integral de Control de Pagos e Inscripciones de la U.E. Colegio Simón Bolívar).

## 🚀 Despliegue en Contenedor Docker

Para iniciar el servicio en la Máquina Virtual / Servidor:

\\\ash
# Ubicarse en la raíz del proyecto
docker-compose up -d
\\\

El panel de n8n estará disponible en: \http://localhost:5678\

## 🔄 Flujo de Trabajo (Workflow):
1. **Webhook Trigger:** Escucha eventos HTTP POST en \/webhook/sicp-notificaciones\.
2. **Event Router (Switch):** Discrimina entre:
   - \INSCRIPCION_CONFIRMADA\: Envío de constancia y recibo de pago bimonetario.
   - \PAGO_RECHAZADO\: Notificación de discrepancia bancaria con motivo al representante.
   - \RECUPERAR_PASSWORD\: Envío de código de seguridad transaccional (OTP de 6 dígitos).
   - \DEVOLUCION_SOLICITADA\: Notificación de trámite y comprobante de acta administrativa.
3. **Gmail / SMTP Node:** Despacha el correo electrónico con plantilla HTML profesional.
