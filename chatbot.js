(function() {
  // Inject FontAwesome if not already loaded (to support close & send icons)
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const faLink = document.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(faLink);
  }


  // Build and Inject HTML Elements
  const chatbotTrigger = document.createElement('button');
  chatbotTrigger.id = 'chatbot-trigger';
  chatbotTrigger.setAttribute('aria-label', 'Open support chat');
  chatbotTrigger.innerHTML = '<i class="fa-solid fa-comments"></i>';

  const chatbotWindow = document.createElement('div');
  chatbotWindow.id = 'chatbot-window';
  chatbotWindow.innerHTML = `
    <div class="chatbot-header">
      <div class="chatbot-header-info">
        <div class="chatbot-avatar">G</div>
        <div class="chatbot-title-container">
          <span class="chatbot-title">Genex LogiBot</span>
          <span class="chatbot-status">Online AI Assistant</span>
        </div>
      </div>
      <button class="chatbot-close" aria-label="Close chat">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="chatbot-messages" id="chatbot-messages-log"></div>
    <div class="chatbot-footer">
      <div class="chatbot-input-wrapper">
        <input type="text" class="chatbot-input" id="chatbot-user-input" placeholder="Ask LogiBot..." autocomplete="off">
      </div>
      <button class="chatbot-send" id="chatbot-send-btn" aria-label="Send message">
        <i class="fa-solid fa-paper-plane"></i>
      </button>
    </div>
  `;

  document.body.appendChild(chatbotTrigger);
  document.body.appendChild(chatbotWindow);

  // Selector cache
  const messagesLog = document.getElementById('chatbot-messages-log');
  const userInput = document.getElementById('chatbot-user-input');
  const sendBtn = document.getElementById('chatbot-send-btn');
  const closeBtn = chatbotWindow.querySelector('.chatbot-close');

  // Toggle Visibility
  chatbotTrigger.addEventListener('click', () => {
    chatbotWindow.classList.add('active');
    // Set focus to input
    setTimeout(() => userInput.focus(), 150);
  });

  closeBtn.addEventListener('click', () => {
    chatbotWindow.classList.remove('active');
  });

  // Append single message bubble
  function appendMessage(text, sender = 'bot', hasHtml = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg', sender);
    if (hasHtml) {
      msgDiv.innerHTML = text;
    } else {
      msgDiv.textContent = text;
    }
    messagesLog.appendChild(msgDiv);
    messagesLog.scrollTop = messagesLog.scrollHeight;
    return msgDiv;
  }

  // Append quick reply buttons
  function appendQuickReplies() {
    const repliesDiv = document.createElement('div');
    repliesDiv.classList.add('quick-replies');
    
    const options = [
      { text: 'Get Quote 💰', value: 'quote' },
      { text: 'Services 🏢', value: 'services' },
      { text: 'Industries 🏭', value: 'industries' },
      { text: 'Contact 📞', value: 'contact' }
    ];

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.classList.add('quick-reply-btn');
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        handleUserInput(opt.text);
      });
      repliesDiv.appendChild(btn);
    });

    messagesLog.appendChild(repliesDiv);
    messagesLog.scrollTop = messagesLog.scrollHeight;
  }

  // Display bouncing typing indicator
  let currentTypingIndicator = null;
  function showTypingIndicator() {
    if (currentTypingIndicator) return;
    
    currentTypingIndicator = document.createElement('div');
    currentTypingIndicator.classList.add('typing-indicator');
    currentTypingIndicator.innerHTML = `
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    `;
    messagesLog.appendChild(currentTypingIndicator);
    messagesLog.scrollTop = messagesLog.scrollHeight;
  }

  function removeTypingIndicator() {
    if (currentTypingIndicator && currentTypingIndicator.parentNode) {
      currentTypingIndicator.parentNode.removeChild(currentTypingIndicator);
      currentTypingIndicator = null;
    }
  }

  // Initial Welcome Message
  appendMessage("Welcome to Genex Logistics! 👋 I am LogiBot, your intelligent supply chain assistant. How can I help you today?", 'bot');
  appendQuickReplies();

  // AI Response matcher
  function getResponseText(text) {
    const query = text.toLowerCase().trim();

    if (query.includes('track') || query.includes('consignment') || query.includes('shipment')) {
      return `📦 <strong>Shipment Tracking Support</strong>:<br><br>` +
             `To track your cargo consignment in real-time, please contact our solutions desk directly:<br>` +
             `• <strong>Email Support:</strong> <a href="mailto:solutions@genexlogistics.in" style="color: var(--chat-accent); text-decoration: underline;">solutions@genexlogistics.in</a><br>` +
             `• <strong>Direct Hotline:</strong> +91-11-28085421 (Mon-Sat, 9AM-6PM)<br><br>` +
             `Our team will provide you with the exact coordinates and transit details for your cargo.`;
    }

    // Quote / Pricing Info
    if (query.includes('quote') || query.includes('pricing') || query.includes('cost') || query.includes('price') || query.includes('charge') || query.includes('rate') || query.includes('estimator') || query.includes('calculate')) {
      return `💰 <strong>Instant Proposal & Quotes</strong>:<br><br>` +
             `1. Use our interactive <strong>Instant Quote Estimator</strong> widget in the Logistics Hub section of the homepage for a quick baseline calculation.<br>` +
             `2. For a structured corporate proposal, please scroll down to the <strong>Request Custom Proposal</strong> form on our homepage and submit details.<br>` +
             `3. Or email our solutions desk at <a href="mailto:solutions@genexlogistics.in" style="color: var(--chat-accent); text-decoration: underline;">solutions@genexlogistics.in</a>.`;
    }

    // Services Queries
    if (query.includes('service') || query.includes('3pl') || query.includes('warehouse') || query.includes('storage') || query.includes('freight') || query.includes('distribution') || query.includes('express') || query.includes('forwarding') || query.includes('project') || query.includes('odc')) {
      return `🏢 <strong>Genex Logistics Core Capabilities:</strong><br><br>` +
             `• <strong>3PL & Contract Logistics:</strong> High-complexity warehousing layouts, JIT manufacturing feeds, and FTWZ setups.<br>` +
             `• <strong>Shared Warehousing:</strong> Scalable pallet structures and cross-docking.<br>` +
             `• <strong>Express & Road LTL:</strong> MILK run deliveries and nationwide FTL/LTL freight forwarding.<br>` +
             `• <strong>Global Freight Forwarding:</strong> International ocean and air shipping with quick customs clearance.<br>` +
             `• <strong>Project Logistics & ODC:</strong> Feasibility surveys and hauling of heavy oversized cargo.`;
    }

    // Contact Details
    if (query.includes('contact') || query.includes('phone') || query.includes('call') || query.includes('email') || query.includes('number') || query.includes('hotline') || query.includes('support') || query.includes('office') || query.includes('location')) {
      return `📞 <strong>Direct Contact Channels:</strong><br><br>` +
             `• <strong>Corporate Email:</strong> <a href="mailto:solutions@genexlogistics.in" style="color: var(--chat-accent); text-decoration: underline;">solutions@genexlogistics.in</a><br>` +
             `• <strong>Direct Hotline:</strong> +91-11-28085421 (Mon-Sat, 9AM to 6PM)<br>` +
             `• <strong>Offices:</strong> Headquartered in New Delhi, operating facilities in over 28 states PAN India.`;
    }

    // Industries
    if (query.includes('industry') || query.includes('vertical') || query.includes('automotive') || query.includes('ecommerce') || query.includes('pharma') || query.includes('healthcare') || query.includes('chemical') || query.includes('retail') || query.includes('fashion')) {
      return `⚡ <strong>Specialized Industry Solutions:</strong><br><br>` +
             `• <strong>Automotive & Spares:</strong> JIT delivery and reverse logistics feeds.<br>` +
             `• <strong>E-commerce & Retail:</strong> Rapid same-day pick-pack and seasonal scale-ups.<br>` +
             `• <strong>Pharma & Cold-chain:</strong> WHO-GDP compliant vaulting and 2°C to 8°C temperature controls.<br>` +
             `• <strong>Hazmat Chemicals:</strong> Certified security layouts, safe bulk haulage, and EPA permit clearance documentation.<br>` +
             `• <strong>Apparel & Fashion:</strong> Complex multi-SKU inventory setups.`;
    }

    // General greetings & small talk
    if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('greeting') || query.includes('yo')) {
      return `👋 Hello! I am LogiBot, the Genex AI assistant. How can I help you optimize your supply chain today? You can ask about shipping tracking, quotes, services, or contact numbers.`;
    }

    if (query.includes('thank') || query.includes('thanks') || query.includes('awesome') || query.includes('perfect') || query.includes('great')) {
      return `😊 You're welcome! Genex is dedicated to keeping your production lines and distribution loops operating with 99.9% uptime. Let me know if you have any other questions.`;
    }

    // Default Fallback
    return `👋 I am LogiBot, your Genex AI Assistant. I didn't quite catch that. You can query me on:<br><br>` +
           `• <strong>Consignment Status</strong> (e.g. type: <strong>GNX-10294</strong>)<br>` +
           `• <strong>Estimates & Costing</strong> (e.g. type: <strong>Get a quote</strong>)<br>` +
           `• <strong>Capabilities</strong> (e.g. type: <strong>Warehousing services</strong>)<br>` +
           `• <strong>Hotline/Support</strong> (e.g. type: <strong>How to contact you</strong>)`;
  }

  // Handle Input Submission
  function handleUserInput(inputVal) {
    const text = inputVal || userInput.value.trim();
    if (!text) return;

    // Append User Message
    appendMessage(text, 'user');
    if (!inputVal) userInput.value = '';

    // Simulate Bot response with typing latency
    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const responseHtml = getResponseText(text);
      appendMessage(responseHtml, 'bot', true);
    }, 900);
  }

  // Send Event Hooks
  sendBtn.addEventListener('click', () => handleUserInput());
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUserInput();
    }
  });

  // Track page clicks to sync chat input if user clicks quick estimator or consignment tracker triggers in layout
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#estimator-section' || window.location.hash === '#quote-estimator') {
      // Prompt user in chat if window is active
      if (chatbotWindow.classList.contains('active')) {
        setTimeout(() => {
          appendMessage("💡 You navigated to our Instant Quote Estimator! Enter your logistics specs to view a custom cost estimate.", 'bot');
        }, 600);
      }
    }
  });

})();
