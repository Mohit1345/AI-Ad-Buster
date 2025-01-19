// Background script

// Simulated LLM Detector
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

      // Assuming returned_response.irrelevantLines contains the detected irrelevant content
      return returned_response.irrelevantLines;
  } catch (error) {
      console.error("Error detecting irrelevant content:", error.message);
      throw error;
  }
}

  
  // Simulated LLM Generator
//   function simulateLLMGenerator(content, mode, pageContent) {
//     return new Promise(resolve => {
//       setTimeout(() => {
//         let generatedContent;
//         switch (mode) {
//           case 'vampire':
//             generatedContent = `🧛‍♂️ Spooky monochrome content: ${content.substring(0, 30)}...`;
//             break;
//           case 'exorcism':
//             generatedContent = ''; // Content will be removed in the content script
//             break;
//           default:
//             generatedContent = `Related content: ${pageContent.substring(0, 30)}...`;
//         }
//         resolve(generatedContent);
//       }, 500);
//     });
//   }
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
      // Extract and return the `transformedContent` string
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
      return true; // Indicates that the response is asynchronous
    } else if (request.action === "llmGenerator") {
      simulateLLMGenerator(request.content, request.mode, request.pageContent).then(generatedContent => {
        console.log('Generated content:', generatedContent);
        sendResponse({generatedContent: generatedContent});
      });
      return true; // Indicates that the response is asynchronous
    }
  });
  
  


// old 
// // Function to detect irrelevant content using the API
// async function simulateLLMDetection(content) {
//     try {
//         const response = await fetch('http://localhost:3000/detect-irrelevant-content', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ content }),
//         });
  
//         if (!response.ok) {
//             throw new Error(`Error: ${response.status} ${response.statusText}`);
//         }
  
//         const data = await response.json();
//         console.log("Irrelevant lines are:");
//         console.log(data.irrelevantLines);
//         return data.irrelevantLines;
//     } catch (error) {
//         console.error("Error detecting irrelevant content:", error.message);
//         throw error;
//     }
//   } 
  
//   // Function to transform ad content using the API
//   async function simulateLLMTransformation(content) {
//     try {
//         const response = await fetch('http://localhost:3000/transform-ad-content', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ content }),
//         });
//         console.log("response is ")
//         console.log(response)
//         if (!response.ok) {
//             throw new Error(`Error: ${response.status} ${response.statusText}`);
//         }
  
//         const data = await response.json();
//         console.log("Transformed content is:");
//         console.log(data.transformedContent);
//         return data.transformedContent;
//     } catch (error) {
//         console.error("Error transforming ad content:", error.message);
//         throw error;
//     }
//   }
  
//   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     console.log('Background script received message:', request);
  
//     if (request.action === "detectIrrelevantContent") {
//       simulateLLMDetection(request.content).then(irrelevantLines => {
//         console.log('Detected irrelevant lines:', irrelevantLines);
//         sendResponse({irrelevantLines: irrelevantLines});
//       });
//       return true; // Indicates that the response is asynchronous
//     } else if (request.action === "transformAdContent") {
//       simulateLLMTransformation(request.content).then(transformedContent => {
//         console.log('Transformed content:', transformedContent);
//         sendResponse({transformedContent: transformedContent});
//       });
//       return true; // Indicates that the response is asynchronous
//     }
//   });
  
  