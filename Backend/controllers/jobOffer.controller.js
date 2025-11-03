import { User } from '../models/user.model.js';
import { JobOffer } from '../models/jobOffer.model.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

export const getCandidates = async (req, res) => {
  const { id } = req.params; // Assuming the job offer ID is passed as a URL parameter

  try {
    // Find the job offer by its ID
    const jobOffer = await JobOffer.findById(id); 
    if (!jobOffer) {
      console.log('Aucune offre d\'emploi trouvée');
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }

    // Return the candidates array
    res.status(200).json(jobOffer.candidates);
  } catch (error) {
    console.error('Erreur lors de la récupération des candidats', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des candidats' });
  }
};



export const createJobOffer = async (req, res) => {
  const { title, description, deadline } = req.body;
  console.log(req.body);
  
  if (!title || !description || !deadline) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }
  // Affiche les données du corps de la requête
  try {
    // Vérifie si un fichier a été uploadé
        const jobOffer = new JobOffer({
          title,
          description,
          deadline,
        });

        await jobOffer.save();
        return res.status(201).json({ message: 'Offre d\'emploi créé avec succès' });
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'offre d\'emploi', error);
    return res.status(500).json({ message: 'Erreur lors de la création de l\'offre d\'emploi' , error: error.message });
  }
};



export const updateJobOffer = async (req, res) => {
  const { title, description, deadline } = req.body;
  const { id } = req.params;

  try {
    const jobOffer = await JobOffer.findOneAndUpdate({ _id: id }, {
      title,
      description,
      deadline
    }, { new: true });
    console.log(jobOffer);
    if (!jobOffer) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }
    res.status(200).json({ message: 'Offre d\'emploi mise à jour avec succès' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Erreur lors de la mise a jour de l\'offre', error: error.message });
  }
};
export const deleteJobOffer = async (req, res) => {
  const { id } = req.params;
  try {
    const jobOffer = await JobOffer.findOneAndDelete({ _id: id });
    if (!jobOffer) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }
    res.status(200).json({ message: 'Offre d\'emploi supprimée avec succès' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'offre', error: error.message });
  }
};

export const getJobOffers = async (req, res) => {
  try {
    const jobOffers = await JobOffer.find();
    res.status(200).json(jobOffers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des offres d\'emploi', error: error.message });
  }
};

export const getJobOffer = async (req, res) => {
  try {
    const jobOffer = await JobOffer.findOne({ _id: req.params.id });
    if (!jobOffer) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }
    console.log(jobOffer);
    res.status(200).json(jobOffer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'offre', error: error.message });
  }
};



export const applyJobOffer = async (req, res) => {
  const { email, name, phone } = req.body;
  const { id } = req.params;

  

  try {
    // Vérifier l'offre d'emploi
    const jobOffer = await JobOffer.findById(id);
    if (!jobOffer) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }

    if(jobOffer.candidates.some(candidate => candidate.email === email)) {
      return res.status(400).json({ message: 'Vous avez déjà postulé à cette offre d\'emploi.' });
    }

    if(jobOffer.candidates.some(candidate => candidate.name === name)) {
      return res.status(400).json({ message: 'Vous avez déjà postulé à cette offre d\'emploi.' });
    }

    // Vérifier si un CV a été uploadé
    if (!req.files?.cv || req.files.cv.length === 0) {
      return res.status(400).json({ message: 'Le fichier CV est requis.' });
    }

    const cvFile = req.files.cv[0]; // Récupérer le premier fichier CV
    const optionalFile = req.files.optionalFile ? req.files.optionalFile[0] : null; // Récupérer le fichier optionnel si présent

    const maxSizeInMB = 2; // Limite de taille de fichier en Mo
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Convertir en octets

    // Vérifier la taille du CV
    if (cvFile.size > maxSizeInBytes) {
      return res.status(400).json({ message: 'Le fichier CV doit être inférieur à 2 Mo.' });
    }

    // Vérifier la taille du fichier optionnel si présent
    if (optionalFile && optionalFile.size > maxSizeInBytes) {
      return res.status(400).json({ message: 'Le fichier optionnel doit être inférieur à 2 Mo.' });
    }

    const alreadyApplied = jobOffer.candidates.some(p => p.email === email);
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Cet e-mail est déjà inscrit à l\'offre' });
    }

    // Upload du CV sur Cloudinary
    const cvUploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, async (error, result) => {
      if (error) {
        console.error('Erreur lors de l\'upload du CV sur Cloudinary', error);
        return res.status(500).json({ message: 'Erreur lors de l\'upload du CV', error: error.message });
      }

      // Récupérer l'URL du CV uploadé
      const cvUrl = result.secure_url;

      // Upload du fichier optionnel sur Cloudinary (si présent)
      let optionalFileUrl = null;
      if (optionalFile) {
        await new Promise((resolve, reject) => {
          const optionalUploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error) {
              return reject(error);
            }
            optionalFileUrl = result.secure_url;
            resolve();
          });
          optionalUploadStream.end(optionalFile.buffer);
        });
      }

      // Créer un nouvel candidat
      const candidate = {
        name,
        email,
        phone,
        file: cvUrl,
        optionalFile: optionalFileUrl,
      };

      // Ajouter le candidat à l'offre d'emploi
      jobOffer.candidates.push(candidate);
      await jobOffer.save();

      res.status(201).json({ message: 'Candidature réussie' });
    });

    // Passer le buffer du CV au stream
    cvUploadStream.end(cvFile.buffer);

  } catch (error) {
    console.error('Erreur lors de la candidature à l\'offre d\'emploi', error);
    return res.status(500).json({ message: 'Erreur lors de la candidature à l\'offre d\'emploi', error: error.message });
  }
};
