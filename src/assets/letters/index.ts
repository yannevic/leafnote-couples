import rosa from './rosa.png'
import trevo from './trevo.png'
import lavanda from './lavanda.png'
import pessego from './pessego.png'
import nuvem from './nuvem.png'
import panda from './panda.png'
import cereja from './cereja.png'
import margarida from './margarida.png'
import luaNoite from './lua-noite.png'
import florAzul from './flor-azul.png'
import laco from './laco.png'
import urso from './urso.png'
import luaDia from './lua-dia.png'
import ursoRosa from './urso-rosa.png'
import estrela from './estrela.png'

import type { SpecialLetterLayout } from '../../types/board'

export interface CardModel {
  id: string
  label: string
  image: string
  layout: SpecialLetterLayout
}

export const CARD_MODELS: CardModel[] = [
  { id: 'rosa', label: 'Rosa', image: rosa, layout: 'A' },
  { id: 'trevo', label: 'Trevo', image: trevo, layout: 'A' },
  { id: 'lavanda', label: 'Lavanda', image: lavanda, layout: 'A' },
  { id: 'pessego', label: 'Pêssego', image: pessego, layout: 'A' },
  { id: 'nuvem', label: 'Nuvem', image: nuvem, layout: 'A' },
  { id: 'panda', label: 'Panda', image: panda, layout: 'A' },
  { id: 'cereja', label: 'Cereja', image: cereja, layout: 'A' },
  { id: 'margarida', label: 'Margarida', image: margarida, layout: 'A' },
  { id: 'lua-noite', label: 'Lua Noite', image: luaNoite, layout: 'B' },
  { id: 'flor-azul', label: 'Flor Azul', image: florAzul, layout: 'B' },
  { id: 'laco', label: 'Laço', image: laco, layout: 'B' },
  { id: 'urso', label: 'Urso', image: urso, layout: 'B' },
  { id: 'lua-dia', label: 'Lua Dia', image: luaDia, layout: 'C' },
  { id: 'urso-rosa', label: 'Urso Rosa', image: ursoRosa, layout: 'C' },
  { id: 'estrela', label: 'Estrela', image: estrela, layout: 'C' },
]
