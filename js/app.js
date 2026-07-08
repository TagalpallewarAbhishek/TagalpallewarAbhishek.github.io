/* ════════════════════════════════════════
   PORTFOLIO INTERACTIVE CONTROLLER (APP.JS)
   ════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const htmlElement = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const navToggleBtn = document.getElementById('nav-toggle');
  const navMobileMenu = document.getElementById('nav-mobile');
  const mobileNavLinks = document.querySelectorAll('.navbar__mobile-link');
  
  // Contact Form
  const contactForm = document.getElementById('contact-form');

  // --- Theme State & Handler ---
  const getSavedTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const setTheme = (theme) => {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // Initialize Theme
  setTheme(getSavedTheme());

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  // --- Mobile Navigation Menu ---
  const toggleMobileMenu = () => {
    const isExpanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
    navToggleBtn.setAttribute('aria-expanded', !isExpanded);
    navMobileMenu.setAttribute('aria-hidden', isExpanded);
  };

  navToggleBtn.addEventListener('click', toggleMobileMenu);

  // Close mobile menu when links are clicked
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggleBtn.setAttribute('aria-expanded', 'false');
      navMobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  // --- Scroll Active Links & Navbar Styling ---
  const sections = document.querySelectorAll('section[id]');
  const scrollProgress = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  const handleScroll = () => {
    const scrollY = window.pageYOffset;

    // Sticky transparent navbar shadow threshold
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (scrollY > 50) {
        navbar.style.boxShadow = 'var(--shadow-md)';
      } else {
        navbar.style.boxShadow = 'none';
      }
    }

    // Scroll Progress Bar Update
    if (scrollProgress) {
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = windowHeight > 0 ? (scrollY / windowHeight) * 100 : 0;
      scrollProgress.style.width = `${progress}%`;
    }

    // Back to Top Button Toggle
    if (backToTopBtn) {
      if (scrollY > 300) {
        backToTopBtn.classList.add('back-to-top--visible');
      } else {
        backToTopBtn.classList.remove('back-to-top--visible');
      }
    }

    // Active Section Link Highlight
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      
      const link = document.querySelector(`.navbar__links a[href*=${sectionId}]`);
      if (link) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          link.classList.add('navbar__link--active');
          link.style.color = 'var(--color-primary)';
        } else {
          link.classList.remove('navbar__link--active');
          link.style.color = 'var(--color-text-secondary)';
        }
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Run once initially

  // Back to Top Click Action
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Contact Form Submission Handling (via Web3Forms) ---
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const message = document.getElementById('form-message').value.trim();

      if (!name || !email || !message) {
        alert('Please fill out all fields before submitting.');
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      const formData = new FormData(contactForm);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      })
      .then(async (response) => {
        let json = await response.json();
        if (response.status === 200) {
          submitBtn.style.background = 'green';
          submitBtn.textContent = 'Message Sent! ✔';
          contactForm.reset();
        } else {
          console.error(response);
          alert(json.message || 'Something went wrong. Please try again.');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      })
      .catch((error) => {
        console.error(error);
        alert('Could not submit form. Please check your internet connection and try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      })
      .finally(() => {
        setTimeout(() => {
          if (submitBtn.textContent === 'Message Sent! ✔') {
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            submitBtn.textContent = originalText;
          }
        }, 3000);
      });
    });
  }
});
