// ===== PetBuddyHub Main JavaScript =====

document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Menu Toggle ---
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  const navbar = document.getElementById('navbar');

  function closeMenu() {
    burger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  if (burger && navLinks) {
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        burger.classList.add('active');
        navLinks.classList.add('open');
        document.body.classList.add('nav-open');
      }
    });

    // Close menu on nav link click (but not dropdown toggles)
    navLinks.querySelectorAll('a:not(.nav-dropdown__toggle)').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') &&
          !navLinks.contains(e.target) &&
          !burger.contains(e.target)) {
        closeMenu();
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // --- Mobile Dropdown Toggle ---
  const dropdownToggles = document.querySelectorAll('.nav-dropdown__toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      // Only handle tap on mobile
      if (window.innerWidth <= 768) {
        e.preventDefault();
        e.stopPropagation();
        const dropdown = toggle.closest('.nav-dropdown');
        const isActive = dropdown.classList.contains('dropdown-open');

        // Close all other dropdowns
        document.querySelectorAll('.nav-dropdown.dropdown-open').forEach(d => {
          if (d !== dropdown) d.classList.remove('dropdown-open');
        });

        dropdown.classList.toggle('dropdown-open', !isActive);
      }
    });
  });

  // --- Navbar Scroll Effect ---
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // --- Scroll Animations (Intersection Observer) ---
  const fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeElements.forEach(el => observer.observe(el));
  }

  // --- Filter Pills (Blog Page) ---
  const filterPills = document.querySelectorAll('.filter-pill');
  if (filterPills.length > 0) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.dataset.filter;
        const cards = document.querySelectorAll('.post-card');

        cards.forEach(card => {
          const category = card.querySelector('.post-card__category');
          if (filter === 'all' || (category && category.textContent.toLowerCase().replace(/[^a-z]/g, '-').includes(filter))) {
            card.style.display = '';
            card.style.animation = 'fadeInUp 0.4s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --- Newsletter Form ---
  const forms = document.querySelectorAll('.newsletter__form, #newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        const btn = form.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = '✓ Subscribed!';
        btn.style.background = '#4CAF50';
        input.value = '';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 3000);
      }
    });
  });

  // --- Contact Form (Web3Forms) ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;

      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      const formData = new FormData(contactForm);
      formData.append('access_key', '20e21b3b-4cc6-402e-8ade-cbc34ca715fe');

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          submitBtn.textContent = '✓ Message Sent!';
          submitBtn.style.background = '#4CAF50';
          contactForm.reset();
          setTimeout(() => {
            submitBtn.innerHTML = originalHTML;
            submitBtn.style.background = '';
          }, 3000);
        } else {
          submitBtn.textContent = '✗ Failed to send';
          submitBtn.style.background = '#e74c3c';
          setTimeout(() => {
            submitBtn.innerHTML = originalHTML;
            submitBtn.style.background = '';
          }, 3000);
        }
      } catch (error) {
        submitBtn.textContent = '✗ Something went wrong';
        submitBtn.style.background = '#e74c3c';
        setTimeout(() => {
          submitBtn.innerHTML = originalHTML;
          submitBtn.style.background = '';
        }, 3000);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
});
