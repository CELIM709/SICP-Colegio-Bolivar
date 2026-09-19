-- ==============================================================================
-- SISTEMA INTEGRADO DE CONTROL DE PAGOS (SICP)
-- Script Completo de Creación y Modelado DDL (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Limpieza previa de tablas existentes para garantizar migración limpia
DROP TABLE IF EXISTS imputaciones_pagos CASCADE;
DROP TABLE IF EXISTS devoluciones CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS estudiantes CASCADE;
DROP TABLE IF EXISTS tokens_recuperacion CASCADE;
DROP TABLE IF EXISTS configuracion_periodo CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 3. TABLA: USUARIOS (Representantes y Personal Administrativo)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(50),
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('REPRESENTANTE', 'ADMINISTRADOR')),
    cargo VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: CONFIGURACION_PERIODO (Parámetros y Tasas)
CREATE TABLE configuracion_periodo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anio_escolar VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    arancel_base_usd NUMERIC(10, 2) NOT NULL DEFAULT 120.00,
    tasa_bcv_manual NUMERIC(10, 4) NOT NULL DEFAULT 36.50,
    modo_contingencia BOOLEAN NOT NULL DEFAULT false,
    modificado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: ESTUDIANTES (Expediente del Alumno)
CREATE TABLE estudiantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    representante_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    periodo_id UUID REFERENCES configuracion_periodo(id) ON DELETE SET NULL,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    cedula_escolar VARCHAR(30) UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    grado VARCHAR(50) NOT NULL,
    arancel_usd NUMERIC(10, 2) NOT NULL DEFAULT 120.00,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('SOLVENTE', 'ABONO_PARCIAL', 'PENDIENTE', 'EN_REVISION', 'CANCELADO')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: PAGOS (Comprobantes Bancarios)
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    representante_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    referencia VARCHAR(50) UNIQUE NOT NULL,
    banco_emisor VARCHAR(100) NOT NULL,
    metodo VARCHAR(30) NOT NULL CHECK (metodo IN ('PAGO_MOVIL', 'TRANSFERENCIA')),
    moneda VARCHAR(10) NOT NULL CHECK (moneda IN ('BS', 'USD')),
    monto_pagado NUMERIC(14, 2) NOT NULL,
    tasa_cambio NUMERIC(10, 4) NOT NULL,
    monto_usd NUMERIC(10, 2) NOT NULL,
    fecha_reporte DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
    motivo_rechazo TEXT,
    comprobante_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA: IMPUTACIONES_PAGOS (Prorrateo 1 a N)
CREATE TABLE imputaciones_pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pago_id UUID NOT NULL REFERENCES pagos(id) ON DELETE CASCADE,
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    monto_usd NUMERIC(10, 2) NOT NULL,
    saldo_anterior_usd NUMERIC(10, 2) NOT NULL,
    saldo_restante_usd NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA: DEVOLUCIONES (Gestión de Desistimiento y Reintegros)
CREATE TABLE devoluciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlativo VARCHAR(30) UNIQUE NOT NULL,
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    representante_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    monto_usd NUMERIC(10, 2) NOT NULL,
    monto_bs NUMERIC(14, 2) NOT NULL,
    tasa_bcv NUMERIC(10, 4) NOT NULL,
    motivo TEXT NOT NULL,
    tipo_reintegro VARCHAR(30) NOT NULL CHECK (tipo_reintegro IN ('PAGO_MOVIL', 'TRANSFERENCIA')),
    banco_receptor VARCHAR(100) NOT NULL,
    cedula_titular VARCHAR(20) NOT NULL,
    telefono_cuenta VARCHAR(30) NOT NULL,
    nombre_titular VARCHAR(150) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'SOLICITADA' CHECK (estado IN ('SOLICITADA', 'REINTEGRADO')),
    referencia_reintegro VARCHAR(50),
    fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_liquidacion DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA: TOKENS_RECUPERACION (Seguridad OTP)
CREATE TABLE tokens_recuperacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    codigo_otp VARCHAR(10) NOT NULL,
    expira_en TIMESTAMPTZ NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ÍNDICES DE RENDIMIENTO (B-Tree)
CREATE INDEX idx_estudiantes_rep ON estudiantes(representante_id);
CREATE INDEX idx_estudiantes_cedula ON estudiantes(cedula_escolar);
CREATE INDEX idx_pagos_rep ON pagos(representante_id);
CREATE INDEX idx_pagos_ref ON pagos(referencia);
CREATE INDEX idx_imputaciones_pago ON imputaciones_pagos(pago_id);
CREATE INDEX idx_imputaciones_est ON imputaciones_pagos(estudiante_id);
CREATE INDEX idx_devoluciones_rep ON devoluciones(representante_id);
CREATE INDEX idx_devoluciones_est ON devoluciones(estudiante_id);

-- 11. ROW LEVEL SECURITY (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE imputaciones_pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE devoluciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_periodo ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens_recuperacion ENABLE ROW LEVEL SECURITY;

-- 12. DATOS SEMILLA (SEED DATA)
INSERT INTO usuarios (email, password_hash, nombre, cedula, telefono, rol, cargo)
VALUES 
('admin@colegio.edu.ve', 'admin123', 'Lcda. María Rodríguez', 'V-15.420.910', '0414-1234567', 'ADMINISTRADOR', 'Coordinadora de Cobranzas'),
('carlos.mendoza@email.com', 'user123', 'Carlos Mendoza', 'V-18.765.432', '0412-7654321', 'REPRESENTANTE', 'Representante Legal');

INSERT INTO configuracion_periodo (anio_escolar, arancel_base_usd, tasa_bcv_manual, modo_contingencia)
VALUES ('2026-2027', 120.00, 36.50, false);
