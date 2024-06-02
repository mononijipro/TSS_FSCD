import { Application, Router } from "https://deno.land/x/oak@14.2.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'

const APP = new Application();
const PORT = 80;
const ROUTER = new Router();
const SUPABASE = createClient("https://jqahlwbeiamsrblpprpx.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxYWhsd2JlaWFtc3JibHBwcnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4OTMzNjksImV4cCI6MjAzMjQ2OTM2OX0.Qmm2y8EEoJ6RQVqpWvqfyFHT2oT-0TVkoSe7VXF_teE");

ROUTER.get("/issue/:name", async ( context ) => {
    if (context.params.name) {
        const { data, error } = await SUPABASE.rpc('claim_random_soul');
        if (!error) {
            context.response.body = data;
        } else {
            console.error(error);
            context.response.body = "SOLD_OUT";
        }   
    }
});

ROUTER.post("/auth/:code", async ( context ) => {
    const code = context.params.code;
    if (code && code.length !== 5) return;
    const { data, error } = await SUPABASE.from('souls').select('progress').eq('code', code).eq('claimed', true).limit(1).single(); 
    if (!error) {
        console.log("Progress for " + code);
        context.response.body = data;
    } else {
        console.error(error);
        context.response.body = "Not a valid code";
        context.response.status = 403;
    }
});

ROUTER.post("/record/:code/:progress", async ( context ) => {
    const code = context.params.code;
    const progress = context.params.progress;
    if (!code || !progress) return;
    if (code.length !== 5 || progress.length !== 6) return;
    const { error } = await SUPABASE.from('souls').update('progress', progress).eq('code', code);
    if ( error ) {
        console.error(error);
    }
});

APP.use(ROUTER.routes());
APP.use(ROUTER.allowedMethods());
APP.use(async (context) => {
    await context.send({
        root: `${Deno.cwd()}/public`,
        index: "index.html",
    });
});
APP.addEventListener("listen", ( { port } ) => {
    console.log("Listening at http://localhost:" + port + "\n");
});
await APP.listen({ port: PORT });