// Componente para visualizar logs do frontend
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { logger, FrontendLogEntry, LogLevel } from '@/lib/logger';
import { Download, Trash2, Search, Filter, Eye, EyeOff } from 'lucide-react';

export const LogViewer: React.FC = () => {
  const [allLogs, setAllLogs] = useState<Record<string, FrontendLogEntry[]>>({});
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    setAllLogs(logger.getAllLogs());
  };

  const getFilteredLogs = (): FrontendLogEntry[] => {
    let logs: FrontendLogEntry[] = [];

    if (selectedComponent === 'all') {
      logs = Object.values(allLogs).flat();
    } else {
      logs = allLogs[selectedComponent] || [];
    }

    // Filtrar por nível
    if (selectedLevel !== 'all') {
      logs = logs.filter(log => log.level === selectedLevel);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      logs = logs.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.component.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por timestamp (mais recente primeiro)
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getLogLevelColor = (level: LogLevel): string => {
    const colors = {
      [LogLevel.ERROR]: 'bg-red-100 text-red-800',
      [LogLevel.WARN]: 'bg-yellow-100 text-yellow-800',
      [LogLevel.INFO]: 'bg-blue-100 text-blue-800',
      [LogLevel.DEBUG]: 'bg-green-100 text-green-800',
      [LogLevel.TRACE]: 'bg-gray-100 text-gray-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const exportLogs = () => {
    const logsJson = logger.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barbershop-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (confirm('Tem certeza que deseja limpar todos os logs?')) {
      logger.clearLogs(selectedComponent === 'all' ? undefined : selectedComponent);
      loadLogs();
    }
  };

  const filteredLogs = getFilteredLogs();
  const components = Object.keys(allLogs);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📊 Visualizador de Logs</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Buscar logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="px-3 py-1 border rounded-md"
            >
              <option value="all">Todos os Componentes</option>
              {components.map(component => (
                <option key={component} value={component}>
                  {component} ({allLogs[component].length})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'all')}
              className="px-3 py-1 border rounded-md"
            >
              <option value="all">Todos os Níveis</option>
              <option value={LogLevel.ERROR}>ERROR</option>
              <option value={LogLevel.WARN}>WARN</option>
              <option value={LogLevel.INFO}>INFO</option>
              <option value={LogLevel.DEBUG}>DEBUG</option>
              <option value={LogLevel.TRACE}>TRACE</option>
            </select>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex gap-4 mb-4">
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{filteredLogs.length}</span> logs
          </div>
          <div className="text-sm text-red-600">
            Erros: <span className="font-semibold">
              {filteredLogs.filter(l => l.level === LogLevel.ERROR).length}
            </span>
          </div>
          <div className="text-sm text-yellow-600">
            Avisos: <span className="font-semibold">
              {filteredLogs.filter(l => l.level === LogLevel.WARN).length}
            </span>
          </div>
        </div>

        {/* Lista de Logs */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Nenhum log encontrado com os filtros selecionados.
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={`${log.timestamp}-${index}`}
                className="border rounded-lg p-3 bg-white hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getLogLevelColor(log.level)}>
                      {log.level}
                    </Badge>
                    <span className="text-sm font-medium text-blue-600">
                      {log.component}
                    </span>
                    <span className="text-sm text-gray-500">
                      {log.action}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-sm mb-2">
                  {log.message}
                </div>

                {showDetails && (
                  <div className="text-xs text-gray-600 space-y-1">
                    {log.url && (
                      <div><strong>URL:</strong> {log.url}</div>
                    )}
                    {log.user_id && (
                      <div><strong>Usuário:</strong> {log.user_id}</div>
                    )}
                    {log.barbershop_id && (
                      <div><strong>Barbearia:</strong> {log.barbershop_id}</div>
                    )}
                    {log.session_id && (
                      <div><strong>Sessão:</strong> {log.session_id}</div>
                    )}
                    {log.performance && (
                      <div>
                        <strong>Performance:</strong> {log.performance.duration_ms}ms
                        {log.performance.memory_usage && (
                          <span> | Memória: {(log.performance.memory_usage / 1024 / 1024).toFixed(2)}MB</span>
                        )}
                      </div>
                    )}
                    {log.error && (
                      <div className="bg-red-50 p-2 rounded mt-2">
                        <div><strong>Erro:</strong> {log.error.name}: {log.error.message}</div>
                        {log.error.stack && (
                          <pre className="text-xs mt-1 overflow-x-auto">{log.error.stack}</pre>
                        )}
                      </div>
                    )}
                    {log.data && (
                      <div className="bg-gray-50 p-2 rounded mt-2">
                        <strong>Dados:</strong>
                        <pre className="text-xs mt-1 overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};