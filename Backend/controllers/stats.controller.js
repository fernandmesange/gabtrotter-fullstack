import { User } from '../models/user.model.js';
import { Event } from '../models/event.model.js';
import { Survey } from '../models/survey.model.js';
import { ResponseSurvey } from '../models/responseSurvey.model.js';
import { Report } from '../models/report.model.js';
import nodemailerTransport from '../config/nodemailerTransport.js';

import dotenv from 'dotenv';
import { JobOffer } from '../models/jobOffer.model.js';
import { getReports } from './report.controller.js';
import { Courses } from '../models/courses.model.js';

dotenv.config();


export const getUserStats = async (req, res) => {
  try {
    // Vérifier l'utilisateur
    const users = await User.find();
    const agents = users.filter(user => user.role === 'agent');
    const agentsCount = agents.length;
    const usersCount = users.length;
    const agentsPercentage = (agentsCount / usersCount) * 100;
    const newUsersWeek = users.filter(user => {
      const userDate = new Date(user.createdAt);
      const currentDate = new Date();
      const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      return userDate >= oneWeekAgo && userDate <= currentDate;
    }).length;
    return res.status(200).json({ agentsCount, usersCount, agentsPercentage, newUsersWeek });
  }catch(error){
    return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
  }

}

export const getEventStats = async (req, res) => {
  try {
    const events = await Event.find();
    const availableEvents = events.filter(event => event.isAvailable === true);
    const eventsCount = events.length;
    const participantsCount = events.reduce((total, event) => total + event.participants.length, 0);
    const newEventsWeek = events.filter(event => {
      const eventDate = new Date(event.createdAt);
      const currentDate = new Date();
      const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      return eventDate >= oneWeekAgo && eventDate <= currentDate;
    }).length;
    return res.status(200).json({ eventsCount, availableEvents, newEventsWeek, participantsCount });
  }catch(error){
    return res.status(500).json({ message: 'Erreur lors de la récupération des événements', error: error.message });
  }
}

export const getSurveyStats = async (req, res) => {
  try {
    const surveys = await Survey.find();
    const surveysCount = surveys.length;
    const surveysResponses = await ResponseSurvey.find();
    const surveysResponsesCount = surveysResponses.length;
    const newSurveysResponsesWeek = surveysResponses.filter(surveyResponse => {
      const surveyResponseDate = new Date(surveyResponse.createdAt);
      const currentDate = new Date();
      const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      return surveyResponseDate >= oneWeekAgo && surveyResponseDate <= currentDate;
    }).length;
    const newSurveysWeek = surveys.filter(survey => {
      const surveyDate = new Date(survey.createdAt);
      const currentDate = new Date();
      const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      return surveyDate >= oneWeekAgo && surveyDate <= currentDate;
    }).length;
    return res.status(200).json({ surveysCount,surveysResponsesCount, newSurveysResponsesWeek, newSurveysWeek });
  }catch(error){
    return res.status(500).json({ message: 'Erreur lors de la récupération des sondages', error: error.message });
  }
}

export const getReportStats = async (req, res) => {
  try {
    const reports = await Report.find();
    const reportsCount = reports.length;
    const newReportsWeek = reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      const currentDate = new Date();
      const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      return reportDate >= oneWeekAgo && reportDate <= currentDate;
    }).length;
    return res.status(200).json({ reportsCount, newReportsWeek });
  }catch(error){
    return res.status(500).json({ message: 'Erreur lors de la récupération des rapports', error: error.message });
  }
}

export const getOfferStats = async (req,res) => {
  try{
    const offers = await JobOffer.find();
    const offersCount = offers.length;
    const newOffersWeek = offers.filter(offer => {
      const offerDate = new Date(offer.createdAt);
      const currentDate = new Date();
      const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 6)});
    const candidatesCount = offers.reduce((total, offer) => total + offer.candidates.length, 0);

    return res.status(200).json({offersCount, newOffersWeek, candidatesCount });
  }catch(error){
    return res.status(500).json({ message: 'Erreur lors de la récupération des offres', error: error.message });
  }
}

export const getAgentStats = async (req,res) => {

  const {agentId}= req.params;
  console.log(agentId);
  try{
    const reports = await Report.countDocuments({userId: agentId})
    const surveyResponses = await ResponseSurvey.countDocuments({agentId: agentId})
    return res.status(200).json({reports, surveyResponses });
  }catch(error){
    console.log(error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des offres', error: error.message });
  }
}

export const getCourseTrainerStats = async (req, res) => {
  try {
    const courses = await Courses.find();
    const availableCourses = courses.filter(course => course.isValidate === true);
    const coursesCount = courses.length;
    const participantsCount = courses.reduce((total, course) => total + course.subscribers.length, 0);

    return res.status(200).json({ availableCourses, coursesCount, participantsCount });
  }catch(error){
    console.log(error)
    return res.status(500).json({ message: 'Erreur lors de la récupération des formations', error: error.message });
  }
}
