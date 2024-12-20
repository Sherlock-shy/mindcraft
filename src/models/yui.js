import { strictFormat } from '../utils/text.js';

export class Yui{
    constructor(model_name, url) {
        this.model_name = model_name;
        this.url = url || 'http://127.0.0.1:8000'; // Default to your FastAPI server
        this.chat_endpoint = '/api/query'; // Matches your FastAPI query endpoint
    }

    async sendRequest(turns, systemMessage, author_id = null) {
        let messages = strictFormat(turns);
        messages.unshift({ role: 'system', content: systemMessage });

        // Combine the conversation turns into a single prompt
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');

        // Prepare the payload for the API
        const payload = {
            user_input: prompt,
            author_id: author_id // Optional author ID
        };

        let res = null;
        try {
            console.log(`Sending request to local LLM server at ${this.url}${this.chat_endpoint}...`);
            res = await this.send(this.chat_endpoint, payload);

            if (res && res.response) {
                console.log(`Response received: ${res.response}`);
                return res.response;
            }
        } catch (err) {
            console.error('Error querying the local LLM server:', err);
            return 'An error occurred while processing your request.';
        }
        return res;
    }

    // This method remains as a placeholder in case embeddings are added in the future
    async embed(text) {
        console.warn('Embedding functionality is not implemented in the current API server.');
        return null;
    }

    async send(endpoint, body) {
        const url = new URL(endpoint, this.url); // Combine base URL and endpoint
        const headers = { 'Content-Type': 'application/json' };

        let data = null;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (res.ok) {
                data = await res.json();
            } else {
                throw new Error(`Server responded with status: ${res.status}`);
            }
        } catch (err) {
            console.error('Failed to send request to the LLM server:', err);
            throw err;
        }
        return data;
    }
}
