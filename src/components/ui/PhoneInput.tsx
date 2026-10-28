'use client';

import { Phone } from 'lucide-react';
import PhoneNumberInput, { type Value } from 'react-phone-number-input';
import { getExampleNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';
import { useState } from 'react';
import 'react-phone-number-input/style.css';
import type { Country } from 'react-phone-number-input';

type PhoneInputProps = {
  id: string;
  value?: Value;
  onChange: (value: Value | undefined) => void;
};

export default function PhoneInput({ id, value, onChange }: PhoneInputProps) {
  const [country, setCountry] = useState<Country | undefined>('UZ');
  const placeholder = country
    ? getExampleNumber(country, examples)?.formatNational()
    : undefined;

  return (
    <div className="relative">
      <Phone aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-emerald-700" />
      <PhoneNumberInput
        id={id}
        value={value}
        onChange={onChange}
        defaultCountry="UZ"
        onCountryChange={setCountry}
        autoComplete="tel"
        numberInputProps={{
          className: 'h-full min-w-0 flex-1 border-0 bg-transparent px-3 py-0 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0',
          placeholder,
          required: true,
        }}
        className="flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white pl-11 pr-3 text-gray-900 shadow-sm transition-colors focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20"
      />
    </div>
  );
}