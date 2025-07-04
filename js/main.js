// Tarifa Zero Cuiabá - Scripts principais

document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling for navigation links
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add intersection observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = Math.random() * 0.3 + 's';
        entry.target.classList.add('animate');
      }
    });
  }, observerOptions);

  // Observe all benefit cards, steps, and stats
  document.querySelectorAll('.benefit-card, .step, .stat-item').forEach(el => {
    observer.observe(el);
  });

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }

  // Analytics tracking (opcional)
  function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        event_label: label
      });
    }
  }

  // Track button clicks
  document.querySelectorAll('.cta-primary, .btn-secondary').forEach(button => {
    button.addEventListener('click', function() {
      const buttonText = this.textContent.trim();
      trackEvent('engagement', 'button_click', buttonText);
    });
  });

  // Track social media clicks
  document.querySelectorAll('.social-links a').forEach(link => {
    link.addEventListener('click', function() {
      const platform = this.getAttribute('aria-label') || 'social';
      trackEvent('social', 'click', platform);
    });
  });
});

// Function to share the page
function compartilhar() {
  if (navigator.share) {
    navigator.share({
      title: 'Tarifa Zero Cuiabá',
      text: 'Apoie o movimento pela Tarifa Zero no transporte público de Cuiabá!',
      url: window.location.href
    }).then(() => {
      console.log('Conteúdo compartilhado com sucesso');
    }).catch((error) => {
      console.log('Erro ao compartilhar:', error);
      fallbackShare();
    });
  } else {
    fallbackShare();
  }
}

// Fallback para navegadores que não suportam Web Share API
function fallbackShare() {
  const url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showNotification('Link copiado para a área de transferência!');
    }).catch(() => {
      promptCopyURL(url);
    });
  } else {
    promptCopyURL(url);
  }
}

// Prompt para copiar URL manualmente
function promptCopyURL(url) {
  const textArea = document.createElement('textarea');
  textArea.value = url;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showNotification('Link copiado para a área de transferência!');
  } catch (err) {
    showNotification('Não foi possível copiar o link automaticamente. URL: ' + url);
  }
  document.body.removeChild(textArea);
}

// Mostrar notificação personalizada
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--primary-green);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideInFromRight 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutToRight 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Adicionar estilos para as animações de notificação
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInFromRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutToRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
