import { generateApi } from 'swagger-typescript-api';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// dotenv 설정: 우선순위에 따라 환경 변수 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface EndpointConfig {
  url: string;
  outputPath: string;
  name: string;
}

// Swagger 문서 URL 및 출력 경로 설정
const endpoints: EndpointConfig[] = [
  {
    name: 'admin',
    url: process.env.ADMIN_SWAGGER_URL || 'http://localhost:8000/admin/api-docs/swagger.json',
    outputPath: path.resolve(__dirname, '../src/admin/types'),
  },
  {
    name: 'conch',
    url:
      process.env.CONCH_SWAGGER_URL ||
      process.env.VITE_CONCH_SWAGGER_URL ||
      'https://test.magicofconch.site/api-docs',
    outputPath: path.resolve(__dirname, '../src/conch/types'),
  },
];

// 환경 변수 확인 로그
console.log('Using environment variables:');
console.log(`ADMIN_SWAGGER_URL: ${process.env.ADMIN_SWAGGER_URL || '(not set)'}`);
console.log(`CONCH_SWAGGER_URL: ${process.env.CONCH_SWAGGER_URL || process.env.VITE_CONCH_SWAGGER_URL || '(not set)'}`);

async function generateTypes() {
  for (const endpoint of endpoints) {
    console.log(`Generating types for ${endpoint.name} API...`);
    
    // 출력 디렉토리 확인 및 생성
    if (!fs.existsSync(endpoint.outputPath)) {
      fs.mkdirSync(endpoint.outputPath, { recursive: true });
    }
    
    try {
      const result = await generateApi({
        fileName: `${endpoint.name}Api.ts`,
        output: endpoint.outputPath,
        url: endpoint.url,
        httpClientType: 'axios',
        moduleNameFirstTag: true,
        generateRouteTypes: true,
        generateResponses: true,
        enumNamesAsValues: true,
        extraTemplates: [],
        // 필요한 경우 사용자 정의 템플릿 추가
        // templates: path.resolve(__dirname, 'templates'),
      });
      
      console.log(`✅ ${endpoint.name} API types generated successfully!`);
    } catch (error) {
      console.error(`❌ Error generating ${endpoint.name} API types:`, error);
    }
  }
}

generateTypes()
  .then(() => console.log('✨ All API types generated successfully!'))
  .catch((error) => console.error('❌ Error generating API types:', error)); 