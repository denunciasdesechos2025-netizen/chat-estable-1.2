const state = {
    step: 0,
    data: {
        category: '',
        address: '',
        locationLink: '',
        name: '',
        phone: '',
        description: ''
    },
    conversationHistory: [],
    aiChatMode: false
};

const chatArea = document.getElementById('chatArea');
const inputArea = document.getElementById('inputArea');

// Venice AI Configuration from config.js
const VENICE_API_URL = CONFIG.VENICE_API_URL;
const VENICE_API_KEY = CONFIG.VENICE_API_KEY;

// Initial Greeting
window.onload = () => {
    addMessage("¡Hola! 👋 Bienvenido al chat de denuncias de desechos sólidos de la Alcaldía de San Salvador Este.", 'bot');
    setTimeout(() => {
        addMessage("Por favor, elige el tipo de denuncia que deseas realizar:", 'bot');
        renderOptions([
            { text: "1. Recolección de desechos sólidos", value: "Recolección de desechos sólidos" },
            { text: "2. Urbano (baches, tragantes, calles)", value: "Urbano (baches, tragantes, etc.)" },
            { text: "3. Mi denuncia es de otro tema", value: "Otro tema" },
            { text: "4. Hablar con asistente de IA", value: "chat_with_ai" }
        ]);
    }, 600);
};

// Function to call Venice AI API
async function callVeniceAI(prompt) {
    try {
        const response = await fetch(VENICE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${VENICE_API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.AI_MODEL || 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un experto asistente virtual de la Alcaldía de San Salvador Este. Tu objetivo es ayudar a los ciudadanos con reportes de baches, recolección de basura y otros temas urbanos. Responde de manera servicial, empática y profesional siempre en español.'
                    },
                    ...state.conversationHistory,
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error al llamar a Venice AI:', error);
        return 'Lo siento, he tenido un problema al procesar tu solicitud. Por favor, intenta de nuevo más tarde.';
    }
}

function scrollToBottom() {
    chatArea.scrollTop = chatArea.scrollHeight;
}

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerText = text;
    chatArea.appendChild(msgDiv);

    // Add to conversation history for AI context
    if (sender === 'user') {
        state.conversationHistory.push({ role: 'user', content: text });
    } else if (sender === 'bot') {
        state.conversationHistory.push({ role: 'assistant', content: text });
    }

    scrollToBottom();
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatArea.appendChild(typingDiv);
    scrollToBottom();
}

function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

function simulateBotResponse(text, nextAction, delay = 600) {
    showTyping();
    setTimeout(() => {
        hideTyping();
        addMessage(text, 'bot');
        if (nextAction) nextAction();
    }, delay);
}

// Function to handle AI chat mode
async function handleAIChat(userMessage) {
    showTyping();

    try {
        const aiResponse = await callVeniceAI(userMessage);
        hideTyping();
        addMessage(aiResponse, 'bot');

        // Check if AI detected a complaint intent
        if (aiResponse.toLowerCase().includes('denuncia') ||
            aiResponse.toLowerCase().includes('reportar') ||
            aiResponse.toLowerCase().includes('problema')) {

            setTimeout(() => {
                addMessage("¿Deseas formalizar una denuncia con los datos que has proporcionado?", 'bot');
                renderOptions([
                    { text: "Sí, quiero formalizar la denuncia", value: "formalize_complaint" },
                    { text: "No, solo estaba consultando", value: "just_consulting" },
                    { text: "Volver al menú principal", value: "back_to_menu" }
                ]);
            }, 1000);
        }
    } catch (error) {
        hideTyping();
        addMessage("Lo siento, he tenido un problema al procesar tu solicitud. Por favor, intenta de nuevo más tarde.", 'bot');
    }
}

function renderOptions(options) {
    inputArea.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        btn.onclick = () => handleOptionClick(opt.value, opt.display || opt.text);
        inputArea.appendChild(btn);
    });
}

function renderTextInput(placeholder, inputType = 'text', btnIcon = '➤') {
    inputArea.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'text-input-container';
    const input = document.createElement('input');
    input.className = 'chat-input';
    input.type = inputType;
    input.placeholder = placeholder;

    // Auto-focus logic for better UX
    setTimeout(() => input.focus(), 100);

    const btn = document.createElement('button');
    btn.className = 'send-btn';
    btn.innerHTML = btnIcon;
    btn.onclick = () => handleTextInput(input.value);

    // Allow Enter key to submit
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleTextInput(input.value);
    });

    container.appendChild(input);
    container.appendChild(btn);
    inputArea.appendChild(container);
}

function renderLocationRequest() {
    inputArea.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'text-input-container';
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.style.flex = "1";
    btn.innerHTML = '📍 Compartir mi ubicación actual';
    btn.onclick = () => getUserLocation();

    const skipBtn = document.createElement('button');
    skipBtn.className = 'option-btn';
    skipBtn.innerText = 'Escribir manual';
    skipBtn.onclick = () => {
        state.data.locationLink = "No compartida / Manual";
        nextStep();
    };

    inputArea.appendChild(btn);
    inputArea.appendChild(skipBtn);
}

function getUserLocation() {
    if (!navigator.geolocation) {
        alert("Geolocalización no soportada por su navegador.");
        return;
    }

    addMessage("Obteniendo ubicación...", 'user');
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const link = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
            state.data.locationLink = link;
            simulateBotResponse("¡Ubicación recibida gracias! 📍", () => nextStep());
        },
        (error) => {
            addMessage("No se pudo obtener la ubicación. Por favor escríbela o descríbela.", 'bot');
            state.data.locationLink = "No compartida / Error GPS";
            nextStep();
        }
    );
}

function handleOptionClick(value, displayText) {
    addMessage(displayText, 'user');
    inputArea.innerHTML = '';

    // Handle AI chat mode
    if (value === 'chat_with_ai') {
        state.aiChatMode = true;
        state.conversationHistory = []; // Reset conversation history
        addMessage("Has entrado en modo de chat con IA. ¿En qué puedo ayudarte hoy?", 'bot');
        renderTextInput("Escribe tu pregunta aquí...");
        return;
    }

    // Handle back to menu
    if (value === 'back_to_menu') {
        state.aiChatMode = false;
        state.step = 0;
        addMessage("Volviendo al menú principal...", 'bot');
        setTimeout(() => {
            addMessage("Por favor, elige el tipo de denuncia que deseas realizar:", 'bot');
            renderOptions([
                { text: "1. Recolección de desechos sólidos", value: "Recolección de desechos sólidos" },
                { text: "2. Urbano (baches, tragantes, calles)", value: "Urbano (baches, tragantes, etc.)" },
                { text: "3. Mi denuncia es de otro tema", value: "Otro tema" },
                { text: "4. Hablar con asistente de IA", value: "chat_with_ai" }
            ]);
        }, 800);
        return;
    }

    // Handle formalize complaint
    if (value === 'formalize_complaint') {
        state.aiChatMode = false;
        state.step = 2; // Jump to address
        addMessage("Perfecto, vamos a formalizar tu reporte.", 'bot');
        setTimeout(() => {
            addMessage("¿Cuál es la dirección exacta del problema?", 'bot');
            renderTextInput("Ej: Calle principal, frente a parque...");
        }, 600);
        return;
    }

    if (value === 'just_consulting') {
        addMessage("Entendido. Si necesitas algo más, aquí estaré.", 'bot');
        renderTextInput("Escribe tu pregunta aquí...");
        return;
    }

    // Default flow
    state.data.category = value;
    nextStep();
}

function handleTextInput(text) {
    if (!text.trim()) return;

    addMessage(text, 'user');

    if (state.aiChatMode) {
        handleAIChat(text);
        return;
    }

    switch (state.step) {
        case 2:
            state.data.address = text;
            break;
        case 4:
            state.data.name = text;
            break;
        case 5:
            state.data.phone = text;
            break;
        case 6:
            state.data.description = text;
            break;
    }
    nextStep();
}

function nextStep() {
    state.step++;

    switch (state.step) {
        case 1:
            simulateBotResponse("¿Dónde se encuentra el problema? Puedes compartir tu ubicación o escribir la dirección.", renderLocationRequest);
            break;
        case 2:
            simulateBotResponse("¿Cuál es la dirección o punto de referencia?", () => renderTextInput("Escriba la dirección aquí..."));
            break;
        case 3:
            simulateBotResponse("Gracias. Ahora, ¿cuál es tu nombre completo?", () => renderTextInput("Escriba su nombre aquí..."));
            break;
        case 4:
            simulateBotResponse("¿A qué número de teléfono podemos contactarte?", () => renderTextInput("Escriba su teléfono aquí...", 'tel'));
            break;
        case 5:
            simulateBotResponse("Por último, describe brevemente el problema (ej: bache profundo, basura acumulada por 3 días).", () => renderTextInput("Escriba la descripción aquí..."));
            break;
        case 6:
            finishReport();
            break;
    }
}

function finishReport() {
    const summary = `📝 *Resumen de Denuncia*
*Categoría:* ${state.data.category}
*Dirección:* ${state.data.address}
*Ubicación:* ${state.data.locationLink}
*Nombre:* ${state.data.name}
*Teléfono:* ${state.data.phone}
*Descripción:* ${state.data.description}`;

    showTyping();
    setTimeout(() => {
        hideTyping();
        addMessage("¡Gracias! He recopilado toda la información. Aquí tienes un resumen:", 'bot');
        setTimeout(() => {
            addMessage(summary, 'bot');
            setTimeout(() => {
                const whatsappMsg = encodeURIComponent(summary);
                const whatsappUrl = `https://wa.me/50370901299?text=${whatsappMsg}`;

                renderOptions([
                    { text: "Confirmar y Enviar a WhatsApp 📱", value: 'send_whatsapp', display: "Enviar Reporte" },
                    { text: "Corregir información", value: 'back_to_menu', display: "Reiniciar Chat" }
                ]);

                // Redefine WhatsApp button click
                document.querySelectorAll('.option-btn').forEach(btn => {
                    if (btn.innerText === "Confirmar y Enviar a WhatsApp 📱") {
                        btn.onclick = () => {
                            window.open(whatsappUrl, '_blank');
                            addMessage("Enviando reporte a WhatsApp...", 'user');
                            simulateBotResponse("¡Reporte enviado con éxito! Un agente le dará seguimiento pronto. ¡Que tenga un feliz día!");
                        };
                    }
                });
            }, 800);
        }, 600);
    }, 1000);
}