import { PlantData, FlowerType } from '../../lib/garden'
import Estagio0 from './flowers/Estagio0'
import Estagio1 from './flowers/Estagio1'
import Estagio2 from './flowers/Estagio2'
import Estagio3 from './flowers/Estagio3'
import RosaEstagio4 from './flowers/RosaEstagio4'
import RosaEstagio5 from './flowers/RosaEstagio5'
import OrquideaEstagio4 from './flowers/OrquideaEstagio4'
import OrquideaEstagio5 from './flowers/OrquideaEstagio5'
import TulipaEstagio4 from './flowers/TulipaEstagio4'
import TulipaEstagio5 from './flowers/TulipaEstagio5'
import MargaridaEstagio4 from './flowers/MargaridaEstagio4'
import MargaridaEstagio5 from './flowers/MargaridaEstagio5'
import GirassolEstagio4 from './flowers/GirassolEstagio4'
import GirassolEstagio5 from './flowers/GirassolEstagio5'
import EspecialEstagio4 from './flowers/EspecialEstagio4'
import EspecialEstagio5 from './flowers/EspecialEstagio5'

interface Props {
  plant: PlantData
}

function getPlantSVG(flowerType: FlowerType, stage: number, wilted: boolean) {
  if (stage === 0) return <Estagio0 wilted={wilted} />
  if (stage === 1) return <Estagio1 wilted={wilted} />
  if (stage === 2) return <Estagio2 wilted={wilted} />
  if (stage === 3) return <Estagio3 wilted={wilted} />

  if (flowerType === 'rosa') {
    if (stage >= 5) return <RosaEstagio5 wilted={wilted} />
    return <RosaEstagio4 wilted={wilted} />
  }
  if (flowerType === 'orquidea') {
    if (stage >= 5) return <OrquideaEstagio5 wilted={wilted} />
    return <OrquideaEstagio4 wilted={wilted} />
  }
  if (flowerType === 'especial') {
    if (stage >= 5) return <EspecialEstagio5 wilted={wilted} />
    return <EspecialEstagio4 wilted={wilted} />
  }
  if (flowerType === 'margarida') {
    if (stage >= 5) return <MargaridaEstagio5 wilted={wilted} />
    return <MargaridaEstagio4 wilted={wilted} />
  }
  if (flowerType === 'girassol') {
    if (stage >= 5) return <GirassolEstagio5 wilted={wilted} />
    return <GirassolEstagio4 wilted={wilted} />
  }
  if (stage >= 5) return <TulipaEstagio5 wilted={wilted} />
  return <TulipaEstagio4 wilted={wilted} />
}

export default function Plant({ plant }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {getPlantSVG(plant.flowerType, plant.stage, plant.wilted)}
    </div>
  )
}
