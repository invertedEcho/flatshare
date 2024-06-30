import React from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { View, Text, TextInput, TextInputProps } from 'react-native';

type Props<T extends FieldValues> = {
  name: Path<T>;
  labelText: string;
  textInputProps: Omit<TextInputProps, 'onChangeText' | 'value'>;
  control: Control<T>;
  errors: FieldErrors<T>;
  rules?: RegisterOptions<T>;
};

function FormTextInput<T extends FieldValues>({
  name,
  labelText,
  textInputProps,
  control,
  errors,
  rules,
}: Props<T>) {
  return (
    <View>
      <Text className="text-white mb-2">
        {labelText} {rules?.required && '*'}
      </Text>
      <Controller
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <TextInput
            {...textInputProps}
            onChangeText={onChange}
            value={value}
            className="p-4 rounded-lg bg-white mb-2"
          />
        )}
        name={name}
      />
      {errors[name] && (
        <Text className="text-red-300">{labelText} is required</Text>
      )}
    </View>
  );
}

export default FormTextInput;
