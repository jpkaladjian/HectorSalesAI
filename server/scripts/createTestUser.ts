import bcrypt from "bcrypt";
import { db } from "../db";
import { users } from "../../shared/schema";

async function createTestUser() {
  const email = 'test-phase28@adsgroup-security.com';
  const password = 'TestPhase28!';
  const passwordHash = await bcrypt.hash(password, 10);
  
  try {
    const result = await db.insert(users).values({
      email,
      password: passwordHash,
      firstName: 'Test',
      lastName: 'Phase 2.8',
      isActive: 'true',
      isAdmin: 'false',
      role: 'commercial',
    }).returning();
    
    console.log('✅ Utilisateur de test créé avec succès!');
    console.log('Email:', email);
    console.log('Password:', password);
    process.exit(0);
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('ℹ️  Un utilisateur existe déjà avec cet email');
    } else {
      console.error('❌ Erreur:', error.message);
    }
    process.exit(1);
  }
}

createTestUser();
