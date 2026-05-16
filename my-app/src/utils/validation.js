// Form validation utilities — CampusCare
// Each validateXxxForm() returns an errors object.
// Keys are field names, values are error message strings.
// An empty object {} means the form passed all validation.

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return null;
};

export const validateLoginForm = (email, password) => {
  const errors = {};
  if (!validateEmail(email)) errors.email = 'Please enter a valid email address';
  const passError = validatePassword(password);
  if (passError) errors.password = passError;
  return errors;
};

export const validateRegisterForm = (name, email, password) => {
  const errors = {};
  const nameError = validateRequired(name, 'Full name');
if (nameError) {
  errors.name = nameError;
} else if (name.trim().length < 2) {
  errors.name = 'Name must be at least 2 characters';
}
  if (!validateEmail(email)) errors.email = 'Please enter a valid email address';
  const passError = validatePassword(password);
  if (passError) errors.password = passError;
  return errors;
};

export const validateIssueForm = (title, description, location) => {
  const errors = {};
  const titleError = validateRequired(title, 'Title');
  if (titleError) errors.title = titleError;
  const descError = validateRequired(description, 'Description');
  if (descError) errors.description = descError;
  const locError = validateRequired(location, 'Location');
  if (locError) errors.location = locError;
  return errors;
};
