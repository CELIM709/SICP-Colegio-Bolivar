/**
 * Módulo de Validaciones Centralizadas para SICP
 * U.E. Colegio Simón Bolívar
 */

/**
 * Valida que un correo electrónico tenga un formato RFC válido y pertenezca a un proveedor real
 * Rechaza errores comunes como @email.com, @mail.com, @gmai.com, etc.
 */
export function validarCorreoElectronico(email: string): { valido: boolean; error?: string } {
  const emailClean = email.trim().toLowerCase();
  
  if (!emailClean) {
    return { valido: false, error: 'Por favor ingresa tu correo electrónico.' };
  }

  // Regex estándar RFC 5322 simplificado
  const regexBasico = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regexBasico.test(emailClean)) {
    return { valido: false, error: 'El formato del correo es inválido (ejemplo: usuario@gmail.com).' };
  }

  const partes = emailClean.split('@');
  if (partes.length !== 2) {
    return { valido: false, error: 'El correo debe contener un único carácter "@".' };
  }

  const dominio = partes[1];

  // Lista de dominios comunes con errores de tipeo o ficticios no permitidos
  const dominiosInvalidos = [
    'email.com',
    'mail.com',
    'gmai.com',
    'gmail.co',
    'gamil.com',
    'gmaill.com',
    'hotmai.com',
    'hotmial.com',
    'outloo.com',
    'yaho.com',
    'test.com',
    'ejemplo.com'
  ];

  if (dominiosInvalidos.includes(dominio)) {
    return {
      valido: false,
      error: `El dominio "@${dominio}" no es válido. Por favor escribe un correo con tu proveedor real (ej. @gmail.com, @hotmail.com, @outlook.com, @yahoo.com).`
    };
  }

  return { valido: true };
}

/**
 * Valida que una referencia bancaria sea puramente numérica, de longitud adecuada y única en el sistema
 */
export function validarReferenciaBancaria(
  referencia: string, 
  pagosExistentes: any[] = []
): { valido: boolean; error?: string } {
  const refClean = referencia.trim();

  if (!refClean) {
    return { valido: false, error: 'Por favor ingresa el número de referencia bancaria.' };
  }

  if (!/^\d+$/.test(refClean)) {
    return { valido: false, error: 'El número de referencia bancaria debe contener exclusivamente dígitos numéricos (sin letras ni guiones).' };
  }

  if (refClean.length < 4 || refClean.length > 15) {
    return { valido: false, error: 'El número de referencia bancaria debe tener entre 4 y 15 dígitos.' };
  }

  // Comprobar unicidad en la base de datos de pagos
  const duplicado = pagosExistentes.some((p: any) => {
    if (!p.referencia) return false;
    const refExistente = String(p.referencia).replace(/\D/g, '');
    return (refExistente && refExistente === refClean) || p.referencia.trim().toUpperCase() === refClean.toUpperCase();
  });

  if (duplicado) {
    return {
      valido: false,
      error: `La referencia bancaria N° "${refClean}" ya fue registrada previamente en el sistema. Cada comprobante bancario es único e irrepetible.`
    };
  }

  return { valido: true };
}
