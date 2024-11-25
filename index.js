//To avoid reference error, use NodeJS 14 or above which no longer has require by default
//import { createRequire } from 'module';
//const require = createRequire(import.meta.url);

//<script src="https://sdk.amazonaws.com/js/aws-sdk-2.1.24.min.js"></script>
//<script type="text/javascript" src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
//<script type="text/javascript"></script>
//Content-Type: application/javascript



import { XhrHttpHandler } from "@aws-sdk/xhr-http-handler";
import { Upload } from "@aws-sdk/lib-storage";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";


import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
//Define identity pool id for your cognito pool
const IdentityPoolId = 'us-west-2:9cb36124-bf06-4865-a091-0b43197a5c41'
const bucketName = 'ai-audio-alpha12beta456'
//insert region for your image bucket 
const bucketRegion = 'us-west-2'
const bucketUrl = `https://ai-audio-alpha12beta456.s3.us-west-2.amazonaws.com`
// Import required AWS SDK clients and command for Node.js   progress bar sset  up        
const myHttpHandler = new XhrHttpHandler({});
// Create an S3 client
const s3 = new S3Client({
  requestHandler: new XhrHttpHandler({}), // overrides default FetchHttpHandler in browsers.
  region: bucketRegion,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: bucketRegion }, // Configure the underlying CognitoIdentityClient.
    identityPoolId: IdentityPoolId,
    logins: {
      // Optional tokens, used for authenticated login.
    },
  })
});


const upload = new Upload({
  client: s3,
  params: {
    Bucket: bucketName,
    //Key: bucketFilesKey
  },
});


/*const fileInput = document.getElementById("file");*/
/*const progressBar = document.getElementById("uploadProgressBar");*/


window.s3upload = function (blob) {

  //Let's create a filename as a DD-MM-YYYY--HH-SS.mpeg
  var currentDate = new Date();
  var recordkey = currentDate.getDate().toString() + '-' + currentDate.getMonth().toString() + '-' +
    currentDate.getFullYear().toString() + '--' + currentDate.getHours().toString() + '-' + currentDate.getMinutes().toString() + '.mpeg';
  var fileInput = document.getElementById("file").files;
  if (!fileInput.length) {
    return alert("Please choose a file to upload first.");
  }
  var filet = fileInput[0];
  var fileName = filet.name;
  var bucketKey = encodeURIComponent(bucketName);

  var bucketFilesKey = fileName; // + bucketKey; 

  // Use S3 ManagedUpload class as it supports multipart uploads
  const input = {
    Bucket: bucketName,
    Key: [bucketFilesKey, recordkey],
    Body: [filet, blob],
  };


  const command = new PutObjectCommand(input);

  s3.send(command).then(
    function (data) {
      alert("Successfully uploaded audio.", data);
    },
    function (err) {
      return alert("There was an error uploading your photo: ", err.message, data);
    }

  );


}

/*------------------------------------------------*/

function countdown(time) {
  var timeleft = time;
  var downloadTimer = setInterval(function () {
      document.getElementById("uploadProgressBartimer").value = time - timeleft;
      timeleft -= 1;
      if (timeleft <= 0) {
          clearInterval(downloadTimer);
          document.getElementById("uploadProgressBartimer").value=0;
      }
  }, 1000);
}

const mic_btn = document.querySelector('#mic');
const playback = document.querySelector('.playback');

mic_btn.addEventListener('click', ToggleMic);

let can_record = false;
let is_recording = false;

let recorder = null; recorder

let chunks = []; 

function SetupAudio() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        audio: true
      })
      .then(SetupStream)
      .catch(err => {
        console.error(err)
      });
  }
}


function SetupStream(stream) {
  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = e => {
    chunks.push(e.data);

  }

  recorder.onstop = e => {
    const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
    chunks = [];
    const audioURL = window.URL.createObjectURL(blob);
    playback.src = audioURL;

  }

  can_record = true;
}

function ToggleMic() {
  if (!can_record) return;
  is_recording = !is_recording;

  if (is_recording) {
    recorder.start();
    mic_btn.classList.add("is-recording");
  } else {
    recorder.stop();
    mic_btn.classList.remove("is-recording");
  }
}


/*------------------------------------------------*/

 // Get elements
 const userInput = document.getElementById("user-input");
 const submitButton = document.getElementById("submit-button");
 const chatContainer = document.getElementById("chat-container");

 // OpenAI API key (replace 'YOUR_API_KEY' with your actual API key)
 const apiKey = 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;

 // Create conversation history
 let conversation = [];

 // Event listener for submit button
 submitButton.addEventListener("click", () => {
   const userMessage = userInput.value.trim();
   if (userMessage !== "") {
     // Display user message in the chat container
     conversation.push({ role: "user", content: userMessage });
     renderChat();

     // Send user message to ChatGPT
     fetch("https://api.openai.com/v1/chat/completions", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${apiKey}`,
       },
       body: JSON.stringify({
         messages: conversation,
       }),
     })
       .then((response) => response.json())
       .then((data) => {
         // Get and display ChatGPT's reply
         const reply = data.choices[0].message.content;
         conversation.push({ role: "assistant", content: reply });
         renderChat();
       })
       .catch((error) => console.error("Error:", error));
     
     // Clear user input field
     userInput.value = "";
   }
 });

 // Render conversation in the chat container
 function renderChat() {
   chatContainer.innerHTML = "";
   conversation.forEach((message) => {
     const messageElement = document.createElement("div");
     messageElement.classList.add("message", message.role);
     messageElement.innerText = message.content;
     chatContainer.appendChild(messageElement);
   });
 }