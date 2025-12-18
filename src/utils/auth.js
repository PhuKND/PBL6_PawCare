export const getUserRole = () => {
  return localStorage.getItem('userRole') || 'USER';
};

export const getUserRoles = () => {
  const role = getUserRole();
  return [role]; 
};

export const hasAccess = (requiredRole) => {
  const userRole = getUserRole();

  if (!userRole) return false;

  
  if (userRole === "ADMIN") return true;
  
  
  if (userRole === "USER" && (requiredRole === "USER" || requiredRole === "profile")) return true;

  
  if (!requiredRole) return true;

  return false;
};

export const isAdmin = () => {
  return getUserRole() === 'ADMIN';
};

export const isUser = () => {
  return getUserRole() === 'USER';
};
