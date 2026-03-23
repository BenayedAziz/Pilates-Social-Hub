# PilatesHub — TODO / Feature Backlog

## Marketplace — Pages Vendeurs Dédiées

### Concept
Chaque vendeur/marque (studios, marques d'apparel, accessoires) peut créer sa propre page dédiée dans l'app PilatesHub. C'est leur vitrine personnalisée.

### Pour les Studios
- Page studio personnalisable : logo, photos, description, horaires
- Gestion des coaches et des cours
- Dashboard analytics (réservations, check-ins, reviews)
- Réponse aux avis
- Promotions et offres spéciales
- Lien vers leur booking intégré

### Pour les Marques / Vendeurs de Produits
- Page marque personnalisable : logo, banner, histoire de la marque
- Catalogue produits avec prix, tailles, couleurs
- Collections saisonnières (drops)
- Codes promo exclusifs PilatesHub
- Analytics : vues, clics, conversions
- Programme d'affiliation ou vente directe

### Business Model
- **Gratuit** : fiche de base (nom, adresse, description)
- **Premium** (€29/mois) : page personnalisée, analytics, promotions
- **Pro** (€99/mois) : booking intégré, marketplace produits, dashboard avancé
- Commission sur les ventes : 5-10% sur les transactions via l'app

### Prochaines étapes
- [ ] Concevoir le dashboard vendeur (admin panel)
- [ ] Créer le formulaire d'inscription vendeur
- [ ] Créer le template de page vendeur
- [ ] Système de vérification / "badge vérifié"
- [ ] Intégrer Stripe Connect pour les paiements vendeurs
- [ ] Analytics vendeur (vues, réservations, revenus)

---

## Google Reviews — 30-Day Storage Policy (PRODUCTION TODO)

Google Places API Terms of Service require that cached Place data (including
reviews) must be **refreshed or deleted within 30 days** of the original fetch.

### Required before production launch:
- [ ] Set up a cron job / scheduled task to re-run `fetch-google-reviews.cjs` every 25 days
      to refresh all stored Google reviews before they expire.
- [ ] Add a `fetched_at` check: delete any `google_reviews` rows older than 30 days that
      have not been refreshed (safety net in case the cron job fails).
- [ ] Ensure the Google attribution badge ("Reviews from Google" + Google logo) is always
      displayed alongside Google review data, as required by Google's branding guidelines.
- [ ] Monitor Google Places API quota usage — at ~6,900 studios x 2 API calls each
      (Text Search + Place Details), budget for ~14,000 requests per refresh cycle.
- [ ] Consider upgrading to a Google Maps Platform billing account with higher QPS limits
      if the 200ms throttle causes refresh cycles to take too long.

**Script location:** `artifacts/api-server/src/scripts/fetch-google-reviews.cjs`
**Table:** `google_reviews` (see `lib/db/src/schema/index.ts`)

---

## Autres features à implémenter

- [ ] On-demand video content (cours en replay)
- [ ] Live class streaming
- [ ] Guided mat sessions (audio-guided)
- [ ] Push notifications (rappels booking, challenges)
- [ ] Spring Settings Log (tracker ses réglages reformer)
- [ ] Lineage Tree (lignée d'instructeurs jusqu'à Joseph Pilates)
- [ ] Buddy system (inviter un ami en cours)
- [ ] Monthly Wrapped (résumé mensuel animé style Spotify)
- [ ] In-app messaging / DMs
- [ ] Calendar sync (Google Calendar, Apple Calendar)
- [ ] Apple Watch / wearable integration
