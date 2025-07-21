export const authEndpoints = {
  getAllUsers:'/api/v1/users',
  login: '/api/v1/users/login',
  signup: '/api/v1/users/signup',
  resetPassword: '/api/v1/users/reset-password',
  sendOtp: '/api/v1/users/send-otp',
  verifyOtp: '/api/v1/users/verify-otp',
  forgotPassword: '/api/v1/users/forgot-password',
  changePassword: '/api/v1/users/update-password',
  googleLogin: '/api/v1/users/google/signin',
  googleRegister: '/api/v1/users/google/signup', 
  completeProfile: '/api/v1/users/complete-profile',
};
