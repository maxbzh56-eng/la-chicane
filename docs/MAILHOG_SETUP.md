# Configuration MailHog pour l'authentification Supabase en local

## 🚀 Démarrage rapide

1. **Lancer les services Docker avec MailHog :**
```bash
make dev
```

2. **Accéder à MailHog :**
   - Interface web : http://localhost:8025
   - SMTP : localhost:1025

## 📧 Configuration Supabase pour utiliser MailHog

### Option 1 : Utiliser Inbucket (Recommandé pour le développement local)

Supabase propose un service d'email local intégré appelé Inbucket quand vous utilisez Supabase en local.

1. **Installer Supabase CLI :**
```bash
npm install -g supabase
```

2. **Initialiser Supabase localement :**
```bash
supabase init
supabase start
```

3. **Les emails seront disponibles sur :**
   - http://localhost:54324/inbucket

### Option 2 : Rediriger les emails Supabase vers MailHog

Si vous utilisez Supabase hébergé (cloud) en développement, vous ne pouvez pas changer la configuration SMTP directement.

**Solutions alternatives :**

1. **Utiliser les logs Supabase :**
   - Dans le dashboard Supabase, allez dans Authentication > Logs
   - Vous verrez les liens de connexion dans les logs

2. **Désactiver la confirmation d'email en développement :**
   - Dashboard Supabase > Authentication > Settings
   - Désactiver "Enable email confirmations"
   - ⚠️ **ATTENTION** : Ne jamais faire ça en production !

3. **Utiliser un email de test :**
   - Créez une adresse email dédiée pour les tests (ex: avec Gmail)
   - Utilisez cette adresse pour tous vos tests locaux

## 🛠️ Test d'envoi d'email avec MailHog

Pour tester que MailHog fonctionne correctement, créez une route API Next.js :

```typescript
// app/api/test-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  const transporter = nodemailer.createTransporter({
    host: 'localhost',
    port: 1025,
    secure: false,
  });

  try {
    await transporter.sendMail({
      from: 'test@localhost',
      to: 'user@localhost',
      subject: 'Test MailHog',
      text: 'Si vous voyez ce message, MailHog fonctionne !',
      html: '<b>Si vous voyez ce message, MailHog fonctionne !</b>',
    });

    return NextResponse.json({ success: true, message: 'Email envoyé !' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

Puis testez avec :
```bash
curl http://localhost:3000/api/test-email
```

## 📝 Variables d'environnement

Les variables suivantes sont déjà configurées dans `.env.local` :

```env
# Configuration MailHog (pour emails custom, pas Supabase)
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_SECURE=false
EMAIL_FROM=noreply@localhost
```

## 🔍 Débugger les emails

1. **Voir tous les emails :** http://localhost:8025
2. **API MailHog :** http://localhost:8025/api/v2/messages
3. **Vider la boîte :** http://localhost:8025/api/v1/messages (DELETE)

## ⚠️ Notes importantes

- MailHog ne peut pas intercepter les emails envoyés directement par Supabase Cloud
- Pour un vrai développement local avec contrôle total, utilisez Supabase CLI avec `supabase start`
- En production, configurez un vrai service SMTP (SendGrid, AWS SES, etc.)