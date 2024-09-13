import {Request, Response, NextFunction} from 'express';
import fetchData from '../../lib/fetchData';

const commentPost = async (
  req: Request<{}, {}, {text: string, style: string}>,
  res: Response<{response: string}>,
  next: NextFunction
) => {
  try {
    const { text, style } = req.body;

    const prompt = `Generate a ${style} response to the following YouTube comment: "${text}".`;

    console.log('Sending request to OpenAI API with:', prompt);

    const response = await fetchData<{choices: {message: {content: string}}[]}>(`${process.env.OPENAI_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
        stop: ['\n'],
      }),
    });

    const aiResponse = response.choices[0].message.content.trim();
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('commentPost error:', error);
    next(error);
  }
};

export {commentPost};