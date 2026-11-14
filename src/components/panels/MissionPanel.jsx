import React from 'react';
import {
  Sparkles,
  Compass,
  CheckCircle2,
  Layers,
  FlaskConical,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';

export function MissionPanel() {
  const scientificGoals = [
    {
      id: 'boxwork',
      title: 'Formaciones Boxwork (Desafío NASA 2025)',
      location: 'Canal Gediz Vallis (-4.78°, 137.35°)',
      description: 'Redes poligonales de crestas minerales formadas cuando fluidos ricos en sales precipitaron en fracturas de roca madre.',
      priority: 'Prioridad 1 (Crítica)',
      datasets: ['MOLA Topografía', 'HiRISE Óptica', 'CheMin Espectrometría'],
      samplesNeeded: '3 muestras de testigo mineral',
      completed: false,
    },
    {
      id: 'clays',
      title: 'Filosilicatos y Biomarcadores',
      location: 'Glen Torridon (-4.755°, 137.385°)',
      description: 'Estratos de arcilla esmectita depositados en aguas templadas y neutras con alto potencial de preservación de materia orgánica.',
      priority: 'Prioridad 1',
      datasets: ['CRISM Espectral', 'REMS Humedad'],
      samplesNeeded: '2 muestras de regolito arcilloso profundo',
      completed: true,
    },
    {
      id: 'hematite',
      title: 'Transición Geoquímica de Oxidación',
      location: 'Cresta Vera Rubin (-4.73°, 137.36°)',
      description: 'Afloramiento de hematita cristalina gris. Revela el cambio radical del pH y potencial redox del agua marciana.',
      priority: 'Prioridad 2',
      datasets: ['THEMIS Infrarrojo', 'Mastcam Stereo'],
      samplesNeeded: '2 fragmentos de nódulos de óxido de hierro',
      completed: false,
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto text-[#F5F5F7]">
      {/* Encabezado de la Misión */}
      <div className="bg-[#1D1D1F]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-apple-card">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-[#BF5AF2] flex items-center justify-center">
            <Award size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#F5F5F7]">
              Consola Científica de Misión — Marswalk Artemisa
            </h2>
            <p className="text-xs text-[#86868B]">
              Respuesta al Reto NASA Space Apps: Integración Multicapa de Datos para Exploración Humana
            </p>
          </div>
        </div>

        <p className="text-sm text-[#86868B] leading-relaxed mt-4">
          La primera tripulación humana en Marte requiere cartas de navegación integradas que unan
          datos ópticos de alta resolución, altimetría láser de pendientes, perfiles térmicos y radiológicos
          en tiempo real. MarsWalk Navigator transforma terabytes de datos de orbitadores y rovers de la NASA
          en una ruta segura y ejecutable con monitoreo biológico y geológico continuo.
        </p>
      </div>

      {/* Matriz de Datos Científicos Integrados de la NASA */}
      <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-apple-card space-y-4">
        <h3 className="text-base font-semibold text-[#F5F5F7] flex items-center gap-2">
          <Layers size={18} className="text-[#0071E3]" />
          <span>Matriz de Fuentes Científicas de la NASA Integradas</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-xs font-semibold text-[#30D158] block mb-1">
              Topografía y Pendientes
            </span>
            <span className="text-sm font-medium text-[#F5F5F7] block">
              MGS MOLA & HRSC DEM
            </span>
            <p className="text-xs text-[#86868B] mt-1">
              Altimetría láser con resolución vertical de 1 m. Alerta de pendientes &gt;25° para seguridad del traje.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-xs font-semibold text-[#0071E3] block mb-1">
              Meteorología Superficial
            </span>
            <span className="text-sm font-medium text-[#F5F5F7] block">
              Curiosity REMS Station
            </span>
            <p className="text-xs text-[#86868B] mt-1">
              Temperatura de suelo y aire, ráfagas de viento, presión y opacidad de polvo atmosférico (Tau).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-xs font-semibold text-[#BF5AF2] block mb-1">
              Radiación Espacial Táctica
            </span>
            <span className="text-sm font-medium text-[#F5F5F7] block">
              Curiosity RAD Instrument
            </span>
            <p className="text-xs text-[#86868B] mt-1">
              Dosis acumulada GCR/SEP calculada dinámicamente con el blindaje de la columna atmosférica del cráter.
            </p>
          </div>
        </div>
      </div>

      {/* Objetivos Científicos en Terreno */}
      <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-apple-card space-y-4">
        <h3 className="text-base font-semibold text-[#F5F5F7] flex items-center gap-2">
          <FlaskConical size={18} className="text-[#FF9F0A]" />
          <span>Objetivos Científicos para la Marswalk</span>
        </h3>

        <div className="space-y-3">
          {scientificGoals.map((goal) => (
            <div
              key={goal.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-[#F5F5F7]">{goal.title}</h4>
                  <span className="text-xs text-[#86868B]">{goal.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#0071E3]/15 text-[#0071E3] border border-[#0071E3]/30">
                    {goal.priority}
                  </span>
                  {goal.completed && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Muestreado
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#86868B] leading-relaxed mb-3">
                {goal.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-[#86868B]">
                <div className="flex items-center gap-2">
                  <span>Capas requeridas:</span>
                  {goal.datasets.map((ds, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-[#F5F5F7]">
                      {ds}
                    </span>
                  ))}
                </div>
                <div className="font-medium text-[#FF9F0A]">
                  {goal.samplesNeeded}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
