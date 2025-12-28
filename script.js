// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const contactForm = document.getElementById('contactForm');
const navItems = document.querySelectorAll('.nav-links a');
const currentYearSpan = document.getElementById('currentYear');
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  mobileMenuBtn.innerHTML = navLinks.classList.contains('active')
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking on a link
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navLinks.classList.remove('active');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  });
});

// Form submission with formspree
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.form-submit-btn');
    const statusDiv = document.getElementById('form-status');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Clear previous status
    if (statusDiv) {
      statusDiv.className = 'form-status';
      statusDiv.style.display = 'none';
    }

    try {
      const formData = new FormData(contactForm);

      // Get the Formspree endpoint from the form action
      const formAction = contactForm.getAttribute('action');

      const response = await fetch(formAction, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Success
        contactForm.reset();

        if (statusDiv) {
          statusDiv.textContent = 'Thank you! Your tour inquiry has been sent. Min will get back to you within 24 hours.';
          statusDiv.className = 'form-status success';
          statusDiv.style.display = 'block';
        } else {
          alert('Thank you! Your tour inquiry has been sent. Min will get back to you within 24 hours.');
        }
      } else {
        // Error from Formspree
        throw new Error('Form submission failed');
      }

    } catch (error) {
      // Network error or Formspree error
      if (statusDiv) {
        statusDiv.textContent = 'Oops! There was a problem sending your message. Please try again or contact Min directly.';
        statusDiv.className = 'form-status error';
        statusDiv.style.display = 'block';
      } else {
        alert('Oops! There was a problem sending your message. Please try again or contact Min directly.');
      }
      console.error('Form submission error:', error);
    } finally {
      // Reset button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;

      // Auto-hide status message after 10 seconds
      if (statusDiv && statusDiv.style.display === 'block') {
        setTimeout(() => {
          statusDiv.style.display = 'none';
        }, 10000);
      }
    }
  });
}

// Gallery filtering
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons
    filterBtns.forEach(b => b.classList.remove('active'));
    // Add active class to clicked button
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    galleryItems.forEach(item => {
      if (filter === 'all' || item.getAttribute('data-category') === filter) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
});

// Enhanced Testimonials Carousel with swipe support
function initTestimonialsCarousel() {
  const container = document.querySelector('.testimonials-container');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const dotsContainer = document.querySelector('.carousel-dots');

  if (!container || !prevBtn || !nextBtn) return;

  const cards = document.querySelectorAll('.testimonial-card');
  if (cards.length === 0) return;

  // Check if mobile (single card view)
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Calculate card width including gap and margins
  let cardWidth;
  if (isMobile) {
    // On mobile, cards have margins: calc(100% - 40px) + 20px margin on each side
    const cardStyle = window.getComputedStyle(cards[0]);
    cardWidth = cards[0].offsetWidth + parseInt(cardStyle.marginLeft) + parseInt(cardStyle.marginRight);
  } else {
    // On desktop, use offsetWidth + gap (30px)
    cardWidth = cards[0].offsetWidth + 30;
  }

  const visibleCards = isMobile ? 1 : (window.innerWidth >= 992 ? 3 : 2);
  let currentPosition = 0;
  let maxPosition = Math.max(0, cards.length - visibleCards);

  // Create dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxPosition; i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to testimonial group ${i + 1}`);
      dot.addEventListener('click', () => {
        goToPosition(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentPosition);
    });
  }

  function goToPosition(position, smooth = true) {
    currentPosition = Math.max(0, Math.min(position, maxPosition));

    // Calculate scroll position based on card width
    const scrollPosition = currentPosition * cardWidth;

    container.scrollTo({
      left: scrollPosition,
      behavior: smooth ? 'smooth' : 'auto'
    });
    updateDots();
  }

  // Update dots on scroll (for swipe)
  container.addEventListener('scroll', () => {
    const scrollPosition = container.scrollLeft;
    const newPosition = Math.round(scrollPosition / cardWidth);

    if (newPosition !== currentPosition && newPosition >= 0 && newPosition <= maxPosition) {
      currentPosition = newPosition;
      updateDots();
    }
  });

  // Next button
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Next button clicked, currentPosition:', currentPosition);

    if (currentPosition < maxPosition) {
      goToPosition(currentPosition + 1);
    } else {
      goToPosition(0);
    }
  });

  // Previous button
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Prev button clicked, currentPosition:', currentPosition);

    if (currentPosition > 0) {
      goToPosition(currentPosition - 1);
    } else {
      goToPosition(maxPosition);
    }
  });

  // Update on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newIsMobile = window.matchMedia('(max-width: 768px)').matches;
      const newVisibleCards = newIsMobile ? 1 : (window.innerWidth >= 992 ? 3 : 2);
      maxPosition = Math.max(0, cards.length - newVisibleCards);

      // Recalculate card width
      if (newIsMobile) {
        const cardStyle = window.getComputedStyle(cards[0]);
        cardWidth = cards[0].offsetWidth + parseInt(cardStyle.marginLeft) + parseInt(cardStyle.marginRight);
      } else {
        cardWidth = cards[0].offsetWidth + 30;
      }

      // Recreate dots if needed
      if (dotsContainer) {
        const dots = document.querySelectorAll('.carousel-dot');
        if (dots.length !== maxPosition + 1) {
          dotsContainer.innerHTML = '';
          for (let i = 0; i <= maxPosition; i++) {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${i === currentPosition ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to testimonial group ${i + 1}`);
            dot.addEventListener('click', () => {
              goToPosition(i);
            });
            dotsContainer.appendChild(dot);
          }
        }
      }

      if (currentPosition > maxPosition) {
        currentPosition = maxPosition;
        goToPosition(currentPosition, false);
      }

      updateDots();
    }, 250);
  });

  // Auto-advance (desktop only)
  if (!isMobile) {
    let autoAdvanceInterval = setInterval(() => {
      if (currentPosition < maxPosition) {
        goToPosition(currentPosition + 1);
      } else {
        goToPosition(0);
      }
    }, 5000);

    container.addEventListener('mouseenter', () => {
      clearInterval(autoAdvanceInterval);
    });

    container.addEventListener('mouseleave', () => {
      autoAdvanceInterval = setInterval(() => {
        if (currentPosition < maxPosition) {
          goToPosition(currentPosition + 1);
        } else {
          goToPosition(0);
        }
      }, 5000);
    });
  }

  // Initialize
  updateDots();
  console.log('Testimonials carousel initialized, cardWidth:', cardWidth, 'visibleCards:', visibleCards);
}

// Header scroll effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 100) {
    header.style.backgroundColor = 'rgba(10, 25, 41, 0.98)';
    header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
  } else {
    header.style.backgroundColor = 'rgba(10, 25, 41, 0.95)';
    header.style.boxShadow = 'none';
  }
});

// Set current year in footer
if (currentYearSpan) {
  currentYearSpan.textContent = new Date().getFullYear();
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("Min's Da Lat Tour Guide portfolio loaded!");
  initTestimonialsCarousel();

  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      if (this.getAttribute('href') === '#') return;

      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
});