export const minPasswordLength = 6;

export function getPasswordValidationError(password: string) {
  if (!password) {
    return "Ingresa una contraseña.";
  }

  if (password.length < minPasswordLength) {
    return `La contraseña debe tener al menos ${minPasswordLength} caracteres.`;
  }

  return "";
}
