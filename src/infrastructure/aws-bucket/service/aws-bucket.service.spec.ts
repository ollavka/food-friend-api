import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { describe, expect, it, jest } from '@jest/globals'
import { AppInternalException } from '@common/exception'
import { AWSBucketService } from './aws-bucket.service'

describe('AWSBucketService', () => {
  const awsBucketClient: { send: jest.Mock } = {
    send: jest.fn(),
  }

  const service = new AWSBucketService(awsBucketClient as never, 'bucket-name', 'eu-central-1')

  it('should upload file and return key/url', async () => {
    ;(awsBucketClient.send as any).mockResolvedValueOnce(undefined)

    const result = await service.upload(
      {
        originalname: 'recipe.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('binary'),
        size: 6,
      } as never,
      'recipes/source',
    )

    expect(result.key).toContain('recipes/source/')
    expect(result.key).toContain('-recipe.jpg')
    expect(result.url).toContain(result.key)

    const command = awsBucketClient.send.mock.calls[0][0]
    expect(command).toBeInstanceOf(PutObjectCommand)
  })

  it('should throw internal exception when upload fails', async () => {
    ;(awsBucketClient.send as any).mockRejectedValueOnce(new Error('s3 error'))

    await expect(
      service.upload({
        originalname: 'recipe.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('binary'),
        size: 6,
      } as never),
    ).rejects.toBeInstanceOf(AppInternalException)
  })

  it('should remove file and wrap remove failures', async () => {
    awsBucketClient.send.mockClear()
    ;(awsBucketClient.send as any).mockResolvedValueOnce(undefined)
    await expect(service.remove('recipes/source/key.jpg')).resolves.toBeUndefined()
    expect(awsBucketClient.send.mock.calls[0][0]).toBeInstanceOf(DeleteObjectCommand)
    ;(awsBucketClient.send as any).mockRejectedValueOnce(new Error('delete error'))
    await expect(service.remove('recipes/source/key.jpg')).rejects.toBeInstanceOf(AppInternalException)
  })

  it('should build deterministic file url', () => {
    expect(service.getFileUrl('recipes/key.jpg')).toBe(
      'https://bucket-name.s3.eu-central-1.amazonaws.com/recipes/key.jpg',
    )
  })
})
