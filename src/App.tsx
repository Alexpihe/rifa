import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Users, Trophy, RotateCcw, Settings, Palette, Type, Share2, Gift, Crown } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
}

interface Prize {
  id: string;
  name: string;
  description: string;
}
interface WheelStyle {
  id: string;
  name: string;
  colors: string[];
  textColor: string;
}

const wheelStyles: WheelStyle[] = [
  {
    id: 'classic',
    name: 'Clásico Azul',
    colors: [
      '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE',
      '#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'
    ],
    textColor: '#FFFFFF'
  },
  {
    id: 'gradient',
    name: 'Gradiente Azul',
    colors: [
      '#0F172A', '#1E293B', '#334155', '#475569', '#64748B', '#94A3B8',
      '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'
    ],
    textColor: '#FFFFFF'
  },
  {
    id: 'vibrant',
    name: 'Vibrante',
    colors: [
      '#1E40AF', '#7C3AED', '#2563EB', '#DC2626', '#3B82F6', '#059669',
      '#EA580C', '#0891B2', '#7C2D12', '#BE123C', '#4338CA', '#0D9488'
    ],
    textColor: '#FFFFFF'
  },
  {
    id: 'pastel',
    name: 'Pastel',
    colors: [
      '#DBEAFE', '#E0E7FF', '#FEF3C7', '#D1FAE5', '#FCE7F3', '#F3E8FF',
      '#BFDBFE', '#C7D2FE', '#FDE68A', '#A7F3D0', '#F9A8D4', '#DDD6FE'
    ],
    textColor: '#1F2937'
  }
];

function App() {
  const [raffleName, setRaffleName] = useState('Mi Rifa Especial');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipants, setNewParticipants] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);
  const [numberOfWinners, setNumberOfWinners] = useState(1);
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<WheelStyle>(wheelStyles[0]);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [newPrize, setNewPrize] = useState({ name: '', description: '' });
  const [showPrizesPanel, setShowPrizesPanel] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  const addParticipants = () => {
    if (!newParticipants.trim()) return;
    
    const names = newParticipants
      .split(/[,\n]/)
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .filter(name => !participants.some(p => p.name.toLowerCase() === name.toLowerCase()));
    
    const newParticipantsList = names.map(name => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name
    }));
    
    setParticipants([...participants, ...newParticipantsList]);
    setNewParticipants('');
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
    if (participants.length <= 1) {
      setWinners([]);
    }
  };

  const clearAllParticipants = () => {
    setParticipants([]);
    setWinners([]);
  };

  const addPrize = () => {
    if (!newPrize.name.trim()) return;
    
    const prize: Prize = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: newPrize.name.trim(),
      description: newPrize.description.trim()
    };
    
    setPrizes([...prizes, prize]);
    setNewPrize({ name: '', description: '' });
  };

  const removePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id));
  };

  const spinWheel = () => {
    if (participants.length < numberOfWinners) return;
    
    setIsSpinning(true);
    setWinners([]);
    
    // Función para girar la ruleta múltiples veces
    const performSpins = async () => {
      const availableParticipants = [...participants];
      const selectedWinners: string[] = [];
      const degreesPerSlice = 360 / participants.length;
      
      for (let spin = 0; spin < numberOfWinners; spin++) {
        // Seleccionar ganador para este giro
        const randomIndex = Math.floor(Math.random() * availableParticipants.length);
        const winner = availableParticipants[randomIndex];
        selectedWinners.push(winner.name);
        availableParticipants.splice(randomIndex, 1);
        
        // Calcular rotación para este ganador
        const winnerIndex = participants.findIndex(p => p.id === winner.id);
        const extraSpins = 3 + Math.random() * 2; // Menos giros por cada vuelta
        const targetRotation = rotation + (360 * extraSpins) + (360 - (winnerIndex * degreesPerSlice)) - (degreesPerSlice / 2);
        
        setRotation(targetRotation);
        
        // Esperar a que termine la animación antes del siguiente giro
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Mostrar ganador temporal si hay más giros
        if (spin < numberOfWinners - 1) {
          setWinners([...selectedWinners]);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Mostrar todos los ganadores finales
      setWinners(selectedWinners);
      setIsSpinning(false);
    };
    
    performSpins();
  };

  const resetRaffle = () => {
    setWinners([]);
    setRotation(0);
    setIsSpinning(false);
  };

  const shareWinners = () => {
    const winnersText = winners.length === 1 
      ? `🎉 ¡Ganador de "${raffleName}": ${winners[0]}!`
      : `🎉 ¡Ganadores de "${raffleName}": ${winners.join(', ')}!`;
    
    const prizeText = prizes.length > 0 
      ? `\n🎁 Premios: ${prizes.map(p => p.name).join(', ')}`
      : '';
    
    const shareText = `${winnersText}${prizeText}\n\n#Rifa #Sorteo #Ganador`;
    
    if (navigator.share) {
      navigator.share({
        title: `Ganador de ${raffleName}`,
        text: shareText,
      });
    } else {
      // Crear URLs para compartir
      const encodedText = encodeURIComponent(shareText);
      const currentUrl = encodeURIComponent(window.location.href);
      
      // Abrir directamente en la red social más popular (Twitter)
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      addParticipants();
    }
  };

  const generateWheelSegments = () => {
    if (participants.length === 0) return [];
    
    const degreesPerSlice = 360 / participants.length;
    
    return participants.map((participant, index) => {
      const rotation = index * degreesPerSlice;
      const color = selectedStyle.colors[index % selectedStyle.colors.length];
      
      // Calculate path for casino-style segment
      const startAngle = rotation * (Math.PI / 180);
      const endAngle = (rotation + degreesPerSlice) * (Math.PI / 180);
      const radius = 160;
      const innerRadius = 40;
      
      const x1 = Math.cos(startAngle) * innerRadius;
      const y1 = Math.sin(startAngle) * innerRadius;
      const x2 = Math.cos(startAngle) * radius;
      const y2 = Math.sin(startAngle) * radius;
      const x3 = Math.cos(endAngle) * radius;
      const y3 = Math.sin(endAngle) * radius;
      const x4 = Math.cos(endAngle) * innerRadius;
      const y4 = Math.sin(endAngle) * innerRadius;
      
      const largeArcFlag = degreesPerSlice > 180 ? 1 : 0;
      
      const pathData = [
        `M ${x1} ${y1}`,
        `L ${x2} ${y2}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
        `L ${x4} ${y4}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
        'Z'
      ].join(' ');
      
      // Calculate text position - positioned at 70% of radius for better visibility
      const textRadius = 110;
      const textAngle = (rotation + degreesPerSlice / 2) * (Math.PI / 180);
      const textX = Math.cos(textAngle) * textRadius;
      const textY = Math.sin(textAngle) * textRadius;
      
      return (
        <g
          key={participant.id}
        >
          {/* Segment */}
          <path
            d={pathData}
            fill={color}
            stroke="#1f2937"
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          {/* Segment border highlight */}
          <path
            d={pathData}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />
          {/* Text */}
          <text
            x={textX}
            y={textY}
            fill={selectedStyle.textColor}
            fontSize={participants.length > 20 ? '11' : participants.length > 10 ? '13' : '15'}
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${rotation + degreesPerSlice / 2}, ${textX}, ${textY})`}
            style={{
              filter: selectedStyle.textColor === '#FFFFFF' 
                ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))' 
                : 'drop-shadow(2px 2px 4px rgba(255,255,255,0.8))',
            }}
          >
            {participant.name}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              {isEditingName ? (
                <input
                  type="text"
                  value={raffleName}
                  onChange={(e) => setRaffleName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  className="text-3xl font-bold text-blue-900 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none"
                  autoFocus
                />
              ) : (
                <h1 
                  className="text-3xl font-bold text-blue-900 cursor-pointer hover:text-blue-700 transition-colors"
                  onClick={() => setIsEditingName(true)}
                >
                  {raffleName}
                </h1>
              )}
              <Settings 
                className="h-5 w-5 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                onClick={() => setIsEditingName(true)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStylePanel(!showStylePanel)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
              >
                <Palette className="h-5 w-5 text-blue-600" />
                <span className="text-blue-600 font-semibold">Estilo</span>
              </button>
              <button
                onClick={() => setShowPrizesPanel(!showPrizesPanel)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
              >
                <Gift className="h-5 w-5 text-green-600" />
                <span className="text-green-600 font-semibold">Premios</span>
              </button>
              <div className="flex items-center space-x-2 text-blue-700">
                <Users className="h-5 w-5" />
                <span className="font-semibold">{participants.length} participantes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Style Panel */}
      {showStylePanel && (
        <div className="bg-white/90 backdrop-blur-sm border-b border-blue-200 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Estilos de Ruleta</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {wheelStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedStyle.id === style.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex space-x-1 mb-2">
                    {style.colors.slice(0, 6).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{style.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prizes Panel */}
      {showPrizesPanel && (
        <div className="bg-white/90 backdrop-blur-sm border-b border-green-200 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Premios de la Rifa</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Nombre del premio"
                value={newPrize.name}
                onChange={(e) => setNewPrize({...newPrize, name: e.target.value})}
                className="px-3 py-2 border border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={newPrize.description}
                onChange={(e) => setNewPrize({...newPrize, description: e.target.value})}
                className="px-3 py-2 border border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>
            <button onClick={addPrize} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors">
              Agregar Premio
            </button>
            <div className="grid md:grid-cols-3 gap-3 mt-4">
              {prizes.map((prize) => (
                <div key={prize.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">{prize.name}</h4>
                      {prize.description && (
                        <p className="text-sm text-green-700 mt-1">{prize.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removePrize(prize.id)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Wheel Section */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              {/* Wheel Container */}
              <div className="relative">
                {/* Casino-style outer rings */}
                <div className="absolute inset-0 w-96 h-96 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 shadow-2xl"></div>
                <div className="absolute inset-1 w-94 h-94 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 shadow-xl"></div>
                <div className="absolute inset-2 w-92 h-92 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg"></div>
                <div className="absolute inset-3 w-90 h-90 rounded-full bg-gradient-to-br from-gray-700 to-gray-800"></div>
                
                <svg 
                  ref={wheelRef}
                  className={`relative w-88 h-88 m-4 transition-transform duration-3000 ease-out ${isSpinning ? 'animate-spin-slow' : ''}`}
                  style={{ 
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
                  }}
                  viewBox="-180 -180 360 360"
                >
                  {participants.length > 0 ? (
                    generateWheelSegments()
                  ) : (
                    <circle
                      cx="0"
                      cy="0"
                      r="160"
                      fill="url(#emptyGradient)"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                    />
                  )}
                  
                  {/* Gradient definitions */}
                  <defs>
                    <radialGradient id="emptyGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#F3F4F6" />
                      <stop offset="100%" stopColor="#D1D5DB" />
                    </radialGradient>
                    <radialGradient id="centerGradient" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#FDE047" />
                      <stop offset="50%" stopColor="#FACC15" />
                      <stop offset="100%" stopColor="#CA8A04" />
                    </radialGradient>
                  </defs>
                  
                  {/* Center hub */}
                  <circle
                    cx="0"
                    cy="0"
                    r="35"
                    fill="url(#centerGradient)"
                    stroke="#92400E"
                    strokeWidth="3"
                    className="drop-shadow-lg"
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="25"
                    fill="#FEF3C7"
                    stroke="#D97706"
                    strokeWidth="2"
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="12"
                    fill="#FBBF24"
                  />
                </svg>
                
                {/* Empty state text */}
                {participants.length === 0 && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-gray-500 font-semibold text-lg">Agrega participantes</span>
                  </div>
                )}
                
                {/* Pointer */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="relative">
                    {/* Pointer base */}
                    <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-lg border-2 border-white"></div>
                    {/* Pointer arrow */}
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600 shadow-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-blue-100 mb-4">
              <div className="flex items-center justify-center space-x-4">
                <label className="flex items-center space-x-2 text-blue-900 font-semibold">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <span>Número de ganadores:</span>
                </label>
                <select
                  value={numberOfWinners}
                  onChange={(e) => setNumberOfWinners(parseInt(e.target.value))}
                  className="px-3 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none font-semibold"
                >
                  {Array.from({length: Math.min(participants.length, 10)}, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={spinWheel}
                disabled={participants.length < numberOfWinners || isSpinning}
                className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-200 ${
                  participants.length < numberOfWinners || isSpinning
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {isSpinning ? 'Girando...' : '🎲 Girar Ruleta'}
              </button>
              
              <button
                onClick={resetRaffle}
                className="px-6 py-4 rounded-xl font-semibold text-blue-600 bg-white border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>

            {/* Winner Display */}
            {winners.length > 0 && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-2xl text-center">
                <Trophy className="h-12 w-12 mx-auto mb-3 text-yellow-300" />
                <h2 className="text-2xl font-bold mb-2">
                  {winners.length === 1 ? '¡Ganador!' : '¡Ganadores!'}
                </h2>
                <div className="space-y-2">
                  {winners.map((winner, index) => (
                    <p key={index} className="text-xl font-semibold">
                      {winners.length > 1 && `${index + 1}. `}{winner}
                    </p>
                  ))}
                </div>
                {prizes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-400">
                    <h3 className="text-lg font-semibold mb-2">🎁 Premios:</h3>
                    <div className="space-y-1">
                      {prizes.map((prize, index) => (
                        <p key={prize.id} className="text-sm">
                          {prize.name}{prize.description && ` - ${prize.description}`}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={shareWinners}
                  className="mt-4 px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Compartir Resultado</span>
                </button>
              </div>
            )}
          </div>

          {/* Participants Section */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-blue-100">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Participantes</h2>
              
              {/* Add Multiple Participants */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Type className="h-4 w-4" />
                  <span>Separa los nombres con comas o saltos de línea</span>
                </div>
                <textarea
                  placeholder="Ejemplo:&#10;Juan Pérez&#10;María García, Carlos López&#10;Ana Martínez"
                  value={newParticipants}
                  onChange={(e) => setNewParticipants(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none transition-colors resize-none h-32"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={addParticipants}
                    disabled={!newParticipants.trim()}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 ${
                      !newParticipants.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105'
                    }`}
                  >
                    <Plus className="h-5 w-5 inline mr-2" />
                    Agregar Participantes
                  </button>
                  {participants.length > 0 && (
                    <button
                      onClick={clearAllParticipants}
                      className="px-6 py-3 rounded-xl font-semibold text-red-600 bg-red-50 border-2 border-red-200 hover:bg-red-100 hover:border-red-300 shadow-lg transition-all duration-200"
                    >
                      Limpiar Todo
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Tip: Usa Ctrl + Enter para agregar rápidamente
                </div>
              </div>

              {/* Participants List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {participants.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay participantes aún</p>
                    <p className="text-sm">Agrega al menos 2 para comenzar</p>
                  </div>
                ) : (
                  participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                          style={{ 
                            backgroundColor: selectedStyle.colors[index % selectedStyle.colors.length],
                            color: selectedStyle.textColor 
                          }}
                        >
                          {index + 1}
                        </div>
                        <span className="font-semibold text-blue-900">{participant.name}</span>
                      </div>
                      <button
                        onClick={() => removeParticipant(participant.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {participants.length > 0 && participants.length < numberOfWinners && (
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-xl">
                  <p className="text-yellow-800 text-sm font-semibold">
                    ⚠️ Necesitas al menos {numberOfWinners} participantes para realizar la rifa
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;