import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  Shield, 
  Globe, 
  Mail, 
  Bell,
  Database,
  CreditCard,
  Users,
  Key,
  Server,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SettingsSection = () => {
  const { toast } = useToast();
  
  // Platform Settings
  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'BarberShop Pro',
    platformDescription: 'Sistema completo para gestão de barbearias',
    supportEmail: 'suporte@barbershoppro.com',
    maintenanceMode: false,
    allowNewRegistrations: true,
    maxBarbershopsPerUser: 3,
    defaultPlan: 'basic',
    timeZone: 'America/Sao_Paulo',
    language: 'pt-BR',
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@barbershoppro.com',
    smtpPassword: '••••••••••',
    fromEmail: 'BarberShop Pro <noreply@barbershoppro.com>',
    enableEmailNotifications: true,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    newRegistrationAlert: true,
    paymentFailureAlert: true,
    systemErrorAlert: true,
    maintenanceAlert: true,
    lowUsageAlert: false,
    churnAlert: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    enforceStrongPasswords: true,
    twoFactorRequired: false,
    sessionTimeout: '24',
    maxLoginAttempts: '5',
    apiRateLimit: '1000',
    allowPasswordReset: true,
  });

  // Billing Settings
  const [billingSettings, setBillingSettings] = useState({
    currency: 'BRL',
    taxRate: '0',
    invoicePrefix: 'BSP',
    paymentGracePeriod: '7',
    autoSuspendAfterDays: '30',
    enableTrialPeriod: true,
    trialDays: '14',
  });

  const handleSavePlatformSettings = () => {
    // Aqui seria a lógica para salvar as configurações da plataforma
    toast({
      title: "Configurações salvas",
      description: "As configurações da plataforma foram atualizadas com sucesso.",
    });
  };

  const handleSaveEmailSettings = () => {
    // Aqui seria a lógica para salvar as configurações de email
    toast({
      title: "Configurações de email salvas",
      description: "As configurações de email foram atualizadas com sucesso.",
    });
  };

  const handleSaveNotificationSettings = () => {
    // Aqui seria a lógica para salvar as configurações de notificação
    toast({
      title: "Configurações de notificação salvas",
      description: "As configurações de notificação foram atualizadas com sucesso.",
    });
  };

  const handleSaveSecuritySettings = () => {
    // Aqui seria a lógica para salvar as configurações de segurança
    toast({
      title: "Configurações de segurança salvas",
      description: "As configurações de segurança foram atualizadas com sucesso.",
    });
  };

  const handleSaveBillingSettings = () => {
    // Aqui seria a lógica para salvar as configurações de cobrança
    toast({
      title: "Configurações de cobrança salvas",
      description: "As configurações de cobrança foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Configurações
          </h2>
          <p className="text-muted-foreground">
            Gerencie as configurações globais da plataforma
          </p>
        </div>
      </div>

      {/* Platform Settings */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Configurações da Plataforma
          </CardTitle>
          <CardDescription>
            Configurações gerais e básicas da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platformName">Nome da Plataforma</Label>
              <Input
                id="platformName"
                value={platformSettings.platformName}
                onChange={(e) => setPlatformSettings({...platformSettings, platformName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="supportEmail">Email de Suporte</Label>
              <Input
                id="supportEmail"
                type="email"
                value={platformSettings.supportEmail}
                onChange={(e) => setPlatformSettings({...platformSettings, supportEmail: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="platformDescription">Descrição da Plataforma</Label>
            <Textarea
              id="platformDescription"
              value={platformSettings.platformDescription}
              onChange={(e) => setPlatformSettings({...platformSettings, platformDescription: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="maxBarbershops">Máx. Barbearias por Usuário</Label>
              <Input
                id="maxBarbershops"
                type="number"
                value={platformSettings.maxBarbershopsPerUser}
                onChange={(e) => setPlatformSettings({...platformSettings, maxBarbershopsPerUser: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="defaultPlan">Plano Padrão</Label>
              <Select 
                value={platformSettings.defaultPlan} 
                onValueChange={(value) => setPlatformSettings({...platformSettings, defaultPlan: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select 
                value={platformSettings.timeZone} 
                onValueChange={(value) => setPlatformSettings({...platformSettings, timeZone: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Modo de Manutenção</Label>
                <p className="text-sm text-muted-foreground">Bloqueia acesso de usuários à plataforma</p>
              </div>
              <Switch
                checked={platformSettings.maintenanceMode}
                onCheckedChange={(checked) => setPlatformSettings({...platformSettings, maintenanceMode: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Permitir Novos Cadastros</Label>
                <p className="text-sm text-muted-foreground">Habilita registro de novas barbearias</p>
              </div>
              <Switch
                checked={platformSettings.allowNewRegistrations}
                onCheckedChange={(checked) => setPlatformSettings({...platformSettings, allowNewRegistrations: checked})}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSavePlatformSettings}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações da Plataforma
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Configurações de Email
          </CardTitle>
          <CardDescription>
            Configure o servidor SMTP e templates de email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpHost">Servidor SMTP</Label>
              <Input
                id="smtpHost"
                value={emailSettings.smtpHost}
                onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="smtpPort">Porta SMTP</Label>
              <Input
                id="smtpPort"
                value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpUser">Usuário SMTP</Label>
              <Input
                id="smtpUser"
                value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="smtpPassword">Senha SMTP</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="fromEmail">Email Remetente</Label>
            <Input
              id="fromEmail"
              value={emailSettings.fromEmail}
              onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">Habilita envio de notificações por email</p>
            </div>
            <Switch
              checked={emailSettings.enableEmailNotifications}
              onCheckedChange={(checked) => setEmailSettings({...emailSettings, enableEmailNotifications: checked})}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveEmailSettings}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações de Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription>
            Configure quais eventos geram notificações para administradores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Novos Registros</Label>
                <p className="text-sm text-muted-foreground">Notifica quando uma nova barbearia se registra</p>
              </div>
              <Switch
                checked={notificationSettings.newRegistrationAlert}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newRegistrationAlert: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Falhas de Pagamento</Label>
                <p className="text-sm text-muted-foreground">Notifica quando pagamentos falham</p>
              </div>
              <Switch
                checked={notificationSettings.paymentFailureAlert}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, paymentFailureAlert: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Erros do Sistema</Label>
                <p className="text-sm text-muted-foreground">Notifica sobre erros críticos do sistema</p>
              </div>
              <Switch
                checked={notificationSettings.systemErrorAlert}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemErrorAlert: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Churn</Label>
                <p className="text-sm text-muted-foreground">Notifica sobre cancelamentos e churns</p>
              </div>
              <Switch
                checked={notificationSettings.churnAlert}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, churnAlert: checked})}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotificationSettings}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações de Notificação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Configurações de Segurança
          </CardTitle>
          <CardDescription>
            Configure políticas de segurança e autenticação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionTimeout">Timeout de Sessão (horas)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">Máx. Tentativas de Login</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="apiRateLimit">Limite de Rate da API (req/min)</Label>
            <Input
              id="apiRateLimit"
              type="number"
              value={securitySettings.apiRateLimit}
              onChange={(e) => setSecuritySettings({...securitySettings, apiRateLimit: e.target.value})}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Senhas Seguras Obrigatórias</Label>
                <p className="text-sm text-muted-foreground">Força uso de senhas complexas</p>
              </div>
              <Switch
                checked={securitySettings.enforceStrongPasswords}
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, enforceStrongPasswords: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>2FA Obrigatório para Admins</Label>
                <p className="text-sm text-muted-foreground">Exige autenticação de dois fatores</p>
              </div>
              <Switch
                checked={securitySettings.twoFactorRequired}
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorRequired: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Permitir Reset de Senha</Label>
                <p className="text-sm text-muted-foreground">Permite recuperação de senha por email</p>
              </div>
              <Switch
                checked={securitySettings.allowPasswordReset}
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, allowPasswordReset: checked})}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSecuritySettings}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações de Segurança
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Settings */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Configurações de Cobrança
          </CardTitle>
          <CardDescription>
            Configure parâmetros de cobrança e planos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currency">Moeda</Label>
              <Select 
                value={billingSettings.currency} 
                onValueChange={(value) => setBillingSettings({...billingSettings, currency: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (BRL)</SelectItem>
                  <SelectItem value="USD">Dólar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="taxRate">Taxa de Imposto (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={billingSettings.taxRate}
                onChange={(e) => setBillingSettings({...billingSettings, taxRate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="invoicePrefix">Prefixo da Fatura</Label>
              <Input
                id="invoicePrefix"
                value={billingSettings.invoicePrefix}
                onChange={(e) => setBillingSettings({...billingSettings, invoicePrefix: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gracePeriod">Período de Carência (dias)</Label>
              <Input
                id="gracePeriod"
                type="number"
                value={billingSettings.paymentGracePeriod}
                onChange={(e) => setBillingSettings({...billingSettings, paymentGracePeriod: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="autoSuspend">Auto-suspender após (dias)</Label>
              <Input
                id="autoSuspend"
                type="number"
                value={billingSettings.autoSuspendAfterDays}
                onChange={(e) => setBillingSettings({...billingSettings, autoSuspendAfterDays: e.target.value})}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Período de Teste Gratuito</Label>
                <p className="text-sm text-muted-foreground">Oferece período de teste para novos usuários</p>
              </div>
              <Switch
                checked={billingSettings.enableTrialPeriod}
                onCheckedChange={(checked) => setBillingSettings({...billingSettings, enableTrialPeriod: checked})}
              />
            </div>

            {billingSettings.enableTrialPeriod && (
              <div>
                <Label htmlFor="trialDays">Dias de Teste Gratuito</Label>
                <Input
                  id="trialDays"
                  type="number"
                  value={billingSettings.trialDays}
                  onChange={(e) => setBillingSettings({...billingSettings, trialDays: e.target.value})}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveBillingSettings}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações de Cobrança
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Status do Sistema
          </CardTitle>
          <CardDescription>
            Informações sobre o status atual do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1.2s</div>
              <div className="text-sm text-muted-foreground">Resposta Média</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">45GB</div>
              <div className="text-sm text-muted-foreground">Uso de Storage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">12k</div>
              <div className="text-sm text-muted-foreground">Req/hora</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-600">
              Sistema Operacional
            </Badge>
            <Badge variant="outline">
              Última atualização: 31/01/2024 10:30
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;