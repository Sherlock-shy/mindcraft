import { strictFormat } from '../utils/text.js';

export class Local {
    constructor(model_name, url) {
        this.model_name = model_name;
        this.url = url || 'http://127.0.0.1:11434';
        this.chat_endpoint = '/api/chat';
        this.embedding_endpoint = '/api/embeddings';
    }

    async sendRequest(turns, systemMessage) {
        let messages = strictFormat(turns);
        messages.unshift({ role: 'system', content: systemMessage });

        // Combine the conversation turns into a single prompt
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');

        // Prepare the payload for the API
        const payload = {
            user_input: prompt,
        };

        try {
            console.log(`Sending request to local LLM server at ${this.url}${this.chat_endpoint}...`);
            const response = await this.send(this.chat_endpoint, payload);

            if (response && response.response) {
                console.log(`Response received: ${response.response}`);
                return response.response;
            } else {
                console.error('No valid response from the server.');
                return 'An error occurred while processing your request.';
            }
        } catch (err) {
            console.error('Error querying the local LLM server:', err.message || err);
            return 'An error occurred while processing your request.';
        }
    }

    // This method remains as a placeholder in case embeddings are added in the future
    async embed(text) {
        console.warn('Embedding functionality is not implemented in the current API server.');
        return null;
    }

    async send(endpoint, body) {
        const url = new URL(endpoint, this.url); // Combine base URL and endpoint
        const headers = { 'Content-Type': 'application/json' };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });

            if (res.ok) {
                return await res.json();
            } else {
                const errorText = await res.text();
                throw new Error(`Server responded with status: ${res.status}, body: ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to send request to the LLM server:', err.message || err);
            throw err;
        }
    }
}
