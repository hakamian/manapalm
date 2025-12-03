
import { coachingTopics, coActiveFramework, powerfulQuestions } from './coaching/general';
import { coActiveMastery } from './coaching/courses/coActiveMastery';
import { masterOfAsking } from './coaching/courses/masterOfAsking';
import { incomeAlchemy } from './coaching/courses/incomeAlchemy';
import { valuePropositionMastery } from './coaching/courses/valuePropositionMastery';
import { executionMastery } from './coaching/courses/executionMastery';
import { businessModelReinvention } from './coaching/courses/businessModelReinvention';
import { socialEntrepreneurship } from './coaching/courses/socialEntrepreneurship';
import { runningLean } from './coaching/courses/runningLean';
import { actionableGamification } from './coaching/courses/actionableGamification';
import { alchemyPromptCourse } from './coaching/courses/alchemyPromptCourse';
import { zeroToOne } from './coaching/courses/zeroToOne';
import { promptAlchemy } from './coaching/courses/promptAlchemy';
import { creativityStudio } from './coaching/courses/creativityStudio';
import { aiCodingMastery } from './coaching/courses/aiCodingMastery';
import { invisibleArmy } from './coaching/courses/invisibleArmy';
import { aiMarketingAlchemy } from './coaching/courses/aiMarketingAlchemy';
import { autonomousOrg } from './coaching/courses/autonomousOrg';
import { aiDataMastery } from './coaching/courses/aiDataMastery';
import { deepWorkMastery } from './coaching/courses/deepWorkMastery';
import { simplyBetter } from './coaching/courses/simplyBetter';
import { fifteenSkills } from './coaching/courses/fifteenSkills';
import { businessCoachingMastery } from './coaching/courses/businessCoachingMastery';

// Re-export general data for backward compatibility and cleaner imports
export { coachingTopics, coActiveFramework, powerfulQuestions };

// Aggregate book journeys
export const bookJourneys = [
    businessCoachingMastery, // New Course Added
    fifteenSkills,       
    simplyBetter,        
    deepWorkMastery,      
    aiMarketingAlchemy,  
    autonomousOrg,       
    aiDataMastery,       
    invisibleArmy,       
    aiCodingMastery,     
    creativityStudio,    
    promptAlchemy,       
    alchemyPromptCourse, 
    zeroToOne,           
    actionableGamification, 
    coActiveMastery,
    masterOfAsking,
    incomeAlchemy,
    runningLean,
    socialEntrepreneurship, 
    valuePropositionMastery,
    executionMastery,
    businessModelReinvention
];
