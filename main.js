////////////////////////////////////////////////////////////////////////
//                           Creations                                //
//                                                                    //  
////////////////////////////////////////////////////////////////////////

import { sentences, trueObjectsName, falseObjectsName } from "./objects.js";


/**************************************************************************************/

const randomNumber = Math.random();

let correctKey;
let incorrectKey;

if (randomNumber < 0.5) {
  correctKey = "a";
  incorrectKey = "l";
} else {
  correctKey = "l";
  incorrectKey = "a";
}

/**************************************************************************************/

const OBJECTS_URL =
  "https://raw.githubusercontent.com/saramff/objects-attributes-images/refs/heads/master";
  // const TOTAL_IMAGES = 192;
  const TOTAL_IMAGES = 6;

// Create pictures arrays for men and women images
const objectsImages = Array.from(
  { length: TOTAL_IMAGES },
  (_, i) => `${OBJECTS_URL}/object-${i + 1}.jpg`
);

// Create suffle function - suffles array index randomly
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffle(objectsImages);

/**************************************************************************************/

const TOTAL_SENTENCES = 6;

// Create function to get a new array with a random slice from other array
function getRandomSlice(array, sliceSize) {
  const arraySlice = [];

  for (let i = 0; i < sliceSize; i++) {
    const randomIndex = Math.floor(Math.random() * array.length);
    const randomElem = array.splice(randomIndex, 1)[0];
    arraySlice.push(randomElem);
  }

  return arraySlice;
}

shuffle(sentences);
const sentencesSlice = getRandomSlice(sentences, TOTAL_SENTENCES);

// New Array with first half with TRUE sentences and second half with FALSE sentences
const sentencesWithResponse = sentencesSlice.map((sentence, index) => {
  return {
    sentence: index < TOTAL_SENTENCES / 2 ? sentence.true : sentence.false,
    correct_response: index < TOTAL_SENTENCES / 2 ? correctKey : incorrectKey
  }
})

// Shuffle sentences with response
shuffle(sentencesWithResponse);

/**************************************************************************************/

const TOTAL_OBJECT_NAMES = 6;

const trueObjectsNameSlice = getRandomSlice(trueObjectsName, TOTAL_OBJECT_NAMES);
const falseObjectsNameSlice = getRandomSlice(falseObjectsName, TOTAL_OBJECT_NAMES);

const trueObjectsNameWithResponse = trueObjectsNameSlice.map((objName) => {
  return {
    name: objName,
    correct_response: correctKey
  }
})

const falseObjectsNameWithResponse = falseObjectsNameSlice.map((objName) => {
  return {
    name: objName,
    correct_response: incorrectKey
  }
})

const objectsName = [...trueObjectsNameWithResponse, ...falseObjectsNameWithResponse];
shuffle(objectsName);

/**************************************************************************************/

/* Initialize jsPsych */
let jsPsych = initJsPsych();

/* Create timeline */
let timeline = [];

////////////////////////////////////////////////////////////////////////
//                           Consent                                  //
//                           (!works only on server)                  //  
////////////////////////////////////////////////////////////////////////

let check_consent = (elem) => {
  if (document.getElementById('consent_checkbox').checked) {
    return true;
  }
  else {
    alert("Vielen Dank f&uumlr ihr Interesse an unserem Experiment. Wenn Sie bereit sind teilzunehmen, geben Sie uns bitte Ihr Einverst&aumlndnis.");
    return false;
  }
  return false;
};

let html_block_consent = {
  type: jsPsychExternalHtml,
  url: "consentA2.html",
  cont_btn: "start_experiment",
  check_fn: check_consent
};
timeline.push(html_block_consent);

// // ////////////////////////////////////////////////////////////////////////
// // //                           Demographic  variables                   //
// // ////////////////////////////////////////////////////////////////////////

/* fullscreen */
timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  message: '<p>Bitte klicken Sie, um zum Vollbildmodus zu wechseln.</p>',
  button_label:'Weiter',
  on_finish: function(data){
    var help_fullscreen = data.success;
    jsPsych.data.addProperties({fullscreen: help_fullscreen});
  }
});

var age = {
  type: jsPsychSurveyText,
  preamble: 'Im Folgenden fragen wir Sie nach einigen demographischen Daten.',
  name: 'age',
    button_label:'Weiter',
    questions: [{prompt:'<div>Wie alt sind Sie?<\div>', rows: 1, columns: 2, required: 'true'}],
  data: {
    type:"demo",
    age: age,
  },
  on_finish: function(data){
    var help_age = data.response.Q0;
    jsPsych.data.addProperties({age: help_age});
  },
  on_load: function() {
    document.querySelector('.jspsych-btn').style.marginTop = '20px'; // Adjust margin as needed
  }
};

//jsPsych.data.get().last(1).values()[0].response.Q0

timeline.push(age);

var demo2 = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt:'Bitte w&aumlhlen Sie das Geschlecht aus, mit dem Sie sich identifizieren.',
      name: 'gender',
      options: ["m&aumlnnlich", "weiblich", "divers", "keine Angabe"],
      required: true,
      horizontal: true
    },
    {
      prompt:'Bitte geben Sie Ihre H&aumlndigkeit an.',
      name: 'handedness',
      options: ["links", "rechts", "beidh&aumlndig"],
      required: true,
      horizontal: true
    },
    {
      prompt:'Bitte w&aumlhlen Sie Ihre Muttersprache aus.',
      name: 'language',
      options: ["Deutsch", "andere"],
      required: true,
      horizontal: true
    },
  ],
  button_label:'Weiter',
  on_finish: function(data) {
    var help_gender = data.response.gender;
    var help_hand = data.response.handedness;
    var help_language = data.response.language;
    jsPsych.data.addProperties({gender: help_gender, handedness: help_hand, language: help_language});
  }
};
timeline.push(demo2);

/************************************************************************************************ */

/* Preload images */
let preload = {
  type: jsPsychPreload,
  images: objectsImages,
};
timeline.push(preload);


/* Fixation trial */
let fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: "NO_KEYS", // Prevent key press
  trial_duration: 500, // Fixation duration
  data: {
    task: "fixation",
  },
};

/* Welcome message trial */
let welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Willkommen zum Experiment. Drücken Sie eine beliebige Taste, um zu beginnen.",
};
timeline.push(welcome);


// /**************************************************************************************/

/* Instructions trial */
let instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>In diesem Experiment werden nacheinander automatisch verschiedene Objekte angezeigt.</p>
    <p>Bitte achten Sie genau auf jedes Objekt und dessen Aussehen.</p>
    <p>Die Objekte erscheinen von selbst, und Sie brauchen nichts weiter zu tun, außer aufmerksam zu sein.</p>
    <p>Drücken Sie eine beliebige Taste, um zu beginnen, wenn Sie bereit sind.</p>
  `,
  post_trial_gap: 500,
};
timeline.push(instructions);

/* Create stimuli array for image presentation */
let test_stimuli = objectsImages.map((objectImg) => {
  return {
    stimulus: `
      <img class="object-img" src="${objectImg}">
    `,
  };
});

/* Image presentation trial */
let test = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("stimulus"),
  choices: "NO_KEYS", // Prevent key press
  trial_duration: 2000, // Display each image for 2 second
  post_trial_gap: 500
};

/* Test procedure: fixation + image presentation */
let test_procedure = {
  timeline: [fixation, test],
  timeline_variables: test_stimuli,
  randomize_order: true, // Randomize image order
};
timeline.push(test_procedure);


/**************************************************************************************/

/* Instructions for sentence presentation */
let instructionsSentencePresentation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Jetzt sehen Sie eine Reihe von Sätzen auf dem Bildschirm.</p>
    </p>Jeder Satz bezieht sich auf eine Eigenschaft der Objekte, die zuvor gezeigt wurden.</p>
    </p></p>
    <p>Wenn der Satz wahr ist, drücken Sie '${correctKey.toUpperCase()}' (ja).</p>
    <p>Wenn der Satz falsch ist, drücken Sie '${incorrectKey.toUpperCase()}' (nein).</p>
    </p></p>
    </p>Zum Beispiel: Wenn Sie zuvor das Bild einer offenen Kiste gesehen haben und den Satz sehen: "Die Kiste war geschlossen", sollten Sie "NEIN" drücken.</p>
    <br />
    <div>
      <img src='https://raw.githubusercontent.com/saramff/objects-attributes-images/refs/heads/master/Caja.jpg'  class="img-instructions" />
    </div>
    <br />
    <p>Drücken Sie eine beliebige Taste, um zu beginnen.<p>
  `,
  post_trial_gap: 500,
};
timeline.push(instructionsSentencePresentation);

/* Create stimuli array for sentence presentation */
let sentenceRecognitionStimuli = sentencesWithResponse.map((sentence) => {
  return {
    stimulus: `
      <h3 class="sentence">${sentence.sentence}</h3>
      <div class="keys">
        <p class="${correctKey === 'a' ? 'left' : 'right'}">JA</p>
        <p class="${correctKey === 'a' ? 'right' : 'left'}">NEIN</p>
      </div>
    `,
    correct_response: sentence.correct_response
  };
});

/* Sentences presentation trial */
let testSentences = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("stimulus"),
  choices: ['a', 'l'],
  data: {
    task: "response sentences test",
    correct_response: jsPsych.timelineVariable("correct_response"),
  },
  on_finish: function (data) {
    data.correct = jsPsych.pluginAPI.compareKeys(
      data.response,
      data.correct_response
    );
    data.correct_response_meaning = correctKey === data.correct_response ? "YES" : "NO";
  },
};

/* Test procedure: fixation + sentences presentation */
let testSentencesProcedure = {
  timeline: [fixation, testSentences],
  timeline_variables: sentenceRecognitionStimuli,
  randomize_order: true, // Randomize sentences order
};
timeline.push(testSentencesProcedure);


/**************************************************************************************/


/* Instructions for Tetris */
let instructionstetris = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Jetzt werden Sie für etwa 20 Minuten Tetris spielen.</p>
    <p>Benutzen Sie die Pfeiltasten auf der Tastatur, um die Teile zu bewegen.</p>
    </p></p>
    <p>Drücken Sie die Leertaste, um zu beginnen. Wenn der Spielbildschirm erscheint, klicken Sie auf 'Play', um das Spiel zu starten.</p>
    <p>Wenn Sie verlieren, wählen Sie 'Try again', um das Spiel neu zu starten. Sie werden auf diese Weise spielen, bis die Zeit abläuft.</p>
    <p>Drücken Sie eine beliebige Taste, um zu beginnen.<p>
  `,
  post_trial_gap: 500,
};
timeline.push(instructionstetris);

/* Tetris */
let tetris = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="tetris-visible"></div>
  `,
  post_trial_gap: 500,
  choices: "NO_KEYS", // Prevent key press
  trial_duration: 200, 
};
timeline.push(tetris);


/**************************************************************************************/


/* Instructions for objects name presentation */
let instructionsObjectsNamePresentation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Als Nächstes sehen Sie eine Reihe von Objektnamen auf dem Bildschirm.</p>
    <p>Wenn Sie das Objekt zuvor gesehen haben, drücken Sie '${correctKey.toUpperCase()}' (ja).</p>
    <p>Wenn Sie das Objekt nicht gesehen haben, drücken Sie '${incorrectKey.toUpperCase()}' (nein).</p>
    <p>Drücken Sie eine beliebige Taste, um zu beginnen.</p>
  `,
  post_trial_gap: 500,
};
timeline.push(instructionsObjectsNamePresentation);

/* Create stimuli array for objects name presentation */
let objectsNameRecognitionStimuli = objectsName.map((objName) => {
  return {
    stimulus: `
      <h3 class="sentence">${objName.name}</h3>
      <div class="keys">
        <p class="${correctKey === 'a' ? 'left' : 'right'}">JA</p>
        <p class="${correctKey === 'a' ? 'right' : 'left'}">NEIN</p>
      </div>
    `,
    correct_response: objName.correct_response
  };
});

/* Objects name presentation trial */
let testObjectsName = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("stimulus"),
  choices: ['a', 'l'],
  data: {
    task: "response objects name test",
    correct_response: jsPsych.timelineVariable("correct_response"),
  },
  on_finish: function (data) {
    data.correct = jsPsych.pluginAPI.compareKeys(
      data.response,
      data.correct_response
    );
    data.correct_response_meaning = correctKey === data.correct_response ? "YES" : "NO";
  },
};

/* Test procedure: fixation + objects name presentation */
let testObjectsNameProcedure = {
  timeline: [fixation, testObjectsName],
  timeline_variables: objectsNameRecognitionStimuli,
  randomize_order: true, // Randomize objects name order
};
timeline.push(testObjectsNameProcedure);


// /**************************************************************************************/


// // Generate a random subject ID with 15 characters
// var subject_id = jsPsych.randomization.randomID(15);
// jsPsych.data.addProperties({
//   subject: subject_id,
// });


// function saveData(name, data){
//   console.log("Función saveData llamada");
//   console.log("Guardando datos:", name, data);

//   var xhr = new XMLHttpRequest();
//   xhr.open('POST', 'write_data.php'); 
//   xhr.setRequestHeader('Content-Type', 'application/json');
//   xhr.send(JSON.stringify({filename: name, filedata: data}));

//   console.log("Datos enviados");
// };

// var save_data_block = {
//   type: jsPsychCallFunction,
//   func: function(){saveData("data/Subject_"+ subject_id, jsPsych.data.get().csv());},
//   timing_post_trial: 200
// };

// timeline.push(save_data_block)


// var verguetungsfrage = {
//   type: jsPsychHtmlButtonResponse,
//   stimulus: '<div class="custom-style">Sie haben das Ende der Studie erreicht. Vielen Dank, dass Sie teilgenommen haben. Welche Verg&uumltung m&oumlchten Sie f&uumlr dieses Experiment?</div>',
//   choices: ['<div style="font-size:24px;">VP-Stunde (1)', '<div style="font-size:24px;">Gewinnspiel</div>'],
//   on_finish: function(data) {
//     if(data.response == 0) {
//         window.location.href = 'verguetung_b.html';
//     } else {
//         window.location.href = 'verguetung_a.html';
//     }
//   }
// };

 
// timeline.push(verguetungsfrage);


//var html_block_bezahlung = {
//  type: jsPsychExternalHtml,
//  url: "verguetung.html"
//};

//timeline.push(html_block_bezahlung);


/* Run the experiment */
jsPsych.run(timeline);

// Uncomment to see the results on the console (for debugging)
// console.log(jsPsych.data.get());