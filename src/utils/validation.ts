/**
 * Form validation utilities
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateShopSetup = (data: {
  businessName?: string;
  category?: string;
  city?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.businessName?.trim()) {
    errors.push({
      field: 'businessName',
      message: 'Shop or business name is required',
    });
  } else if (data.businessName.length < 2) {
    errors.push({
      field: 'businessName',
      message: 'Shop name must be at least 2 characters',
    });
  } else if (data.businessName.length > 100) {
    errors.push({
      field: 'businessName',
      message: 'Shop name must be less than 100 characters',
    });
  }

  if (!data.category?.trim()) {
    errors.push({
      field: 'category',
      message: 'Business type is required',
    });
  }

  if (!data.city?.trim()) {
    errors.push({
      field: 'city',
      message: 'Town or city is required',
    });
  } else if (data.city.length < 2) {
    errors.push({
      field: 'city',
      message: 'City must be at least 2 characters',
    });
  } else if (data.city.length > 100) {
    errors.push({
      field: 'city',
      message: 'City must be less than 100 characters',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateAdCreation = (data: {
  offer?: string;
  tone?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.offer?.trim()) {
    errors.push({
      field: 'offer',
      message: 'Please write or speak your offer',
    });
  } else if (data.offer.length < 5) {
    errors.push({
      field: 'offer',
      message: 'Offer must be at least 5 characters',
    });
  } else if (data.offer.length > 500) {
    errors.push({
      field: 'offer',
      message: 'Offer must be less than 500 characters',
    });
  }

  if (!data.tone?.trim()) {
    errors.push({
      field: 'tone',
      message: 'Please select a writing style',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getFieldError = (field: string, errors: ValidationError[]): string | undefined => {
  return errors.find((err) => err.field === field)?.message;
};
