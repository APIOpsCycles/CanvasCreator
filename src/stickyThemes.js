const stickyThemes = {
  classic: {
    label: 'Classic',
    description: 'Original sticky-note palette.',
    swatches: ['#C0EB6A', '#DFDDC5', '#FFAFAF', '#7DC9E7', '#FFF399'],
    style: {
      noteBorder: '#4f4f4f',
      noteShadow: 'soft',
    },
  },
  ocean: {
    label: 'Ocean',
    description: 'Cool tones for mapping and planning.',
    swatches: ['#8ED1FC', '#B5EAEA', '#6FA8DC', '#A4C2F4', '#D9EAD3'],
    style: {
      noteBorder: '#245f73',
      noteShadow: 'medium',
    },
  },
  sunset: {
    label: 'Sunset',
    description: 'Warm tones for ideation sessions.',
    swatches: ['#FFD6A5', '#FFADAD', '#FDFFB6', '#FEC89A', '#F4ACB7'],
    style: {
      noteBorder: '#8a3f28',
      noteShadow: 'soft',
    },
  },
}

function getThemeNames() {
  return Object.keys(stickyThemes)
}

function getTheme(themeName) {
  if (themeName && stickyThemes[themeName]) {
    return {
      name: themeName,
      ...stickyThemes[themeName],
    }
  }

  const [defaultThemeName] = getThemeNames()
  return {
    name: defaultThemeName,
    ...stickyThemes[defaultThemeName],
  }
}


function buildPaletteSwatches(themeName, currentColor) {
  const theme = getTheme(themeName)
  const safeColor = getSafeColorForTheme(theme.name, currentColor)

  return theme.swatches.map((color) => ({
    color,
    isSelected: color === safeColor,
  }))
}

function getSafeColorForTheme(themeName, requestedColor) {
  const theme = getTheme(themeName)
  if (requestedColor && theme.swatches.includes(requestedColor.toUpperCase())) {
    return requestedColor.toUpperCase()
  }

  return theme.swatches[0]
}

module.exports = {
  stickyThemes,
  getTheme,
  getThemeNames,
  getSafeColorForTheme,
  buildPaletteSwatches,
}
