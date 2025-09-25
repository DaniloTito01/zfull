import React from 'react'

function Servicos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <p className="text-gray-600">Gerencie os serviços oferecidos</p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-blue-600 text-2xl">🔧</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gerenciamento de Serviços</h3>
        <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
      </div>
    </div>
  )
}

export default Servicos
