import { MenuLiquidGlass } from '@gatsby/liquidglassui'
import { useState } from 'react'
import {
  ANIMATIONS,
  getAnimationComponent,
  type AnimationId,
} from '../../animations'
import { ConfigPanel } from '../../components/ConfigPanel/ConfigPanel'
import { GlassMount } from '../../components/GlassMount'
import { ThreePerfStats } from '../../components/ThreePerfStats/ThreePerfStats'
import { AnimationParamsProvider } from '../../context/AnimationParamsContext'
import './Home.scss'

function Home() {
  const [activeAnimation, setActiveAnimation] = useState<AnimationId>('cyberspace')
  const ActiveBackground = getAnimationComponent(activeAnimation)

  return (
    <AnimationParamsProvider animationId={activeAnimation}>
      <div className="home">
        {ActiveBackground && <ActiveBackground key={activeAnimation} />}
        <ThreePerfStats />
        <GlassMount>
          <MenuLiquidGlass
            className="home__menu"
            filterMode="filter"
            glassParams={{ borderRadius: 12, strength: 2.35, edgeFalloff: 18 }}
            mode="vertical"
            items={ANIMATIONS.map(({ id, label }) => ({
              key: id,
              label,
            }))}
            selectedKeys={[activeAnimation]}
            onSelect={(key) => setActiveAnimation(key as AnimationId)}
          />
        </GlassMount>
        <GlassMount>
          <ConfigPanel />
        </GlassMount>
      </div>
    </AnimationParamsProvider>
  )
}

export default Home
