// Background script

// Simulated LLM Detector
async function simulateLLMDetector(content) {
  try {
      const response = await fetch('http://localhost:3000/detect-irrelevant-content', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
      });

      console.log("Response from LLM detector:", response);

      if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const returned_response = await response.json();
      console.log("Returned response from LLM detector:", returned_response);

      return returned_response.irrelevantLines;
  } catch (error) {
      console.error("Error detecting irrelevant content:", error.message);
      throw error;
  }
}

  

function simulateLLMGenerator(content, mode, pageContent) {
  return fetch('http://localhost:3000/transform-ad-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: content,
      mode: mode,
      pageContent: pageContent,
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      return data.transformedContent;
    })
    .catch(error => {
      console.error('Error in simulateLLMGenerator:', error);
      throw error;
    });
}

  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request);
  
    if (request.action === "llmDetector") {
      simulateLLMDetector(request.content).then(detectedAdContent => {
        console.log('Detected ad content:', detectedAdContent);
        sendResponse({detectedAdContent: detectedAdContent});
      });
      return true; 
    } else if (request.action === "llmGenerator") {
      simulateLLMGenerator(request.content, request.mode, request.pageContent).then(generatedContent => {
        console.log('Generated content:', generatedContent);
        sendResponse({generatedContent: generatedContent});
      });
      return true; 
    }
  });
  
  