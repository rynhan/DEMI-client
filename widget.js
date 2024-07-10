// Select DOM elements using querySelector
const chatbotToggle = document.querySelector(".chatbot-toggler"); // Selects the element with the class "chatbot-toggler" and stores it in the chatbotToggle variable.
const chatBox = document.querySelector(".chatbox"); // Selects the element with the class "chatbox" and stores it in the chatBox variable.
const chatInput = document.querySelector(".chat-input textarea"); // Selects the textarea element within the element with the class "chat-input" and stores it in the chatInput variable.
const sendChatBtn = document.querySelector(".chat-input span"); // Selects the span element within the element with the class "chat-input" and stores it in the sendChatBtn variable.
const chatBotCloseBtn = document.querySelector(".close-btn"); // Selects the element with the class "close-btn" and stores it in the chatBotCloseBtn variable.

// Get the initial height of the chat input textarea
const inputInitHeight = chatInput.scrollHeight; // Retrieves the initial height of the textarea and stores it in the inputInitHeight variable.

// Get data attribute of script tag
const user_sub = document.currentScript.getAttribute('data-uid');

// document.getElementById("widget-header").innerHTML =
// document.getElementById("widget-version").innerHTML =
// document.getElementById("widget-disclaimer").innerHTML =
// document.getElementById("widget-initialmessage").innerHTML =
// document.getElementsByClassName("widget-image").src = 









// Function toHyperlink takes a string (txt) and finds URLs within it, converting them into clickable hyperlinks.
function toHyperlink(txt) {
    
    // The function uses two regular expressions (`pattern1` and `pattern2`) to match URLs in different formats. 
    // The first pattern (`pattern1`) matches URLs starting with http, https, ftp, and file protocols.
    var pattern1 = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

    // Replace matched URLs with HTML anchor tags for hyperlinks
    var str1 = txt.replace(pattern1, "<a href='$1'>$1</a>");
    
    // The second pattern (`pattern2`) matches URLs starting with "www".
    var pattern2 =/(^|[^\/])(www\.[\S]+(\b|$))/gim;

    // Replace matched "www" URLs with HTML anchor tags for hyperlinks, adding the "http://" protocol.
    var str2 = str1.replace(pattern2, '$1<a target="_blank" href="http://$2">$2</a>');

    // Return the modified string with clickable hyperlinks
    return str2;
}

// Function sanitizeUserMessage takes a message and replaces '<' and '>' characters with their HTML entity equivalents.
const sanitizeUserMessage = (message) => {
    // Replace '<' characters with '&lt;' and '>' characters with '&gt;' to prevent rendering HTML tags.
    return message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};






// Default bot image URL, replace this with the actual URL of your bot's image
const botImageUrl = "https://rynhan.github.io/DEMI-client/D3.png";

// Function createChatLi takes a message, className, and optional imageUrl, and creates a chat message element.
const createChatLi = (message, className, imageUrl = botImageUrl) => {
    // Create a new list item element
    const chatLi = document.createElement("li");

    // Add "chat" and the specified className to the list item's class list
    chatLi.classList.add("chat", className);

    // Check if the className is "incoming"
    if (className === "incoming") {
        // Check if imageUrl is provided
        if (imageUrl) {
            // Create an image element with the specified imageUrl
            const image = document.createElement("img");
            image.src = imageUrl;
            image.alt = "Bot Image";

            // Append the image to the list item
            chatLi.appendChild(image);
        }
    }

    // Convert the message to clickable hyperlinks using the toHyperlink function
    var formattedMessage = toHyperlink(message);

    // Create a new div element for the message content
    var messageContent = document.createElement("div");

    // Set the innerHTML of the messageContent div to the formattedMessage
    messageContent.innerHTML = formattedMessage;

    // Append the messageContent div to the list item
    chatLi.appendChild(messageContent);
    
    // Return the created list item
    return chatLi;
}






// Generate a UUID as a client/user identifier and store it to the sessionStorage...
// ...if only client got no any UUID before.
if (sessionStorage.getItem('client-uuid') == null) {
    sessionStorage.setItem("client-uuid", crypto.randomUUID());
}

// Container to store the cleaned (trimmed) user message
let userMessage;

// chatHistory is an array to store all chat history. Previously, it was var chatHistory = [];
var chatHistory = (sessionStorage.getItem('chat_history') == null) ? [] : JSON.parse(sessionStorage.getItem('chat_history')); // <------------------
// Loop through all messages in chatHistory and render it in the chatBox (if there is any)
for (let i = 0; i < chatHistory.length; i++) {
    if (chatHistory[i]['role'] == 'user') { 
        chatBox.appendChild(createChatLi( sanitizeUserMessage(chatHistory[i]['content']) , "outgoing"));
        chatBox.scrollTo(0, chatBox.scrollHeight);
    }
    else if (chatHistory[i]['role'] == 'assistant') { 
        chatBox.appendChild(createChatLi( sanitizeUserMessage(chatHistory[i]['content']) , "incoming"));
        chatBox.scrollTo(0, chatBox.scrollHeight);
    }
}

// Function generateResponse takes an incomingChatLi element and sends a request to the chat server to generate a response.
const generateResponse = (incomingChatLi) => {

    // Reference to the div element within incomingChatLi
    const messageElement = incomingChatLi.querySelector("div");

    // URL for the chat server endpoint
    var url = "https://demi-server-demi-dev-2bd13100.koyeb.app/chat"; // <--------------------------- DEMI-nodeV3 URL

    // Fetch data from the chat server
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pesan: chatHistory,
            // user_sub_s: "0fb90d349d44", // <------------NEED TO BE A DYNAMIC VAR
            user_sub_s: user_sub, // <------------A DYNAMIC VAR
            clientUUID: sessionStorage.getItem('client-uuid') // <------------------ Pass the clientUUID to the server
        })
    }).then(response => {
        // Return the response in JSON format
        return response.json();
    }).then(data => {

        // // Log the entire JSON data
        // console.log(data[0].message);
        // // Log only the content of the message
        // console.log(data[0].message.content);

        // Update the innerHTML of the messageElement with the response content, converting URLs to hyperlinks
        messageElement.innerHTML = toHyperlink(data[0].message.content);

        // Scroll the chatBox to the bottom
        chatBox.scrollTo(0, chatBox.scrollHeight);

        // Push the previous assistant chat into the chatHistory array
        chatHistory.push(data[0].message);

        // Update the chat_
        sessionStorage.setItem('chat_history', JSON.stringify(chatHistory));

    }).catch(error => {
        // Log an error message if something goes wrong
        console.log('Something bad happened ' + error);

        // ---------------------------
        // RAISE AN ERROR MESSAGE TO THE USER (TEMPORARY CODE)
        messageElement.innerHTML = toHyperlink('```'+error+'```');
        chatBox.scrollTo(0, chatBox.scrollHeight);
        chatHistory.push({role:"assistant", content:'<```'+error+'```>'});
        sessionStorage.setItem('chat_history', JSON.stringify(chatHistory));
        // ---------------------------
        
    });
};



// Function handleChat manages the user's input and chat interactions.
const handleChat = () => {

    // Clean the user input
    userMessage = chatInput.value.trim(); // Remove whitespace from both sides of the input string and store it in the userMessage variable
    if (!userMessage) return; // If the userMessage is empty, do nothing

    // Sanitize user input to prevent rendering HTML tags.
    const sanitizedUserMessage = sanitizeUserMessage(userMessage);

    // Append the user message to the chatbox as an outgoing message
    chatBox.appendChild(createChatLi(sanitizedUserMessage, "outgoing"));
    
    // Scroll the chatBox to the bottom
    chatBox.scrollTo(0, chatBox.scrollHeight);

    // Empty the input text to prepare for the next message
    chatInput.value = "";

    // Set the input text height as the default height when it is empty.
    chatInput.style.height = "45px"; 

    // Display a "Thinking..." message while waiting for the response
    setTimeout(() => {
        const incomingChatLi = createChatLi(
            `<div class="typing-animation">
            <div class="dot" style="--delay: 200ms"></div>
            <div class="dot" style="--delay: 300ms"></div>
            <div class="dot" style="--delay: 400ms"></div>
            </div>`,
            "incoming"
        );

        // Append the "Thinking..." message to the chatbox
        chatBox.appendChild(incomingChatLi);

        // Scroll the chatBox to the bottom
        chatBox.scrollTo(0, chatBox.scrollHeight);

        // Generate a response after a delay
        generateResponse(incomingChatLi);
    }, 600);

    // Push the previous user chat into the chatHistory array
    chatHistory.push({ role: 'user', content: sanitizedUserMessage });

    sessionStorage.setItem('chat_history', JSON.stringify(chatHistory));

    // // Log the chat history
    // console.log(chatHistory);
}









// Event listener for input changes in the chat input textarea
chatInput.addEventListener('input', () => {
    chatInput.style.height = `${inputInitHeight}px`; // Set the initial height of the chat input textarea
    chatInput.style.height = `${chatInput.scrollHeight}px`; // Set the height of the chat input textarea to match its scroll height
});

// Event listener for keydown events in the chat input textarea
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 800) { // Check if the 'Enter' key is pressed without the 'Shift' key and the window width is greater than 800 pixels
        e.preventDefault(); // Prevent the default behavior of the 'Enter' key
        handleChat(); // Call the handleChat function to handle the user's input
    }
});

// Event listener for click events on the chatbot toggle element
chatbotToggle.addEventListener('click', () =>
    document.body.classList.toggle('show-chatbot') // Toggle the 'show-chatbot' class on the document body
);

// Event listener for click events on the chatbot close button
chatBotCloseBtn.addEventListener('click', () =>
    document.body.classList.remove('show-chatbot') // Remove the 'show-chatbot' class from the document body
);

// Event listener for click events on the send chat button
sendChatBtn.addEventListener('click', handleChat); // Call the handleChat function when the send chat button is clicked
