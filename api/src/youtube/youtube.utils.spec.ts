import { extractChannelRef, extractVideoId } from './youtube.utils';

describe('extractVideoId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=10s', 'dQw4w9WgXcQ'],
    ['youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('extracts the id from %s', (input, expected) => {
    expect(extractVideoId(input)).toBe(expected);
  });

  it.each([
    ['https://example.com/watch?v=dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?v=tooshort'],
    ['https://www.youtube.com/@veritasium'],
    [''],
  ])('returns null for %s', (input) => {
    expect(extractVideoId(input)).toBeNull();
  });
});

describe('extractChannelRef', () => {
  it('parses a /channel/ id URL', () => {
    expect(
      extractChannelRef('https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw'),
    ).toEqual({ type: 'id', value: 'UCuAXFkgsw1L7xaCfnd5JJOw' });
  });

  it('parses a handle URL', () => {
    expect(extractChannelRef('https://www.youtube.com/@veritasium')).toEqual({
      type: 'handle',
      value: 'veritasium',
    });
  });

  it('parses a bare handle', () => {
    expect(extractChannelRef('@veritasium')).toEqual({
      type: 'handle',
      value: 'veritasium',
    });
  });

  it('parses a /user/ URL', () => {
    expect(extractChannelRef('https://www.youtube.com/user/1veritasium')).toEqual({
      type: 'username',
      value: '1veritasium',
    });
  });

  it('parses a bare channel id', () => {
    expect(extractChannelRef('UCuAXFkgsw1L7xaCfnd5JJOw')).toEqual({
      type: 'id',
      value: 'UCuAXFkgsw1L7xaCfnd5JJOw',
    });
  });

  it('returns null for non-YouTube URLs', () => {
    expect(extractChannelRef('https://example.com/@veritasium')).toBeNull();
  });
});
