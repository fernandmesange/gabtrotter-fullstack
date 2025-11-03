import { User } from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailerTransport from '../config/nodemailerTransport.js';

dotenv.config();



export const generateVerificationCode = () => {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  return verificationCode;
}

export const signup = async (req, res) => {
  try {
    const { email,password,fullname,role } = req.body;
    if (!email || !password || !fullname || !role) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    if( await User.findOne({ email })) {
      return res.status(400).json({ message: 'L\'utilisateur existe déjà' });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = generateVerificationCode();
    const user = new User({
      email,
      password:hashedPassword,
      fullname,
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 3600000)});

    await user.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' , error: error.message });
  }
};


export const login = async (req, res) => {
  console.log(req.body);
  try {
    const { email,password} = req.body;
    if (!email || !password ) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
    const user = await User.findOne({ email });
    if(!user) {
      return res.status(400).json({ message: 'L\'utilisateur n\'existe déjà' });
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Informations de connexion invalides' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: { email: user.email, name: user.fullname, role: user.role, _id: user._id,  mobileCode: user.mobileCode ? user.mobileCode : null } });
  }catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Erreur lors de la connexion' , error: error.message });
  }
};

export const verifyToken = (req, res, next) => {
  
  const token = req.headers.authorization;
  console.log(token);

  if (!token) {
    console.log("Token non fourni");
    return res.status(401).json({ message: 'Token non fourni' });
  }

  const tokenValue = token.split(' ')[1];

  if (!tokenValue) {
    console.log("Token non fourni ou invalide");
    return res.status(401).json({ message: 'Token non fourni ou invalide' });
  }

  try {
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    req.userId = decoded.userId;  // On récupère l'userId spécifiquement
    console.log("Token valide", req.userId);
    next();  // Passer à la prochaine middleware ou route
  } catch (error) {
    console.log("Token invalide", error.message);
    res.status(401).json({ message: 'Token invalide' });
  }
};


export const signUpWithLink = async (req,res) => {
  try{
    const { email,roleUser } = req.body;
    console.log(email,roleUser);
    const temporaryPassword = generateVerificationCode();
    const hashedPassword = await bcryptjs.hash(temporaryPassword, 10);
    const fullname = email.split('@')[0];

    if(await User.findOne({ email })) {
      return res.status(400).json({ message: 'L\'utilisateur existe déjà' });
    }
    const user = new User({
      email,
      role:roleUser,
      password:hashedPassword,
      fullname,
      isVerified: false,
    });

    await user.save();

    const currentUser = await User.findOne({ email });

    console.log('http://localhost:5173/auth/update-new-user/'+currentUser._id);
    const emailData = {
      from: 'contact@gabtrotter.org',
      to: email,
      subject: 'Création de compte',
      html: `
        <p>Bonjour,</p>
        <p>Vous avez été invité à créer un compte sur notre application CRM. Voici vos informations de connexion :</p>
        <p>Email: ${email}</p>
        <p>Voici votre lien pour configurer votre compte : <a href="https://gabtrotter.org/auth/update-new-user/${currentUser._id}">Lien de configuration</a></p>
        <p>Cordialement,</p>
        <p>L\'équipe GabTrotter</p>
      `
    };
    await nodemailerTransport.sendMail(emailData);

    res.status(201).json({ message: 'Demande de creation de compte envoyée avec succès' });
    
  }catch(error){
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' , error: error.message });
  }
}

export const updateUser = async (req,res) => {
  try{
    const { id } = req.params;
    const {fullname,email,role} = req.body;
    console.log('Data:',id,fullname,email,role);

    const user = await User.findOne({ _id:id });
    if(!user){
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    await User.findOneAndUpdate({_id: id},{
      email:email,
      fullname,
      role:role,
    });
    res.status(201).json({ message: 'Utilisateur modifié avec succès' });
  }catch(error){
    res.status(500).json({ message: 'Erreur lors de la modification de l\'utilisateur' , error: error.message });
  }
}

export const deleteUser = async (req,res) => {
  try{
    const { id } = req.params;
    const user = await User.findOne({ _id:id });
    if(!user){
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    await User.findOneAndDelete({_id: id});
    res.status(201).json({ message: 'Utilisateur supprimé avec succès' });
  }catch(error){
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' , error: error.message });
  }
}



export const updateUserWithLink = async (req,res) => {
  try{
    const {password,fullname,_id,mobileCode} = req.body;
    const user = await User.findOne({ _id:_id });
    if(!user){
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    if(user.isVerified){
      return res.status(400).json({ message: 'Utilisateur déjà configuré' });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    await User.findOneAndUpdate({_id: _id},{
      email:user.email,
      mobileCode:mobileCode,
      password:hashedPassword,
      fullname,
      isVerified:true
    });
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  }catch(error){
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' , error: error.message });
  }
}


export const checkStatus = async (req,res) => {
  try {
    const user = await User.findById(req.userId); // Utilisez req.userId pour trouver l'utilisateur
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ user: { email: user.email, name: user.fullname, role: user.role, userId: user._id }, isAuthenticated:true }); // Renvoie des informations sur l'utilisateur
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des informations de l\'utilisateur', error: error.message });
  }
}


export const forgotPassword = async (req,res) => {
  console.log('forgot password');
  const {email} = req.body;

  const user = await User.findOne({email});
  if(!user){
    return res.status(400).json({ message: 'Utilisateur non trouvé' });
  }

  try{
    
    const token = generateVerificationCode();
    const content = `<p>Bonjour,</p><p>Vous avez demandé à réinitialiser votre mot de passe. Veuillez cliquez sur ce lien  <a href="${process.env.FRONTEND_URL}/reset-password/?token=${token}&email=${email}">Lien</a></p>`;
    const subject = 'Réinitialisation de votre mot de passe';

    await nodemailerTransport.sendMail({
      from: 'contact@gabtrotter.org',
      to: email,
      subject: subject,
      html: content,
    });

    await User.findOneAndUpdate({email},{
      resetPasswordToken:token,
      resetPasswordExpiresAt: Date.now() + 3600000,
    });

    res.status(200).json({ message: 'Demande de réinitialisation de mot de passe envoyée avec succès' });
  }catch(error){
    res.status(500).json({ message: 'Erreur lors de la réinitialisation de mot de passe' , error: error.message });
  }
}


export const verifyPasswordToken = async (req, res) => {
  const { token,email } = req.body
  console.log('verify password token');
  if (!token || !email) {
    console.log('token or email is missing');
    return res.status(400).send('Token et email sont requis');
    
  }
  const user = await User.findOne({ email });
  if (!user) {
    console.log('user not found');
    return res.status(404).send('Utilisateur non trouvé');
  }

  if (user.resetPasswordToken !== token) {
    console.log('invalid token');
    return res.status(400).send('Token invalide');
  }

  if (user.resetPasswordExpiresAt < Date.now()) {
    console.log('token expired');
    return res.status(400).send('Token expiré');
  }
  res.status(200).send('Token valide');
}

export const resetPassword = async (req, res) => {
  const {email, password } = req.body;
  //console.log('try');
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send('Utilisateur non trouvé');
  }
  try{
    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();
    res.status(200).send('Mot de passe réinitialisé avec succès');
  }catch(error){
    console.log(error);
    res.status(500).json({message: "Internal server error"});
  }
}

export const getUsers = async (req,res) => {
  try{
    const users = await User.find({},{password:0});
    res.status(200).json({users});
  }catch(error){
    res.status(500).json({message: "Internal server error"});
  }
}

export const getUser = async (req,res) => {

  const {userId} = req.params;
  try{
    const users = await User.findById(userId,{password:0});
    res.status(200).json({users});
  }catch(error){
    res.status(500).json({message: "Internal server error"});
  }
}




export const signUpFromLandingPage = async (req,res) => {
  try{
    const { email, fullname} = req.body;
    const temporaryPassword = generateVerificationCode();
    const hashedPassword = await bcryptjs.hash(temporaryPassword, 10);

    if(await User.findOne({ email })) {
      return res.status(400).json({ message: 'L\'utilisateur existe déjà' });
    }
    const user = new User({
      email,
      role : "beneficiary",
      password:hashedPassword,
      fullname,
      isVerified: false,
    });

    await user.save();

    const currentUser = await User.findOne({ email });

    console.log('http://localhost:5173/auth/update-subscriber-link/'+currentUser._id);
    const emailData = {
      from: 'contact@gabtrotter.org',
      to: email,
      subject: 'Création de compte',
      html: `
        <p>Bonjour,</p>
        <p>Vous avez été invité à créer un compte sur notre application CRM. Voici vos informations de connexion :</p>
        <p>Email: ${email}</p>
        <p>Voici votre lien pour configurer votre compte : <a href="https://gabtrotter.org/auth/update-subscriber-link/${currentUser._id}">Lien de configuration</a></p>
        <p>Cordialement,</p>
        <p>L\'équipe GabTrotter</p>
      `
    };
    await nodemailerTransport.sendMail(emailData);

    res.status(201).json({ message: 'Demande de creation de compte envoyée avec succès' });
    
  }catch(error){
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' , error: error.message });
  }
}

export const updateUserFromLandingPage = async (req,res) => {
  try{
    const {password,fullname,_id} = req.body;
    const user = await User.findOne({ _id:_id });
    if(!user){
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    if(user.isVerified){
      return res.status(400).json({ message: 'Utilisateur déjà configuré' });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    await User.findOneAndUpdate({_id: _id},{
      email:user.email,
      password:hashedPassword,
      fullname,
      isVerified:true,
      mobileCode:"0000"
    });
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  }catch(error){
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' , error: error.message });
  }
}