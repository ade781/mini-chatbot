

document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendMessageButton = document.getElementById('sendMessage');

 
    const VERY_TEMPORARY_GEMINI_API_KEY = 'AIzaSyCblmyODRVKZ_zFqU_LfFu6BOBdRArMQ3Q'; 

    sendMessageButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender + '-message');
        messageDiv.textContent = text;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function sendMessage() {
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        appendMessage(messageText, 'user');
        userInput.value = '';

        if (VERY_TEMPORARY_GEMINI_API_KEY === 'AIzaSyC...ANDA_PUNYA_API_KEY' || VERY_TEMPORARY_GEMINI_API_KEY === '') {
            appendMessage("Mohon masukkan API Key Anda di variabel VERY_TEMPORARY_GEMINI_API_KEY di script.js untuk pengujian ini.", 'bot');
            return;
        }

        try {
            const botResponseText = await getBotResponseDirectlyFromGoogle(messageText);
            appendMessage(botResponseText, 'bot');
        } catch (error) {
            console.error('Error getting bot response:', error);
            appendMessage('Maaf, terjadi kesalahan: ' + error.message, 'bot');
        }
    }

    async function getBotResponseDirectlyFromGoogle(userMessage) {
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${VERY_TEMPORARY_GEMINI_API_KEY}`;
        // atau model lain: gemini-2.0-flash

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: userMessage
                        }
                    ]
                }
            ]
            // Anda bisa tambahkan "generationConfig" di sini jika mau, contoh:
            // "generationConfig": {
            //   "temperature": 0.9,
            //   "topK": 1,
            //   "topP": 1,
            //   "maxOutputTokens": 2048
            // }
        };

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Google API Error:", errorData);
            throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0 &&
            data.candidates[0].content && data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            // Jika tidak ada kandidat atau struktur tidak sesuai
            if (data.promptFeedback) {
                console.error("Prompt Feedback:", data.promptFeedback);
                const blockReason = data.promptFeedback.blockReason;
                const safetyRatings = data.promptFeedback.safetyRatings.map(r => `${r.category}: ${r.probability}`);
                return `Tidak dapat menghasilkan respons. Alasan: ${blockReason || 'Tidak diketahui'}. Detail: ${safetyRatings.join(', ')}`;
            }
            console.error('Unexpected response structure from Gemini API:', data);
            return "Gagal memproses respons dari AI karena struktur data tidak dikenal.";
        }
    }
});