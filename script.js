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
      id: "pine-forests",
      title: "Da Lat Pine Forests",
      subtitle: "Fresh air & perfect photography spots",
      category: "nature",
      description: "Scattered throughout Da Lat, these pine forests offer peaceful walks and iconic photo spots. The scent of pine and cool breeze make it a favorite among visitors. Perfect for morning walks, meditation, and capturing those misty forest shots that Da Lat is famous for.",
      location: "Various locations around Da Lat (Love Valley, Robin Hill, Tuyen Lam Lake area)",
      bestTime: "Early morning (6:00-9:00 AM) for misty photos or late afternoon for golden hour",
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
      id: "robin-hill",
      title: "Robin Hill Cable Car",
      subtitle: "Spectacular aerial views of Da Lat",
      category: "nature",
      description: "Experience Da Lat from above on one of the longest cable car rides in Vietnam. The 15-minute journey offers breathtaking panoramic views of pine forests, Tuyen Lam Lake, and the city below. At the summit, explore Robin Hill with its gardens, souvenir shops, and stunning photo opportunities.",
      location: "Robin Hill, Da Lat (near Love Valley)",
      bestTime: "Clear mornings (8:00-10:00 AM) for best visibility, or late afternoon for sunset views",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwepYpYQDWMNk1RUMkpw2mvdoOZMRW6rh3iorqsrTusXWQ-QRX-I5AB3YD7jDuYfhECBVDgPXl7etETePXhMDtSbArhWFionSwl0W2CmtBsJ2oj6GJbua_x-LBNYeupyBKxYYQ8_xsg=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "y1ZExqT_o-o",
          title: "Cable Car Experience",
          subtitle: "Soaring above Da Lat's pine forests"
        },
        {
          youtubeId: "8q7L2Y1pS9g",
          title: "Summit Views",
          subtitle: "What awaits at Robin Hill"
        },
        {
          youtubeId: "N9sx5LZKx5c",
          title: "Aerial Da Lat",
          subtitle: "Best angles from above"
        }
      ]
    },
    {
      id: "truc-lam",
      title: "Truc Lam Zen Monastery",
      subtitle: "Serene Buddhist sanctuary overlooking Tuyen Lam Lake",
      category: "culture",
      description: "Perched on a hill overlooking Tuyen Lam Lake, Truc Lam Monastery is Vietnam's largest Zen monastery. The peaceful gardens, traditional architecture, and stunning lake views create a perfect atmosphere for meditation and contemplation. Take the cable car up or drive through scenic pine forests.",
      location: "Truc Lam Monastery, Tuyen Lam Lake area",
      bestTime: "Morning hours (7:00-11:00 AM) for peaceful atmosphere and photography",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAweruVpSKqJspD0Hds5XkmE5SZ7D4stc0Kl3m6nSD4AJ5YzsBmviSQ0slOIAXj22bdNH53l50911ckAfnVBdCvIILTO7DN37Ies7BAXxtEi-ONjo4aRuIz0swQlc_cGA7ShW9zTA=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "y1ZExqT_o-o",
          title: "Truc Lam Monastery Tour",
          subtitle: "Discovering Vietnam's largest Zen monastery"
        },
        {
          youtubeId: "8q7L2Y1pS9g",
          title: "Tuyen Lam Lake Views",
          subtitle: "The monastery's stunning backdrop"
        },
        {
          youtubeId: "N9sx5LZKx5c",
          title: "Zen Garden Walk",
          subtitle: "Peaceful moments at Truc Lam"
        }
      ]
    },
    {
      id: "tuyen-lake",
      title: "Tuyền Lâm Lake",
      subtitle: "Da Lat's largest and most picturesque lake",
      category: "nature",
      description: "Tuyen Lam Lake is a stunning 350-hectare freshwater lake surrounded by pine forests and rolling hills. Popular for boating, kayaking, and lakeside cafes, it's also home to several resorts and restaurants. The misty mornings create a magical atmosphere that photographers adore.",
      location: "Tuyen Lam Lake, 6km from Da Lat city center",
      bestTime: "Sunrise (5:00-6:30 AM) for misty views, or sunny afternoons for boating",
      photoUrl: "https://www.originvietnam.com/wp-content/uploads/IMG_76668.jpg",
      videos: [
        {
          youtubeId: "y1ZExqT_o-o",
          title: "Tuyen Lam Lake Magic",
          subtitle: "Morning mist over the water"
        },
        {
          youtubeId: "8q7L2Y1pS9g",
          title: "Boating Adventures",
          subtitle: "Exploring the lake by kayak"
        },
        {
          youtubeId: "N9sx5LZKx5c",
          title: "Lakeside Cafes",
          subtitle: "Best spots to relax with a view"
        }
      ]
    },
    {
      id: "quiet-art-cafe",
      title: "Quiet Art Cafe",
      subtitle: "Cozy cafe in a 1950s French villa",
      category: "hidden",
      description: "Tucked away in a charming French colonial villa, Quiet Art Cafe combines art gallery, cafe, and vintage bookstore. Sip on excellent Vietnamese coffee while surrounded by local artwork, old photographs, and the tranquil garden. A hidden gem for creatives and those seeking authentic Da Lat atmosphere.",
      location: "6 Le Loi Street, Da Lat",
      bestTime: "Afternoons (2:00-5:00 PM) for the perfect coffee break",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAweqp_wyIvcfn3bJ4RvP0HzDdohSrTDfXqAVnwLoDMpt-ewQK9nkSY1wW35HQJ1tRAH8Km9xDmySfnUMrTsfW8i_JZ7CeNpn6MCrvEpxV8OPdhbEiPKNGoEnVnsQzBvqDB6Z46OHAZrzf_WHY=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "y1ZExqT_o-o",
          title: "Quiet Art Cafe Tour",
          subtitle: "Da Lat's hidden creative space"
        },
        {
          youtubeId: "8q7L2Y1pS9g",
          title: "Coffee & Art",
          subtitle: "The perfect combination"
        },
        {
          youtubeId: "N9sx5LZKx5c",
          title: "French Villa Charm",
          subtitle: "History meets creativity"
        }
      ]
    },
    {
      id: "mongo-land",
      title: "Mongo Land",
      subtitle: "Adventure park in the pine forest",
      category: "hidden",
      description: "Mongo Land is an exciting adventure park set in a beautiful pine forest. Try ziplining, obstacle courses, and forest trekking while enjoying panoramic views of the surrounding hills. Perfect for families, groups of friends, and anyone seeking outdoor fun with a touch of adventure.",
      location: "Tuyen Lam Lake area, approximately 7km from city center",
      bestTime: "Dry season (November-April) for outdoor activities",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAweprJp7VqhhYOEPP0O_h3yhBgIi8o0S7WmEfRm3LmFB2R7DfvDlsx5Od7gBQzI1Wyb6s6BSBMRQ_sT33jhg4GzMYQmAZDSWoA8rdfZFDZxW8mJ11EW_m8zD4kyiIuy6QEIW5_3JyuQ=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "y1ZExqT_o-o",
          title: "Mongo Land Adventures",
          subtitle: "Ziplining through the pines"
        },
        {
          youtubeId: "8q7L2Y1pS9g",
          title: "Forest Obstacle Course",
          subtitle: "Fun for all ages"
        },
        {
          youtubeId: "N9sx5LZKx5c",
          title: "Views from Above",
          subtitle: "Panoramic Da Lat scenery"
        }
      ]
    },
    {
      id: "mario-kart",
      title: "Mario Kart",
      subtitle: "Go-kart racing in Da Lat",
      category: "hidden",
      description: "Get your adrenaline pumping at Da Lat's go-kart track! Race friends and family on a winding circuit with stunning views of the surrounding hills. A fun activity for all ages, perfect for adding some excitement to your Da Lat itinerary.",
      location: "Near Robin Hill cable car station",
      bestTime: "Late afternoon (3:00-5:00 PM) after sightseeing",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerYASj0B6cufHiq-niwGe2sTeYqpZEAJC6DW1bvZJvZdFxhLItqucx0gOFx_gCKuUY2Yd_l0RqIGc3P9FS95DH4oluThxDG7JzUO58CRYLr89u0Zoq4SbGUUh84t-RX5ASaHeBS=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "y1ZExqT_o-o",
          title: "Mario Kart Racing",
          subtitle: "Fun at Da Lat's go-kart track"
        },
        {
          youtubeId: "8q7L2Y1pS9g",
          title: "Race Day Experience",
          subtitle: "Friends competing for glory"
        },
        {
          youtubeId: "N9sx5LZKx5c",
          title: "Track Views",
          subtitle: "Scenery while you race"
        }
      ]
    },
    {
      id: "puppy-farm",
      title: "Puppy Farm",
      subtitle: "Adorable dog cafe experience",
      category: "hidden",
      description: "A paradise for animal lovers! Puppy Farm is a unique cafe where you can play with dozens of adorable dogs of various breeds while enjoying coffee and snacks. The dogs are well-cared for, friendly, and love the attention from visitors. A guaranteed mood-booster for your Da Lat trip.",
      location: "Alley 110 Nguyen Cong Tru Street, Da Lat",
      bestTime: "Weekday mornings (9:00-11:00 AM) when it's less crowded",
      photoUrl: "https://mia.vn/media/uploads/blog-du-lich/puppy-farm-2-1752418192.jpg",
      videos: [
        {
          youtubeId: "y1ZExqT_o-o",
          title: "Puppy Farm Fun",
          subtitle: "Playing with adorable dogs"
        },
        {
          youtubeId: "8q7L2Y1pS9g",
          title: "Dog Cafe Experience",
          subtitle: "Coffee with furry friends"
        },
        {
          youtubeId: "N9sx5LZKx5c",
          title: "Meet the Puppies",
          subtitle: "All the adorable breeds"
        }
      ]
    },
    {
      id: "datanla-waterfall",
      title: "Datanla Waterfall",
      subtitle: "Adventure waterfall with alpine coaster",
      category: "nature",
      description: "Datanla is one of Da Lat's most accessible and exciting waterfalls. Take the thrilling alpine coaster down through the pine forest to reach the falls, or walk down the scenic steps. The multi-tiered waterfall offers swimming spots, photo opportunities, and even canyoning adventures for thrill-seekers.",
      location: "Prenn Pass, 5km from Da Lat center",
      bestTime: "Year-round, but best after rain for fuller waterfall",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerxdVvc0Fq0PyivuI7BoXQ2fVG3bjfcBNxPxbDsUH65L_yUfOm9h-ak6J3_6HJCOpWQp7Zj2gmeV7QXTzmpM7vLPrzf6Xzsny428htmsZA1oWKHonK_EB7wA4uXDBQ8nNBiJs36=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "y1ZExqT_o-o",
          title: "Datanla Waterfall",
          subtitle: "Adventure at Da Lat's favorite falls"
        },
        {
          youtubeId: "8q7L2Y1pS9g",
          title: "Alpine Coaster Ride",
          subtitle: "Thrilling ride through the forest"
        },
        {
          youtubeId: "N9sx5LZKx5c",
          title: "Canyoning Adventures",
          subtitle: "Waterfall abseiling experience"
        }
      ]
    },
    {
      id: "lin-phuoc-pagoda",
      title: "Lin Phuoc Pagoda",
      subtitle: "Mosaic masterpiece temple",
      category: "culture",
      description: "Also known as the 'Mosaic Temple', this pagoda is famous for its intricate mosaic art made from broken pottery and glass. The highlight is the 49-meter long dragon sculpture winding around the temple, and the 36-meter bell tower with its massive bronze bell. Every surface sparkles with colorful recycled materials.",
      location: "Trai Mat, Da Lat (7km from city center)",
      bestTime: "Morning for photography when sunlight illuminates the mosaics",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwep8P_dmkv-4XJy8YJ9HBhLVd4NIMjz7HalmrkSCPjSL3orBUtXtcK7x6YV5uXMTD0OleLqwx8sYVp1fF1DIvD5Fov2oa9exCiIyhfd1xIZogUohBWXde_bxlXjxmchWU_tr3bTt=s1360-w1360-h1020-rw",
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
      id: "silk-factory",
      title: "Silk Factory",
      subtitle: "Traditional Vietnamese silk making",
      category: "culture",
      description: "Visit a working silk factory to see the fascinating process of transforming silkworm cocoons into luxurious silk fabric. Watch artisans at work, learn about the history of silk production in Vietnam, and shop for high-quality silk products including scarves, clothing, and accessories.",
      location: "Trai Mat area, near Lin Phuoc Pagoda",
      bestTime: "Weekday mornings when artisans are most active",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAweolBsZwY_F_i8hMyGSGwtzTbBvfhKFhk8XjrMCzraispzvcjgQuB-0wGWfR_g0bgl1MpzCfPTZhEhKLmgKeWAofkiEvXuTXuEYVdup-ByDRwRtc0p4p2VYJe7Rj5eg9B2I0ba6o=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "XqZsoesa55w",
          title: "Silk Making Process",
          subtitle: "From cocoon to fabric"
        },
        {
          youtubeId: "tgbNymZ7vqY",
          title: "Artisan Weaving",
          subtitle: "Traditional craftsmanship"
        }
      ]
    },
    {
      id: "cricket-farm",
      title: "Cricket Farm",
      subtitle: "Unique agricultural experience",
      category: "culture",
      description: "Experience something truly unique at a local cricket farm! Learn about cricket farming as a sustainable protein source, see how these insects are raised, and even sample cricket-based snacks. A fascinating glimpse into Vietnamese agricultural innovation and culinary culture.",
      location: "Trai Mat area, near Lin Phuoc Pagoda",
      bestTime: "Morning hours for tours and demonstrations",
      photoUrl: "https://www.dalatvietnam.vn/images/dalat-landscape/cricket-farm.jpg",
      videos: [
        {
          youtubeId: "XqZsoesa55w",
          title: "Cricket Farming",
          subtitle: "Sustainable protein in Da Lat"
        },
        {
          youtubeId: "tgbNymZ7vqY",
          title: "Culinary Adventure",
          subtitle: "Tasting cricket snacks"
        }
      ]
    },
    {
      id: "strawberry-farm",
      title: "Strawberry Farm",
      subtitle: "Pick your own strawberries",
      category: "culture",
      description: "Da Lat is famous for its sweet strawberries, and visiting a strawberry farm is a must-do activity. Walk through greenhouses filled with ripe strawberries, pick your own fresh berries, and taste strawberry products like jam, wine, and smoothies. Fun for families and couples alike.",
      location: "Multiple locations, popular ones in Trai Mat and Cau Dat areas",
      bestTime: "Harvest season (November-April) for the best picking experience",
      photoUrl: "https://www.stayvista.com/blog/wp-content/uploads/2025/11/ChatGPT-Image-Nov-24-2025-03_39_02-PM.png",
      videos: [
        {
          youtubeId: "XqZsoesa55w",
          title: "Strawberry Picking",
          subtitle: "Harvesting fresh berries"
        },
        {
          youtubeId: "tgbNymZ7vqY",
          title: "Farm Tour",
          subtitle: "How strawberries grow in Da Lat"
        }
      ]
    },
    {
      id: "persimmon-farm",
      title: "Persimmon Farm",
      subtitle: "Famous Da Lat persimmons",
      category: "culture",
      description: "Visit a persimmon farm to see the beautiful orchards where Da Lat's famous persimmons grow. In autumn, the trees are laden with bright orange fruit, creating stunning photo opportunities. Learn about drying persimmons (a local specialty) and taste fresh persimmons straight from the tree.",
      location: "Cau Dat area, approximately 20km from Da Lat",
      bestTime: "Autumn harvest (September-November) for fruit and foliage",
      photoUrl: "https://image.vietnamnews.vn/uploadvnnews/Article/2023/10/19/310924_vna_potal_hong_treo_gio__dac_san_thu_hut_khach_du_lich_da_lat_4414344.jpeg",
      videos: [
        {
          youtubeId: "XqZsoesa55w",
          title: "Persimmon Harvest",
          subtitle: "Da Lat's autumn fruit"
        },
        {
          youtubeId: "tgbNymZ7vqY",
          title: "Drying Process",
          subtitle: "Traditional persimmon preservation"
        }
      ]
    },
    {
      id: "me-linh-coffee",
      title: "Me Linh Coffee Garden",
      subtitle: "Coffee plantation with stunning views",
      category: "culture",
      description: "Me Linh Coffee Garden offers a complete coffee experience in one of Da Lat's most beautiful settings. Walk through coffee plantations, learn about the growing and roasting process, and enjoy freshly brewed coffee while taking in panoramic valley views. The perfect spot for coffee lovers and photographers.",
      location: "Cau Dat area, approximately 18km from Da Lat",
      bestTime: "Morning for coffee tasting, late afternoon for sunset views",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAweq4nWh16CXOAYS7A0iegGGW2VflRipg-TT9Pfx547KgFYO83aZmSq5J7NB-LuA3blrDRl_WzhTTRV8LL7gcbhLs2FTkFQNHBsd9lI8BMHxplA2WU3FkoHaYrpteniduXol2pr4B=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "XqZsoesa55w",
          title: "Coffee Garden Tour",
          subtitle: "From bean to cup"
        },
        {
          youtubeId: "tgbNymZ7vqY",
          title: "Valley Views",
          subtitle: "Scenic beauty of Cau Dat"
        }
      ]
    },
    {
      id: "chicken-village",
      title: "Chicken Village",
      subtitle: "Traditional K'Ho ethnic village",
      category: "culture",
      description: "Chicken Village (Lang Ga) is a traditional settlement of the K'Ho ethnic minority. Named after the large chicken statue at its entrance, the village offers insight into indigenous culture, traditional stilt houses, and local crafts. Visitors can learn about the community's way of life and purchase handmade textiles.",
      location: "Lat Commune, Lac Duong District, 12km from Da Lat",
      bestTime: "Morning to early afternoon for cultural experiences",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAweoTf16s9t_CtpSMKSlH9IcFyQObW6N3938d4m0ip3fnaFUDFccrDKYH8Tp9UxImERAAkm9zRFgrxxK1BFbtMlAR27BhSUbgfhlEPPK8DmVfBDHBP8oiGHkzjCR7CKnA8GKLITLQ=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "XqZsoesa55w",
          title: "Chicken Village Culture",
          subtitle: "K'Ho ethnic traditions"
        },
        {
          youtubeId: "tgbNymZ7vqY",
          title: "Traditional Weaving",
          subtitle: "Handmade textiles"
        }
      ]
    },
    {
      id: "mushroom-village",
      title: "Mushroom Village",
      subtitle: "Unique mushroom farming community",
      category: "culture",
      description: "Explore a fascinating village dedicated to mushroom cultivation. See how various mushroom varieties are grown in specialized houses, learn about the cultivation process, and sample fresh mushroom dishes. The village's unique architecture and agricultural practices make for an interesting cultural experience.",
      location: "Trai Mat area, near Lin Phuoc Pagoda",
      bestTime: "Morning for farm tours and fresh produce",
      photoUrl: "https://gcs.tripi.vn/public-tripi/tripi-feed/img/474544FMQ/langnam1.jpg",
      videos: [
        {
          youtubeId: "XqZsoesa55w",
          title: "Mushroom Farming",
          subtitle: "Cultivation techniques"
        },
        {
          youtubeId: "tgbNymZ7vqY",
          title: "Mushroom Cuisine",
          subtitle: "Tasting local specialties"
        }
      ]
    },
    {
      id: "flower-village",
      title: "Flower Village",
      subtitle: "Da Lat's flower-growing heart",
      category: "culture",
      description: "Da Lat is Vietnam's flower capital, and Flower Village (Van Thanh) is where much of the magic happens. Walk through endless greenhouses filled with colorful blooms—hydrangeas, roses, lilies, chrysanthemums, and more. Learn about flower cultivation and buy fresh flowers at farm prices.",
      location: "Van Thanh Village, 3km from Da Lat center",
      bestTime: "Year-round, but spring (Tet holiday) offers the most spectacular displays",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerLdr08PVrFL79uJ1k5LPy3Wh98LWy55KEPdUBL2BplB1lx7mi3gwFUIS1-EiK3TAzZH9lJztTGo_f-H23vsd3hqGxIWSN9SlvOvxhOyU_97JpIoXINbFSi_aQAgJuB1c06XqEwE9je_fTH=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "XqZsoesa55w",
          title: "Flower Village Tour",
          subtitle: "Da Lat's colorful blooms"
        },
        {
          youtubeId: "tgbNymZ7vqY",
          title: "Greenhouse Walk",
          subtitle: "Behind the scenes"
        }
      ]
    },
    {
      id: "elephant-waterfall",
      title: "Elephant Waterfall",
      subtitle: "Powerful waterfall with misty spray",
      category: "nature",
      description: "Elephant Waterfall (Thac Voi) is one of Da Lat's most impressive waterfalls, named for a rock formation that resembles an elephant. Unlike the more touristy falls, Elephant Waterfall retains a wild, natural character. Climb the rocky path to feel the mist and hear the thunderous roar of water crashing down.",
      location: "Lat Commune, Lac Duong District, 30km from Da Lat",
      bestTime: "Rainy season (June-October) for maximum water flow",
      photoUrl: "https://statics.vinwonders.com/Elephant-Falls-Dalat-01_1686058067.jpeg",
      videos: [
        {
          youtubeId: "XqZsoesa55w",
          title: "Elephant Waterfall",
          subtitle: "Nature's power in Da Lat"
        },
        {
          youtubeId: "tgbNymZ7vqY",
          title: "Climbing the Rocks",
          subtitle: "Adventure at the falls"
        }
      ]
    },
    {
      id: "linh-an-pagoda",
      title: "Linh An Pagoda",
      subtitle: "Peaceful temple with giant Buddha statue",
      category: "culture",
      description: "Linh An Pagoda offers a serene escape with its peaceful grounds, beautiful gardens, and impressive Buddhist architecture. The highlight is the large white Buddha statue overlooking the valley, offering panoramic views. The temple is less crowded than others, perfect for quiet contemplation.",
      location: "Near Elephant Waterfall, Lac Duong District",
      bestTime: "Morning for peaceful atmosphere and photography",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerwVektVZw8zvJJQQ9N1J-e0AyDcBwLBM3SuhZR4NsOVO00QzxBs-wEZnJFQLi_TPbynZCYNlYYP_fgQwoO6ez-J4-SJBROyAth4VsWWRcL-P8T5We_ehizyHlhigzw6oe3bI1J=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "XqZsoesa55w",
          title: "Linh An Pagoda",
          subtitle: "Temple with a view"
        },
        {
          youtubeId: "tgbNymZ7vqY",
          title: "Giant Buddha",
          subtitle: "Iconic statue overlooking Da Lat"
        }
      ]
    },
    {
      id: "night-market",
      title: "Central Night Market",
      subtitle: "Fresh produce & street food gems",
      category: "food",
      description: "The heart of Da Lat's culinary scene comes alive after sunset. From fresh strawberries and artichokes to local specialties like bánh tráng nướng (Vietnamese pizza) and grilled skewers, the night market offers endless food adventures. Shop for souvenirs, warm clothes, and local delicacies.",
      location: "Da Lat Market, Nguyen Thi Minh Khai Street",
      bestTime: "Evening (5:00-9:00 PM) when the market is most vibrant",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwepaFtuMbi7n1KJyKJj8vnGpoq_Ap0A4IqFPpLQ86ChCoc83UU9jWrplNJ1ug-F9JNJXNbaPTju1DrItCZab6oy7vn8s_p3gIbNsoR1hD0XAf3VD7SMPZezRbVB8fGE53zjJYueb=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Street Food Tour",
          subtitle: "Must-try local delicacies"
        }
      ]
    },
    {
      id: "fresh-garden",
      title: "Fresh Garden",
      subtitle: "Organic farm-to-table experience",
      category: "food",
      description: "Fresh Garden is a unique agricultural tourism destination where visitors can explore hydroponic vegetable gardens, pick fresh produce, and enjoy meals made with ingredients harvested moments ago. The on-site restaurant serves delicious farm-fresh Vietnamese cuisine with beautiful garden views.",
      location: "Tuyen Lam Lake area",
      bestTime: "Morning for garden tours, lunch for farm-fresh meals",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerQP85SiraFtAHXgNfV02NpizFjatNzWHAq-JUIuyXg0cWbaJkVAI3uTfnrSlAQ843maKx_0t-5Yz0JkNkB7cbPB11HpC1_xz8eAXZAJ8-eiiziThO9Q34bfKmSi3QXmIVdd-DJ=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Fresh Garden Tour",
          subtitle: "From farm to table"
        }
      ]
    },
    {
      id: "cloud-hunting",
      title: "Cloud Hunting",
      subtitle: "Chasing sunrise clouds above Da Lat",
      category: "hidden",
      description: "One of Da Lat's most magical experiences—waking up before dawn to watch the sunrise from above the clouds. Famous spots like Cau Dat Tea Hill offer breathtaking views of a sea of clouds below, with the sun painting the sky in stunning colors. A photographer's dream and a memory that lasts forever.",
      location: "Cau Dat Tea Hill, approximately 20km from Da Lat",
      bestTime: "Early morning (4:30-6:30 AM) during dry season (November-April)",
      photoUrl: "https://vietnamtimes.thoidai.com.vn/stores/news_dataimages/dieuhuongvnt/082020/07/14/2013_1.png?rt=20200807142025",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Cloud Hunting",
          subtitle: "Sunrise above the clouds"
        }
      ]
    },
    {
      id: "loi-cua-gio-coffee",
      title: "Lời Của Gió",
      subtitle: "Artistic coffee with valley views",
      category: "food",
      description: "Lời Của Gió (Voice of the Wind) is a stunning coffee shop and art space perched on a hillside. Enjoy excellent Vietnamese coffee while taking in panoramic valley views from multiple terraces. The artistic decor, peaceful atmosphere, and beautiful sunsets make it a favorite among locals and travelers.",
      location: "Tuyen Lam Lake area",
      bestTime: "Late afternoon for sunset coffee",
      photoUrl: "https://dalatreview.vn/wp-content/uploads/2023/08/367980633_189246534163168_1789549028850417487_n.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Lời Của Gió",
          subtitle: "Coffee with valley views"
        }
      ]
    },
    {
      id: "Langbiang-Mountain",
      title: "Langbiang Mountain",
      subtitle: "Da Lat's highest peak",
      category: "nature",
      description: "Langbiang Mountain is the iconic peak overlooking Da Lat, offering spectacular views of the surrounding highlands. Take a jeep up the winding road or challenge yourself with a hike through pine forests. At the summit, you're rewarded with 360-degree views of mountains, valleys, and lakes—truly breathtaking.",
      location: "Lac Duong District, 12km from Da Lat",
      bestTime: "Clear mornings (7:00-10:00 AM) for best visibility",
      photoUrl: "https://daytripvietnam.com/wp-content/uploads/Langbiang-dalat-2.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Langbiang Summit",
          subtitle: "Views from Da Lat's highest peak"
        }
      ]
    },
    {
      id: "Langbiang-land",
      title: "Langbiang land",
      subtitle: "Adventure and cultural park",
      category: "culture",
      description: "Langbiang Land is an entertainment and cultural complex at the base of Langbiang Mountain. Experience K'Ho ethnic culture, try traditional crafts, enjoy local food, and take part in adventure activities like ziplining. The park offers family-friendly fun with beautiful mountain backdrops.",
      location: "Base of Langbiang Mountain, Lac Duong District",
      bestTime: "Morning to early afternoon for full experience",
      photoUrl: "https://vietchallenge.com/images/uploads/z7069782767975_b16f4a6d57fe52efbf557613a7ec5715.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Langbiang Land",
          subtitle: "Culture and adventure"
        }
      ]
    },
    {
      id: "Domaine-de-Marie",
      title: "Domaine de Marie church",
      subtitle: "Elegant French Gothic church",
      category: "culture",
      description: "Domaine de Marie is a beautiful Catholic church combining French Gothic architecture with Vietnamese elements. Its distinctive curved roof, pink exterior, and peaceful gardens make it a beloved landmark. The church is still active, and visitors are welcome to attend services or simply enjoy the serene atmosphere.",
      location: "Ngo Quyen Street, Da Lat",
      bestTime: "Morning for photography, Sunday mornings for services",
      photoUrl: "https://www.homepaylater.vn/static/82a1ec42df82fc28f285f84a04862acf/1_nha_tho_domaine_de_marie_bieu_tuong_kien_truc_phap_giua_thanh_pho_ngan_hoa_607411a51d.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Domaine de Marie",
          subtitle: "Da Lat's pink church"
        }
      ]
    },
    {
      id: "DaLat-Bee-Farm",
      title: "DaLat Bee Farm",
      subtitle: "Honey tasting and bee education",
      category: "food",
      description: "Visit a working bee farm to learn about beekeeping and honey production. See bees up close (safely), taste different varieties of honey, and learn about the health benefits of bee products. The farm also sells honey, pollen, propolis, and beeswax products—perfect souvenirs.",
      location: "Tuyen Lam Lake area",
      bestTime: "Morning when bees are most active",
      photoUrl: "https://lh3.googleusercontent.com/p/AF1QipOFX-EI-r-3ofvbAxFlQydyW8j28z12aU2LBXFW=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Bee Farm Tour",
          subtitle: "Honey and beeswax in Da Lat"
        }
      ]
    },
    {
      id: "Grilled-Vietnamese-Rice-Paper",
      title: "Grilled Vietnamese Rice Paper",
      subtitle: "Da Lat's famous street food",
      category: "food",
      description: "Bánh tráng nướng, often called 'Vietnamese pizza', is Da Lat's signature street food. Rice paper is grilled over charcoal, topped with quail egg, dried shrimp, green onion, and various sauces, then folded into a crispy, savory treat. Find it at night market stalls and enjoy this iconic local snack.",
      location: "Da Lat Night Market and street food alleys",
      bestTime: "Evening (5:00-9:00 PM) when street food stalls are active",
      photoUrl: "https://cdn1.vietnamtourism.org.vn/files/thumb/600/400//images/content/476573f60a9ea991ef344871448418be.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Vietnamese Pizza",
          subtitle: "Making bánh tráng nướng"
        }
      ]
    },
    {
      id: "Vietnamese-Fruit-Cocktail-Dessert",
      title: "Vietnamese Fruit Cocktail Dessert",
      subtitle: "Sweet fruit medley with coconut milk",
      category: "food",
      description: "Chè Thái is a refreshing fruit cocktail dessert that Da Lat does especially well. Fresh local fruits (dragon fruit, jackfruit, lychee, longan) are mixed with jelly, topped with crushed ice and sweetened coconut milk. Perfect for cooling down after exploring the city, available at night market dessert stalls.",
      location: "Da Lat Night Market dessert area",
      bestTime: "Evening dessert cravings",
      photoUrl: "https://iscleecam.edu.vn/wp-content/uploads/2024/06/Che-Thai-Vietnamese-Dessert-Drink-4.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Chè Thái",
          subtitle: "Da Lat's refreshing fruit dessert"
        }
      ]
    },
    {
      id: "young-green-rice-milk",
      title: "Young Green Rice Milk",
      subtitle: "Traditional Vietnamese cốm drink",
      category: "food",
      description: "Sữa cốm (young green rice milk) is a Da Lat specialty made from flattened young rice (cốm) blended with milk and sugar. The drink has a unique nutty, floral flavor and subtle green color. A refreshing taste of Vietnamese culinary tradition, best enjoyed at local cafes or the night market.",
      location: "Da Lat Night Market and traditional cafes",
      bestTime: "Any time, especially as a midday refreshment",
      photoUrl: "https://static.kinhtedouong.vn/w640/images/upload/huongtra/02262025/1740450619-490-thumbnail-width1239height929.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Sữa Cốm",
          subtitle: "Da Lat's young green rice milk"
        }
      ]
    },
    {
      id: "grilled-chicken-with-bamboo-rice",
      title: "Grilled Chicken with Bamboo Rice",
      subtitle: "K'Ho ethnic specialty",
      category: "food",
      description: "Gà nướng cơm lam (grilled chicken with bamboo rice) is a specialty of the K'Ho ethnic people around Langbiang Mountain. Chicken is marinated in local herbs and grilled over charcoal, while sticky rice is cooked inside bamboo tubes, absorbing the wood's aroma. A must-try authentic meal with mountain views.",
      location: "Restaurants around Langbiang Mountain area",
      bestTime: "Lunch or dinner, best enjoyed with mountain scenery",
      photoUrl: "https://cdnen.thesaigontimes.vn/wp-content/uploads/2020/09/com-lam1.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Cơm Lam",
          subtitle: "Bamboo-cooked rice tradition"
        }
      ]
    },
    {
      id: "mini-vietnamese-savory-pancakes",
      title: "Mini Vietnamese Savory Pancakes",
      subtitle: "Bánh căn - Da Lat's mini pancakes",
      category: "food",
      description: "Bánh căn are tiny savory pancakes cooked in special clay molds over charcoal. Each mini pancake is topped with quail egg, then served with grilled meat, fresh herbs, and a tangy dipping sauce. A beloved Da Lat breakfast and snack, found at dedicated bánh căn restaurants around the city.",
      location: "Various bánh căn restaurants throughout Da Lat",
      bestTime: "Breakfast or late-night snack",
      photoUrl: "https://mia.vn/media/uploads/blog-du-lich/Banh-can-da-lat-top-nhung-quan-ngon-nhat-tai-thanh-pho-suong-mu-06-1634570628.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Bánh Căn",
          subtitle: "Da Lat's mini savory pancakes"
        }
      ]
    },
    {
      id: "vietnammese-bread-with-pork-meatballs-for-dipping",
      title: "Vietnamese Bread with Pork Meatballs for Dipping",
      subtitle: "Bánh mì xíu mại - bread with pork meatballs",
      category: "food",
      description: "Bánh mì xíu mại is a Da Lat breakfast specialty. Crusty Vietnamese baguette is served alongside a bowl of savory pork meatballs in tomato-based broth. Dip the bread into the rich sauce, enjoy the tender meatballs, and start your day like a true Da Lat local.",
      location: "Morning markets and breakfast spots around Da Lat",
      bestTime: "Breaktime (6:00-10:00 AM)",
      photoUrl: "https://bizweb.dktcdn.net/100/489/006/files/xiu-mai-da-lat-1-1bb1f625-eaf7-4f87-8472-a8a992b8b96f.jpg?v=1700015360868",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Xíu Mại",
          subtitle: "Pork meatballs with bread"
        }
      ]
    },
    {
      id: "soy-milk-with-sweet-pastries",
      title: "Soy Milk with Sweet Pastries",
      subtitle: "Traditional Vietnamese breakfast combo",
      category: "food",
      description: "Sữa đậu nành (soy milk) served with various sweet pastries is a classic Vietnamese breakfast and late-night snack. The warm, slightly sweet soy milk pairs perfectly with bánh tiêu (hollow donuts), bánh bao (steamed buns), or bánh rán (fried sesame balls). Find it at night market stalls.",
      location: "Da Lat Night Market and breakfast spots",
      bestTime: "Early morning or late evening",
      photoUrl: "https://reviewvilla.vn/wp-content/uploads/2022/06/quansuadaunanh-8.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Soy Milk & Pastries",
          subtitle: "Traditional Vietnamese combo"
        }
      ]
    },
    {
      id: "vietnamese-pho",
      title: "Vietnamese Pho",
      subtitle: "Vietnam's iconic noodle soup",
      category: "food",
      description: "No visit to Vietnam is complete without pho, and Da Lat offers its own delicious versions. The cool highland climate makes a steaming bowl of pho especially satisfying. Try pho with beef (phở bò) or chicken (phở gà) at local spots, each with their own family recipes passed down through generations.",
      location: "Various pho restaurants throughout Da Lat",
      bestTime: "Breakfast or anytime comfort food needed",
      photoUrl: "https://tasteasianfood.com/wp-content/uploads/2015/11/pho9.png.webp",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Vietnamese Pho",
          subtitle: "The iconic noodle soup"
        }
      ]
    },
    {
      id: "spicy-beef-noodle-soup-from-Hue",
      title: "Spicy Beef Noodle Soup from Hue",
      subtitle: "Bún bò Huế - Central Vietnam specialty",
      category: "food",
      description: "Bún bò Huế is a spicy beef noodle soup originating from Hue, and Da Lat has excellent versions. The rich broth is flavored with lemongrass and shrimp paste, served with thick rice noodles, tender beef shank, pork knuckle, and fresh herbs. A flavorful alternative to pho for spice lovers.",
      location: "Specialty bún bò restaurants around Da Lat",
      bestTime: "Breakfast or lunch",
      photoUrl: "https://thewoksoflife.com/wp-content/uploads/2016/02/beef-noodle-soup-7-1.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Bún Bò Huế",
          subtitle: "Spicy beef noodle soup"
        }
      ]
    },
    {
      id: "vietnamese-broken-rice",
      title: "Vietnamese Broken Rice",
      subtitle: "Cơm tấm - Saigon specialty in Da Lat",
      category: "food",
      description: "Cơm tấm (broken rice) is a Saigon specialty now beloved nationwide. Broken rice grains are served with grilled pork, shredded pork skin, egg meatloaf, and pickled vegetables, all topped with scallion oil and fish sauce. Da Lat's versions add local touches like highland vegetables.",
      location: "Various cơm tấm restaurants in Da Lat",
      bestTime: "Lunch or dinner",
      photoUrl: "https://statics.vinpearl.com/vietnamese-broken-rice-3_1668778307.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Cơm Tấm",
          subtitle: "Vietnamese broken rice platter"
        }
      ]
    },
    {
      id: "avocado-ice-cream",
      title: "Avocado Ice Cream",
      subtitle: "Da Lat's signature dessert",
      category: "food",
      description: "Kem bơ (avocado ice cream) is Da Lat's most famous dessert. Fresh, creamy avocado is blended with coconut milk and ice, then topped with coconut flakes and roasted peanuts. The result is a uniquely Vietnamese treat that's refreshing, satisfying, and absolutely delicious. Find it at night market stalls.",
      location: "Da Lat Night Market and dessert cafes",
      bestTime: "Afternoon or evening treat",
      photoUrl: "https://rewrew.vn/wp-content/uploads/2024/05/dalat-food-tour-3.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Kem Bơ",
          subtitle: "Da Lat's famous avocado ice cream"
        }
      ]
    },
    {
      id: "Valley-Of-Love",
      title: "Valley Of Love",
      subtitle: "Romantic landscaped gardens",
      category: "nature",
      description: "Valley of Love is a beautifully landscaped park with flower gardens, swan-shaped paddle boats, and romantic photo spots. Popular with couples and families, the valley offers peaceful walks, horse carriage rides, and stunning views of the surrounding hills. A classic Da Lat destination for over 50 years.",
      location: "Valley of Love, 5km from city center",
      bestTime: "Morning for flowers, late afternoon for golden light",
      photoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c7/TLTY2.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Valley of Love",
          subtitle: "Da Lat's romantic gardens"
        }
      ]
    },
    {
      id: "Pink Valley Dalat",
      title: "Pink Valley Dalat",
      subtitle: "Instagram-worthy pink landscape",
      category: "nature",
      description: "Pink Valley is a newer attraction featuring artificial pink landscapes, flower fields, and whimsical photo setups. Perfect for Instagram enthusiasts, the valley offers colorful backdrops, themed gardens, and playful installations. A fun, lighthearted spot for creative photos and cheerful moments.",
      location: "Near Valley of Love area",
      bestTime: "Morning for best light and fewer crowds",
      photoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbSNvkLWMJGw7mztva3-_XM5c9Yd4TSHBH4w&s",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Pink Valley",
          subtitle: "Da Lat's colorful photo spot"
        }
      ]
    },
    {
      id: "QUÊ Garden",
      title: "QUÊ Garden",
      subtitle: "Peaceful countryside garden cafe",
      category: "hidden",
      description: "QUÊ Garden is a tranquil garden cafe that feels like stepping into the Vietnamese countryside. Surrounded by lush plants, koi ponds, and traditional architecture, it's the perfect spot to escape the city bustle. Enjoy coffee or tea while listening to birds and water features—pure relaxation.",
      location: "Near Tuyen Lam Lake",
      bestTime: "Afternoon for peaceful relaxation",
      photoUrl: "https://dalatreview.vn/wp-content/uploads/2024/01/1.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "QUÊ Garden",
          subtitle: "Countryside tranquility in Da Lat"
        }
      ]
    },
    {
      id: "vietnamese-grilled-pork-with-corn-spring-rolls",
      title: "Vietnamese Grilled Pork with Corn Spring Rolls",
      subtitle: "Nem nướng - Da Lat's grilled pork rolls",
      category: "food",
      description: "Nem nướng is a Da Lat specialty featuring grilled pork sausage wrapped in rice paper with fresh herbs, green banana, starfruit, and cucumber, then dipped in savory-sweet peanut sauce. The combination of smoky pork, fresh vegetables, and rich sauce is unforgettable. A must-try local dish.",
      location: "Specialty nem nướng restaurants throughout Da Lat",
      bestTime: "Lunch or dinner",
      photoUrl: "https://happydaytravel.com/wp-content/uploads/2022/03/nem-nuong-da-lat1.jpg",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Nem Nướng",
          subtitle: "Da Lat's grilled pork rolls"
        }
      ]
    },
    {
      id: "Dalat-Railway-Station",
      title: "Dalat Railway Station",
      subtitle: "Historic Art Deco train station",
      category: "culture",
      description: "Dalat Railway Station is a beautifully preserved Art Deco landmark built in the 1930s. Its distinctive architecture features three roof peaks representing the region's three mountains. Though passenger service is limited, you can still ride a vintage train a few kilometers to Trai Mat village, passing through scenic countryside.",
      location: "Quang Trung Street, Da Lat",
      bestTime: "Morning to early afternoon for train schedules and photography",
      photoUrl: "https://lh3.googleusercontent.com/gps-cs-s/AHVAweryr4lhfbjEO6jRHsXT99rf3b2k_OXzOCsHeYCr3dfEHT8Z9ZNELWbSK44jNonDTEn8X6QP2DiTuc3M4WaO5NqEjKjTXnEGH2nCPmNb3X9RVFYtbxFllHQq5H9mDsC66rUorVw=s1360-w1360-h1020-rw",
      videos: [
        {
          youtubeId: "jfKfPfyJRdk",
          title: "Dalat Railway Station",
          subtitle: "Vintage train ride to Trai Mat"
        }
      ]
    },
    {
      id: "pongour-waterfall",
      title: "Pongour Waterfall",
      subtitle: "Majestic 7-tier waterfall in the jungle",
      category: "nature",
      description: "Known as the most beautiful waterfall in Da Lat, Pongour features a 40-meter drop across a 100-meter wide cliff. The waterfall is surrounded by wild jungle and has 7 tiers that create a spectacular view, especially during the rainy season. A popular spot for photography and nature lovers seeking a more remote experience.",
      location: "Tan Nghia commune, Duc Trong district (45km from Da Lat)",
      bestTime: "Rainy season (June-October) for maximum water flow",
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
      id: "tuyen-lam-lake",
      title: "Tuyen Lam Lake Sunrise",
      subtitle: "Secret viewpoint for magical mornings",
      category: "hidden",
      description: "Experience the magic of sunrise at Tuyen Lam Lake from lesser-known viewpoints away from the tourist crowds. Watch as mist rises from the water, pine forests emerge from the darkness, and the first light paints the sky in gold and pink. A peaceful, unforgettable experience for early risers.",
      location: "Various quiet spots around Tuyen Lam Lake (ask locals)",
      bestTime: "Sunrise (5:00-6:30 AM) for the magical experience",
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
      id: "french-villas",
      title: "French Colonial Villas",
      subtitle: "Historical architecture with stories",
      category: "culture",
      description: "Da Lat is dotted with hundreds of elegant French colonial villas, remnants of the city's past as a hill station for French officials. Many have been restored as hotels, restaurants, or museums, while others stand gracefully weathered. Take a walking tour through the villa districts to appreciate the unique architecture and imagine life in colonial times.",
      location: "Tran Hung Dao Street area and surrounding neighborhoods",
      bestTime: "Daytime for architecture viewing and photography",
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
      description: "Da Lat's highland climate produces some of Vietnam's finest coffee. Visit working plantations in the Cau Dat area to see how coffee is grown, harvested, and processed. Walk through hillside farms, learn about different coffee varieties, and taste fresh brews with spectacular valley views.",
      location: "Cau Dat area, approximately 18-20km from Da Lat",
      bestTime: "Harvest season (November-February) for full experience",
      photoUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      videos: [
        {
          youtubeId: "2Vv-BfVoq4g",
          title: "From Bean to Cup",
          subtitle: "Coffee making process"
        }
      ]
    },
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