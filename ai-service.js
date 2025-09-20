// AI Service for Mental Wellness Application
// This service uses the Google Generative AI API

class GenerativeAIService {
    constructor() {
        // In a production environment, you would use environment variables for API keys
        this.apiKey = 'AIzaSyBrU-KZIo4fDIbsSfhWq40QYd8rdHSVnz0'; // Replace with your actual API key
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.contextHistory = [];
        this.systemPrompt = `You are MindfulAI, an empathetic AI assistant designed to support youth mental wellness. 
        Your responses should be compassionate, non-judgmental, and helpful. 
        Focus on providing emotional support, coping strategies, and gentle guidance. 
        If someone appears to be in crisis, suggest professional resources while maintaining a supportive tone. 
        Never provide medical diagnoses or replace professional mental health care.
        Keep responses concise (2-3 sentences) and conversational with emojis where appropriate.`;
    }

    // Add a message to the context history
    addToContext(role, content) {
        this.contextHistory.push({
            role: role, // 'user' or 'assistant'
            content: content
        });
        
        // Keep context history to a reasonable size
        if (this.contextHistory.length > 10) {
            this.contextHistory.shift();
        }
    }

    // Build the prompt with context history
    buildPrompt(userMessage) {
        let prompt = this.systemPrompt + "\n\n";
        
        // Add conversation history
        this.contextHistory.forEach(message => {
            prompt += `${message.role}: ${message.content}\n`;
        });
        
        // Add the current user message
        prompt += `user: ${userMessage}\n`;
        prompt += "assistant: ";
        
        return prompt;
    }

    // Generate a response using the API
    async generateResponse(userMessage) {
        try {
            // For demo purposes, we'll use a fallback if API is not available
            if (!this.apiKey || this.apiKey === 'AIzaSyBrU-KZIo4fDIbsSfhWq40QYd8rdHSVnz0') {
                console.log('Using fallback response (demo API key provided)');
                return this.getFallbackResponse(userMessage);
            }

            const prompt = this.buildPrompt(userMessage);
            
            // Simplified request format to match Gemini API expectations
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API error:', errorData);
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            // More robust response parsing with better error handling
            if (data && data.candidates && 
                data.candidates.length > 0 && 
                data.candidates[0].content && 
                data.candidates[0].content.parts && 
                data.candidates[0].content.parts.length > 0 && 
                data.candidates[0].content.parts[0].text) {
                
                const aiResponse = data.candidates[0].content.parts[0].text.trim();
                this.addToContext('assistant', aiResponse);
                return aiResponse;
            } else {
                console.error('Invalid API response format:', data);
                throw new Error('Invalid response format from API');
            }
        } catch (error) {
            console.error('Error generating AI response:', error);
            // Always use fallback for any error
            const fallbackResponse = this.getFallbackResponse(userMessage);
            this.addToContext('assistant', fallbackResponse);
            return fallbackResponse;
        }
    }

    // Fallback responses when API is not available
    getFallbackResponse(userMessage) {
        // Analyze user message for keywords to provide more relevant responses
        const message = userMessage.toLowerCase();
        
        // Track which emotion categories are detected
        const emotionDetected = {
            anxiety: false,
            sadness: false,
            stress: false,
            sleep: false,
            social: false,
            academic: false,
            crisis: false,
            gratitude: false,
            greeting: false,
            anger: false,
            happiness: false,
            fear: false,
            confusion: false
        };
        
        // Detect emotions with more comprehensive keyword sets
        emotionDetected.anxiety = /\b(anxious|anxiety|worried|nervous|panic|fear|phobia|tense)\b/.test(message);
        emotionDetected.sadness = /\b(sad|depressed|unhappy|down|blue|miserable|hopeless|grief|loss)\b/.test(message);
        emotionDetected.stress = /\b(stress|overwhelmed|pressure|burnout|exhausted|too much|can't cope|overload)\b/.test(message);
        emotionDetected.sleep = /\b(sleep|tired|insomnia|fatigue|rest|awake|nightmare|dream)\b/.test(message);
        emotionDetected.social = /\b(friend|relationship|social|family|parent|sibling|peer|bully|lonely|alone)\b/.test(message);
        emotionDetected.academic = /\b(school|study|exam|test|college|university|homework|grade|class|teacher|professor)\b/.test(message);
        emotionDetected.crisis = /\b(help|suicide|hurt|die|kill|end|pain|suffering|crisis|emergency|hopeless)\b/.test(message);
        emotionDetected.gratitude = /\b(thank|thanks|helpful|appreciate|grateful|good advice)\b/.test(message);
        emotionDetected.greeting = /\b(hello|hi|hey|greetings|good morning|good afternoon|good evening|howdy)\b/.test(message);
        emotionDetected.anger = /\b(angry|mad|furious|rage|upset|irritated|annoyed|frustrated)\b/.test(message);
        emotionDetected.happiness = /\b(happy|joy|excited|great|wonderful|fantastic|good|positive|better)\b/.test(message);
        emotionDetected.fear = /\b(scared|terrified|afraid|frightened|terror|horror|dread)\b/.test(message);
        emotionDetected.confusion = /\b(confused|unsure|don't understand|lost|uncertain|doubt|puzzled)\b/.test(message);
        
        // Crisis takes highest priority
        if (emotionDetected.crisis) {
            const crisisResponses = [
                "❗ I'm concerned about what you're sharing. Please reach out to a crisis helpline right away - text HOME to 741741 or call 988 for immediate support. You deserve help, and people care about you. 🤗",
                "⚠️ This sounds serious, and I want to make sure you get the support you need. Please contact a crisis counselor by calling 988 or texting HOME to 741741. They're available 24/7 and can provide immediate help. 💪",
                "🚨 Your wellbeing matters. If you're having thoughts of harming yourself, please call 988 or text HOME to 741741 immediately to speak with a trained crisis counselor. You don't have to face this alone. 💗"
            ];
            return crisisResponses[Math.floor(Math.random() * crisisResponses.length)];
        }
        
        // Greeting responses
        if (emotionDetected.greeting) {
            const greetingResponses = [
                "👋 Hi there! I'm MindfulAI. How are you feeling today? I'm here to listen and support you. 😊",
                "🌟 Hello! Thanks for reaching out. I'm here to chat about whatever's on your mind. How are you doing today? 🙂",
                "✨ Hey! I'm your mental wellness assistant. I'm here to listen and offer support. What's been on your mind lately? 💭"
            ];
            return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
        }
        
        // Gratitude responses
        if (emotionDetected.gratitude) {
            const gratitudeResponses = [
                "🙏 I'm glad I could help. Remember that taking care of your mental health is an ongoing journey, and you're doing great by seeking support. 🌱",
                "💖 You're welcome! It takes courage to work on your mental wellness, and I'm here whenever you need to talk. 🌈",
                "😊 I'm happy our conversation was helpful. Remember that small steps toward wellness add up over time. Is there anything else you'd like to discuss? 🌻"
            ];
            return gratitudeResponses[Math.floor(Math.random() * gratitudeResponses.length)];
        }
        
        // Anxiety responses
        if (emotionDetected.anxiety) {
            const anxietyResponses = [
                "😌 It's completely normal to feel anxious sometimes. Try taking a few deep breaths - breathe in for 4 counts, hold for 4, and exhale for 6. Would you like to explore some other anxiety management techniques? 🧘‍♀️",
                "🌬️ Anxiety can feel overwhelming, but there are techniques that can help. The 5-4-3-2-1 grounding exercise might help: name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste. 🌿",
                "💆‍♂️ When anxiety hits, try to notice where you feel it in your body. Sometimes just acknowledging these physical sensations without judgment can help them ease. What specific worries are on your mind right now? 🤔"
            ];
            return anxietyResponses[Math.floor(Math.random() * anxietyResponses.length)];
        }
        
        // Sadness responses
        if (emotionDetected.sadness) {
            const sadnessResponses = [
                "😔 I'm sorry you're feeling down. Remember that emotions come and go like waves. Would it help to talk about what's contributing to these feelings? 🌊",
                "🫂 It's okay to feel sad sometimes. Being gentle with yourself during difficult emotions is an important part of mental wellness. What small comfort might help you right now? 🍵",
                "🎨 When sadness feels heavy, sometimes it helps to express it creatively - through writing, art, or music. Have you found any ways to express your feelings that help you process them? 📝"
            ];
            return sadnessResponses[Math.floor(Math.random() * sadnessResponses.length)];
        }
        
        // Stress responses
        if (emotionDetected.stress) {
            const stressResponses = [
                "Being overwhelmed is challenging. Consider breaking down what's causing stress into smaller, manageable parts. What's one small step you could take right now?",
                "When stress builds up, your body needs moments of relief. Even a 2-minute break to stretch or a 10-minute walk can help reset your nervous system. What brief break might work for you today?",
                "Stress often comes from trying to handle everything at once. It's okay to prioritize and let some things wait. What's one thing that needs your attention most right now?"
            ];
            return stressResponses[Math.floor(Math.random() * stressResponses.length)];
        }
        
        // Sleep responses
        if (emotionDetected.sleep) {
            const sleepResponses = [
                "Sleep is so important for mental wellness. Creating a calming bedtime routine and limiting screen time before bed can help. Would you like some specific relaxation techniques?",
                "Sleep troubles can really affect how we feel. Keeping a consistent sleep schedule, even on weekends, can help regulate your body's natural rhythm. What's your current sleep routine like?",
                "If racing thoughts keep you awake, try the 'worry journal' technique - write down your concerns before bed to help your mind let go of them temporarily. Have you tried any relaxation techniques for better sleep?"
            ];
            return sleepResponses[Math.floor(Math.random() * sleepResponses.length)];
        }
        
        // Social relationship responses
        if (emotionDetected.social) {
            const socialResponses = [
                "Relationships can be complicated. Remember that healthy connections involve mutual respect and good communication. Would you like to talk more about what's happening?",
                "Social challenges are a normal part of life, though they can be painful. Setting boundaries is important for your wellbeing. How do you feel about the boundaries in this relationship?",
                "Sometimes relationship difficulties reflect different communication styles rather than incompatibility. Have you had a chance to express how you're feeling to the other person?"
            ];
            return socialResponses[Math.floor(Math.random() * socialResponses.length)];
        }
        
        // Academic pressure responses
        if (emotionDetected.academic) {
            const academicResponses = [
                "Academic pressure can be intense. Breaking study sessions into focused 25-minute blocks with short breaks can help. How might you make your study routine more manageable?",
                "School stress is very common. Remember that your worth isn't defined by grades or academic performance. What specific aspect of school is feeling most challenging right now?",
                "Learning environments can be demanding. Sometimes adjusting your expectations from 'perfect' to 'progress' can reduce pressure. What would a balanced approach to your studies look like?"
            ];
            return academicResponses[Math.floor(Math.random() * academicResponses.length)];
        }
        
        // Anger responses
        if (emotionDetected.anger) {
            const angerResponses = [
                "It's natural to feel angry sometimes. Taking a short break to cool down before responding can help prevent saying things you might regret. What triggered these feelings?",
                "Anger often masks other emotions like hurt or fear. When you feel ready, exploring what's beneath the anger might help address the root cause. What do you think might be behind these feelings?",
                "When anger builds up, physical release can help - like going for a run or punching a pillow. Do you have any safe ways to release this energy when you're feeling this way?"
            ];
            return angerResponses[Math.floor(Math.random() * angerResponses.length)];
        }
        
        // Happiness responses
        if (emotionDetected.happiness) {
            const happinessResponses = [
                "It's wonderful to hear you're feeling positive! Savoring good moments helps build resilience for challenging times. What specifically is bringing you joy right now?",
                "That's great to hear! Sharing positive experiences with others can actually amplify the good feelings. Is there someone in your life you could share this happiness with?",
                "Positive emotions are worth celebrating! Taking mental photographs of good moments can help you revisit them later. What about this experience would you like to remember?"
            ];
            return happinessResponses[Math.floor(Math.random() * happinessResponses.length)];
        }
        
        // Fear responses
        if (emotionDetected.fear) {
            const fearResponses = [
                "Fear is your brain's way of trying to protect you, even if it sometimes overreacts. Naming your fear can actually help reduce its power. Can you describe what you're afraid might happen?",
                "Being scared is a natural human experience. Remember that courage isn't the absence of fear, but moving forward despite it. What small step might help you face this fear?",
                "When fear feels overwhelming, grounding yourself in the present moment can help. Notice five things you can see right now. What do you observe around you?"
            ];
            return fearResponses[Math.floor(Math.random() * fearResponses.length)];
        }
        
        // Confusion responses
        if (emotionDetected.confusion) {
            const confusionResponses = [
                "It's okay to feel uncertain sometimes. Breaking complex situations into smaller questions can make them more manageable. What specific aspect feels most confusing right now?",
                "Confusion often comes before clarity. Writing down your thoughts might help you organize them and see patterns. Have you tried journaling about this situation?",
                "When things feel unclear, sometimes taking a step back gives perspective. What would you tell a friend who was in your situation?"
            ];
            return confusionResponses[Math.floor(Math.random() * confusionResponses.length)];
        }
        
        // General supportive responses if no specific emotion is detected
        const generalResponses = [
            "Thank you for sharing that with me. Would you like to tell me more about how this is affecting you?",
            "I hear you. It takes courage to express your feelings. What do you think might help in this situation?",
            "That sounds challenging. Remember that it's okay to prioritize your mental wellbeing. What's one small thing you could do for self-care today?",
            "I understand this is difficult. You're not alone in feeling this way, and there are strategies that might help. Would you like to explore some options?",
            "Your feelings are valid. Sometimes just acknowledging our emotions can be a helpful first step. How long have you been feeling this way?",
            "It sounds like you're going through a lot. Taking small steps toward wellness can make a difference. What's worked for you in the past during difficult times?",
            "I appreciate you opening up. Sometimes putting feelings into words is the first step toward understanding them better. What else is on your mind?",
            "Everyone's mental health journey is unique. What kinds of support have you found helpful in the past?",
            "It takes strength to talk about these things. Would it help to explore some coping strategies that others have found useful in similar situations?"
        ];
        
        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
}

// Export the service
window.GenerativeAIService = GenerativeAIService;