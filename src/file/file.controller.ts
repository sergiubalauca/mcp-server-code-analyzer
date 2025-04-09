// src/file/file.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { FileChangeDto } from './dto/file-change.dto';
import * as acorn from 'acorn';
import { ESLint } from 'eslint';
import * as ts from 'typescript';

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
    const program = ts.createProgram(['file.ts'], options, host);

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
          `Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`,
        );
      } else {
        console.log(`Error: ${message}`);
      }
    });
  }

  private runCustomAnalysis(content: string) {
    // Implement custom analysis logic
  }
}
