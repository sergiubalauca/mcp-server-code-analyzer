// src/file/file.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { FileChangeDto } from './dto/file-change.dto';
import * as acorn from 'acorn';
import { ESLint } from 'eslint';
import * as ts from 'typescript';
import { exec } from 'child_process';

@Controller('file')
export class FileController {
  @Post('change')
  async handleFileChange(
    @Body() fileChangeDto: FileChangeDto,
  ): Promise<string> {
    console.log('File change received:', fileChangeDto);

    // Perform syntax checking
    this.checkSyntax(fileChangeDto.content);

    // Perform linting
    await this.runLinting(fileChangeDto.content);

    // Perform static analysis
    this.runStaticAnalysis(fileChangeDto.content);

    // Perform custom analysis
    this.runCustomAnalysis(fileChangeDto.content);

    return 'File change processed and analyzed';
  }

  private checkSyntax(content: string) {
    try {
      acorn.parse(content, { ecmaVersion: 2020 });
      console.log('Syntax is valid.');
    } catch (error) {
      console.error('Syntax error:', error);
    }
  }

  private async runLinting(content: string) {
    const eslint = new ESLint();
    const results = await eslint.lintText(content);

    results.forEach((result) => {
      if (result.messages.length > 0) {
        console.log(`Linting issues in ${result.filePath}:`);
        result.messages.forEach((msg) => {
          console.log(
            `- ${msg.message} (line ${msg.line}, column ${msg.column})`,
          );
        });
      } else {
        console.log('No linting issues found.');
      }
    });
  }

  private runStaticAnalysis(content: string) {
    // Example: Using TypeScript compiler API for static analysis
    const options = { noEmit: true, checkJs: true };
    const host = ts.createCompilerHost(options);
    
    // Create a virtual source file from the content
    const sourceFile = ts.createSourceFile(
      'temp.ts', // Virtual filename
      content,   // Use the actual content passed in
      ts.ScriptTarget.Latest
    );
    
    // Create program with the virtual source file
    const program = ts.createProgram({
      rootNames: ['temp.ts'],
      options: options,
      host: {
        ...host,
        getSourceFile: (fileName) => {
          if (fileName === 'temp.ts') {
            return sourceFile;
          }
          return undefined;
        },
      },
    });

    const diagnostics = ts.getPreEmitDiagnostics(program);
    diagnostics.forEach((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n',
      );
      if (diagnostic.file) {
        const { line, character } =
          diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        console.log(
          `Error (${line + 1},${character + 1}): ${message}`,
        );
      } else {
        console.log(`Error: ${message}`);
      }
    });
  }

  private async runCustomAnalysis(content: string) {
    // 1. Code Complexity Analysis
    const complexity = this.calculateComplexity(content);
    console.log(`Code complexity: ${complexity}`);

    // 2. Security Vulnerability Checks
    this.checkSecurityVulnerabilities();

    // 3. Code Style and Convention Checks
    // Already handled by ESLint

    // 4. Dead Code Detection
    this.checkDeadCode();

    // 5. Custom Pattern Matching
    const logPattern = /console\.log\(/g;
    const matches = content.match(logPattern);
    if (matches) {
      console.log(`Found ${matches.length} instances of console.log.`);
    } else {
      console.log('No console.log statements found.');
    }
  }

  // Example function to calculate code complexity (simple logic)
  private calculateComplexity(content: string): number {
    const functionPattern = /function\s+\w+\s*\(/g;
    const matches = content.match(functionPattern);
    return matches ? matches.length : 0;
  }

  // Function to check for security vulnerabilities
  private checkSecurityVulnerabilities() {
    exec('npm audit --json', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running npm audit: ${stderr}`);
        return;
      }
      const auditResults = JSON.parse(stdout);
      if (auditResults.metadata.vulnerabilities.total > 0) {
        console.log('Security vulnerabilities found:');
        console.log(auditResults);
      } else {
        console.log('No security vulnerabilities found.');
      }
    });
  }

  // Function to check for dead code
  private checkDeadCode() {
    exec('ts-prune', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running ts-prune: ${stderr}`);
        return;
      }
      if (stdout) {
        console.log('Dead code found:');
        console.log(stdout);
      } else {
        console.log('No dead code found.');
      }
    });
  }
}
