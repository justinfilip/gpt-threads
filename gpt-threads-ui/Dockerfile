# Use the official PHP image with Apache
FROM php:7.4-apache

# Copy your PHP application into the container
COPY ./public /var/www/html

# Expose both HTTP and HTTPS ports
EXPOSE 80

# By default, start Apache in the foreground
CMD ["apache2-foreground"]
