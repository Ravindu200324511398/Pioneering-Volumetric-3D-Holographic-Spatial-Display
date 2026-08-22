import React from 'react';

/**
 * SlidingNumber Component
 * Recreates @animate-ui/primitives-texts-sliding-number digit sliding animation.
 * Smoothly translates digit columns (0-9) vertically on numeric value changes.
 */

function DigitColumn({ digit }) {
  const digitNum = parseInt(digit, 10);
  const isNumber = !isNaN(digitNum);

  if (!isNumber) {
    return <span className="inline-block px-0.5">{digit}</span>;
  }

  return (
    <div className="relative inline-block h-[1em] overflow-hidden leading-none select-none">
      <div
        className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col"
        style={{
          transform: `translateY(-${digitNum * 10}%)`
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[1em] flex items-center justify-center">
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SlidingNumber({ value, prefix = '', suffix = '', className = '' }) {
  const valueStr = String(value);
  const characters = valueStr.split('');

  return (
    <span className={`inline-flex items-center font-mono tracking-tight ${className}`}>
      {prefix && <span className="mr-0.5">{prefix}</span>}
      {characters.map((char, index) => (
        <DigitColumn key={`${index}-${char}`} digit={char} />
      ))}
      {suffix && <span className="ml-1 text-[0.75em] font-sans opacity-80">{suffix}</span>}
    </span>
  );
}

export default SlidingNumber;
