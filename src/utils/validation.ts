export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caracteres';
  return null;
}

export interface TripFormData {
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
}

export function validateTripForm(data: Partial<TripFormData>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.name?.trim()) errors.name = 'Le nom est requis';
  if (!data.destination?.trim()) errors.destination = 'La destination est requise';
  if (!data.startDate) errors.startDate = 'La date de debut est requise';
  if (!data.endDate) errors.endDate = 'La date de fin est requise';
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    errors.endDate = 'La date de fin doit etre apres la date de debut';
  }
  return errors;
}

export function validateEventName(name: string | undefined): string | null {
  if (!name?.trim()) return 'Le nom est requis';
  return null;
}
