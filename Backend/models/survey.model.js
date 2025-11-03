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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Survey = mongoose.model('Survey', SurveySchema);
