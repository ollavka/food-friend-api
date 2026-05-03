import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from '@jest/globals'

const SPEC_EXTENSION = '.spec.ts'
const CYRILLIC_PATTERN = /[А-Яа-яІіЇїЄєҐґ]/
const TITLE_CALL_PATTERN = /\b(?:describe|it|test)\s*\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g

function collectSpecFiles(directoryPath: string): string[] {
  const entries = readdirSync(directoryPath)
  const files: string[] = []

  for (const entry of entries) {
    const absolutePath = join(directoryPath, entry)
    const stats = statSync(absolutePath)

    if (stats.isDirectory()) {
      files.push(...collectSpecFiles(absolutePath))
      continue
    }

    if (absolutePath.endsWith(SPEC_EXTENSION)) {
      files.push(absolutePath)
    }
  }

  return files
}

function extractTitles(content: string): string[] {
  const titles: string[] = []
  const matches = content.matchAll(TITLE_CALL_PATTERN)

  for (const match of matches) {
    titles.push(match[2])
  }

  return titles
}

describe('English test title policy', () => {
  it('should enforce English-only describe/it/test titles across spec files', () => {
    const sourceRoots = [join(process.cwd(), 'src'), join(process.cwd(), 'test')]
    const specFiles = sourceRoots.flatMap((sourceRoot) => collectSpecFiles(sourceRoot))
    const violations: string[] = []

    for (const specFile of specFiles) {
      const content = readFileSync(specFile, 'utf8')
      const titles = extractTitles(content)

      for (const title of titles) {
        if (CYRILLIC_PATTERN.test(title)) {
          violations.push(`${specFile}: "${title}"`)
        }
      }
    }

    expect(violations).toEqual([])
  })
})
