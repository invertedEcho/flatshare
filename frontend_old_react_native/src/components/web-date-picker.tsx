import { createElement } from 'react';

type Props = {
  value: string;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
};

export default function WebDateTimerPicker({ value, onChange }: Props) {
  return createElement('input', {
    type: 'date',
    value,
    onChange,
  });
}
