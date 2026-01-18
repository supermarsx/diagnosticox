import { IDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import logger from '../services/logger.service';

export async function seedPivotLibrary(db: IDatabase) {
  logger.info('Seeding expanded pivot library...');

  const pivots = [
    {
      name: 'Orthostatic Heart Rate Change',
      type: 'clinical_sign',
      category: 'Autonomic',
      description: 'Increase in HR >= 30 bpm from supine to standing (after 3 mins)',
      measurement_method: 'Active Stand Test',
      threshold_value: 30,
      threshold_unit: 'bpm',
      threshold_operator: '>=',
      discriminates_between: ['POTS', 'Normal'],
      sensitivity: 0.92,
      specificity: 0.88,
      lr_pos: 7.6,
      lr_neg: 0.09,
    },
    {
      name: 'TSH Level (Elevated)',
      type: 'lab_test',
      category: 'Endocrine',
      description: 'Thyroid Stimulating Hormone above reference range',
      threshold_value: 4.5,
      threshold_unit: 'mIU/L',
      threshold_operator: '>',
      discriminates_between: ['Hypothyroidism', 'Euthyroid'],
      sensitivity: 0.95,
      specificity: 0.92,
      lr_pos: 11.8,
      lr_neg: 0.05,
    },
    {
      name: 'Joint Hypermobility (Beighton Score)',
      type: 'clinical_sign',
      category: 'Musculoskeletal',
      description: 'Score indicating generalized joint hypermobility',
      threshold_value: 5,
      threshold_unit: 'points',
      threshold_operator: '>=',
      discriminates_between: ['hEDS/HSD', 'Normal'],
      sensitivity: 0.85,
      specificity: 0.89,
      lr_pos: 7.7,
      lr_neg: 0.17,
    },
    {
      name: 'D-Dimer (Age-adjusted)',
      type: 'lab_test',
      category: 'Hematology',
      description: 'Fibrin degradation product used to rule out thrombosis',
      threshold_value: 500,
      threshold_unit: 'ng/mL',
      threshold_operator: '>',
      discriminates_between: ['Pulmonary Embolism', 'Other'],
      sensitivity: 0.97,
      specificity: 0.40,
      lr_pos: 1.6,
      lr_neg: 0.08,
    },
    {
      name: 'HbA1c (Prediabetic range)',
      type: 'lab_test',
      category: 'Endocrine',
      description: 'Average blood sugar over 3 months',
      threshold_value: 5.7,
      threshold_unit: '%',
      threshold_operator: '>=',
      discriminates_between: ['Prediabetes', 'Normal'],
      sensitivity: 0.80,
      specificity: 0.85,
      lr_pos: 5.3,
      lr_neg: 0.24,
    }
  ];

  for (const p of pivots) {
    const id = uuidv4();
    await db.execute(
      `INSERT INTO pivots (
        id, organization_id, pivot_name, pivot_type, category, description,
        measurement_method, threshold_value, threshold_unit, threshold_operator,
        discriminates_between, sensitivity, specificity, likelihood_ratio_positive,
        likelihood_ratio_negative, is_public, created_at, updated_at
      ) VALUES (?, 'system', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        id,
        p.name,
        p.type,
        p.category,
        p.description,
        p.measurement_method || null,
        p.threshold_value,
        p.threshold_unit,
        p.threshold_operator,
        JSON.stringify(p.discriminates_between),
        p.sensitivity,
        p.specificity,
        p.lr_pos,
        p.lr_neg,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );
  }

  logger.info('Pivot library seeded successfully');
}
