// =====================================================
// SGI Opera Soluciones - Scroll Hook
// Hook de scroll
// =====================================================
// Description: Custom hook for scroll detection
// Descripción: Hook personalizado para detección de scroll
// Author: Carlos Muñoz
// Date: 2025-09-16
// =====================================================

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect scroll position
 * Hook personalizado para detectar posición de scroll
 */
export function useScroll() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isScrolled;
}
