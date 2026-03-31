import axios from 'axios';

async function removeBg(image: Buffer) {
    const form = new FormData();
    const blob = new Blob([image as any], { type: 'image/png' });
    form.append('file', blob, 'image.png');

    const response = await axios.post('https://huggingface.co/spaces/fntxxx/remove-bg', form);
    return response.data;
}