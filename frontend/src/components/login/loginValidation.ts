import i18next from 'i18next';

export const loginValidationRules = {
  username: {
    required: i18next.t('usernameIsRequired'),
  },
  password: {
    required: i18next.t('passwordIsRequired'),
  },
};
