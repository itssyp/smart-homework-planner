import i18next from 'i18next';

export const loginValidationRules = {
  username: {
    required: i18next.t('auth.usernameRequired'),
  },
  password: {
    required: i18next.t('auth.passwordRequired'),
  },
};
