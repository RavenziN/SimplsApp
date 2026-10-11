import React, { useState } from 'react';
import signaturePng from '../../assets/pedro-signature.png';

interface PedroSignatureProps {
  className?: string;
}

/**
 * PedroSignature
 * Assinatura elegante de Pedro Otávio, criador do Simpls.
 * Renderiza o PNG transparente autêntico com suporte a modo claro e escuro,
 * além de fallback vetorial SVG garantido.
 */
export const PedroSignature: React.FC<PedroSignatureProps> = ({ className = '' }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative inline-flex items-center select-none overflow-visible ${className}`}>
      {!hasError ? (
        <img
          src={signaturePng}
          alt="Assinatura de Pedro Otávio"
          onError={() => setHasError(true)}
          className="h-full w-auto max-w-full object-contain filter dark:invert contrast-125 select-none pointer-events-none drop-shadow-none"
          style={{
            maxHeight: '100%',
          }}
          loading="eager"
          decoding="async"
        />
      ) : (
        <svg
          viewBox="0 0 240 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible text-[#0A0A0A] dark:text-neutral-100 transition-colors duration-200"
          style={{
            transform: 'rotate(-1.5deg)',
            transformOrigin: 'left center',
          }}
          aria-label="Assinatura manuscrita elegante de Pedro Otávio"
          role="img"
        >
          <g
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* === P (Haste inclinada elegante com pressão de pena) === */}
            <path
              d="M 22 15 C 20.5 24.5, 18 39, 15 54"
              strokeWidth="2.3"
            />
            {/* === P (Laço gracioso superior) === */}
            <path
              d="M 16 18 C 21 11, 35 10.5, 39.5 15 C 44 19.5, 39 27, 21.5 27"
              strokeWidth="2.0"
            />

            {/* === e cursivo rápido === */}
            <path
              d="M 23 26.5 C 27 27, 32 27.5, 35 24 C 37 21, 36 19, 33.5 19.5 C 31 20, 31.5 26, 37.5 26"
              strokeWidth="1.8"
            />

            {/* === d com haste alta e suave === */}
            <path
              d="M 39 25 C 41 22, 44 21.5, 43 19.5 C 41 18, 38.5 21, 39 24.5 C 39.8 26.5, 43 26.5, 45.5 26"
              strokeWidth="1.7"
            />
            <path
              d="M 45.5 9.5 C 45.2 8.5, 44 8.5, 43.5 9.5 C 42.5 12, 43.2 19, 44.5 26"
              strokeWidth="1.8"
            />

            {/* === r cursivo elegante === */}
            <path
              d="M 46 24 C 48.5 21, 52 20, 55 20 C 57 20, 57.5 21.5, 56.5 23 C 57.5 25, 59.5 26, 62.5 25.5"
              strokeWidth="1.7"
            />

            {/* === o com finalização rápida ligada === */}
            <path
              d="M 64 24.5 C 66 21.5, 68.5 20, 67 18.5 C 65 17, 62.5 20, 63.5 24 C 64.5 26, 67.5 26, 71 24"
              strokeWidth="1.7"
            />

            {/* === O Maiúsculo de Otávio (Amplo, expressivo e fluido) === */}
            <path
              d="M 97 9 C 84 11, 75 22.5, 76 35 C 77 46.5, 87 50, 99 48 C 109 46, 115 35.5, 113 23 C 111 13.5, 103 9.5, 94.5 11.5 C 89.5 13, 90.5 19, 97.5 20"
              strokeWidth="2.2"
            />

            {/* === t haste ascendente === */}
            <path
              d="M 100 20 C 105 20, 110.5 17, 114.5 13.5 L 116 28.5"
              strokeWidth="1.8"
            />
            {/* === t corte dinâmico === */}
            <path
              d="M 110 18.5 C 115 18, 120 17.5, 124 17"
              strokeWidth="1.6"
            />

            {/* === á com acento agudo === */}
            <path
              d="M 116.5 25.5 C 119 22, 123.5 20.5, 126.5 20.5 C 129.5 20.5, 129.5 24, 127.5 26.5 C 129 26.5, 131.5 25.5, 134 24"
              strokeWidth="1.7"
            />
            {/* Acento agudo no á */}
            <path
              d="M 124 13.5 L 128 10"
              strokeWidth="1.8"
            />

            {/* === v cursivo === */}
            <path
              d="M 134.5 24 C 136.5 21.5, 140 20.5, 142.5 20.5 C 145 20.5, 144.5 24, 146.5 26.5"
              strokeWidth="1.65"
            />

            {/* === i com pingo preciso === */}
            <path
              d="M 147 26.5 C 149 23.5, 152 20.5, 154 20.5 L 155 26.5"
              strokeWidth="1.65"
            />
            {/* Pingo do i */}
            <circle
              cx="154.5"
              cy="14"
              r="1.25"
              fill="currentColor"
              stroke="none"
            />

            {/* === o final de Otávio === */}
            <path
              d="M 155.5 26.5 C 158 23, 161.5 20.5, 164 20.5 C 167 20.5, 167 25, 164 26 C 166.5 26, 171 24.5, 176 21.5"
              strokeWidth="1.7"
            />

            {/* === Rubrica / Traço inferior característico do fundador === */}
            <path
              d="M 18 43 C 58 40.5, 110 38.5, 168 37 C 187 36.5, 202 37, 191 39 C 160 42, 100 45, 54 47.5"
              strokeWidth="1.6"
            />
            <path
              d="M 191 39 C 206 38, 219 37.5, 226 36.5"
              strokeWidth="1.3"
            />
          </g>
        </svg>
      )}
    </div>
  );
};
