import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from '@jest/globals'

const ROUTE_DECORATOR_PATTERN = /^\s*@(?:Get|Post|Patch|Put|Delete)\b/
const METHOD_SIGNATURE_PATTERN = /^\s*public\s+(?:async\s+)?\w+\s*\(/
const DOCS_DECORATOR_PATTERN = /@\w+Docs\(\)/
const DOCS_IMPORT_PATTERN = /from '\.\.\/docs'/

function collectFiles(directoryPath: string, matcher: (absolutePath: string) => boolean): string[] {
  const entries = readdirSync(directoryPath)
  const files: string[] = []

  for (const entry of entries) {
    const absolutePath = join(directoryPath, entry)
    const stats = statSync(absolutePath)

    if (stats.isDirectory()) {
      files.push(...collectFiles(absolutePath, matcher))
      continue
    }

    if (matcher(absolutePath)) {
      files.push(absolutePath)
    }
  }

  return files
}

function collectControllerFiles(): string[] {
  return collectFiles(join(process.cwd(), 'src', 'core'), (absolutePath) => absolutePath.endsWith('.controller.ts'))
}

function collectDocsFiles(): string[] {
  return collectFiles(
    join(process.cwd(), 'src', 'core'),
    (absolutePath) => absolutePath.includes('/docs/') && absolutePath.endsWith('.docs.ts'),
  )
}

function ensureControllerRoutesHaveDocs(controllerPath: string): string[] {
  const content = readFileSync(controllerPath, 'utf8')

  if (content.includes('@ApiExcludeController')) {
    return []
  }

  const lines = content.split('\n')
  const violations: string[] = []

  for (let index = 0; index < lines.length; index += 1) {
    if (!ROUTE_DECORATOR_PATTERN.test(lines[index])) {
      continue
    }

    let decoratorsStartIndex = index

    for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
      const trimmedLine = lines[cursor].trim()

      if (trimmedLine.startsWith('@')) {
        decoratorsStartIndex = cursor
        continue
      }

      if (trimmedLine.length === 0) {
        continue
      }

      break
    }

    let signatureIndex = -1

    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      if (METHOD_SIGNATURE_PATTERN.test(lines[cursor])) {
        signatureIndex = cursor
        break
      }
    }

    if (signatureIndex < 0) {
      continue
    }

    const block = lines.slice(decoratorsStartIndex, signatureIndex + 1).join('\n')
    const isHiddenEndpoint = block.includes('@ApiExcludeEndpoint')

    if (isHiddenEndpoint) {
      continue
    }

    if (!DOCS_DECORATOR_PATTERN.test(block)) {
      violations.push(`${controllerPath}:${decoratorsStartIndex + 1}`)
    }
  }

  return violations
}

describe('Swagger docs coverage', () => {
  it('should require docs decorator on every non-hidden endpoint', () => {
    const controllerFiles = collectControllerFiles()
    const violations = controllerFiles.flatMap((controllerPath) => ensureControllerRoutesHaveDocs(controllerPath))

    expect(violations).toEqual([])
  })

  it('should keep docs files with operation and response decorators', () => {
    const docsFiles = collectDocsFiles()
    const violations: string[] = []

    for (const docsPath of docsFiles) {
      const content = readFileSync(docsPath, 'utf8')

      if (!content.includes('ApiOperation(')) {
        violations.push(`${docsPath}: missing ApiOperation`)
      }

      if (!/Api(?:Ok|Created|Accepted|NoContent)Response\(/.test(content)) {
        violations.push(`${docsPath}: missing success response decorator`)
      }
    }

    expect(violations).toEqual([])
  })

  it('should keep controllers importing docs barrels when routes are documented', () => {
    const controllerFiles = collectControllerFiles()
    const violations: string[] = []

    for (const controllerPath of controllerFiles) {
      const content = readFileSync(controllerPath, 'utf8')
      const hasRouteDecorators = ROUTE_DECORATOR_PATTERN.test(content)
      const hasDocsDecorators = DOCS_DECORATOR_PATTERN.test(content)
      const hasHiddenController = content.includes('@ApiExcludeController')

      if (!hasRouteDecorators || !hasDocsDecorators || hasHiddenController) {
        continue
      }

      if (!DOCS_IMPORT_PATTERN.test(content)) {
        violations.push(`${controllerPath}: missing docs barrel import`)
      }
    }

    expect(violations).toEqual([])
  })
})
