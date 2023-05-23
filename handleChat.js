class InteractiveChatbox {
  constructor(a, b, c) {
    this.args = {
      button: a,
      chatbox: b,
    };
    this.icons = c;
    this.state = false;
  }

  display() {
    const { button, chatbox } = this.args;

    button.addEventListener("click", () => this.toggleState(chatbox));
  }

  toggleState(chatbox) {
    this.state = !this.state;
    this.showOrHideChatBox(chatbox, this.args.button);
  }

  showOrHideChatBox(chatbox, button) {
    if (this.state) {
      chatbox.classList.add("chatbox--active");
      this.toggleIcon(true, button);
    } else if (!this.state) {
      chatbox.classList.remove("chatbox--active");
      this.toggleIcon(false, button);
    }
  }

  toggleIcon(state, button) {
    const { isClicked, isNotClicked } = this.icons;
    let b = button.children[0].innerHTML;

    if (state) {
      button.children[0].innerHTML = isClicked;
    } else if (!state) {
      button.children[0].innerHTML = isNotClicked;
    }
  }
}

$(document).ready(function () {
  // Add an event listener for the 'keyup' event on the input element
  $("#inputMessage").on("keyup", function (event) {
    // Check if the Enter key was pressed (key code 13)
    if (event.keyCode === 13) {
      // Enter key was pressed
      // Perform the desired action here
      handleSendMsg();

      // You can access the input value using $(this).val() and perform further processing
    }
  });
});

const chatButton = document.querySelector(".chatbox__button");
const chatContent = document.querySelector(".chatbox__support");
const icons = {
  isClicked: '<i class="fa-solid fa-comment-dots"></i>',
  isNotClicked: '<i class="fa-solid fa-comment-dots"></i>',
};
const chatbox = new InteractiveChatbox(chatButton, chatContent, icons);
chatbox.display();
chatbox.toggleIcon(false, chatButton);

const uniqueID = () => {
  return Math.floor(Math.random() * Date.now()).toString();
};

const recognizeVoice = () => {
  $(".btn-rec").css("display", "block");
  // Check if the browser supports the Web Speech API
  if ("webkitSpeechRecognition" in window) {
    // Create an instance of the speech recognition object
    const recognition = new webkitSpeechRecognition();

    // Set the recognition language to Vietnamese
    recognition.lang = "vi-VN";

    // Start recognition
    recognition.start();

    // Event fired when speech recognition starts
    recognition.onstart = function () {
      console.log("Speech recognition started...");
    };

    // Event fired when speech recognition results are available
    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      $("#inputMessage").val(transcript);
      $("#inputMessage").focus();
      $(".btn-rec").css("display", "none");
      // Do something with the transcript, like displaying it on the page
      // For example: document.getElementById('result').textContent = transcript;
    };

    // Event fired when speech recognition ends
    recognition.onend = function () {
      console.log("Speech recognition ended.");
    };

    // Event fired on speech recognition error
    recognition.onerror = function (event) {
      console.error("Speech recognition error:", event.error);
    };
  } else {
    console.error("Web Speech API is not supported in this browser.");
  }
};

const handleSendMsg = () => {
  let senderHTML = `<div class="messages__item messages__item--operator">Content</div>`;
  let receiverHTML = `<div class="messages__item messages__item--visitor">Content</div>`;
  let msg = $("#inputMessage").val();
  senderHTML = senderHTML.replace("Content", msg);
  $(".chatbox__messages").prepend(senderHTML);
  $("#inputMessage").val("");
  let request = {
    secret_key: secretKey,
    script_id: scriptId,
    current_node_id: currentNodeId,
    message: msg,
    is_trying: false,
    session_id: uniqueID(),
  };

  $.ajax({
    url: "http://103.200.20.180:8085/api/training/predict",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(request),
    success: function (result) {
      if (result.http_status == "OK") {
        currentNodeId = result.current_node_id;
        if (currentNodeId != "_END") {
          if (result.message != null && result.message.trim() != "") {
            receiverHTML = receiverHTML.replace("Content", result.message);
            $(".chatbox__messages").prepend(receiverHTML);
          }
        }
      }
      return result;
    },
    error: function (error) {
      console.log(error);
    },
  });
};
