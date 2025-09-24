import { useMediaQuery, useTheme } from '@mui/material';

export const useResponsive = () => {
  const theme = useTheme();
  
  const isXs = useMediaQuery(theme.breakpoints.only('xs')); // 0-599px
  const isSm = useMediaQuery(theme.breakpoints.only('sm')); // 600-899px
  const isMd = useMediaQuery(theme.breakpoints.only('md')); // 900-1199px
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));   // 1200px+
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // 0-899px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg')); // 600-1199px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // 900px+
  
  const getValue = (mobileValue, tabletValue, desktopValue) => {
    if (isMobile) return mobileValue;
    if (isTablet) return tabletValue;
    return desktopValue;
  };

  return {
    isXs,
    isSm,
    isMd,
    isLg,
    isMobile,
    isTablet,
    isDesktop,
    getValue,
    breakpoint: theme.breakpoints
  };
};