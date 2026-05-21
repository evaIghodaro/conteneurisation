// Imports Next.js
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Classe d'erreur personnalisée pour distinguer les erreurs opérationnelles
// Permet d'attacher un code HTTP à chaque erreur métier
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;        // Code HTTP à retourner (400, 401, 404, 500…)
    this.isOperational = true;           // Erreur connue (par opposition aux bugs)
    
    Error.captureStackTrace(this, this.constructor);  // Conserve la stack trace propre
  }
}

// Gestionnaire centralisé d'erreurs API - convertit toute erreur en réponse HTTP propre
// Gère les erreurs Mongoose, JWT, MongoDB et autres
export function handleApiError(error: unknown, request?: NextRequest) {
  console.error('API Error:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    url: request?.url,
    method: request?.method
  });

  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        statusCode: error.statusCode 
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Erreurs de validation Mongoose (champ manquant, type incorrect…)
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur de validation',
          details: validationErrors,
          statusCode: 400 
        },
        { status: 400 }
      );
    }

    // Erreur côté MongoDB (connexion perdue, timeout…)
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur de base de données',
          statusCode: 503 
        },
        { status: 503 }
      );
    }

    // Token JWT mal formé ou signature invalide
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token invalide',
          statusCode: 401 
        },
        { status: 401 }
      );
    }

    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token expiré',
          statusCode: 401 
        },
        { status: 401 }
      );
    }
  }

  // Erreur par défaut
  return NextResponse.json(
    { 
      success: false, 
      error: 'Erreur interne du serveur',
      statusCode: 500 
    },
    { status: 500 }
  );
}

// Crée une réponse de succès standardisée
export function createApiResponse<T>(
  data: T, 
  message?: string, 
  statusCode: number = 200
) {
  return NextResponse.json(
    { 
      success: true, 
      data,
      message,
      statusCode 
    },
    { status: statusCode }
  );
}

// Crée une réponse de succès avec pagination
export function createPaginatedResponse<T>(
  data: T[], 
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  },
  message?: string
) {
  return NextResponse.json(
    { 
      success: true, 
      data,
      pagination,
      message 
    },
    { status: 200 }
  );
}
