/**
 * Documentation Tools - Direct File System Access
 * Simple, reliable tools for accessing project documentation
 * Without MCP complexity for maximum reliability
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export interface DocumentationTool {
  name: string;
  description: string;
  execute: (args: any) => Promise<string>;
  schema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

// ===================================================
// 📁 FILE SYSTEM UTILITIES
// ===================================================

// Determine project root - works in both local dev and Vercel
const PROJECT_ROOT = (() => {
  const cwd = process.cwd();
  
  // In Vercel, check if we're in the correct directory by looking for key files
  if (fs.existsSync(path.join(cwd, 'CLAUDE.md')) && fs.existsSync(path.join(cwd, 'package.json'))) {
    return cwd;
  }
  
  // Try parent directory (in case we're in a subdirectory)
  const parentDir = path.dirname(cwd);
  if (fs.existsSync(path.join(parentDir, 'CLAUDE.md')) && fs.existsSync(path.join(parentDir, 'package.json'))) {
    return parentDir;
  }
  
  // Fallback to current working directory
  console.warn(`[DOCS-TOOLS] Could not find project root with CLAUDE.md, using cwd: ${cwd}`);
  return cwd;
})();

async function readProjectFile(relativePath: string): Promise<string> {
  try {
    const fullPath = path.join(PROJECT_ROOT, relativePath);
    
    // Enhanced logging for debugging
    console.log(`[DOCS-TOOLS] Reading file: ${relativePath}`);
    console.log(`[DOCS-TOOLS] PROJECT_ROOT: ${PROJECT_ROOT}`);
    console.log(`[DOCS-TOOLS] Full path: ${fullPath}`);
    console.log(`[DOCS-TOOLS] File exists: ${fs.existsSync(fullPath)}`);
    
    // Security check - ensure path is within project
    if (!fullPath.startsWith(PROJECT_ROOT)) {
      throw new Error('Path outside project directory not allowed');
    }
    
    if (!fs.existsSync(fullPath)) {
      // List available files for debugging
      try {
        const rootFiles = fs.readdirSync(PROJECT_ROOT).slice(0, 10);
        return `File not found: ${relativePath}\nPROJECT_ROOT: ${PROJECT_ROOT}\nAvailable files: ${rootFiles.join(', ')}`;
      } catch {
        return `File not found: ${relativePath}\nPROJECT_ROOT: ${PROJECT_ROOT}`;
      }
    }
    
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      return `Path is a directory, not a file: ${relativePath}`;
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    console.log(`[DOCS-TOOLS] Successfully read ${content.length} characters from ${relativePath}`);
    return `File: ${relativePath}\n\n${content}`;
    
  } catch (error) {
    const errorMsg = `Error reading file ${relativePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`[DOCS-TOOLS] ${errorMsg}`);
    return errorMsg;
  }
}

async function listProjectDirectory(relativePath: string = ''): Promise<string> {
  try {
    const fullPath = path.join(PROJECT_ROOT, relativePath);
    
    // Security check
    if (!fullPath.startsWith(PROJECT_ROOT)) {
      throw new Error('Path outside project directory not allowed');
    }
    
    if (!fs.existsSync(fullPath)) {
      return `Directory not found: ${relativePath || 'root'}`;
    }
    
    const stats = fs.statSync(fullPath);
    if (!stats.isDirectory()) {
      return `Path is not a directory: ${relativePath}`;
    }
    
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    const files = items.filter(item => item.isFile()).map(item => `📄 ${item.name}`);
    const dirs = items.filter(item => item.isDirectory()).map(item => `📁 ${item.name}/`);
    
    const result = [
      `Directory: ${relativePath || 'root'}`,
      '',
      ...dirs.sort(),
      ...files.sort(),
    ].join('\n');
    
    return result;
    
  } catch (error) {
    return `Error listing directory ${relativePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function searchProjectFiles(query: string, fileType?: string): Promise<string> {
  try {
    let patterns: string[] = [];
    
    switch (fileType) {
      case 'contracts':
        patterns = ['contracts/**/*.sol', 'lib/**/*.sol', 'src/**/*.sol'];
        break;
      case 'docs':
        patterns = ['docs/**/*.md', '*.md', 'README*.md', 'CHANGELOG*.md'];
        break;
      case 'governance':
        patterns = ['governance/**/*', 'proposals/**/*', '*governance*', '*DAO*'];
        break;
      default:
        patterns = ['**/*.md', '**/*.sol', '**/*.ts', '**/*.js', '**/*.json'];
        break;
    }
    
    const matches: string[] = [];
    
    for (const pattern of patterns) {
      try {
        const files = await glob(pattern, {
          cwd: PROJECT_ROOT,
          ignore: ['node_modules/**', '.git/**', '.next/**', 'dist/**', 'build/**', 'coverage/**']
        });
        
        for (const file of files) {
          try {
            const fullPath = path.join(PROJECT_ROOT, file);
            const content = fs.readFileSync(fullPath, 'utf-8');
            
            if (content.toLowerCase().includes(query.toLowerCase())) {
              // Find the line with the match for context
              const lines = content.split('\n');
              const matchingLines = lines
                .map((line, index) => ({ line, index }))
                .filter(({ line }) => line.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 3); // Max 3 matches per file
              
              const contextLines = matchingLines.map(({ line, index }) => 
                `  Line ${index + 1}: ${line.trim()}`
              ).join('\n');
              
              matches.push(`📄 ${file}\n${contextLines}`);
            }
          } catch (fileError) {
            // Skip files that can't be read
            continue;
          }
        }
      } catch (globError) {
        // Skip patterns that fail
        continue;
      }
    }
    
    if (matches.length === 0) {
      return `No matches found for "${query}" in ${fileType || 'all'} files`;
    }
    
    return [
      `Search results for "${query}" in ${fileType || 'all'} files (${matches.length} matches):`,
      '',
      ...matches.slice(0, 10) // Limit to top 10 matches
    ].join('\n');
    
  } catch (error) {
    return `Error searching files: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function getProjectOverview(): Promise<string> {
  try {
    console.log(`[DOCS-TOOLS] Getting project overview from: ${PROJECT_ROOT}`);
    
    // Key files to check
    const keyFiles = [
      'CLAUDE.md',
      'README.md',
      'package.json',
      'hardhat.config.js',
      'deployments/deployment-base-latest.json',
      'contracts',
      'scripts',
      'docs',
      '.env.example'
    ];
    
    const overview: string[] = [
      '🏗️ CryptoGift DAO Project Overview',
      '=====================================',
      ''
    ];
    
    for (const item of keyFiles) {
      const fullPath = path.join(PROJECT_ROOT, item);
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          const files = fs.readdirSync(fullPath);
          overview.push(`📁 ${item}/ (${files.length} items)`);
        } else {
          const sizeKB = Math.round(stats.size / 1024);
          overview.push(`📄 ${item} (${sizeKB}KB)`);
        }
      } else {
        overview.push(`❌ ${item} (not found)`);
      }
    }
    
    // Add quick deployment info
    try {
      const deploymentPath = path.join(PROJECT_ROOT, 'deployments/deployment-base-latest.json');
      if (fs.existsSync(deploymentPath)) {
        const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf-8'));
        overview.push('');
        overview.push('🚀 Latest Deployment (Base Mainnet):');
        if (deployment.contracts) {
          Object.entries(deployment.contracts).forEach(([name, address]) => {
            overview.push(`   ${name}: ${address}`);
          });
        }
      }
    } catch (deployError) {
      overview.push('⚠️ Could not read deployment info');
    }
    
    return overview.join('\n');
    
  } catch (error) {
    return `Error getting project overview: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// ===================================================
// 🛠️ TOOL DEFINITIONS
// ===================================================

export const DOCUMENTATION_TOOLS: DocumentationTool[] = [
  {
    name: 'read_project_file',
    description: 'Read any file from the CryptoGift DAO project (CLAUDE.md, contracts, docs, etc.)',
    execute: async ({ path }: { path: string }) => {
      return await readProjectFile(path);
    },
    schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to read (e.g., "CLAUDE.md", "contracts/CGCToken.sol", "docs/PLAN_DESARROLLO_COMPLETO.md")'
        }
      },
      required: ['path']
    }
  },
  
  {
    name: 'list_directory',
    description: 'List contents of a directory in the project',
    execute: async ({ path }: { path?: string }) => {
      return await listProjectDirectory(path);
    },
    schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Directory path to list (optional, defaults to root)'
        }
      },
      required: []
    }
  },
  
  {
    name: 'search_project_files',
    description: 'Search for specific text across all project files',
    execute: async ({ query, type }: { query: string; type?: string }) => {
      return await searchProjectFiles(query, type);
    },
    schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Text to search for in project files'
        },
        type: {
          type: 'string',
          enum: ['contracts', 'docs', 'governance'],
          description: 'Filter by file type (optional)'
        }
      },
      required: ['query']
    }
  },
  
  {
    name: 'get_project_overview',
    description: 'Get an overview of the project structure, key files, and deployment status',
    execute: async () => {
      return await getProjectOverview();
    },
    schema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

// ===================================================
// 🔧 HELPER FUNCTIONS
// ===================================================

export async function testDocumentationTools(): Promise<{
  available: string[];
  errors: Record<string, string>;
}> {
  const available: string[] = [];
  const errors: Record<string, string> = {};
  
  for (const tool of DOCUMENTATION_TOOLS) {
    try {
      let testResult: string;
      
      switch (tool.name) {
        case 'read_project_file':
          testResult = await tool.execute({ path: 'CLAUDE.md' });
          break;
        case 'list_directory':
          testResult = await tool.execute({ path: '' });
          break;
        case 'search_project_files':
          testResult = await tool.execute({ query: 'DAO' });
          break;
        case 'get_project_overview':
          testResult = await tool.execute({});
          break;
        default:
          throw new Error('Unknown tool');
      }
      
      if (testResult && !testResult.startsWith('Error')) {
        available.push(tool.name);
      } else {
        errors[tool.name] = testResult || 'Tool returned empty result';
      }
    } catch (error) {
      errors[tool.name] = error instanceof Error ? error.message : 'Tool test failed';
    }
  }
  
  return { available, errors };
}