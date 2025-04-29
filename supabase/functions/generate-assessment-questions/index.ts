
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { topic, difficulty, numQuestions = 5 } = await req.json();
    
    if (!topic) {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating ${numQuestions} ${difficulty || 'standard'} questions on topic: ${topic}`);
    
    const systemPrompt = `You are an expert educational content creator specializing in creating multiple-choice questions. 
    Generate ${numQuestions} ${difficulty || ''} multiple-choice questions about ${topic}.
    For each question:
    1. Provide a clear question text
    2. Include exactly 4 answer options labeled with letters A, B, C, and D
    3. Indicate which option is correct
    4. Include a brief explanation of why the answer is correct
    
    Format your response as a JSON array with this structure for each question:
    {
      "questions": [
        {
          "text": "question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": 0, // index of correct answer (0-3)
          "explanation": "explanation of the correct answer"
        },
        // more questions...
      ]
    }`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", 
            content: systemPrompt
          },
          {
            role: "user",
            content: `Generate ${numQuestions} ${difficulty || ''} multiple-choice questions about ${topic}. Return only the JSON.`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      return new Response(
        JSON.stringify({ error: "Error from OpenAI API", details: data.error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      const content = data.choices[0].message.content;
      
      // Extract JSON from the response (sometimes the API returns markdown-formatted JSON)
      let jsonString = content;
      if (content.includes('```json')) {
        jsonString = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        jsonString = content.split('```')[1].split('```')[0].trim();
      }
      
      const parsedQuestions = JSON.parse(jsonString);

      return new Response(
        JSON.stringify(parsedQuestions),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      console.error("Failed to parse response:", parseError);
      console.log("Response content:", data.choices[0].message.content);
      
      return new Response(
        JSON.stringify({ error: "Failed to parse AI-generated questions", details: parseError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in generate-assessment-questions function:", error);
    
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
