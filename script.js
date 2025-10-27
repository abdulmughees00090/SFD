// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.getElementById('menu');

    if (menuToggle && menu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
                menu.classList.remove('show');
            }
        });

        // Close menu when clicking on menu items
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('show');
            });
        });
    }
});
// Add this script to create shooting stars
function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    
    // Random position
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight / 2;
    
    star.style.left = startX + 'px';
    star.style.top = startY + 'px';
    
    // Random size and duration
    const size = Math.random() * 2 + 1;
    const duration = Math.random() * 3 + 2;
    
    star.style.width = size + 'px';
    star.style.animation = `shoot ${duration}s linear forwards`;
    
    document.querySelector('.space-background').appendChild(star);
    
    // Remove element after animation
    setTimeout(() => {
        star.remove();
    }, duration * 1000);
}

// Create shooting stars periodically
setInterval(createShootingStar, 2000);

// Create initial stars
for (let i = 0; i < 3; i++) {
    setTimeout(createShootingStar, i * 500);
}
// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful');
      })
      .catch(function(error) {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

