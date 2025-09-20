// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.glassmorphic-navbar');
    if (window.scrollY > 50) {
        navbar.style.padding = '0.7rem 5%';
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.padding = '1rem 5%';
        navbar.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.1)';
    }
});

// AI Chat Demo Functionality
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Initialize the Generative AI Service
let aiService;

// Initialize the AI service when the page loads
document.addEventListener('DOMContentLoaded', () => {
    aiService = new GenerativeAIService();
    
    // Load chat history if available
    if (localStorage.getItem('mindfulAI_chatHistory')) {
        loadChatHistory();
    } else {
        // Add initial greeting to the context and UI
        const greeting = "👋 Hi there! I'm MindfulAI. How are you feeling today? 😊";
        aiService.addToContext('assistant', greeting);
        addAIMessage(greeting);
    }
});

// Get current timestamp
function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Save chat history to local storage
function saveChatHistory() {
    const messages = Array.from(chatMessages.children).map(msg => {
        return {
            type: msg.classList.contains('user-message') ? 'user' : 'ai',
            content: msg.querySelector('p').textContent,
            timestamp: msg.querySelector('.message-timestamp')?.textContent || getCurrentTimestamp()
        };
    });
    localStorage.setItem('mindfulAI_chatHistory', JSON.stringify(messages));
}

// Load chat history from local storage
function loadChatHistory() {
    const history = localStorage.getItem('mindfulAI_chatHistory');
    if (history) {
        const messages = JSON.parse(history);
        chatMessages.innerHTML = ''; // Clear current messages
        messages.forEach(msg => {
            if (msg.type === 'user') {
                addUserMessage(msg.content, msg.timestamp);
            } else {
                addAIMessage(msg.content, msg.timestamp);
            }
        });
    }
}

// Add user message to chat
function addUserMessage(message, timestamp = getCurrentTimestamp()) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'user-message');
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
            <span class="message-timestamp">${timestamp}</span>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    saveChatHistory();
}

// Add AI message to chat
function addAIMessage(message, timestamp = getCurrentTimestamp()) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'ai-message');
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
            <span class="message-timestamp">${timestamp}</span>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    saveChatHistory();
}

// Simulate AI thinking with typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'ai-message', 'typing-indicator');
    typingDiv.innerHTML = `
        <div class="message-content">
            <p>MindfulAI is typing<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></p>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Remove typing indicator
function removeTypingIndicator(indicator) {
    chatMessages.removeChild(indicator);
}

// Handle sending messages
async function sendMessage() {
    const message = userInput.value.trim();
    if (message !== '') {
        // Add user message to UI
        addUserMessage(message);
        
        // Add user message to AI context
        aiService.addToContext('user', message);
        
        // Clear input field
        userInput.value = '';

        // Show typing indicator
        const typingIndicator = showTypingIndicator();

        try {
            // Simulate AI thinking time (between 1-2 seconds)
            const thinkingTime = Math.floor(Math.random() * 1000) + 1000;
            await new Promise(resolve => setTimeout(resolve, thinkingTime));
            
            // Generate AI response
            const aiResponse = await aiService.generateResponse(message);
            
            // Remove typing indicator
            removeTypingIndicator(typingIndicator);
            
            // Add AI response to chat
            addAIMessage(aiResponse);
        } catch (error) {
            console.error('Error getting AI response:', error);
            
            // Remove typing indicator
            removeTypingIndicator(typingIndicator);
            
            // Add fallback message
            addAIMessage("😕 I'm having trouble connecting right now. Please try again in a moment. 🙏");
        }
    }
}

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Send message on Enter key
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Testimonial Slider
const testimonialContainer = document.getElementById('testimonials-container');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;

// Set up testimonial slider if it exists on the page
if (testimonialContainer && dots.length > 0) {
    // Function to show specific slide
    function showSlide(index) {
        const slideWidth = testimonialContainer.querySelector('.testimonial-card').offsetWidth + 30; // card width + gap
        testimonialContainer.style.transform = `translateX(-${index * slideWidth}px)`;
        
        // Update active dot
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
    }
    
    // Add click event to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });
    
    // Auto slide every 5 seconds
    setInterval(() => {
        currentSlide = (currentSlide + 1) % dots.length;
        showSlide(currentSlide);
    }, 5000);
}

// Animate elements when they come into view
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.glassmorphic-card, .section-header');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Set initial styles for animation
document.querySelectorAll('.glassmorphic-card, .section-header').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'all 0.6s ease-out';
});

// Run animation on scroll
window.addEventListener('scroll', animateOnScroll);
// Run once on page load
window.addEventListener('load', animateOnScroll);

// Mood Tracking Feature (simplified demo)
const moodButtons = document.querySelectorAll('.service-btn');

moodButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (this.textContent === 'Track Mood') {
            // Show a simple mood tracking dialog
            alert('Mood tracking feature would open here. This would allow users to log their emotional state and track patterns over time.');
        } else if (this.textContent === 'Start Exercise') {
            // Show a guided exercise dialog
            alert('Guided exercise would start here. This would provide step-by-step mindfulness or relaxation techniques.');
        } else if (this.textContent === 'Try Now') {
            // Scroll to chat demo
            document.getElementById('ai-demo').scrollIntoView({ behavior: 'smooth' });
        }
    });
});