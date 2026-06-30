/**
 * Migration: Crée des offres pour les activités de circuit orphelines
 *
 * Chaque programme item sans linked_offer_item_id reçoit:
 *   1. Une offre "Activité: {title}" rattachée au projet du circuit
 *   2. Un offer item lié
 *
 * Usage: npx ts-node backend/scripts/migrate-orphan-activities.ts
 */
import { createConnection, getRepository } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [path.resolve(__dirname, '../src/**/*.entity{.ts,.js}')],
    synchronize: false,
  });

  const circuitRepo = getRepository('Circuit');
  const dayRepo = getRepository('CircuitDay');
  const progItemRepo = getRepository('CircuitProgramItem');
  const offerRepo = getRepository('Offer');
  const offerItemRepo = getRepository('OfferItem');
  const catRepo = getRepository('OfferCategory');

  const activityCat = await catRepo.findOne({ where: { slug: 'activity' } });
  if (!activityCat) {
    console.error('❌ Category "activity" not found. Run seeds first.');
    await connection.close();
    return;
  }

  const circuits = await circuitRepo.find({ relations: ['days', 'days.programItems'] });
  let created = 0;
  let skipped = 0;

  for (const circuit of circuits) {
    if (!circuit.project_id) {
      console.log(`⏭️  Circuit ${circuit.id} (${circuit.title}): pas de project_id, ignoré`);
      skipped++;
      continue;
    }

    for (const day of circuit.days || []) {
      for (const prog of day.programItems || []) {
        if (prog.linked_offer_item_id) {
          continue; // déjà lié
        }
        if (!prog.title?.trim()) {
          continue; // pas de titre
        }

        // 1. Créer une offre "Activité: {title}"
        const offer = await offerRepo.save({
          author_id: circuit.author_id,
          author_type: 'project_owner',
          project_id: circuit.project_id,
          category_id: activityCat.id,
          offer_type: 'activity',
          title: `Activité: ${prog.title.trim()}`,
          description: prog.description || null,
          status: 'approved',
          confirmation_mode: 'manual',
          region: circuit.region || null,
        });

        // 2. Créer un offer item
        const details: any = {};
        if (prog.duration_minutes) details.duration_minutes = prog.duration_minutes;
        if (prog.distance_km) details.distance_km = prog.distance_km;
        if (prog.start_time) details.start_time = prog.start_time;
        if (prog.end_time) details.end_time = prog.end_time;
        if (prog.transport_mode) details.transport_mode = prog.transport_mode;
        if (prog.emoji) details.emoji = prog.emoji;

        const item = await offerItemRepo.save({
          offer_id: offer.id,
          name: prog.title.trim(),
          description: prog.description || null,
          item_type: 'activity',
          details_json: details,
          status: 'active',
        });

        // 3. Lier le programme item à l'offer item
        await progItemRepo.update(prog.id, { linked_offer_item_id: item.id });

        console.log(`✅ Circuit ${circuit.title} / Jour ${day.day_number}: "${prog.title}" → offre créée`);
        created++;
      }
    }
  }

  console.log(`\n=== Terminé ===`);
  console.log(`✅ ${created} activités liées à des offres`);
  console.log(`⏭️  ${skipped} circuits ignorés (pas de project_id)`);
  await connection.close();
}

main().catch((err) => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
