// responsive breakpoints
export const breakpoints = {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    large: '1200px'
  };
  
  // media query tool function
  export const mediaQuery = (breakpoint) => `@media (max-width: ${breakpoint})`;
  
  // responsive style generator
  export const responsive = {
    // 添加 mediaQuery 函数到 responsive 对象中
    mediaQuery: (breakpoint) => `@media (max-width: ${breakpoint})`,
    
    // container style
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      [mediaQuery(breakpoints.tablet)]: {
        padding: '15px',
        maxWidth: '100%'
      },
      [mediaQuery(breakpoints.mobile)]: {
        padding: '10px'
      }
    },
  
    // grid layout
    grid: {
      display: 'grid',
      gap: '20px',
      [mediaQuery(breakpoints.tablet)]: {
        gap: '15px'
      },
      [mediaQuery(breakpoints.mobile)]: {
        gap: '10px'
      }
    },
  
    // card style
    card: {
      background: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      [mediaQuery(breakpoints.mobile)]: {
        padding: '15px',
        borderRadius: '8px'
      }
    },
  
    // button group
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      [mediaQuery(breakpoints.mobile)]: {
        flexDirection: 'column',
        gap: '8px'
      }
    },
  
    // search form
    searchForm: {
      display: 'flex',
      gap: '15px',
      flexWrap: 'wrap',
      alignItems: 'end',
      [mediaQuery(breakpoints.mobile)]: {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '10px'
      }
    },
  
    // input
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box',
      [mediaQuery(breakpoints.mobile)]: {
        padding: '12px',
        fontSize: '16px' // 防止iOS缩放
      }
    },
  
    // pagination
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      marginTop: '30px',
      flexWrap: 'wrap',
      [mediaQuery(breakpoints.mobile)]: {
        gap: '5px',
        marginTop: '20px'
      }
    }
  };