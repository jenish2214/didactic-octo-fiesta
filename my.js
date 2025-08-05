const GEMINI_API_KEY = "AIzaSyDQDgq_H-ywd_w9yjJFtwgfkV1VU39Rf3w";

const userInput = document.getElementById("text");
const submitbtn = document.getElementById("btn");
const chatbox = document.getElementById("chatBox");
const addNewBtn = document.getElementById("addNewBtn");
const allChat = document.getElementById("allChat");

let currentChat = "";
let allChats = JSON.parse(localStorage.getItem("allChats") || "{}");
let currentChatValue = [];
const allChatKeys = Object.keys(allChats);

// Add Google Fonts for better typography
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Typing indicator function
function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing-indicator";
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatbox.appendChild(typingDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
    return typingDiv;
}

// Remove typing indicator
function removeTypingIndicator(typingDiv) {
    if (typingDiv) {
        typingDiv.remove();
    }
}

// Enhanced message creation with animations
function createMessage(text, isUser = false, isAI = false) {
    const div = document.createElement("div");
    
    if (isUser) {
        div.innerText = `User : ${text}`;
        div.className = "rightChat";
    } else if (isAI) {
        div.innerHTML = `Ai : ${marked.parse(text)}`;
        div.className = "leftChat";
    }
    
    // Add entrance animation
    div.style.opacity = "0";
    div.style.transform = "translateY(20px)";
    
    chatbox.appendChild(div);
    
    // Trigger animation
    setTimeout(() => {
        div.style.transition = "all 0.5s ease-out";
        div.style.opacity = "1";
        div.style.transform = "translateY(0)";
    }, 100);
    
    // Auto scroll to bottom
    setTimeout(() => {
        chatbox.scrollTop = chatbox.scrollHeight;
    }, 600);
    
    return div;
}

// Enhanced chat list creation
function createChatListItem(key) {
    let outerbox = document.createElement("div");
    outerbox.classList.add("chatList");
    outerbox.style.opacity = "0";
    outerbox.style.transform = "translateY(20px)";

    const div = document.createElement("div");
    div.innerText = key;

    const remove = document.createElement("h3");
    remove.innerText = `❌`;

    outerbox.appendChild(div);
    outerbox.appendChild(remove);
    allChat.prepend(outerbox);

    // Animate in
    setTimeout(() => {
        outerbox.style.transition = "all 0.5s ease-out";
        outerbox.style.opacity = "1";
        outerbox.style.transform = "translateY(0)";
    }, 100);

    div.addEventListener("click", () => {
        // Add click animation
        outerbox.style.transform = "scale(0.95)";
        setTimeout(() => {
            outerbox.style.transform = "scale(1)";
        }, 150);

        currentChat = key;
        currentChatValue = allChats[key];

        chatbox.innerHTML = "";
        
        // Animate in chat history
        for (let i = 0; i < currentChatValue.length; i++) {
            setTimeout(() => {
                const div = document.createElement("div");
                let text = currentChatValue[i].parts[0].text;
                if (currentChatValue[i].role === "user") {
                    div.innerText = `User : ${text}`;
                    div.className = "rightChat";
                } else if (currentChatValue[i].role === "model") {
                    div.innerHTML = `Ai : ${marked.parse(text)}`;
                    div.className = "leftChat";
                }
                div.style.opacity = "0";
                div.style.transform = "translateY(20px)";
                chatbox.append(div);
                
                setTimeout(() => {
                    div.style.transition = "all 0.5s ease-out";
                    div.style.opacity = "1";
                    div.style.transform = "translateY(0)";
                }, 100);
            }, i * 100);
        }
    });

    remove.addEventListener("click", (e) => {
        e.stopPropagation();
        
        // Add removal animation
        outerbox.style.transition = "all 0.3s ease-out";
        outerbox.style.opacity = "0";
        outerbox.style.transform = "translateX(-100px)";
        
        setTimeout(() => {
            outerbox.remove();
            delete allChats[key];
            if (currentChat === key) {
                chatbox.innerHTML = "";
                currentChat = "";
                currentChatValue = [];
            }
            localStorage.setItem("allChats", JSON.stringify(allChats));
        }, 300);
    });

    return outerbox;
}

// Load existing chats with animations
for (let i = 0; i < allChatKeys.length; i++) {
    setTimeout(() => {
        createChatListItem(allChatKeys[i]);
    }, i * 100);
}

// Enhanced add new chat functionality
addNewBtn.addEventListener("click", () => {
    // Add button click animation
    addNewBtn.style.transform = "scale(0.95)";
    setTimeout(() => {
        addNewBtn.style.transform = "scale(1)";
    }, 150);

    const chatName = prompt("Enter chat name : ").trim();
    if (!chatName) {
        return;
    }

    const outerbox = createChatListItem(chatName);
    allChats[chatName] = !currentChat ? currentChatValue : [];
    localStorage.setItem("allChats", JSON.stringify(allChats));
});

// Enhanced user input function
const user = () => {
    const value = userInput.value.trim();
    if (!value) return;

    // Add input animation
    submitbtn.style.transform = "scale(0.95)";
    setTimeout(() => {
        submitbtn.style.transform = "scale(1)";
    }, 150);

    createMessage(value, true);
    userInput.value = "";
    
    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    
    // Call AI with delay for better UX
    setTimeout(() => {
        Ai(value, typingIndicator);
    }, 500);
};

// Enhanced AI response function
const Ai = (prompt, typingIndicator) => {
    currentChatValue.push({
        role: "user",
        parts: [
            {
                text: prompt,
            },
        ],
    });
    
    const body = {
        contents: currentChatValue,
    };
    
    fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
            headers: {
                "content-type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(body),
        }
    )
        .then((res) => res.json())
        .then((data) => {
            // Remove typing indicator
            removeTypingIndicator(typingIndicator);
            
            let response = data.candidates[0].content.parts[0].text;
            createMessage(response, false, true);

            currentChatValue.push({
                role: "model",
                parts: [
                    {
                        text: response,
                    },
                ],
            });
            
            // Save to localStorage
            if (currentChat) {
                allChats[currentChat] = currentChatValue;
                localStorage.setItem("allChats", JSON.stringify(allChats));
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            removeTypingIndicator(typingIndicator);
            
            // Show error message
            const errorDiv = createMessage("Sorry, I encountered an error. Please try again.", false, true);
            errorDiv.style.background = "linear-gradient(135deg, #ff6347, #ff8c00)";
        });
};

// Event listeners
submitbtn.addEventListener("click", user);

// Enter key support
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        user();
    }
});

// Add focus animation to input
userInput.addEventListener("focus", () => {
    userInput.style.transform = "scale(1.02)";
    userInput.style.transition = "transform 0.3s ease";
});

userInput.addEventListener("blur", () => {
    userInput.style.transform = "scale(1)";
});

// Add loading state to buttons
function addLoadingState(button) {
    const originalText = button.textContent;
    button.textContent = "Loading...";
    button.disabled = true;
    return () => {
        button.textContent = originalText;
        button.disabled = false;
    };
}

// Add some initial animation to the page
document.addEventListener("DOMContentLoaded", () => {
    // Add a subtle pulse animation to the main container
    const chatContainer = document.getElementById("chat");
    chatContainer.style.animation = "pulse 2s ease-in-out infinite";
    
    // Add CSS for pulse animation
    const style = document.createElement("style");
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.01); }
        }
    `;
    document.head.appendChild(style);
});
