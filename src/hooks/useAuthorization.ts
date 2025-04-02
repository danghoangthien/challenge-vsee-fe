// Helper function to handle API errors
export const handleUnauthorizedError = (
  error: any,
  logout: () => void,
  defaultErrorMessage: string
) => {
  if (error?.response?.status === 401) {
    logout();
  } else {
    console.log(defaultErrorMessage)
  }
}; 