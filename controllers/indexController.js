// controllers/indexController.js
const home = (req, res) => {
  res.render('index', { response: '' }); // Default empty response
};

const chatController = async (req, res) => {
  const { userInput } = req.body; // Retrieve user input from the form
  console.log(userInput);
  const url =
    'https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions';
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': 'c09fcfefe3mshaca01c50f7cb56dp133551jsn5d7436139c0d',
      'x-rapidapi-host':
        'cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: userInput,
        },
      ],
      model: 'gpt-4o',
      max_tokens: 100,
      temperature: 0.9,
    }),
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    res.render('index', { response: result.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.render('index', {
      response: 'Error processing your request. Please try again later.',
    });
  }
};

module.exports = { home, chatController };
