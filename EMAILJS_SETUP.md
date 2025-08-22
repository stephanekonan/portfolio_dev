# Configuration EmailJS pour votre projet Astro

## 1. Installation

EmailJS est déjà intégré dans le composant Contact via CDN. Aucune installation npm n'est nécessaire.

## 2. Configuration EmailJS

### Étape 1 : Créer un compte EmailJS
1. Allez sur [EmailJS.com](https://www.emailjs.com/) et créez un compte
2. Connectez-vous à votre dashboard

### Étape 2 : Configurer un service email
1. Dans votre dashboard, allez dans "Email Services"
2. Cliquez sur "Add New Service"
3. Choisissez votre fournisseur d'email (Gmail, Outlook, etc.)
4. Suivez les instructions pour configurer l'authentification
5. Notez votre **Service ID**

### Étape 3 : Créer un template email
1. Allez dans "Email Templates"
2. Cliquez sur "Create New Template"
3. Créez un template avec les variables suivantes :
   - `{{user_name}}` - Nom de l'expéditeur
   - `{{user_email}}` - Email de l'expéditeur
   - `{{subject}}` - Sujet du message
   - `{{message}}` - Contenu du message
4. Notez votre **Template ID**

### Étape 4 : Obtenir votre clé publique
1. Dans votre dashboard, allez dans "Account" > "API Keys"
2. Copiez votre **Public Key**

## 3. Configuration du projet

### Option 1 : Variables d'environnement (recommandé)
Créez un fichier `.env` à la racine de votre projet :

```env
PUBLIC_EMAILJS_SERVICE_ID=votre_service_id
PUBLIC_EMAILJS_TEMPLATE_ID=votre_template_id
PUBLIC_EMAILJS_PUBLIC_KEY=votre_public_key
```

### Option 2 : Modification directe du composant
Si vous préférez modifier directement le composant, ouvrez `src/components/Contact.astro` et remplacez :

```typescript
// Ligne 90
(window as any).emailjs.init('YOUR_PUBLIC_KEY');

// Lignes 142-144
(window as any).emailjs.send(
  'YOUR_SERVICE_ID',
  'YOUR_TEMPLATE_ID',
  templateParams
)
```

## 4. Utilisation

Le composant Contact est maintenant prêt à être utilisé ! Il inclut :

- ✅ Formulaire de contact responsive
- ✅ Validation des champs
- ✅ États de chargement
- ✅ Messages de succès/erreur
- ✅ Intégration EmailJS complète

## 5. Ajouter le composant à votre page

Dans votre page principale (par exemple `src/pages/fr/index.astro`) :

```astro
---
import Layout from '@layouts/Layout.astro';
import Contact from '@components/Contact.astro';
---

<Layout title="Contact">
  <Contact />
</Layout>
```

## 6. Test

1. Lancez votre projet : `pnpm dev`
2. Remplissez le formulaire de contact
3. Vérifiez que l'email est bien reçu
4. Vérifiez la console pour les logs de succès/erreur

## 7. Personnalisation

Vous pouvez personnaliser :
- Les couleurs et styles (classes Tailwind CSS)
- Les messages de succès/erreur
- Les champs du formulaire
- Le template EmailJS

## Support

- [Documentation EmailJS](https://www.emailjs.com/docs/)
- [Dashboard EmailJS](https://dashboard.emailjs.com/)
- [Astro Documentation](https://docs.astro.build/)
