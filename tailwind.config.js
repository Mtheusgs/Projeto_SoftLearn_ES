import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // <- ESSENCIAL: Habilita troca via classe .dark no <html>
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.js',       
        './resources/css/**/*.css'       
    ],

    theme: {
        extend: {
          colors: {
            'custom-texto': '#292929',
            'custom-dark': '#EFEFEF',
            'custom-card': '#BDBDBD',
            'custom-input': '#A0A0A0',
            'custom-button': '#1E1E1E',
          },
          fontFamily: {
            inria: ['"Inria Serif"', 'serif'],
            inter: ['"Inter"', 'sans-serif'],
            sans: ['Figtree', ...defaultTheme.fontFamily.sans],
          }
        }
    },


    plugins: [forms],
};