// Mobile menu toggle
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('show');
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.getElementById('menu');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
        menu.classList.remove('show');
    }
});

// Close menu when clicking on links
document.querySelectorAll('#menu a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('menu').classList.remove('show');
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Add scrolled class if page is already scrolled
    if (window.scrollY > 50) {
        document.querySelector('header').classList.add('scrolled');
    }
    
    // Form submission handling for contact page
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    // Success
                    submitBtn.textContent = 'Message Sent!';
                    contactForm.reset();
                    
                    // Show success message
                    const successMsg = document.createElement('div');
                    successMsg.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #4CAF50;
                        color: white;
                        padding: 15px 25px;
                        border-radius: 8px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                        z-index: 1000;
                        animation: slideIn 0.3s ease;
                    `;
                    successMsg.textContent = 'Message sent successfully!';
                    document.body.appendChild(successMsg);
                    
                    // Remove after 5 seconds
                    setTimeout(() => {
                        successMsg.remove();
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }, 5000);
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // Error
                submitBtn.textContent = 'Error - Try Again';
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
                console.error('Form submission error:', error);
            }
        });
    }
});
