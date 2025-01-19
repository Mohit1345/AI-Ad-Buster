// Content script
console.log('Content script loaded');

let isEnabled = false;
let currentMode = 'default';

// Step 1: Initial Content Extraction (class and id based only)
function extractAdElements() {
  console.log('Extracting ad elements');
  const adPatterns = ['ad', 'advertisement', 'sponsored', 'promotion',"Ad"];
  const elements = [];

  // Extract elements based on class or id
  adPatterns.forEach(pattern => {
    elements.push(...document.querySelectorAll(`[class*="${pattern}"], [id*="${pattern}"]`));
  });

  console.log(`Found ${elements.length} potential ad elements`);
  console.log(elements)
  return elements;
}

// Step 2: LLM Detector for remaining content
async function llmDetector(content) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "llmDetector", content: content }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error in LLM detection:', chrome.runtime.lastError);
        resolve([]);
      } else {
        console.log("response of detectedadcontent is ", response)
        resolve(response.detectedAdContent);
      }
    });
  });
}

// Step 3: LLM Generator
async function llmGenerator(content, mode, pageContent) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "llmGenerator", content: content, mode: mode, pageContent: pageContent }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error in LLM generation:', chrome.runtime.lastError);
        resolve('');
      } else {
        resolve(response.generatedContent);
      }
    });
  });
}

// Process and transform ad content
async function processAdElement(element_array, mode, pageContent) {
  // const originalContent = element.innerHTML;
  const innerHtmlContent = []
  console.log("before for loop ", element_array)
  for (const element of element_array) {
    innerHtmlContent.push(element.innerHTML);
}

  console.log("after loop  , ", innerHtmlContent)
  const newContents = await llmGenerator(innerHtmlContent, mode, pageContent);
  // for (const element in element_array){
  //   element.innerHTML = newContent;   
  // }
  for (let i = 0; i < element_array.length; i++) {
    element_array[i].innerHTML = newContents[i];
    applyStyle(element_array[i], mode);
}
    
  
}

function applyStyle(element, mode) {
  element.classList.remove('ad-transform-default', 'ad-transform-vampire', 'ad-transform-exorcism');
  element.classList.add(`ad-transform-${mode}`);

  switch (mode) {
    case 'vampire':
      element.style.filter = 'grayscale(100%)';
      break;
    case 'exorcism':
      element.style.display = 'none';
      break;
    default:
      element.style.filter = '';
  }
}

// Main execution
async function main() {
//   const adElements = extractAdElements();
  const pageContent = document.body.innerText;

//   // Process definite ad elements
//   for (const element of adElements) {
//     await processAdElement(element, currentMode, pageContent);
//   }

  const processedElements = new Set();
  const adElements = extractAdElements();
  for (const element of adElements) {
    processedElements.add(element);
    // await processAdElement(element, currentMode, pageContent);
  }
  await processAdElement(adElements, currentMode, pageContent);

  
  // Build remaining content excluding processed elements
  const allElements = document.body.querySelectorAll('*');
  let remainingContent = Array.from(allElements)
    .filter((el) => !processedElements.has(el))
    .map((el) => el.outerHTML)
    .join('');

  remainingContent = remainingContent.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  console.log("page content is ")
  console.log(pageContent)

  console.log("remaining content is ")
  console.log(remainingContent)
  

  // Process remaining content with LLM detector
//   const remainingContent = document.body.innerHTML;
  const detectedAdContent = await llmDetector(remainingContent);
  console.log("detectedAdContent is , ", detectedAdContent)

  console.log("type of detectedAdContent is ", typeof detectedAdContent)

  for (const adText of detectedAdContent) {
    const regex = new RegExp(adText, 'gi');
    document.body.innerHTML = document.body.innerHTML.replace(regex, (match) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'llm-detected-ad';
      wrapper.innerHTML = match;
      return wrapper.outerHTML;
    });
  }

  // Process LLM detected ad content
  const llmDetectedAds = document.querySelectorAll('.llm-detected-ad');
  // for (const element of llmDetectedAds) {
  //   await processAdElement(element, currentMode, pageContent);
  // }
  processAdElement(llmDetectedAds, currentMode, pageContent);
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleExtension") {
    isEnabled = request.enabled;
    if (isEnabled) {
      main();
    } else {
      location.reload(); // Reload the page to reset all changes
    }
  } else if (request.action === "changeMode") {
    currentMode = request.mode;
    if (isEnabled) {
      main();
    }
  }
});

// Initial run
chrome.storage.sync.get(['enabled', 'mode'], (data) => {
  if (chrome.runtime.lastError) {
    console.error('Error loading settings:', chrome.runtime.lastError);
    return;
  }
  isEnabled = data.enabled ?? false;
  currentMode = data.mode ?? 'default';
  if (isEnabled) {
    main();
  }
});

