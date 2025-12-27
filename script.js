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

// Testimonials Carousel
function initTestimonialsCarousel() {
  const container = document.querySelector('.testimonials-container');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const dotsContainer = document.querySelector('.carousel-dots');

  if (!container || !prevBtn || !nextBtn) return;

  const cards = document.querySelectorAll('.testimonial-card');
  const cardWidth = cards[0] ? cards[0].offsetWidth + 30 : 330;
  const visibleCards = window.innerWidth >= 992 ? 3 : window.innerWidth >= 768 ? 2 : 1;
  let currentPosition = 0;
  let maxPosition = Math.max(0, cards.length - visibleCards);

  // Create dots
  if (dotsContainer) {
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

  function goToPosition(position) {
    currentPosition = Math.max(0, Math.min(position, maxPosition));
    container.scrollTo({
      left: currentPosition * cardWidth,
      behavior: 'smooth'
    });
    updateDots();
  }

  // Next button
  nextBtn.addEventListener('click', () => {
    if (currentPosition < maxPosition) {
      goToPosition(currentPosition + 1);
    } else {
      goToPosition(0);
    }
  });

  // Previous button
  prevBtn.addEventListener('click', () => {
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
      const newVisibleCards = window.innerWidth >= 992 ? 3 : window.innerWidth >= 768 ? 2 : 1;
      maxPosition = Math.max(0, cards.length - newVisibleCards);

      // Update dots
      const dots = document.querySelectorAll('.carousel-dot');
      if (dots.length > maxPosition + 1) {
        for (let i = dots.length - 1; i > maxPosition; i--) {
          dots[i].remove();
        }
      } else if (dots.length < maxPosition + 1) {
        for (let i = dots.length; i <= maxPosition; i++) {
          const dot = document.createElement('button');
          dot.className = `carousel-dot ${i === currentPosition ? 'active' : ''}`;
          dot.setAttribute('aria-label', `Go to testimonial group ${i + 1}`);
          dot.addEventListener('click', () => {
            goToPosition(i);
          });
          dotsContainer.appendChild(dot);
        }
      }

      if (currentPosition > maxPosition) {
        currentPosition = maxPosition;
        goToPosition(currentPosition);
      }
    }, 250);
  });

  // Auto-advance every 5 seconds
  let autoAdvanceInterval = setInterval(() => {
    if (currentPosition < maxPosition) {
      goToPosition(currentPosition + 1);
    } else {
      goToPosition(0);
    }
  }, 5000);

  // Pause auto-advance on hover
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

  updateDots();
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