let isListening = false;
let recognition;

document.addEventListener("DOMContentLoaded", function () {
  let isFirstClick = true;

  document
    .getElementById("startCooking")
    .addEventListener("click", function () {
      if (!isListening) {
        isListening = true;
        document.getElementById("startCooking").style.display =
          "none";
        document.getElementById("conversation").style.display = "block";
        startListening();
      }

      if (isFirstClick) {
        const recipe = document.getElementById("recipe").value || "any dish";
        const ingredients =
          document.getElementById("ingredients").value || "any ingredients";
        const restrictions =
          document.getElementById("restrictions").value || "no restrictions";
        const servings =
          document.getElementById("servings").value || "any number of servings";
        const precautions =
          document.getElementById("precautions").value || "no precautions";

        const data = {
          recipe: recipe,
          ingredients: ingredients,
          restrictions: restrictions,
          servings: servings,
          precautions: precautions,
        };

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/chat", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
          if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            if (xhr.responseText !== "") {
              const conversationDiv = document.getElementById("conversation");
              conversationDiv.innerHTML +=
                "<p class='ai'>Assistant: " + xhr.responseText + "</p>";
              stopSpeaking();
              speak(xhr.responseText);
            }
            if (
              xhr.responseText.toLowerCase().includes("cooking session ended")
            ) {
              isListening = false;
              document.getElementById("resumeListening").style.display =
                "inline"; // Show the "Resume Listening" button
            } else {
              startListening(); // Restart listening after the response
            }
          }
        };
        xhr.send(JSON.stringify(data));
        isFirstClick = false; // Set this to false after sending the first query
      }
    });

  // Event listener for the "Resume Listening" button
  document
    .getElementById("resumeListening")
    .addEventListener("click", function () {
      isListening = true;
      document.getElementById("conversation").innerHTML +=
        "<p class='user'>Resumed listening...</p>";
      document.getElementById("resumeListening").style.display = "none"; // Hide the "Resume Listening" button
      recognition = new webkitSpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = function () {
        console.log("Recognition started");
      };

      recognition.onresult = function (event) {
        console.log("Recognition result received");
        var result = event.results[event.resultIndex][0].transcript;
        console.log("Recognized:", result);
        var conversationDiv = document.getElementById("conversation");
        if (/^AI/i.test(result.trim())) {
          // Regular expression to match "GPT" at the beginning (case-insensitive)
          console.log("Recognized GPT query. Sending to server.");
          conversationDiv.innerHTML +=
            "<p class='user'>You: " + result + "</p>";

          stopListening();

          var xhr = new XMLHttpRequest();
          xhr.open("POST", "/chat", true);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
              console.log("Received response from server:", xhr.responseText);
              conversationDiv.innerHTML +=
                "<p class='ai'>Assistant: " + xhr.responseText + "</p>";
              stopSpeaking();
              speak(xhr.responseText);

              if (
                xhr.responseText.toLowerCase().includes("cooking session ended")
              ) {
                isListening = false;
                window.speechSynthesis.cancel();
                document.getElementById("resumeListening").style.display =
                  "block";
              } else {
                startListening(); // Restart listening after the response
              }
            }
          };
          console.log("Sending request to server:", result);
          xhr.send(JSON.stringify({ query: result }));
          isFirstQuery = false;
        }
      };

      recognition.onend = function () {
        console.log("Recognition ended");
        if (isListening) {
          startListening(); // Restart listening if it ends due to inactivity
        }
      };

      recognition.onerror = function (event) {
        console.error("Speech recognition error detected: " + event.error);
        if (isListening) {
          startListening(); // Restart listening on error
        }
      };
      startListening();
    });
});

function initializeRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onstart = function () {
    console.log("Recognition started");
  };

  recognition.onresult = function (event) {
    console.log("Recognition result received");
    var result = event.results[event.resultIndex][0].transcript;
    console.log("Recognized:", result);
    var conversationDiv = document.getElementById("conversation");
    if (/^AI/i.test(result.trim())) {
      // Regular expression to match "GPT" at the beginning (case-insensitive)
      console.log("Recognized GPT query. Sending to server.");
      conversationDiv.innerHTML += "<p class='user'>You: " + result + "</p>";

      stopListening();

      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/chat", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          console.log("Received response from server:", xhr.responseText);
          conversationDiv.innerHTML +=
            "<p class='ai'>Assistant: " + xhr.responseText + "</p>";
          stopSpeaking();
          speak(xhr.responseText);

          if (
            xhr.responseText.toLowerCase().includes("cooking session ended")
          ) {
            isListening = false;
            window.speechSynthesis.cancel();
            document.getElementById("resumeListening").style.display = "block";
          } else {
            startListening(); // Restart listening after the response
          }
        }
      };
      console.log("Sending request to server:", result);
      xhr.send(JSON.stringify({ query: result }));
      isFirstQuery = false;
    }
  };

  recognition.onend = function () {
    console.log("Recognition ended");
    if (isListening) {
      startListening(); // Restart listening if it ends due to inactivity
    }
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error detected: " + event.error);
    if (isListening) {
      startListening(); // Restart listening on error
    }
  };
}

function startListening() {
  if (!isListening) return;

  if (!recognition) {
    initializeRecognition();
  }

  recognition.start();
  console.log("Listening started");
}

function stopListening() {
  if (recognition) {
    recognition.onend = null; // Prevent immediate restart
    recognition.stop();
    console.log("Listening stopped");
  }
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
  console.log("Speaking stopped");
}

function speak(text) {
  var msg = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  msg.voice = voices[0];
  msg.rate = 1;
  msg.pitch = 1;
  msg.text = text;

  msg.onend = function (e) {
    console.log("Finished speaking in " + e.elapsedTime + " seconds.");
    if (isListening) {
      startListening(); // Restart listening after speaking
    }
  };

  window.speechSynthesis.speak(msg);
}
