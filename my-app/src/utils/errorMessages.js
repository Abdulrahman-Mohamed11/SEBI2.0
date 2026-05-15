export function getErrorMessage(err) {
  if (!err.response) {
    return 'Cannot connect to server. Please check your internet connection.';
  }

  const status = err.response.status;
  const message = err.response.data?.message ?? '';

  if (status === 401 || message.toLowerCase().includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (status === 409 || message.toLowerCase().includes('email already in use')) {
    return 'An account with this email already exists.';
  }
  if (status === 403 || message.toLowerCase().includes('deactivated')) {
    return 'Your account has been deactivated. Please contact support.';
  }

  return 'Something went wrong. Please try again.';
}
