export const environment = {
  production: true,
  // URL base da API no Render (atualize caso escolha outro nome de serviço no Render)
  apiUrl: (typeof window !== 'undefined' && (window as any).__env?.apiUrl) || 'https://rankgit-backend.onrender.com'
};
