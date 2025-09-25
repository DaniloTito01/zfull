import { Router } from 'express';

const router = Router();

// Teste simples de auth
router.post('/test', async (req, res) => {
  console.log('🔥 AUTH TEST ROUTE CALLED');

  try {
    res.json({
      success: true,
      message: 'Auth route funcionando!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🔥 AUTH TEST ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no teste de auth'
    });
  }
});

// Teste super admin login simples
router.post('/super-admin/test', async (req, res) => {
  console.log('🔥 SUPER ADMIN TEST CALLED');

  try {
    res.json({
      success: true,
      message: 'Super admin test funcionando!',
      body: req.body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🔥 SUPER ADMIN TEST ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no teste super admin'
    });
  }
});

export default router;