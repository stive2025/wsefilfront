#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para la consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class BuildValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.srcPath = path.join(__dirname, '..', 'src');
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  async validateImports() {
    this.log('\n🔍 Validando imports...', colors.blue);
    
    const jsxFiles = await this.findFiles(this.srcPath, /\.(jsx?|tsx?)$/);
    
    for (const file of jsxFiles) {
      await this.checkFileImports(file);
    }
  }

  async findFiles(dir, pattern) {
    const files = [];
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        files.push(...await this.findFiles(fullPath, pattern));
      } else if (item.isFile() && pattern.test(item.name)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async checkFileImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const importMatch = line.match(/import.*from\s+['"`]([^'"`]+)['"`]/);
        if (importMatch) {
          const importPath = importMatch[1];
          this.validateImportPath(filePath, importPath, index + 1);
        }
      });
    } catch (error) {
      this.errors.push(`Error leyendo archivo ${filePath}: ${error.message}`);
    }
  }

  validateImportPath(filePath, importPath, lineNumber) {
    // Validar imports relativos y con alias @
    if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/')) {
      let resolvedPath;
      
      if (importPath.startsWith('@/')) {
        // Resolver alias @/ a src/
        resolvedPath = path.join(this.srcPath, importPath.slice(2));
      } else {
        // Resolver path relativo
        resolvedPath = path.resolve(path.dirname(filePath), importPath);
      }

      // Agregar extensiones comunes si no tiene extensión
      const extensions = ['', '.js', '.jsx', '.ts', '.tsx'];
      let exists = false;
      let actualPath = null;

      for (const ext of extensions) {
        const testPath = resolvedPath + ext;
        if (fs.existsSync(testPath)) {
          exists = true;
          actualPath = testPath;
          break;
        }
      }

      // También verificar si es un directorio con index
      if (!exists) {
        for (const ext of ['.js', '.jsx', '.ts', '.tsx']) {
          const indexPath = path.join(resolvedPath, `index${ext}`);
          if (fs.existsSync(indexPath)) {
            exists = true;
            actualPath = indexPath;
            break;
          }
        }
      }

      if (!exists) {
        this.errors.push({
          file: path.relative(process.cwd(), filePath),
          line: lineNumber,
          import: importPath,
          message: `Import no encontrado: ${importPath}`
        });
      } else if (actualPath) {
        // Verificar case sensitivity comparando nombres
        const expectedName = path.basename(resolvedPath);
        const actualName = path.basename(actualPath, path.extname(actualPath));
        
        if (expectedName !== actualName && expectedName.toLowerCase() === actualName.toLowerCase()) {
          this.warnings.push({
            file: path.relative(process.cwd(), filePath),
            line: lineNumber,
            import: importPath,
            expected: actualName,
            message: `Posible problema de case sensitivity: esperado "${actualName}", encontrado "${expectedName}"`
          });
        }
      }
    }
  }

  async validatePackageJson() {
    this.log('\n📦 Validando package.json...', colors.blue);
    
    const packagePath = path.join(__dirname, '..', 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      this.errors.push('package.json no encontrado');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Verificar scripts esenciales
      const requiredScripts = ['build', 'dev'];
      for (const script of requiredScripts) {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
          this.warnings.push(`Script "${script}" no encontrado en package.json`);
        }
      }

      // Verificar dependencias críticas
      const criticalDeps = ['react', 'react-dom'];
      for (const dep of criticalDeps) {
        if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
          this.errors.push(`Dependencia crítica "${dep}" no encontrada`);
        }
      }

    } catch (error) {
      this.errors.push(`Error parseando package.json: ${error.message}`);
    }
  }

  async validateViteConfig() {
    this.log('\n⚡ Validando configuración de Vite...', colors.blue);
    
    const configFiles = ['vite.config.js', 'vite.config.ts', 'vite.config.mjs'];
    let configFound = false;
    
    for (const configFile of configFiles) {
      const configPath = path.join(__dirname, '..', configFile);
      if (fs.existsSync(configPath)) {
        configFound = true;
        break;
      }
    }
    
    if (!configFound) {
      this.warnings.push('Archivo de configuración de Vite no encontrado');
    }
  }

  printResults() {
    this.log('\n' + '='.repeat(50), colors.bold);
    this.log('📋 REPORTE DE VALIDACIÓN', colors.bold);
    this.log('='.repeat(50), colors.bold);

    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('\n✅ ¡Todo está perfecto! No se encontraron problemas.', colors.green);
      return true;
    }

    if (this.errors.length > 0) {
      this.log(`\n❌ ERRORES (${this.errors.length}):`, colors.red);
      this.errors.forEach((error, index) => {
        if (typeof error === 'object') {
          this.log(`\n${index + 1}. ${error.file}:${error.line}`, colors.red);
          this.log(`   Import: ${error.import}`, colors.yellow);
          this.log(`   ${error.message}`, colors.red);
        } else {
          this.log(`\n${index + 1}. ${error}`, colors.red);
        }
      });
    }

    if (this.warnings.length > 0) {
      this.log(`\n⚠️  ADVERTENCIAS (${this.warnings.length}):`, colors.yellow);
      this.warnings.forEach((warning, index) => {
        if (typeof warning === 'object') {
          this.log(`\n${index + 1}. ${warning.file}:${warning.line}`, colors.yellow);
          this.log(`   Import: ${warning.import}`, colors.blue);
          this.log(`   ${warning.message}`, colors.yellow);
          if (warning.expected) {
            this.log(`   Sugerencia: cambiar a "${warning.expected}"`, colors.green);
          }
        } else {
          this.log(`\n${index + 1}. ${warning}`, colors.yellow);
        }
      });
    }

    this.log('\n💡 RECOMENDACIONES:', colors.blue);
    this.log('- Ejecuta este script antes de hacer commit');
    this.log('- Corrige los errores antes de hacer deploy');
    this.log('- Las advertencias pueden causar problemas en producción');

    return this.errors.length === 0;
  }

  async run() {
    this.log('🚀 Iniciando validación de build...', colors.bold);
    
    await this.validateImports();
    await this.validatePackageJson();
    await this.validateViteConfig();
    
    const success = this.printResults();
    
    if (!success) {
      process.exit(1);
    }
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new BuildValidator();
  validator.run().catch(console.error);
}

export default BuildValidator;
