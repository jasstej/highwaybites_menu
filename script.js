document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Change header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-active');
      menuToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-active');
        menuToggle.classList.remove('active');
      });
    });
  }

  // Smooth scroll logic for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const offset = 80; // height of header
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Rate Us Popup Timer (2 minutes = 120,000ms)
  const RATE_POPUP_DELAY = 120000; 
  let isHamsterState = false;

  const showRateModal = () => {
    // Check if the user has already interacted with the rating popup
    if (localStorage.getItem('hbt_rate_prompt_completed') || localStorage.getItem('hbt_rate_prompt_dismissed')) {
      return;
    }

    const rateModal = document.getElementById('rate-modal');
    if (rateModal) {
      resetModalState();
      rateModal.classList.add('active');
      rateModal.setAttribute('aria-hidden', 'false');
    }
  };

  const resetModalState = () => {
    isHamsterState = false;
    
    const defaultIcon = document.getElementById('modal-default-icon');
    const hamsterContainer = document.getElementById('modal-hamster-container');
    const video = document.getElementById('sad-hamster-video');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.querySelector('.rate-modal-content p');
    const rateLaterBtn = document.getElementById('rate-later-btn');

    if (defaultIcon) defaultIcon.style.display = 'inline';
    if (hamsterContainer) hamsterContainer.style.display = 'none';
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    if (modalTitle) modalTitle.textContent = 'Enjoying Highway Bites?';
    if (modalDesc) modalDesc.textContent = 'Your feedback helps us serve you better! Rate us on Google and let us know what you think.';
    if (rateLaterBtn) rateLaterBtn.textContent = 'Maybe Later';
  };

  const closeRateModal = (completed = false) => {
    const rateModal = document.getElementById('rate-modal');
    if (rateModal) {
      rateModal.classList.remove('active');
      rateModal.setAttribute('aria-hidden', 'true');
    }

    // Stop video playback
    const video = document.getElementById('sad-hamster-video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    if (completed) {
      localStorage.setItem('hbt_rate_prompt_completed', 'true');
    } else {
      localStorage.setItem('hbt_rate_prompt_dismissed', 'true');
    }
  };

  // Start timer
  setTimeout(showRateModal, RATE_POPUP_DELAY);

  // Modal interactions
  const rateModal = document.getElementById('rate-modal');
  const modalClose = document.getElementById('modal-close');
  const rateLaterBtn = document.getElementById('rate-later-btn');
  const rateSubmitBtn = document.getElementById('rate-submit-btn');
  const stars = document.querySelectorAll('.star-rating .star');

  if (rateModal) {
    rateModal.addEventListener('click', (e) => {
      if (e.target === rateModal) {
        closeRateModal(false);
      }
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => closeRateModal(false));
  }

  if (rateLaterBtn) {
    rateLaterBtn.addEventListener('click', () => {
      if (!isHamsterState) {
        isHamsterState = true;

        // Hide default star, show video container and play the video
        const defaultIcon = document.getElementById('modal-default-icon');
        const hamsterContainer = document.getElementById('modal-hamster-container');
        const video = document.getElementById('sad-hamster-video');

        if (defaultIcon) defaultIcon.style.display = 'none';
        if (hamsterContainer) hamsterContainer.style.display = 'block';
        if (video) {
          video.play().catch(err => console.log('Video autoplay blocked or failed:', err));
        }

        // Change text to ask again in a sad hamster meme way
        const modalTitle = document.getElementById('modal-title');
        if (modalTitle) {
          modalTitle.textContent = "You're making the hamster cry... 🥺";
        }

        const modalDesc = document.querySelector('.rate-modal-content p');
        if (modalDesc) {
          modalDesc.textContent = "Every time someone clicks 'Maybe Later', a hamster sheds a tear. Please spare a quick moment to rate us on Google!";
        }

        // Change "Maybe Later" button text
        rateLaterBtn.textContent = "Close anyway 😢";
      } else {
        // Second click closes the modal
        closeRateModal(false);
      }
    });
  }

  if (rateSubmitBtn) {
    rateSubmitBtn.addEventListener('click', () => closeRateModal(true));
  }

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = star.getAttribute('data-value');
      
      // Highlight stars up to selected value
      stars.forEach(s => {
        if (parseInt(s.getAttribute('data-value')) <= parseInt(rating)) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
      
      // Redirect after a brief visual cue
      setTimeout(() => {
        closeRateModal(true);
        if (rateSubmitBtn) {
          window.open(rateSubmitBtn.href, '_blank', 'noopener,noreferrer');
        }
      }, 400);
    });

    star.addEventListener('mouseover', () => {
      const rating = star.getAttribute('data-value');
      stars.forEach(s => {
        if (parseInt(s.getAttribute('data-value')) <= parseInt(rating)) {
          s.classList.add('hovered');
        } else {
          s.classList.remove('hovered');
        }
      });
    });

    star.addEventListener('mouseout', () => {
      stars.forEach(s => s.classList.remove('hovered'));
    });
  });

  // Open rate modal on manual trigger from navigation or footer buttons
  const navRateBtn = document.getElementById('nav-rate-btn');
  const footerRateBtn = document.getElementById('footer-rate-btn');
  const openRateModalDirectly = (e) => {
    e.preventDefault();
    resetModalState();
    const rateModal = document.getElementById('rate-modal');
    if (rateModal) {
      rateModal.classList.add('active');
      rateModal.setAttribute('aria-hidden', 'false');
    }
  };

  if (navRateBtn) {
    navRateBtn.addEventListener('click', openRateModalDirectly);
  }
  if (footerRateBtn) {
    footerRateBtn.addEventListener('click', openRateModalDirectly);
  }
});

