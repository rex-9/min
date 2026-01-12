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

// Gallery initialization
function initGallery() {
  const galleryContainer = document.getElementById('galleryContainer');
  const filterBtns = document.querySelectorAll('.filter-btn');

  if (!galleryContainer) return;

  // Clear existing gallery
  galleryContainer.innerHTML = '';

  // Get current filter
  const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';

  // Get filtered places
  const places = daLatGalleryData.getByCategory(activeFilter);

  // Generate gallery items
  places.forEach(place => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.setAttribute('data-category', place.category);
    galleryItem.setAttribute('data-place-id', place.id);

    galleryItem.innerHTML = `
      <div class="category-badge">
        ${place.category.charAt(0).toUpperCase() + place.category.slice(1)}
      </div>
      <div class="gallery-image">
        <img src="${place.photoUrl}" alt="${place.title}" loading="lazy">
        <div class="gallery-overlay">
          <div class="gallery-info">
            <h3>${place.title}</h3>
            <p>${place.subtitle}</p>
            <p class="gallery-desc">${place.description.substring(0, 100)}...</p>
            <button class="gallery-view-btn">
              <i class="fas fa-play-circle"></i> Watch Videos (${place.videos.length})
            </button>
          </div>
        </div>
      </div>
    `;

    galleryContainer.appendChild(galleryItem);

    // Add click event to gallery item
    galleryItem.addEventListener('click', () => {
      openVideoModal(place.id);
    });
  });

  // Update filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      initGallery();
    });
  });
}

// Video Modal Management
let currentPlaceId = null;
let currentVideoIndex = 0;
let isScrolling = false;

function openVideoModal(placeId) {
  const place = daLatGalleryData.getById(placeId);
  if (!place) return;

  currentPlaceId = placeId;
  currentVideoIndex = 0;

  const modal = document.getElementById('videoModal');
  const slidesContainer = document.getElementById('videoSlidesContainer');
  const scrollIndicator = document.getElementById('scrollIndicator');
  const videoCounter = document.getElementById('videoCounter');

  // Clear existing content
  slidesContainer.innerHTML = '';
  scrollIndicator.innerHTML = '';

  // Generate video slides
  place.videos.forEach((video, index) => {
    // Create video slide
    const videoSlide = document.createElement('div');
    videoSlide.className = 'video-slide';
    videoSlide.setAttribute('data-video-index', index);

    videoSlide.innerHTML = `
      <div class="video-wrapper">
        <iframe
          class="youtube-video"
          src="https://www.youtube.com/embed/${video.youtubeId}?enablejsapi=1&autoplay=0&rel=0&modestbranding=1"
          title="${video.title}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy">
        </iframe>
      </div>
      <div class="video-info">
        <h3>${video.title}</h3>
        <p class="subtitle">${video.subtitle}</p>
        <p class="description">${place.description}</p>
        <div class="place-details">
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>${place.location}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>Best time: ${place.bestTime}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-tag"></i>
            <span>${place.category.charAt(0).toUpperCase() + place.category.slice(1)}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-images"></i>
            <span>${place.videos.length} videos</span>
          </div>
        </div>
      </div>
    `;

    slidesContainer.appendChild(videoSlide);

    // Create scroll indicator dot
    const scrollDot = document.createElement('div');
    scrollDot.className = 'scroll-dot';
    if (index === 0) scrollDot.classList.add('active');
    scrollDot.setAttribute('data-index', index);
    scrollDot.addEventListener('click', () => {
      scrollToVideo(index);
    });
    scrollIndicator.appendChild(scrollDot);
  });

  // Update video counter
  videoCounter.textContent = `1/${place.videos.length}`;

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Scroll to top
  slidesContainer.scrollTop = 0;

  // Setup scroll event
  slidesContainer.addEventListener('scroll', handleScroll);
}

function closeVideoModal() {
  const modal = document.getElementById('videoModal');

  // Stop all videos
  document.querySelectorAll('.youtube-video').forEach(iframe => {
    iframe.src = '';
  });

  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function scrollToVideo(index) {
  if (isScrolling) return;

  const slidesContainer = document.getElementById('videoSlidesContainer');
  const slides = slidesContainer.querySelectorAll('.video-slide');
  const place = daLatGalleryData.getById(currentPlaceId);
  const videoCounter = document.getElementById('videoCounter');

  if (index >= 0 && index < slides.length) {
    isScrolling = true;
    currentVideoIndex = index;

    // Scroll to video
    slides[index].scrollIntoView({ behavior: 'smooth' });

    // Update scroll indicator
    updateScrollIndicator();

    // Update video counter
    videoCounter.textContent = `${index + 1}/${place.videos.length}`;

    // Reset scrolling flag after animation
    setTimeout(() => {
      isScrolling = false;
    }, 500);
  }
}

function handleScroll() {
  if (isScrolling) return;

  const slidesContainer = document.getElementById('videoSlidesContainer');
  const slides = slidesContainer.querySelectorAll('.video-slide');
  const place = daLatGalleryData.getById(currentPlaceId);
  const videoCounter = document.getElementById('videoCounter');

  // Find current visible slide
  const containerRect = slidesContainer.getBoundingClientRect();
  const containerMiddle = containerRect.top + containerRect.height / 2;

  for (let i = 0; i < slides.length; i++) {
    const slideRect = slides[i].getBoundingClientRect();
    const slideMiddle = slideRect.top + slideRect.height / 2;

    if (Math.abs(slideMiddle - containerMiddle) < slideRect.height / 2) {
      currentVideoIndex = i;
      updateScrollIndicator();
      videoCounter.textContent = `${i + 1}/${place.videos.length}`;
      break;
    }
  }
}

function updateScrollIndicator() {
  const scrollDots = document.querySelectorAll('.scroll-dot');
  scrollDots.forEach((dot, index) => {
    if (index === currentVideoIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// Initialize modal events
function initVideoModal() {
  const modal = document.getElementById('videoModal');
  const modalClose = document.getElementById('modalClose');
  const prevBtn = document.getElementById('prevVideo');
  const nextBtn = document.getElementById('nextVideo');

  if (!modal) return;

  // Close modal
  modalClose.addEventListener('click', closeVideoModal);

  // Close modal when clicking outside content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeVideoModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeVideoModal();
    }
  });

  // Navigation buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      scrollToVideo(currentVideoIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      scrollToVideo(currentVideoIndex + 1);
    });
  }

  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        scrollToVideo(currentVideoIndex - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        scrollToVideo(currentVideoIndex + 1);
        break;
    }
  });
}

// Update DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
  console.log("Min's Da Lat Tour Guide portfolio loaded!");
  initTestimonialsCarousel();
  initGallery();
  initVideoModal();

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

// Dalat Gallery Data
const daLatGalleryData = {
  places: [
    {
      id: "pongour-waterfall",
      title: "Pongour Waterfall",
      subtitle: "Majestic 7-tier waterfall in the jungle",
      category: "nature",
      description: "Known as the most beautiful waterfall in Da Lat, Pongour features a 40-meter drop across a 100-meter wide cliff. The waterfall is surrounded by wild jungle and has 7 tiers that create a spectacular view, especially during the rainy season.",
      location: "Tan Nghia commune, Duc Trong district",
      bestTime: "Rainy season (June-October)",
      photoUrl: "https://statics.vinpearl.com/Da-Lat-Waterfalls-01_1682518396.jpg",
      videos: [
        {
          youtubeId: "y1ZExqT_o-o",
          title: "Pongour Waterfall Majesty",
          subtitle: "Witness the power of nature"
        },
        {
          youtubeId: "8q7L2Y1pS9g",
          title: "Behind the Waterfall",
          subtitle: "Hidden viewpoints and angles"
        },
        {
          youtubeId: "N9sx5LZKx5c",
          title: "Local Legends",
          subtitle: "The story behind Pongour"
        }
      ]
    },
    {
      id: "lin-phuoc-pagoda",
      title: "Lin Phuoc Pagoda",
      subtitle: "Mosaic masterpiece temple",
      category: "culture",
      description: "Also known as the 'Mosaic Temple', this pagoda is famous for its intricate mosaic art made from broken pottery and glass. The highlight is the 49-meter long dragon sculpture winding around the temple.",
      location: "Trai Mat, Da Lat",
      bestTime: "Morning for photography",
      photoUrl: "https://images.unsplash.com/photo-1534008897995-27a23e859048?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      videos: [
        {
          youtubeId: "XqZsoesa55w",
          title: "Mosaic Artistry",
          subtitle: "The incredible details up close"
        },
        {
          youtubeId: "tgbNymZ7vqY",
          title: "Architectural Marvel",
          subtitle: "Traditional Vietnamese design"
        }
      ]
    },
    {
      id: "tuyen-lam-lake",
      title: "Tuyen Lam Lake Sunrise",
      subtitle: "Secret viewpoint for magical mornings",
      category: "hidden",
      description: "A peaceful lake surrounded by pine forests, perfect for sunrise viewing. The misty mornings create a dreamy atmosphere that photographers love.",
      location: "Tuyen Lam Lake area",
      bestTime: "Sunrise (5:00-6:30 AM)",
      photoUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      videos: [
        {
          youtubeId: "dQw4w9WgXcQ",
          title: "Sunrise Magic",
          subtitle: "Morning mist over the lake"
        }
      ]
    },
    {
      id: "central-market",
      title: "Central Market Delights",
      subtitle: "Fresh produce & street food gems",
      category: "food",
      description: "The heart of Da Lat's culinary scene. From fresh strawberries and artichokes to local specialties like banh trang nuong (Vietnamese pizza).",
      location: "Da Lat Market, Nguyen Thi Minh Khai Street",
      bestTime: "Evening (5:00-9:00 PM)",
      photoUrl: "https://statics.vinwonders.com/da-lat-night-market-1_1686415823.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Street Food Tour",
          subtitle: "Must-try local delicacies"
        }
      ]
    },
    {
      id: "pine-forests",
      title: "Da Lat Pine Forests",
      subtitle: "Fresh air & perfect photography spots",
      category: "nature",
      description: "Scattered throughout Da Lat, these pine forests offer peaceful walks and iconic photo spots. The scent of pine and cool breeze make it a favorite among visitors.",
      location: "Various locations around Da Lat",
      bestTime: "Year-round",
      photoUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      videos: [
        {
          youtubeId: "CduA0TULnow",
          title: "Forest Walks",
          subtitle: "Peaceful pine forest exploration"
        }
      ]
    },
    {
      id: "french-villas",
      title: "French Colonial Villas",
      subtitle: "Historical architecture with stories",
      category: "culture",
      description: "Remnants of Da Lat's French colonial past, these elegant villas showcase European architecture adapted to the local climate and terrain.",
      location: "Tran Hung Dao Street area",
      bestTime: "Daytime for architecture viewing",
      photoUrl: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      videos: [
        {
          youtubeId: "9bZkp7q19f0",
          title: "Architectural Heritage",
          subtitle: "French influence in Da Lat"
        }
      ]
    },
    {
      id: "coffee-plantations",
      title: "Local Coffee Plantations",
      subtitle: "Where Da Lat's best coffee grows",
      category: "hidden",
      description: "Da Lat is famous for its coffee. Visit local plantations to see how coffee is grown, harvested, and processed, with opportunities to taste fresh brews.",
      location: "Cau Dat area",
      bestTime: "Harvest season (November-February)",
      photoUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      videos: [
        {
          youtubeId: "2Vv-BfVoq4g",
          title: "From Bean to Cup",
          subtitle: "Coffee making process"
        }
      ]
    },
    {
      id: "night-market",
      title: "Night Market Eats",
      subtitle: "Authentic Vietnamese street food",
      category: "food",
      description: "As the sun sets, the night market comes alive with food stalls offering everything from grilled meats to sweet desserts. A must-experience for food lovers.",
      location: "Da Lat Night Market",
      bestTime: "Evening to late night",
      photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      videos: [
        {
          youtubeId: "L_jWHffIx5E",
          title: "Foodie Paradise",
          subtitle: "A tour of night market delicacies"
        }
      ]
    }
  ],

  // Helper function to filter by category
  getByCategory: function (category) {
    if (category === 'all') return this.places;
    return this.places.filter(place => place.category === category);
  },

  // Helper function to get by ID
  getById: function (id) {
    return this.places.find(place => place.id === id);
  }
};