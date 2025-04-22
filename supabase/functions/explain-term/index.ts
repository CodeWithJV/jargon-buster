// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Type definitions are often provided implicitly by the Supabase environment.
// Removing the explicit import below to resolve potential installation/path issues.
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// Using full JSR specifier for Supabase client
import { createClient } from 'jsr:@supabase/supabase-js@^2.0.0';

console.log("Explain Term Function Initialized");

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow requests from any origin (adjust for production)
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with auth context
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default when deployed/run locally
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default when deployed/run locally
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the user object
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('User authentication failed:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or missing authentication token.' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    // If user is authenticated, proceed...
    console.log(`Authenticated user: ${user.id}`);


    const { term } = await req.json();

    if (!term || typeof term !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid "term" in request body' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Received term: ${term}`);

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("GEMINI_API_KEY environment variable not set.");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing API key." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const prompt = `Explain the term "${term}" concisely, in 1-2 sentences, as you would to someone learning about it in the context of software development or technology. Focus on its core meaning and relevance.`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      // Optional: Add safety settings or generation config if needed
      // generationConfig: {
      //   temperature: 0.7,
      //   maxOutputTokens: 100,
      // }
    };

    console.log("Calling Gemini API...");
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error(`Gemini API error: ${geminiResponse.status} ${geminiResponse.statusText}`, errorBody);
      return new Response(
        JSON.stringify({ error: `Failed to get explanation from AI service. Status: ${geminiResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiData = await geminiResponse.json();

    // Extract the explanation text - structure might vary slightly based on Gemini response format
    let explanation = "Could not extract explanation from AI response.";
    if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content && geminiData.candidates[0].content.parts && geminiData.candidates[0].content.parts[0]) {
      explanation = geminiData.candidates[0].content.parts[0].text.trim();
    } else {
       console.warn("Unexpected Gemini response structure:", JSON.stringify(geminiData, null, 2));
    }

     console.log("Received explanation from Gemini:", explanation);

    const data = {
      explanation: explanation, // Use the explanation from Gemini
    };

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error processing request:", error);
    // Handle unknown error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: 'Failed to process request', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/explain-term' \
    --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"term":"API"}'

*/
