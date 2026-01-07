import fs from 'node:fs';
import path from 'node:path';

// Manual .env parser (no external dependencies)
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Only set if not already set (first file wins)
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

const envFiles = ['.env.local', '.env.development.local', '.env.development', '.env'];

envFiles.forEach((file) => {
  const fullPath = path.resolve(process.cwd(), file);
  loadEnvFile(fullPath);
});

const specs = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    fallbacks: ['VITE_SUPABASE_URL'],
    description: 'Supabase project URL'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    fallbacks: ['VITE_SUPABASE_ANON_KEY'],
    description: 'Supabase anon/public key'
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key (server-side writes)'
  },
  {
    key: 'GEMINI_API_KEY',
    fallbacks: ['VITE_GEMINI_API_KEY', 'NEXT_PUBLIC_GEMINI_API_KEY'],
    description: 'Google Gemini API key (server proxy)'
  },
  {
    key: 'OPENROUTER_API_KEY',
    description: 'OpenRouter API key (AI fallback)'
  },
  {
    key: 'ZARINPAL_MERCHANT_ID',
    description: 'ZarinPal merchant identifier'
  },
  {
    key: 'ZARINPAL_SANDBOX',
    description: 'Set to true for sandbox, false for production'
  },
  {
    key: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    fallbacks: ['VITE_CLOUDINARY_CLOUD_NAME'],
    description: 'Cloudinary cloud name'
  },
  {
    key: 'CLOUDINARY_API_KEY',
    description: 'Cloudinary API key'
  },
  {
    key: 'CLOUDINARY_API_SECRET',
    description: 'Cloudinary API secret'
  },
  {
    key: 'OPENAI_API_KEY',
    description: 'OpenAI key (used for legacy AI image flows)'
  }
];

const missing = [];

const resolveValue = (spec) => {
  const candidates = [spec.key, ...(spec.fallbacks || [])];
  for (const candidate of candidates) {
    const value = process.env[candidate];
    if (value && value.trim().length > 0) {
      return { key: candidate, value };
    }
  }
  return null;
};

console.log('🔍 Verifying required environment variables...');

specs.forEach((spec) => {
  const resolved = resolveValue(spec);
  if (resolved) {
    console.log(`✅ ${spec.description} (${resolved.key})`);
  } else {
    missing.push(spec);
    console.warn(`⚠️ Missing ${spec.description} (${spec.key})`);
  }
});

if (missing.length > 0) {
  console.error('\n❌ Environment verification failed. Please add the variables above and re-run `npm run verify:env`.');
  process.exit(1);
}

console.log('\n✅ Environment variables verified.');