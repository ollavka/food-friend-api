import { describe, expect, it } from '@jest/globals'
import { validateSync } from 'class-validator'
import { IsPostgresURL } from './is-postgres-url.decorator'

class TestPostgresUrlDto {
  @IsPostgresURL()
  public databaseUrl!: unknown
}

describe('IsPostgresURL', () => {
  it('should validate correct PostgreSQL url', () => {
    const dto = Object.assign(new TestPostgresUrlDto(), {
      databaseUrl: 'postgresql://user:secret@localhost:5432/food_friend',
    })

    const result = validateSync(dto)
    expect(result).toHaveLength(0)
  })

  it('should reject non-string value', () => {
    const dto = Object.assign(new TestPostgresUrlDto(), {
      databaseUrl: 12345,
    })

    const result = validateSync(dto)
    expect(result).toHaveLength(1)
  })

  it('should reject malformed PostgreSQL url', () => {
    const dto = Object.assign(new TestPostgresUrlDto(), {
      databaseUrl: 'https://localhost:5432/food_friend',
    })

    const result = validateSync(dto)
    expect(result).toHaveLength(1)
    expect(result[0].constraints).toBeDefined()
  })
})
