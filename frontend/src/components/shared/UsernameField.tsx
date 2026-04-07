import { FormControl, TextField } from '@mui/material';
import { Controller, type Control, type Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { loginValidationRules } from '../login/loginValidation';
import { signupValidationRules } from '../signup/signupValidation';

interface UsernameFieldProps<T extends { username: string }> {
  control: Control<T>;
  validationRules: typeof loginValidationRules | typeof signupValidationRules;
}

export function UsernameField<T extends { username: string }>({ control, validationRules }: UsernameFieldProps<T>) {
  const { t } = useTranslation();

  return (
    <FormControl fullWidth margin="normal">
      <Controller<T>
        name={'username' as Path<T>}
        control={control}
        rules={typeof validationRules === 'function' ? validationRules('').username : validationRules.username}
        render={({ field, fieldState: { error: fieldError } }) => (
          <TextField
            {...field}
            label={t('username')}
            error={!!fieldError}
            helperText={fieldError?.message}
            fullWidth
            required
          />
        )}
      />
    </FormControl>
  );
}
