// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active'); // optional: animate hamburger
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
