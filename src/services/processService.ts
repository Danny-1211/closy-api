import axios from 'axios';

// 將傳進來的圖片去背
async function removeBg(image: Buffer) {
  const form = new FormData();
  const imageUint8 = new Uint8Array(image);
  const blob = new Blob([imageUint8], { type: 'image/png' });
  form.append('file', blob, 'image.png');

  const response = await axios.post('https://fntxxx-rembg-service.hf.space/remove-bg', form);
  return response.data;
}

export { removeBg };
