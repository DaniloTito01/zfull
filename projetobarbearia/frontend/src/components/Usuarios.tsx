import React from 'react'
function Usuarios() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-600">Gerenciamento de usuários do sistema</p>
      </div>
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-gray-600 text-2xl">👤</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Controle de Usuários</h3>
        <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
      </div>
    </div>
  )
}
export default Usuarios
