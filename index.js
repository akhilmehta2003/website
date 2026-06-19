document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. STICKY GLASSMORPHIC HEADER
     ========================================================================== */
  const header = document.querySelector('header');
  const checkScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', checkScroll);
  checkScroll(); // Run once in case page loads scrolled down

  /* ==========================================================================
     2. MOBILE NAVIGATION MENU
     ========================================================================== */
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-item');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking links (on mobile)
    const links = document.querySelectorAll('.nav-link:not(.dropdown-trigger)');
    links.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });

    // Mobile dropdown toggle click handlers
    navItems.forEach(item => {
      const trigger = item.querySelector('.dropdown-trigger');
      if (trigger) {
        trigger.addEventListener('click', (e) => {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            item.classList.toggle('active');
          }
        });
      }
    });
  }



  /* ==========================================================================
     5. LOGISTICS QUOTE COST ESTIMATOR
     ========================================================================== */
  const estimatorForm = document.getElementById('estimator-form');
  const estimatorResult = document.getElementById('estimator-result');

  if (estimatorForm) {
    estimatorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const serviceType = document.getElementById('est-service').value;
      const weightClass = document.getElementById('est-weight').value;
      const industry = document.getElementById('est-industry').value;

      // Base Rates calculation mock
      let baseRate = 12000;
      let serviceLabel = "3PL Supply Chain Solutions";

      if (serviceType === 'warehousing') {
        baseRate = 25000;
        serviceLabel = "Dedicated 3PL Contract Warehousing";
      } else if (serviceType === 'global') {
        baseRate = 45000;
        serviceLabel = "Global Air/Ocean Freight Clearance";
      } else if (serviceType === 'distribution') {
        baseRate = 15000;
        serviceLabel = "Express Road Distribution / FTL";
      } else if (serviceType === 'project') {
        baseRate = 60000;
        serviceLabel = "Project Cargo Logistics & ODC Handling";
      }

      // Weight multiplier
      let multiplier = 1.0;
      if (weightClass === 'mid') multiplier = 1.8;
      if (weightClass === 'heavy') multiplier = 3.5;

      // Industry discount/premium adjustments
      let industryPremium = 1.0;
      if (industry === 'pharma' || industry === 'chemicals') {
        industryPremium = 1.25; // hazmat/temp compliance overhead
      } else if (industry === 'ecommerce') {
        industryPremium = 0.95; // high volume bulk shipping
      }

      const totalEstimate = Math.round(baseRate * multiplier * industryPremium);

      // Render output values
      document.getElementById('est-disp-service').innerText = serviceLabel;
      document.getElementById('est-disp-details').innerText = `Configured for ${industry.toUpperCase()} requirements (${weightClass} cargo class). Subject to final survey.`;
      
      // Formatting number as Indian Rupee (INR) format (e.g. ₹ 45,200)
      const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      });
      document.getElementById('est-disp-price').innerText = formatter.format(totalEstimate);

      // Open results pane
      estimatorResult.style.display = 'block';
    });
  }

  /* ==========================================================================
     6. INDUSTRY TAB SELECTOR
     ========================================================================== */
  const industryTabs = document.querySelectorAll('.industry-menu-btn');
  const industryPanels = document.querySelectorAll('.industry-panel');

  industryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const selectedId = tab.getAttribute('data-industry');

      // Update button highlights
      industryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update visible details panel
      industryPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `${selectedId}-panel`) {
          panel.classList.add('active');
        }
      });
    });
  });

  /* ==========================================================================
     7. TESTIMONIAL SLIDER CAROUSEL
     ========================================================================== */
  const sliderTrack = document.querySelector('.slider-track');
  const slides = document.querySelectorAll('.slide');
  const nextBtn = document.querySelector('.slider-btn.next');
  const prevBtn = document.querySelector('.slider-btn.prev');

  if (sliderTrack && slides.length > 0) {
    let currentIndex = 0;
    const slideCount = slides.length;
    let autoSlideInterval;

    const updateSlider = () => {
      sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    const nextSlide = () => {
      currentIndex = (currentIndex + 1) % slideCount;
      updateSlider();
    };

    const prevSlide = () => {
      currentIndex = (currentIndex - 1 + slideCount) % slideCount;
      updateSlider();
    };

    if (nextBtn && prevBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetTimer();
      });
      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetTimer();
      });
    }

    const startTimer = () => {
      autoSlideInterval = setInterval(nextSlide, 6000);
    };

    const resetTimer = () => {
      clearInterval(autoSlideInterval);
      startTimer();
    };

    startTimer();
    
    // Pause auto-sliding on hover
    const sliderContainer = document.querySelector('.slider-container');
    sliderContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    sliderContainer.addEventListener('mouseleave', startTimer);
  }

  /* ==========================================================================
     8. FAQ ACCORDION PANEL TOGGLE
     ========================================================================== */
  const faqHeaders = document.querySelectorAll('.faq-header');

  faqHeaders.forEach(headerEl => {
    headerEl.addEventListener('click', () => {
      const item = headerEl.parentElement;
      const isActive = item.classList.contains('active');
      const faqContent = item.querySelector('.faq-content');

      // Close all other FAQs first
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-content').style.maxHeight = null;
      });

      // Toggle current FAQ
      if (!isActive) {
        item.classList.add('active');
        faqContent.style.maxHeight = faqContent.scrollHeight + 'px';
      } else {
        item.classList.remove('active');
        faqContent.style.maxHeight = null;
      }
    });
  });

  /* ==========================================================================
     9. SCROLL INTERSECTION ANIMATIONS
     ========================================================================== */
  const animatedElements = document.querySelectorAll('.animated');

  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-delay') || '0s';
          entry.target.style.animationDelay = delay;
          
          if (entry.target.classList.contains('fade-in-up')) {
            entry.target.classList.add('fade-in-up');
          }
          entry.target.style.opacity = 1;
          
          const animationName = window.getComputedStyle(entry.target).animationName;
          if (animationName === 'none') {
            // Apply fallback if class list did not trigger automatically
            const animClass = entry.target.classList.contains('slide-in-left') ? 'slideInLeft' : 'fadeInUp';
            entry.target.style.animationName = animClass;
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15
    });

    animatedElements.forEach(el => animationObserver.observe(el));
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    animatedElements.forEach(el => {
      el.style.opacity = 1;
    });
  }

  /* ==========================================================================
     10. LIVE COUNT-UP FOR NUMBERS
     ========================================================================== */
  const statNums = document.querySelectorAll('.stat-num');

  const startCountUp = (el) => {
    const target = parseInt(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    let count = 0;
    const duration = 2000; // 2 seconds
    const increment = Math.ceil(target / (duration / 16)); // ~60fps

    const updateCount = () => {
      count += increment;
      if (count >= target) {
        el.innerHTML = target.toLocaleString('en-IN') + `<span>${suffix}</span>`;
      } else {
        el.innerHTML = count.toLocaleString('en-IN') + `<span>${suffix}</span>`;
        requestAnimationFrame(updateCount);
      }
    };
    
    requestAnimationFrame(updateCount);
  };

  if ('IntersectionObserver' in window && statNums.length > 0) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCountUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    statNums.forEach(num => statsObserver.observe(num));
  } else {
    // Fallback
    statNums.forEach(num => {
      const target = num.getAttribute('data-target');
      const suffix = num.getAttribute('data-suffix') || '';
      num.innerHTML = parseInt(target).toLocaleString('en-IN') + `<span>${suffix}</span>`;
    });
  }

  /* ==========================================================================
     11. CONTACT FORM & NEWSLETTER MOCK SUBMISSIONS
     ========================================================================== */
  const contactForm = document.getElementById('contact-inquiry-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Basic validation
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      
      if (!name || !email) {
        alert('Please fill out all required fields.');
        return;
      }

      // Generate a sleek Toast or alert modal
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.backgroundColor = '#ffffff';
      modal.style.padding = '40px';
      modal.style.borderRadius = '20px';
      modal.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.3)';
      modal.style.zIndex = '10001';
      modal.style.textAlign = 'center';
      modal.style.maxWidth = '450px';
      modal.style.width = '90%';
      modal.style.border = '1px solid #10b981';

      modal.innerHTML = `
        <div style="width: 60px; height: 60px; background-color: #d1fae5; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 20px;">✓</div>
        <h3 style="font-family: 'Outfit', sans-serif; font-size: 24px; color: #0b132b; margin-bottom: 12px;">Inquiry Received</h3>
        <p style="font-size: 15px; color: #475569; margin-bottom: 24px; line-height: 1.6;">Thank you for reaching out to Genex Logistics, <strong>${name}</strong>. Our custom solutions expert will review your requirements and respond within 2 business hours.</p>
        <button id="close-modal-btn" class="btn btn-primary" style="width: 100%;">Return to Home</button>
      `;

      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(11, 19, 43, 0.6)';
      overlay.style.backdropFilter = 'blur(4px)';
      overlay.style.zIndex = '10000';

      document.body.appendChild(overlay);
      document.body.appendChild(modal);

      document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
        contactForm.reset();
      });
    });
  }

  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim()) {
        alert(`Thank you for subscribing! Insights will be sent to: ${emailInput.value.trim()}`);
        emailInput.value = '';
      }
    });
  });

  /* ==========================================================================
     12. DYNAMIC CHATBOT INTEGRATION
     ========================================================================== */
  const chatbotScript = document.createElement('script');
  chatbotScript.src = 'chatbot.js';
  document.body.appendChild(chatbotScript);

});

