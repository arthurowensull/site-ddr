export const CONFIG = {
    // Estes dois valores são públicos no front-end quando RLS está corretamente configurado.
    // Deixe vazio para usar o modo local (o site continua funcionando no GitHub Pages).
    supabaseUrl: '',
    supabasePublishableKey: '',
    evaluateFunction: 'evaluate-answer'
};
export const hasSupabase = Boolean(CONFIG.supabaseUrl && CONFIG.supabasePublishableKey);
