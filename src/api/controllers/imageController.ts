import { Request, Response, NextFunction } from 'express';
import fetchData from '../../lib/fetchData';
import fs from 'fs';
import path from 'path';
import https from 'https';

const generateThumbnail = async (
  req: Request<{}, {}, { topic: string }>,
  res: Response<{ url: string }>,
  next: NextFunction
) => {
  try {
    const { topic } = req.body;

    const prompt = `Generate a YouTube thumbnail image related to the topic: ${topic}. Include elements like stars, planets, or astronauts if the topic is space, and splash text like "Explore the Universe!"`;

    console.log('Sending request to OpenAI API with:', prompt);

    const response = await fetchData<{ data: { url: string }[] }>(`${process.env.OPENAI_API_URL}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.data[0].url) {
      throw new Error('Image not generated');
    }

    const imageUrl = response.data[0].url;
    res.locals.url = imageUrl;
    next();
  } catch (error) {
    console.error('generateThumbnail error:', error);
    next(error);
  }
};

const saveThumbnail = async (
    req: Request<{}, {}, { topic: string }>,
    res: Response<{ file: string; url: string }>,
    next: NextFunction
  ) => {
    const imageName = `${req.body.topic.replace(/\s+/g, '_')}.png`;
    const filePath = path.join(__dirname, '../../uploads', imageName);
    const file = fs.createWriteStream(filePath);
  
    if (!res.locals.url) {
      res.json({ file: 'default.png', url: '' });
      return;
    }
  
    const imageUrl = res.locals.url;
  
    https
      .get(imageUrl, (response) => {
        response.pipe(file);
  
        file.on('finish', () => {
          file.close();
          console.log(`Image downloaded from ${imageUrl}`);
          res.json({ file: imageName, url: imageUrl });
        });
      })
      .on('error', (err) => {
        fs.unlink(filePath, () => {
          console.error(`Error downloading image: ${err.message}`);
          next(err);
        });
      });
  };
  
  export { generateThumbnail, saveThumbnail };