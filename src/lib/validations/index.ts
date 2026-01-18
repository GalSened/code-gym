// Auth validations
export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} from "./auth";
export type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ChangePasswordFormData,
  VerifyEmailFormData,
} from "./auth";

// User validations
export {
  updateProfileSchema,
  updatePreferencesSchema,
  updateAvatarSchema,
} from "./user";
export type {
  UpdateProfileFormData,
  UpdatePreferencesFormData,
  UpdateAvatarFormData,
} from "./user";
