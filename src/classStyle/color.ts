import type { magizTypes } from '../types/magizTypes'

export { presetColors, presetLight }

const presetColors: magizTypes.presetColor = {
  face: {
    _GLASS: '#8bf',
    _CONCRETE: '#eee',
    _METAL: '#666',
    _WOOD: '#eb7',
    _BRICK: '#d66',
    _ROOF: '#333',
  },
  other: {
    EDGE: '#000',
    GROUND: '#eee',
    SKY: '#fff',
  },
}

const presetLight = [
  { hour: 5, color: '#116', directional: 0, ambient: 0 },
  { hour: 6, color: '#f60', directional: 0.6, ambient: 0.2 },
  { hour: 9, color: '#fff', directional: 2, ambient: 0.6 },
  { hour: 12, color: '#fff', directional: 2, ambient: 0.6 },
  { hour: 16, color: '#fff', directional: 2, ambient: 0.6 },
  { hour: 18, color: '#d33', directional: 0.6, ambient: 0.2 },
  { hour: 19, color: '#116', directional: 0.1, ambient: 0.1 },
  { hour: 24, color: '#000', directional: 0, ambient: 0 },
]
