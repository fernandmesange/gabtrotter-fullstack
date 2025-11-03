import { Courses } from '../models/courses.model.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';

dotenv.config();

// export const getCandidates = async (req, res) => {
//   const { id } = req.params; // Assuming the job offer ID is passed as a URL parameter

//   try {
//     // Find the job offer by its ID
//     const jobOffer = await JobOffer.findById(id); 
//     if (!jobOffer) {
//       console.log('Aucune offre d\'emploi trouvée');
//       return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
//     }

//     // Return the candidates array
//     res.status(200).json(jobOffer.candidates);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des candidats', error);
//     res.status(500).json({ message: 'Erreur lors de la récupération des candidats' });
//   }
// };


export const getTrainerCourses = async (req, res) => {
  const { trainerId } = req.params; // Assuming the job offer ID is passed as a URL parameter

  try {
    // Find the job offer by its ID
    const trainerCourses = await Courses.find({trainerId:trainerId}); 
    if (!trainerCourses) {
      console.log('Aucune formations trouvée');
      return res.status(404).json({ message: 'Formations non trouvée' });
    }

    // Return the candidates array
    res.status(200).json(trainerCourses);
    console.log('Success')
  } catch (error) {
    console.error('Erreur lors de la récupération des formation de ce formateur', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des formation de ce formateur' });
  }
};


export const getCourse = async (req, res) => {
  const id = req.params.id;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Vous devez être connecté pour accéder à cette page.' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({ message: 'Utilisateur non trouvé.' });
  }

  try {
    // 1. On récupère d'abord le cours SANS populate
    const course = await Courses.findById(id);

    if (!course) {
      console.log('Aucune formation trouvée');
      return res.status(404).json({ message: 'Formation non trouvée.' });
    }

    // 2. Vérification des droits
    if (user.role === 'admin') {
      // Admin peut voir tout avec populate
      const fullCourse = await Courses.findById(id).populate('subscribers'); // 👈 adapte si tu veux d'autres populates
      return res.status(200).json(fullCourse);
    }

    if (user.role === 'trainer') {
      // Trainer peut voir uniquement ses propres cours
      if (course.trainerId.toString() !== userId) {
        return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à accéder à ce cours.' });
      }
      const fullCourse = await Courses.findById(id).populate('subscribers');
      return res.status(200).json(fullCourse);
    }

    // 3. Pour un user normal
    return res.status(200).json(course);

  } catch (error) {
    console.error('Erreur lors de la récupération de la formation', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};




export const getAllCourses = async (req, res) => {

  try {
    // Find the job offer by its ID
    const courses = await Courses.find().sort({ isValidate: 1 });
    if (!courses) {
      console.log('Aucune formations trouvée');
      return res.status(404).json({ message: 'Formations non trouvée' });
    }

    // Return the candidates array
    res.status(200).json(courses);
    console.log('Success')
  } catch (error) {
    console.error('Erreur lors de la récupération des formations', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des formations' });
  }
};


export const getAllCoursesPublic = async (req, res) => {

  try {
    const courses = await Courses.find(
      {isValidate: true },
      { subscribers: 0 } // Exclure le champ `subscribers`
    );
    if (!courses) {
      console.log('Aucune formations trouvée');
      return res.status(404).json({ message: 'Formations non trouvée' });
    }

    // Return the candidates array
    res.status(200).json(courses);
    console.log('Success')
  } catch (error) {
    console.error('Erreur lors de la récupération des formations', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des formations' });
  }
};

export const subscribe = async (req, res) => {
  const { courseId, userId } = req.body;

  if (!courseId || !userId) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    // Récupérer l'utilisateur et la formation
    const user = await User.findById(userId);
    const course = await Courses.findById(courseId);

    console.log('Course:', course); // Log du cours
    if (!course) {
      return res.status(404).json({ message: 'Formation non trouvée.' });
    }

    console.log('User:', user); // Log de l'utilisateur
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    console.log('Subscribers:', course.subscribers); // Log des abonnés
    if (!Array.isArray(course.subscribers)) {
      course.subscribers = [];
    }

    // Vérifier si l'utilisateur est déjà inscrit
    const alreadySubscribed = course.subscribers.some(
      (subscriber) => subscriber.toString() === userId
    );

    if (alreadySubscribed) {
      return res.status(400).json({ message: 'Utilisateur déjà inscrit à cette formation.' });
    }

    // Ajouter l'utilisateur aux abonnés
    course.subscribers.push(userId);
    user.subscribeCourses.push(courseId);
    await course.save();
    await user.save();

    return res.status(201).json({ message: 'Utilisateur inscrit avec succès.' });
  } catch (err) {
    console.error('Erreur lors de l\'inscription à la formation :', err);
    return res.status(500).json({
      message: 'Erreur lors de l\'inscription à la formation.',
      error: err.message,
    });
  }
};



export const createCourses = async (req, res) => {
  const { title, description, category } = req.body;
  const trainerId = req.userId;
  console.log(req.body);
  
  if (!title || !description || !category) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }
  // Affiche les données du corps de la requête
  try {
    // Vérifie si un fichier a été uploadé
        const courses = new Courses({
          trainerId,
          title,
          description,
          category,
        });

        await courses.save();
        return res.status(201).json({ message: 'Formation créé avec succès' });
    
  } catch (error) {
    console.error('Erreur lors de la création de la formation', error);
    return res.status(500).json({ message: 'Erreur lors de la création de la formation' , error: error.message });
  }
};


export const validateCourse = async (req, res) => {
  const courseId = req.params.courseId;
  console.log(courseId);
  if (!courseId) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }
  // Affiche les données du corps de la requête
  try {
    const courses = await Courses.findOneAndUpdate(
      { _id: courseId },
      { isValidate: true },
      { new: true }
    );

    console.log(courses)
    
    if (!courses) {
      return res.status(404).json({ message: 'Formation non trouvée.' });
    }
    
    return res.status(201).json({ message: 'Formation validée avec succès', course: courses });

  } catch (error) {
    console.error('Erreur lors de la validation de la formation', error);
    return res.status(500).json({ message: 'Erreur lors de la validation de la formation' , error: error.message });
  }
};


export const addChapters = async (req, res) => {
  const { title, description,  courseId , type} = req.body;
  const file = req.file;
  

  if (!title || !description || !file || !courseId, !type) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }
  // Affiche les données du corps de la requête
  try {

    const course = await Courses.findById(courseId);

    if(!course){
      return res.status(404).json({ message: 'Aucune formation trouvée'});
    }


    const maxSizeInMB = 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Convertir en octets

    if (file.size > maxSizeInBytes) {
      return res.status(400).json({ message: 'Le fichier doit être inférieur à 10 Mo.' });
    }

    const chaptersUploadStream = cloudinary.uploader.upload_stream({resource_type: 'auto'}, async (error,result) => {
      if (error) {
        console.error('Erreur lors de l\'upload du fichier sur Cloudinary', error);
        return res.status(500).json({ message: 'Erreur lors de l\'upload du fichier', error: error.message });
      }

      const fileUrl = result.secure_url;

    const chapters = {
      title,
      description,
      file:fileUrl,
      type
    }

    course.chapters.push(chapters);

    await course.save();
    return res.status(201).json({ message: 'Chapitre ajouté avec succés' });

    })

    chaptersUploadStream.end(file.buffer)
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi du chapitre', error);
    return res.status(500).json({ message: 'Erreur lors de l\'envoi du chapitre', error: error.message });
  }
};


export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const courseToDelete = await Courses.findOneAndDelete({ _id: id });
    if (!courseToDelete) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }
    res.status(200).json({ message: 'Formation supprimée avec succès' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la formation', error: error.message });
  }
};


export const toggleChapterLock = async (req, res) => {
  const { courseId, chapterId } = req.params;

  try {
    // Rechercher le cours par son ID
    const course = await Courses.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Formation non trouvée" });
    }

    // Rechercher le chapitre dans la liste des chapitres du cours
    const chapter = course.chapters.find(
      (chapter) => chapter._id.toString() === chapterId
    );

    if (!chapter) {
      return res.status(404).json({ message: "Chapitre non trouvé" });
    }

    // Inverser la valeur actuelle de `isLocked`
    chapter.isLocked = !chapter.isLocked;

    // Sauvegarder le cours
    await course.save();

    res.status(200).json({
      message: `Chapitre ${chapter.isLocked ? "verrouillé" : "déverrouillé"} avec succès.`,
      chapter,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du chapitre :", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du chapitre",
      error: error.message,
    });
  }
};

