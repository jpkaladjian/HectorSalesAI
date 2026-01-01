import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { storage } from "../storage";

/**
 * MIDDLEWARE RLS SESSION
 * 
 * Configure les variables de session PostgreSQL pour Row Level Security (RLS)
 * 
 * Ce middleware DOIT être exécuté APRÈS l'authentification (après express-session)
 * pour que req.session.userId soit disponible.
 * 
 * Variables PostgreSQL configurées :
 * - app.current_entity : L'entité de l'utilisateur (france, luxembourg, belgique)
 * - app.user_role : Le rôle de l'utilisateur (admin_groupe, manager_france, business_developer, etc.)
 * - app.user_id : L'ID de l'utilisateur courant
 * 
 * Ces variables sont utilisées par les politiques RLS PostgreSQL pour filtrer automatiquement
 * les données accessibles par chaque utilisateur.
 */
export async function rlsSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Si l'utilisateur n'est pas authentifié, passer au middleware suivant
    if (!req.session.userId || !req.session.entity || !req.session.role) {
      return next();
    }

    // Définir les variables de session PostgreSQL pour RLS
    // Utilise les données de session Express pour éviter la dépendance circulaire
    // avec storage.getUser() qui est maintenant protégé par RLS
    // Ces variables seront utilisées par les fonctions RLS :
    // - current_user_entity()
    // - current_user_role()
    // - current_user_id()
    await db.execute(sql`
      SELECT 
        set_config('app.current_entity', ${req.session.entity}, false),
        set_config('app.user_role', ${req.session.role}, false),
        set_config('app.user_id', ${req.session.userId}, false)
    `);

    next();
  } catch (error) {
    console.error("[RLS Session Middleware] Error setting session variables:", error);
    // En cas d'erreur, continuer quand même pour ne pas bloquer l'application
    // Les politiques RLS utiliseront les valeurs par défaut
    next();
  }
}

/**
 * Middleware pour réinitialiser les variables de session RLS
 * Utilisé principalement pour les tests ou les connexions admin
 */
export async function resetRlsSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await db.execute(sql`
      SELECT 
        set_config('app.current_entity', NULL, false),
        set_config('app.user_role', NULL, false),
        set_config('app.user_id', NULL, false)
    `);
    next();
  } catch (error) {
    console.error("[RLS Session Middleware] Error resetting session variables:", error);
    next();
  }
}
