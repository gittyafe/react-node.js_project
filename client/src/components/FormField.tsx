import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
}) => {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        {...register}
        type={type}
        placeholder={placeholder}
      />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
};
