import i18next from 'i18next';

export const signupValidationRules = (password: string) => ({
  username: {
    required: i18next.t('auth.usernameRequired'),
  },
  password: {
    required: i18next.t('auth.passwordRequired'),
    minLength: {
      value: 6,
      message: i18next.t('auth.passwordMinLength'),
    },
  },
  rePassword: {
    required: i18next.t('auth.pleaseConfirmPassword'),
    validate: (value: string) => value === password || i18next.t('auth.passwordsMismatch'),
  },
});
