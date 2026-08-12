import { initNavigation } from './navigation.js';
import { initHeroEye, initAnatomyScanner } from './eye.js';
import { initPhotonLab } from './photon.js';
import { initDetachmentLab } from './detachment.js';
import { initSignalAndBuild } from './signal.js';
import { initFlashcards } from './flashcards.js';
import { initExam } from './exam.js';

async function boot(){
  initNavigation();
  initHeroEye();
  initAnatomyScanner();
  initPhotonLab();
  initDetachmentLab();
  initSignalAndBuild();
  await Promise.all([initFlashcards(),initExam()]);
}

boot().catch(error=>console.error('RETINA-LAB boot error:',error));
