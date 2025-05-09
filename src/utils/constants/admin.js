export const ADMIN_ACCESS = {
    email: 'admin@tanishq534.com',
    pin: '1852'
};

export const validateAdminAccess = (email, pin) => {
    return email.toLowerCase() === ADMIN_ACCESS.email.toLowerCase() && pin === ADMIN_ACCESS.pin;
}; 