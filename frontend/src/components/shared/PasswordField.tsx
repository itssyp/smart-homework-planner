import { FormControl, TextField } from '@mui/material';
import { Controller, type Control, type Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { loginValidationRules } from '../login/loginValidation';
import { signupValidationRules } from '../signup/signupValidation';

interface PasswordFieldProps<T extends { password?: string; rePassword?: string }> {
  name: 'password' | 'rePassword';
  control: Control<T>;
  validationRules: typeof loginValidationRules | typeof signupValidationRules;
  label?: string;
}

export function PasswordField<T extends { password?: string; rePassword?: string }>({
  name,
  control,
  validationRules,
  label = '',
}: PasswordFieldProps<T>) {
  const { t } = useTranslation();

  const rules = validationRules[name as keyof typeof validationRules];

  return (
    <FormControl fullWidth margin="normal">
      <Controller<T>
        name={name as Path<T>}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error: fieldError } }) => (
          <TextField
            {...field}
            type="password"
            label={label || t(name === 'rePassword' ? 'confirmPassword' : 'password')}
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
