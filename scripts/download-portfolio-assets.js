const fs = require('fs');
const path = require('path');
const https = require('https');

const IMAGES = [
  {
    name: 'fachada-acm-tech-tower-cover.webp',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1280&q=75'
  },
  {
    name: 'fachada-acm-tech-tower-thumb.webp',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=70'
  },
  {
    name: 'letreiro-acrilico-lumina-cover.webp',
    url: 'https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=1280&q=75'
  },
  {
    name: 'letreiro-acrilico-lumina-thumb.webp',
    url: 'https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=800&q=70'
  },
  {
    name: 'branding-studio-aurora-cover.webp',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1280&q=75'
  },
  {
    name: 'branding-studio-aurora-thumb.webp',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=70'
  },
  {
    name: 'sinalizacao-inox-centro-medico-cover.webp',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1280&q=75'
  },
  {
    name: 'sinalizacao-inox-centro-medico-thumb.webp',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=70'
  },
  {
    name: 'painel-ripado-alpha-medicina-cover.webp',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1280&q=75'
  },
  {
    name: 'painel-ripado-alpha-medicina-thumb.webp',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=70'
  },
  {
    name: 'quadros-uv-silveira-advocacia-cover.webp',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1280&q=75'
  },
  {
    name: 'quadros-uv-silveira-advocacia-thumb.webp',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=70'
  },
  {
    name: 'trofeus-metal-premio-destaque-cover.webp',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1280&q=75'
  },
  {
    name: 'trofeus-metal-premio-destaque-thumb.webp',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=70'
  },
  {
    name: 'portico-monolitico-auto-premium-cover.webp',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1280&q=75'
  },
  {
    name: 'portico-monolitico-auto-premium-thumb.webp',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=70'
  },
  {
    name: 'iluminacao-led-noturna.webp',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=70'
  },
  {
    name: 'montagem-fabrica-estrutura.webp',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=70'
  }
];

const destDir = path.join(__dirname, '..', 'public', 'images', 'portfolio');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Tratar redirects caso o Unsplash responda 301/302
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Falha HTTP ${res.statusCode} ao baixar ${url}`));
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        const stat = fs.statSync(destPath);
        resolve(stat.size);
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log(`🚀 Iniciando download e otimização local de ${IMAGES.length} imagens de portfólio...`);

  for (const item of IMAGES) {
    const dest = path.join(destDir, item.name);
    try {
      const size = await downloadImage(item.url, dest);
      console.log(`✅ [${(size / 1024).toFixed(1)} KB] ${item.name}`);
    } catch (err) {
      console.error(`❌ Erro em ${item.name}:`, err.message);
    }
  }

  console.log('🎉 Todas as imagens de portfólio foram baixadas e salvas em /public/images/portfolio/!');
}

main();
