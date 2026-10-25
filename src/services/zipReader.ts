export async function extractJsonFromZip(arrayBuffer: ArrayBuffer): Promise<string | null> {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  let offset = 0;

  while (offset < bytes.length - 30) {
    // Local file header signature = 0x04034b50
    if (
      bytes[offset] === 0x50 &&
      bytes[offset + 1] === 0x4b &&
      bytes[offset + 2] === 0x03 &&
      bytes[offset + 3] === 0x04
    ) {
      const compMethod = view.getUint16(offset + 8, true);
      const compSize = view.getUint32(offset + 18, true);
      const nameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);

      const fileNameBytes = bytes.subarray(offset + 30, offset + 30 + nameLen);
      const fileName = new TextDecoder('utf-8').decode(fileNameBytes);

      const dataStart = offset + 30 + nameLen + extraLen;
      const dataEnd = dataStart + compSize;

      if (fileName.toLowerCase().endsWith('.json') && dataEnd <= bytes.length) {
        const rawData = bytes.subarray(dataStart, dataEnd);

        if (compMethod === 0) {
          // Stored (no compression)
          return new TextDecoder('utf-8').decode(rawData);
        } else if (compMethod === 8) {
          // Deflate compressed
          try {
            if (typeof DecompressionStream !== 'undefined') {
              const stream = new Blob([rawData])
                .stream()
                .pipeThrough(new DecompressionStream('deflate-raw'));
              const response = new Response(stream);
              return await response.text();
            }
          } catch {
            // Fallback below
          }
        }
      }
      offset = dataEnd;
    } else {
      offset += 1;
    }
  }

  return null;
}
