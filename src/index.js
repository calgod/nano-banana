/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { GoogleGenAI } from "@google/genai";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const prompt = url.searchParams.get("q") || "A nano banana dish in a fancy restaurant";

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: [prompt],
      });
    } catch (err) {
      return new Response("Error calling Gemini API", { status: 500 });
    }

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const imageData = parts.find(p => p.inlineData?.data)?.inlineData.data;

    if (!imageData) return new Response("No image generated", { status: 500 });

    const html = `
      <html>
        <body>
          <h2>Prompt: ${prompt}</h2>
          <img src="data:image/png;base64,${imageData}" />
        </body>
      </html>
    `;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  },
};





