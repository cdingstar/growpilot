const http = require('http');

const HOST = '175.27.193.51';
const PORT = 3008;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000 // 5s timeout
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    console.log(`\n[Request] ${method} http://${HOST}:${PORT}${path}`);
    if (body) console.log(`[Body] ${body}`);

    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`[Response Status] ${res.statusCode} ${res.statusMessage}`);
      console.log(`[Response Headers]`, JSON.stringify(res.headers));

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`[Response Body] ${data.substring(0, 1000)}${data.length > 1000 ? '...' : ''}`);
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', (e) => {
      console.error(`[Error] ${e.message}`);
      resolve({ error: e });
    });

    req.on('timeout', () => {
        req.destroy();
        console.error(`[Error] Request Timeout (5s)`);
        resolve({ error: new Error("Timeout") });
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runDiagnostics() {
  console.log("=== API Diagnostic Script ===");
  
  // 1. Check OpenAPI Spec
  console.log("\n>>> Step 1: Checking openapi.json...");
  const specRes = await makeRequest('/openapi.json');
  
  if (specRes.data) {
    try {
      const spec = JSON.parse(specRes.data);
      console.log("✅ OpenAPI JSON parsed successfully.");
      // Try to find the specific endpoint in paths
      const targetPath = '/api/v1/text2img';
      if (spec.paths && spec.paths[targetPath]) {
          console.log(`✅ Found endpoint: ${targetPath}`);
          const postOp = spec.paths[targetPath].post;
          if (postOp) {
             console.log("   Operation: POST");
             if (postOp.requestBody) {
                 console.log("   RequestBody:", JSON.stringify(postOp.requestBody, null, 2));
             }
             if (postOp.parameters) {
                 console.log("   Parameters:", JSON.stringify(postOp.parameters, null, 2));
             }
          }
      } else {
          console.log(`⚠️ Endpoint ${targetPath} NOT found in openapi.json paths.`);
          console.log("Available paths:", Object.keys(spec.paths || {}));
      }
    } catch (e) {
      console.log("⚠️ Response is not valid JSON.");
    }
  }

  // 2. Test Generation
  const testEndpoint = '/api/v1/text2img';
  console.log(`\n>>> Step 2: Testing Generation Endpoint (${testEndpoint})...`);
  const payload = JSON.stringify({ prompt: "A futuristic city" });
  await makeRequest(testEndpoint, 'POST', payload);
  
  console.log("\n=== Diagnosis Complete ===");
}

runDiagnostics();
