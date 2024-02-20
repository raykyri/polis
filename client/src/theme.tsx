export default {
  space: [0, 4, 8, 16, 24, 32, 42, 56, 72, 96, 128, 256, 512],
  fonts: {
    heading: "'Instrument Sans', sans-serif",
    body: "'Instrument Sans', sans-serif",
    monospace: "monospace",
  },
  fontSizes: [12, 14, 16, 20, 24, 36, 40, 64, 96],
  fontWeights: {
    body: 400,
    heading: 700,
  },
  lineHeights: {
    body: 1.45,
    heading: 1.125,
  },
  boxes: {
    menu: {
      bg: "background",
      py: "2px",
      boxShadow: "0 0 8px rgba(0, 0, 0, 0.125)",
      position: "absolute",
      right: 0,
      mt: [2],
      minWidth: "150px",
      origin: "top-right",
      borderRadius: "8px",
      zIndex: 9999,
      // bg-white shadow-lg ring-1 ring-black/5 focus:outline-none
    },
    menuitem: {
      py: "5px",
      px: "7px",
      pl: "10px",
      cursor: "pointer",
      "&:hover": {
        background: "#f3f0e9 !important",
      },
    },
  },
  colors: {
    text: "#44474d",
    textDark: "#111",
    background: "#ffffff",
    primary: "#5c73c9",
    secondary: "#E6E0D4",
    mediumGray: "#8f8f8f",
    lightGray: "#afafaf",
    lighterGray: "#e2ddd5",
    bgGrayLight: "#f3f0e9",
    bgGray: "#ede8dd",
    bgGrayActive: "#ede4d1",
    bgOffWhite: "#faf9f6",
    primaryActive: "#4e65bd",
    secondaryActive: "#e0e4e7",
    mediumGrayActive: "#7f7f7f",
    lightGrayActive: "#9f9f9f",
    mediumRed: "#dd413c",
    mediumRedActive: "#d32d28",
    mediumGreen: "#539a33",
    mediumGreenActive: "#448b24",
  },
  forms: {
    input: {
      fontSize: "inherit !important",
      fontFamily: "body",
      backgroundColor: "#ffffff",
      my: [2],
    },
    textarea: {
      fontSize: "inherit !important",
      fontFamily: "body",
      backgroundColor: "#ffffff",
      my: [2],
    },
  },
  links: {
    a: {
      fontWeight: "600",
      color: "primary",
      "&:active": {
        color: "primary",
      },
      "&:hover": {
        color: "primary",
        textDecoration: "underline",
      },
      "&:visited": {
        color: "primary",
      },
      textDecoration: "none",
      cursor: "pointer",
    },
    text: {
      fontWeight: "600",
      color: "primary",
      "&:active": {
        color: "primary",
      },
      "&:hover": {
        color: "primary",
        textDecoration: "underline",
      },
      textDecoration: "none",
      cursor: "pointer",
    },
    textGray: {
      fontWeight: "600",
      color: "mediumGray",
      "&:visited": {
        color: "mediumGray",
      },
      "&:active": {
        color: "mediumGrayActive",
      },
      "&:hover": {
        color: "mediumGrayActive",
        textDecoration: "underline",
      },
      textDecoration: "none",
      cursor: "pointer",
    },
    button: {
      px: "1em",
      pt: "0.7em",
      pb: "0.64em",
      borderRadius: "4px",
      backgroundColor: "primary",
      textDecoration: "none",
      color: "#fbf5e9 !important",
      "&:hover": {
        bg: "#4e65bd !important",
        textDecoration: "none",
      },
      bg: "primary",
      fontFamily: "body",
      cursor: "pointer",
      textWrap: "nowrap",
    },
    buttonBlack: {
      px: "1em",
      pt: "0.7em",
      pb: "0.64em",
      borderRadius: "4px",
      backgroundColor: "#373737",
      textDecoration: "none",
      color: "#fff !important",
      "&:hover": {
        backgroundColor: "#444 !important",
        borderBottomColor: "#444",
        textDecoration: "none",
      },
      fontFamily: "body",
      cursor: "pointer",
      textWrap: "nowrap",
    },
    nav: {
      fontFamily: "body",
      color: "inherit",
      "&.active": {
        color: "primary",
      },
      "&:hover": {
        color: "primary",
        borderBottom: "1.5px solid",
        borderBottomColor: "primary",
      },
      textDecoration: "none",
      fontWeight: "body",
      cursor: "pointer",
      borderBottom: "1.5px solid",
      borderBottomColor: "transparent",
    },
    activeNav: {
      fontFamily: "body",
      color: "inherit",
      "&.active": {
        color: "primary",
      },
      "&:hover": {
        color: "primary",
        borderBottomColor: "primary",
      },
      textDecoration: "none",
      mr: [4],
      fontSize: "0.96em",
      fontWeight: "heading",
      cursor: "pointer",
      borderBottom: "1.5px solid",
      borderBottomColor: "mediumGray",
    },
  },
  buttons: {
    vote: {
      bg: "bgGray",
      color: "text",
      cursor: "pointer",
      fontFamily: "body",
      fontSize: "0.96em",
      fontWeight: 500,
      borderRadius: 8,
      "&:hover": {
        backgroundColor: "bgGrayActive",
        color: "textDark",
      },
      pb: [0, 1],
      pt: [0, 1],
    },
    primary: {
      color: "background",
      bg: "primary",
      fontFamily: "body",
      borderRadius: [8],
      cursor: "pointer",
      border: "1px solid",
      borderColor: "primary",
      "&:hover": {
        bg: "primaryActive",
      },
    },
    black: {
      color: "background",
      bg: "#373737",
      fontFamily: "body",
      borderRadius: [8],
      cursor: "pointer",
      border: "1px solid",
      borderColor: "#373737",
      "&:hover": {
        bg: "#444",
      },
    },
    disabled: {
      color: "background",
      bg: "primary",
      fontFamily: "body",
      borderRadius: [8],
      border: "1px solid",
      borderColor: "primary",
      "&:hover": {
        bg: "primaryActive",
      },
      opacity: 0.4,
      pointerEvents: "none" as any,
    },
    secondary: {
      color: "background",
      bg: "lightGray",
      fontFamily: "body",
      cursor: "pointer",
      borderRadius: [8],
      "&:hover": {
        bg: "lightGrayActive",
      },
    },
    outline: {
      color: "primary",
      bg: "background",
      fontFamily: "body",
      cursor: "pointer",
      border: "1px solid",
      borderColor: "primary",
      borderRadius: [8],
      "&:hover": {
        color: "primaryActive",
        borderColor: "primaryActive",
      },
    },
    outlineSecondary: {
      color: "#6b6762",
      bg: "background",
      fontFamily: "body",
      cursor: "pointer",
      border: "1px solid",
      borderColor: "secondary",
      boxShadow: "2px 2px 2px #E6E0D433",
      py: [1],
      px: [2],
      borderRadius: [8],
      "&:hover": {
        boxShadow: "none",
        color: "mediumGrayActive",
        borderColor: "lightGrayActive",
      },
    },
    outlineRed: {
      color: "mediumRed",
      bg: "background",
      fontFamily: "body",
      cursor: "pointer",
      border: "1px solid",
      borderColor: "lightGray",
      "&:hover": {
        color: "mediumRedActive",
        borderColor: "mediumRedActive",
      },
    },
    outlineGreen: {
      color: "mediumGreen",
      bg: "background",
      fontFamily: "body",
      cursor: "pointer",
      border: "1px solid",
      borderColor: "lightGray",
      "&:hover": {
        color: "mediumGreenActive",
        borderColor: "mediumGreenActive",
      },
    },
    outlineLightGray: {
      color: "mediumGray",
      bg: "background",
      fontFamily: "body",
      cursor: "pointer",
      border: "1px solid",
      borderColor: "lightGray",
      "&:hover": {
        color: "lightGrayActive",
        borderColor: "lightGrayActive",
      },
    },
    outlineGray: {
      color: "mediumGray",
      bg: "background",
      fontFamily: "body",
      cursor: "pointer",
      border: "1px solid",
      borderColor: "lightGray",
      "&:hover": {
        color: "mediumGrayActive",
        borderColor: "lightGrayActive",
      },
    },
  },
  cards: {
    primary: {
      backgroundColor: "background",
      color: "mediumGray",
      padding: 3,
      borderRadius: 4,
      boxShadow: "0 0 8px rgba(0, 0, 0, 0.125)",
    },
  },
  styles: {
    root: {
      fontFamily: "body",
      lineHeight: "body",
      fontWeight: "body",
    },
    a: {
      color: "primary",
      "&:visited": {
        color: "primary",
      },
      "&:active": {
        color: "primary",
      },
      "&:hover": {
        textDecoration: "underline",
      },
      textDecoration: "none",
      cursor: "pointer",
    },
  },
}
