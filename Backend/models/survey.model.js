import mongoose from 'mongoose';

const FormFieldSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    
  },
  label: {
    type: String,
    required: true,
  },
  options: {
    type: [String], // Tableau pour les options de choix unique (radio)
    default: [],
  },
}); // _id: false pour ne pas créer un nouvel ID pour chaque champ

const PrivacyNoticeSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  version: { type: Number, default: 1, min: 1 },
  controllerName: { type: String, default: 'Gabtrotter' },
  contactEmail: {
    type: String,
    default: () => process.env.PRIVACY_CONTACT_EMAIL || 'associationgabtrotter@gmail.com',
  },
  purpose: {
    type: String,
    default: 'Réaliser cette enquête et produire des résultats consolidés pour la campagne.',
  },
  legalBasis: {
    type: String,
    enum: ['CONSENT', 'PUBLIC_INTEREST', 'LEGITIMATE_INTEREST', 'LEGAL_OBLIGATION'],
    default: 'CONSENT',
  },
  recipients: {
    type: [String],
    default: ['Responsables et superviseurs autorisés de la campagne'],
  },
  rights: {
    type: [String],
    default: [
      'Accès',
      'Rectification',
      'Effacement',
      'Limitation',
      'Opposition',
      'Retrait du consentement lorsque le traitement repose sur celui-ci',
    ],
  },
  rightsRequestInstructions: {
    type: String,
    default: 'Utilisez l’identifiant de soumission et le code confidentiel remis après l’enquête.',
  },
  complaintAuthorityName: { type: String, default: 'Autorité compétente en matière de données personnelles' },
  complaintAuthorityUrl: String,
  internationalTransfers: {
    type: String,
    default: 'Aucun transfert international n’est prévu, sauf indication contraire de la campagne.',
  },
  mandatoryDataConsequences: {
    type: String,
    default: 'Les champs signalés comme obligatoires sont nécessaires pour valider le questionnaire.',
  },
  automatedDecisionMaking: { type: Boolean, default: false },
  automatedDecisionDetails: String,
  withdrawalInstructions: {
    type: String,
    default: 'Le consentement peut être retiré à l’aide du reçu confidentiel remis après l’enquête.',
  },
  locationPolicy: {
    enabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    purpose: { type: String, default: '' },
    precision: { type: String, enum: ['COARSE', 'PRECISE'], default: 'COARSE' },
  },
  retentionDays: {
    type: Number,
    min: 1,
    max: 3650,
    default: () => Number(process.env.SURVEY_DEFAULT_RETENTION_DAYS || 365),
  },
  requiresConsent: { type: Boolean, default: true },
  enforcedAt: { type: Date, default: null },
  updatedAt: { type: Date, default: Date.now },
}, { _id: false });

const SurveySchema = new mongoose.Schema({

  title:{
    type: String,
    required: true,
    unique: true,
    
  },
  fields: {
    type: [FormFieldSchema],
    required: true,
  },
  version: {
    type: Number,
    default: 1,
    min: 1,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  privacyNotice: {
    type: PrivacyNoticeSchema,
    default: () => ({}),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Survey = mongoose.model('Survey', SurveySchema);
