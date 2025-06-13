const NodeID3 = require('node-id3');
const fs = require('fs');
const path = require('path');

const musicasDir = path.join(__dirname, 'musicas');
const playlistOutputFile = path.join(__dirname, 'playlist-data.js');

console.log('🔎 Lendo a pasta de músicas...');

fs.readdir(musicasDir, (err, files) => {
    if (err) {
        return console.log(`❌ Erro! A pasta 'musicas' não foi encontrada. Por favor, crie uma pasta chamada 'musicas' no seu projeto e coloque seus arquivos .mp3 dentro dela.`);
    }

    const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');

    if (mp3Files.length === 0) {
        return console.log('🟡 Nenhuma música .mp3 encontrada na pasta /musicas.');
    }
    
    console.log(`🎵 Encontradas ${mp3Files.length} músicas. Lendo informações...`);

    const playlist = mp3Files.map(file => {
        const filePath = path.join(musicasDir, file);
        const tags = NodeID3.read(filePath);

        return {
            title: tags.title || path.basename(file, '.mp3'), // Usa o nome do arquivo se não houver título
            artist: tags.artist || 'Artista Desconhecido',
            audioSrc: `musicas/${file.replace(/\\/g, '/')}`, // Garante barras corretas para o caminho web
            // Tenta extrair a capa do álbum dos metadados
            artSrc: tags.image ? `data:${tags.image.mime};base64,${tags.image.imageBuffer.toString('base64')}` : 'caminho/para/arte-padrao.jpg'
        };
    });

    // Usa JSON.stringify para formatar o array de objetos corretamente como texto
    const playlistCode = `const musicPlaylist = ${JSON.stringify(playlist, null, 4)};`;

    fs.writeFile(playlistOutputFile, playlistCode, 'utf8', (err) => {
        if (err) {
            return console.log('❌ Erro ao salvar o arquivo da playlist:', err);
        }
        console.log(`✅ Playlist gerada com sucesso! O arquivo 'playlist-data.js' foi criado/atualizado.`);
    });
});