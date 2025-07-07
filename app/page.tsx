"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Zap, Trophy, Flag } from "lucide-react"
import { ParticipantesModal } from "@/components/ParticipantesModal"
import type { Participante } from "@/types/game"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const handleStartGame = (participantes: Participante[]) => {
    // Guardar participantes en sessionStorage para la página de juego
    sessionStorage.setItem("participantes", JSON.stringify(participantes))
    setShowModal(false)
    router.push("/jugar")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-white to-sky-300 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Flag className="h-12 w-12 text-sky-600" />
            <h1 className="text-5xl md:text-7xl font-black text-sky-800 drop-shadow-lg">¿PASÓ EN ARGENTINA?</h1>
            <Flag className="h-12 w-12 text-sky-600" />
          </div>
          <p className="text-xl md:text-2xl text-sky-700 font-medium">El juego de noticias increíbles pero reales</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-sky-200">
          <CardHeader className="text-center pb-4 bg-gradient-to-r from-sky-50 to-white">
            <CardTitle className="text-2xl md:text-3xl text-sky-900">
              Descubrí qué cosas increíbles pasaron realmente
            </CardTitle>
            <CardDescription className="text-lg text-sky-700">
              10 preguntas que te van a sorprender sobre Argentina
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-lg border border-sky-200">
                <Users className="h-8 w-8 text-sky-600" />
                <div>
                  <h3 className="font-semibold text-sky-900">Para grupos</h3>
                  <p className="text-sm text-sky-700">Hasta 25 participantes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Zap className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Dinámico</h3>
                  <p className="text-sm text-yellow-700">10 preguntas sorprendentes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Trophy className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Competitivo</h3>
                  <p className="text-sm text-green-700">Sistema de puntajes</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-sky-50 to-white p-6 rounded-lg border-2 border-sky-200">
              <h3 className="font-semibold text-sky-900 mb-3 text-lg">¿Cómo jugar?</h3>
              <ol className="space-y-3 text-sky-800">
                <li className="flex items-start gap-3">
                  <span className="bg-sky-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  <span>Agregá los nombres de todos los participantes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-sky-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  <span>Cada jugador vota por la opción que cree correcta</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-sky-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  <span>El administrador revela la respuesta correcta</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-sky-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                    4
                  </span>
                  <span>¡Sumá puntos y descubrí quién sabe más!</span>
                </li>
              </ol>
            </div>

            <div className="text-center pt-4">
              <Button
                onClick={() => setShowModal(true)}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🎮 ¡EMPEZAR A JUGAR!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ParticipantesModal isOpen={showModal} onClose={() => setShowModal(false)} onStartGame={handleStartGame} />
    </div>
  )
}
