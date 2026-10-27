import { useState, useEffect } from 'react';

/**
 * Custom hook áp dụng kỹ thuật Debounce để hạn chế gọi API hoặc trigger logic liên tục khi người dùng nhập liệu.
 * @param {any} value - Giá trị cần debounce (ví dụ từ khóa tìm kiếm)
 * @param {number} delay - Thời gian trễ (mili-giây), mặc định 350ms
 * @returns {any} Giá trị sau khi được debounce
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
