// Script para verificar as estatísticas de linguagens do GitHub
// Execute com: node check-github-stats.js

const https = require('https');

const username = 'yurifp'; // Seu username do GitHub

// Função para fazer requisição HTTPS
function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function checkGitHubStats() {
    console.log('🔍 Verificando estatísticas do GitHub...\n');
    
    try {
        // 1. Buscar repositórios
        const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100`;
        const repos = await fetchData(reposUrl);
        
        console.log(`📦 Total de repositórios públicos: ${repos.length}\n`);
        
        // 2. Coletar linguagens de cada repositório
        const languages = {};
        
        for (const repo of repos) {
            console.log(`Analisando: ${repo.name}`);
            
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
                
                // Buscar detalhes de linguagens do repositório
                try {
                    const langUrl = `https://api.github.com/repos/${username}/${repo.name}/languages`;
                    const repoLangs = await fetchData(langUrl);
                    
                    for (const [lang, bytes] of Object.entries(repoLangs)) {
                        if (!languages[lang]) languages[lang] = 0;
                        languages[lang] += bytes;
                    }
                } catch (err) {
                    console.log(`  ⚠️ Erro ao buscar linguagens de ${repo.name}`);
                }
            }
            
            // Pequeno delay para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // 3. Ordenar e exibir resultados
        console.log('\n📊 Linguagens detectadas:\n');
        const sortedLangs = Object.entries(languages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        const total = sortedLangs.reduce((acc, [,bytes]) => acc + bytes, 0);
        
        sortedLangs.forEach(([lang, bytes]) => {
            const percentage = ((bytes / total) * 100).toFixed(2);
            console.log(`  ${lang}: ${percentage}%`);
        });
        
        // 4. URLs para forçar atualização
        console.log('\n🔄 Para forçar atualização, acesse estas URLs:\n');
        console.log(`1. Stats: https://github-readme-stats.vercel.app/api?username=${username}&cache_seconds=1`);
        console.log(`2. Linguagens: https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&cache_seconds=1`);
        console.log('\nAguarde alguns segundos e recarregue seu README.');
        
    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error.message);
    }
}

// Executar verificação
checkGitHubStats();