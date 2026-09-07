const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'import { AdminDashboard } from "./pages/AdminDashboard";',
  'import { AdminDashboard } from "./pages/AdminDashboard";\nimport { NotFound } from "./pages/NotFound";'
);

code = code.replace(
  '      </Routes>',
  '        <Route path="*" element={<NotFound />} />\n      </Routes>'
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched app routing');
