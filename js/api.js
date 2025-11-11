/**
 * API Integration for Kachehub Portfolio
 * Handles form submissions and dynamic content loading
 * 
 * @author Kachehub Team
 * @version 1.0
 */

class KachehubAPI {
    constructor() {
        // For static hosting, API calls are disabled
        // Contact form uses WhatsApp integration instead
        this.baseURL = '/api/'; // Will use Netlify Functions if needed
        this.init();
    }

    init() {
        this.initContactForm();
        this.initNewsletterForm();
        this.loadDynamicContent();
    }

    /**
     * Make API request
     */
    async apiRequest(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300`;
        
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        notification.classList.add(bgColor, 'text-white');
        
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(full)';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    /**
     * Initialize contact form
     */
    initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            const formData = new FormData(contactForm);

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
            `;

            try {
                // Convert FormData to JSON
                const data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });

                const response = await this.apiRequest('contact.php', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });

                // Show success message
                this.showNotification(`Thank you, ${response.data.name}! Your message has been sent successfully.`, 'success');
                
                // Reset form
                contactForm.reset();

            } catch (error) {
                console.error('Contact form error:', error);
                this.showNotification(error.message || 'Failed to send message. Please try again.', 'error');
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    /**
     * Initialize newsletter form
     */
    initNewsletterForm() {
        const newsletterForm = document.getElementById('newsletterForm');
        if (!newsletterForm) return;

        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            const emailInput = newsletterForm.querySelector('input[type="email"]');

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subscribing...
            `;

            try {
                const response = await this.apiRequest('newsletter.php', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: emailInput.value
                    })
                });

                // Show success message
                this.showNotification(response.message || 'Successfully subscribed to newsletter!', 'success');
                
                // Reset form
                newsletterForm.reset();

            } catch (error) {
                console.error('Newsletter form error:', error);
                this.showNotification(error.message || 'Failed to subscribe. Please try again.', 'error');
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    /**
     * Load dynamic content
     */
    async loadDynamicContent() {
        await Promise.all([
            this.loadServices(),
            this.loadPortfolio(),
            this.loadTestimonials()
        ]);
    }

    /**
     * Load services from API
     */
    async loadServices() {
        try {
            const response = await this.apiRequest('services.php?limit=6');
            const services = response.data.services;

            const servicesContainer = document.getElementById('services-container');
            if (!servicesContainer || !services.length) return;

            servicesContainer.innerHTML = services.map(service => `
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div class="text-primary text-4xl mb-4">
                        <span class="material-symbols-rounded">${service.icon || 'star'}</span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-4">${service.name || service.title}</h3>
                    <p class="text-gray-600 leading-relaxed">${service.description}</p>
                    ${service.features && service.features.length ? `
                        <ul class="mt-4 space-y-2">
                            ${service.features.slice(0, 3).map(feature => `
                                <li class="flex items-center text-sm text-gray-600">
                                    <span class="material-symbols-rounded text-primary text-sm mr-2">check_circle</span>
                                    ${feature}
                                </li>
                            `).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('');

        } catch (error) {
            console.error('Failed to load services:', error);
        }
    }

    /**
     * Load portfolio from API
     */
    async loadPortfolio() {
        try {
            const response = await this.apiRequest('portfolio.php?limit=6');
            const projects = response.data.projects;

            const portfolioContainer = document.getElementById('portfolio-container');
            if (!portfolioContainer || !projects.length) return;

            portfolioContainer.innerHTML = projects.map(project => `
                <div class="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div class="relative overflow-hidden">
                        <img src="${project.images && project.images[0] ? project.images[0] : 'https://via.placeholder.com/400x250?text=' + encodeURIComponent(project.title)}" 
                             alt="${project.title}" 
                             class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300">
                        <div class="absolute inset-0 bg-primary bg-opacity-80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div class="text-center">
                                ${project.project_url ? `
                                    <a href="${project.project_url}" target="_blank" class="inline-block bg-white text-primary px-4 py-2 rounded-lg font-semibold mr-2 hover:bg-gray-100 transition-colors">
                                        View Project
                                    </a>
                                ` : ''}
                                ${project.github_url ? `
                                    <a href="${project.github_url}" target="_blank" class="inline-block bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                        View Code
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-primary text-sm font-semibold">${project.category}</span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">${project.title}</h3>
                        <p class="text-gray-600 mb-4">${project.description || project.short_description || ''}</p>
                        ${project.technologies && project.technologies.length ? `
                            <div class="flex flex-wrap gap-2">
                                ${project.technologies.slice(0, 4).map(tech => `
                                    <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">${tech}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Failed to load portfolio:', error);
        }
    }

    /**
     * Load testimonials from API
     */
    async loadTestimonials() {
        try {
            const response = await this.apiRequest('testimonials.php?limit=6');
            const testimonials = response.data.testimonials;

            const testimonialsContainer = document.getElementById('testimonials-container');
            if (!testimonialsContainer || !testimonials.length) return;

            testimonialsContainer.innerHTML = testimonials.map(testimonial => `
                <div class="bg-white p-8 rounded-xl shadow-lg">
                    <div class="flex items-center mb-4">
                        ${Array.from({length: 5}, (_, i) => `
                            <span class="material-symbols-rounded text-yellow-400 ${i < (testimonial.rating || 5) ? '' : 'opacity-30'}">star</span>
                        `).join('')}
                    </div>
                    <p class="text-gray-700 mb-6 italic">"${testimonial.testimonial}"</p>
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-4">
                            ${testimonial.avatar_url ? `
                                <img src="${testimonial.avatar_url}" alt="${testimonial.client_name}" class="w-full h-full rounded-full object-cover">
                            ` : testimonial.client_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                            <p class="font-semibold text-gray-800">${testimonial.client_name}</p>
                            <p class="text-gray-600 text-sm">
                                ${testimonial.position || testimonial.client_position || ''}
                                ${testimonial.company || testimonial.client_company ? ` at ${testimonial.company || testimonial.client_company}` : ''}
                            </p>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Failed to load testimonials:', error);
        }
    }
}

// Initialize API integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KachehubAPI();
});

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KachehubAPI;
}