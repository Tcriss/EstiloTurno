// Debe coincidir con @MinLength(8) de RegisterDto/ResetPasswordDto en el backend.
export const minPasswordLength = 8;

export function getPasswordValidationError(password: string) {
  if (!password) {
    return "Ingresa una contraseña.";
  }

  if (password.length < minPasswordLength) {
    return `La contraseña debe tener al menos ${minPasswordLength} caracteres.`;
  }

  return "";
}
