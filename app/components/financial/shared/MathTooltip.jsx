'use client';

import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

/**
 * Reusable Math Tooltip Component
 * Shows calculation breakdown on hover
 *
 * @param {string} id - Unique identifier for this tooltip
 * @param {string} title - Tooltip title (e.g., "How we calculated this:")
 * @param {Array} lines - Array of line objects with {label, value, isPositive, isNegative, isTotal, isBorder}
 * @param {string} note - Optional note to display at bottom
 */
export default function MathTooltip({ id, title, lines, note }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative inline-block group">
      <Calculator
        className="w-4 h-4 text-gray-400 hover:text-indigo-600 cursor-help ml-2 inline-block transition"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {isHovered && (
        <div className="absolute z-50 w-80 p-4 bg-gray-900 text-white text-sm rounded-lg shadow-2xl -top-2 left-6">
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-3"></div>
          <p className="font-semibold mb-2 text-indigo-300">{title}</p>
          <div className="space-y-1">
            {lines.map((line, idx) => (
              <div
                key={idx}
                className={`flex justify-between ${
                  line.isBorder ? 'border-t border-gray-600 pt-1 mt-1' : ''
                }`}
              >
                <span className={line.isTotal ? 'font-semibold' : ''}>{line.label}</span>
                <span
                  className={`font-mono ${
                    line.isPositive
                      ? 'text-green-400'
                      : line.isNegative
                      ? 'text-red-400'
                      : line.isTotal
                      ? 'font-semibold text-white'
                      : 'text-gray-300'
                  }`}
                >
                  {line.value}
                </span>
              </div>
            ))}
          </div>
          {note && <p className="text-xs text-gray-400 mt-3 italic">{note}</p>}
        </div>
      )}
    </div>
  );
}
