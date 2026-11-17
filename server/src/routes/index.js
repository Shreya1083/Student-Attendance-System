import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import testRoutes from './testRoutes.js';
import adminRoutes from './adminRoutes.js';
import facultyRoutes from './facultyRoutes.js';

const router = Router();

// Mount Health Check: /api/v1/health
router.use('/health', healthRoutes);

// Mount Authentication: /api/v1/auth
router.use('/auth', authRoutes);

// Mount RBAC Verification Test Routes: /api/v1/test
router.use('/test', testRoutes);

// Mount Admin Master Data & Allocation Routes: /api/v1/admin
router.use('/admin', adminRoutes);

// Mount Faculty Endpoints: /api/v1/faculty
router.use('/faculty', facultyRoutes);

export default router;
