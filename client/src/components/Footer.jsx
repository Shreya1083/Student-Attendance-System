import React from 'react';
import { Layers, Database, Lock, Cpu } from 'lucide-react';
import { APP_CONFIG } from '../utils/constants.js';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">{APP_CONFIG.name}</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Centralized academic attendance tracking, real-time analytics, and automated shortage notification system for higher education institutions.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>Frontend Architecture</span>
            </h4>
            <p className="text-slate-500 text-xs">
              React 18 + Vite, Tailwind CSS, React Router, Axios, Lucide React.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Backend & Security</span>
            </h4>
            <p className="text-slate-500 text-xs">
              Node.js + Express REST API, JWT, bcrypt, Helmet, CORS, Rate Limiting, Mongo Sanitize.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Data & Reliability</span>
            </h4>
            <p className="text-slate-500 text-xs">
              MongoDB with Mongoose ODM, Compound Unique Constraints & Multi-doc Transactions.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CampusTrack. All rights reserved.</p>
          <p>Campus Attendance Management Portal • Version {APP_CONFIG.version}</p>
        </div>
      </div>
    </footer>
  );
};
