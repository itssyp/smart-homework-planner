import i18next from 'i18next';

export const signupValidationRules = (password: string) => ({
  username: {
    required: i18next.t('usernameIsRequired'),
  },
  password: {
    required: i18next.t('passwordIsRequired'),
    minLength: {
      value: 6,
      message: i18next.t('passwordMustBeAtLeast6Characters'),
    },
  },
  rePassword: {
    required: i18next.t('pleaseConfirmYourPassword'),
    validate: (value: string) => value === password || i18next.t('passwordsDoNotMatch'),
  },
});
