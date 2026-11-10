import React from 'react'
import { Room, RoomPlayer, GameSession } from '@/types'
import { MeenBarraSalfa } from './meen-barra/MeenBarraSalfa'
import { MeenAtrash } from './meen-atrash/MeenAtrash'
import { MeenBarraRasma } from './meen-barra-rasma/MeenBarraRasma'
import { MeenGhalban } from './meen-ghalban/MeenGhalban'
import { Mamnoo3 } from './mamnoo3/Mamnoo3'
import { TahadiSoraa } from './tahadi/TahadiSoraa'
import { IrsomWKhamen } from './irsom/IrsomWKhamen'
import { Button } from '@/components/ui/Button'

interface GameContainerProps {
  room: Room
  players: RoomPlayer[]
  gameSession: GameSession
  currentUserId: string
  isHost: boolean
  onBackToLobby: () => void
}

export const GameContainer: React.FC<GameContainerProps> = (props) => {
  const { gameSession } = props

  const gameProps = {
    ...props,
    players: props.players,
  }

  switch (gameSession.game_type) {
    case 'meen_barra_salfa':
      return <MeenBarraSalfa {...gameProps} />
    case 'meen_atrash':
      return <MeenAtrash {...gameProps} />
    case 'meen_barra_rasma':
      return <MeenBarraRasma {...gameProps} />
    case 'meen_ghalban':
      return <MeenGhalban {...gameProps} />
    case 'mamnoo3_tahki':
      return <Mamnoo3 {...gameProps} />
    case 'tahadi_soraa':
      return <TahadiSoraa {...gameProps} />
    case 'irsom_w_khamen':
      return <IrsomWKhamen {...gameProps} />
    default:
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-4">لعبة غير معروفة</h2>
            <Button onClick={props.onBackToLobby}>العودة للغرفة</Button>
          </div>
        </div>
      )
  }
}
